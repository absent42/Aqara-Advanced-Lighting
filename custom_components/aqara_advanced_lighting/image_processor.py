"""Image processing utilities for color extraction and thumbnails."""

import colorsys
import io
import logging
import math
from functools import partial

from PIL import Image, ImageOps, UnidentifiedImageError

from homeassistant.core import HomeAssistant

from .const import (
    DEFAULT_EXTRACTED_COLORS,
    MAX_PROJECTION_SEGMENTS,
    PROJECTION_DARK_THRESHOLD,
    THUMBNAIL_JPEG_QUALITY,
    THUMBNAIL_MAX_DIMENSION,
)
from .models import RGBColor, round_xy
from .payload_builder import rgb_to_xy

_LOGGER = logging.getLogger(__name__)

# Minimum max-channel value for a color to be usable by a light.
# Pure black has no chromaticity and cannot be reproduced.
_MIN_CHANNEL = 5

# D65 white point (returned for black/zero-luminance inputs)
_D65_X = 0.3127
_D65_Y = 0.3290

def _rgb_to_xy(r: int, g: int, b: int) -> tuple[float, float]:
    """Convert sRGB to CIE 1931 xy chromaticity using the sRGB D65 matrix.

    Delegates to ``payload_builder.rgb_to_xy`` for the core conversion.
    For black/zero-luminance inputs (where chromaticity is undefined),
    returns the D65 white point instead of (0, 0) since color extraction
    needs a usable fallback.
    """
    x, y = rgb_to_xy(r, g, b)
    if x == 0.0 and y == 0.0:
        return (_D65_X, _D65_Y)
    return (x, y)

def _color_distance(c1: RGBColor, c2: RGBColor) -> float:
    """Perceptual color distance using the redmean approximation.

    More accurate than plain Euclidean RGB distance, cheaper than Lab.
    """
    rmean = (c1.r + c2.r) / 2
    dr = c1.r - c2.r
    dg = c1.g - c2.g
    db = c1.b - c2.b
    return math.sqrt(
        (2 + rmean / 256) * dr * dr
        + 4 * dg * dg
        + (2 + (255 - rmean) / 256) * db * db
    )

def _select_diverse_colors(
    candidates: list[tuple[int, RGBColor]],
    num_colors: int,
    min_distance: float = 40.0,
) -> list[tuple[int, RGBColor]]:
    """Select diverse colors from frequency-sorted candidates.

    Walks the candidates in frequency order and keeps each color only if
    it is sufficiently different from all already-selected colors. If
    strict selection yields fewer than num_colors, fills remaining slots
    with the most frequent unused colors.
    """
    selected: list[tuple[int, RGBColor]] = []
    used_indices: set[int] = set()

    for i, (count, rgb) in enumerate(candidates):
        if len(selected) >= num_colors:
            break
        if all(
            _color_distance(rgb, sel_rgb) >= min_distance
            for _, sel_rgb in selected
        ):
            selected.append((count, rgb))
            used_indices.add(i)

    # Fill remaining slots with most frequent unused colors
    if len(selected) < num_colors:
        for i, (count, rgb) in enumerate(candidates):
            if len(selected) >= num_colors:
                break
            if i not in used_indices:
                selected.append((count, rgb))

    return selected

def _extract_palette(
    image_bytes: bytes,
    num_colors: int = DEFAULT_EXTRACTED_COLORS,
    extract_brightness: bool = True,
) -> list[dict[str, float | int]]:
    """Extract dominant colors from image bytes using Pillow quantization.

    Runs in an executor thread -- no async calls allowed.

    Over-samples the quantization (3x requested colors) then uses a
    greedy diversity selection to ensure distinct colors are preserved
    rather than letting similar shades consume multiple slots.

    Args:
        image_bytes: Raw image file bytes.
        num_colors: Number of dominant colors to extract (1-8).
        extract_brightness: Whether to derive brightness from image luminance.
            When False, all colors are returned at 100% brightness.

    Returns:
        List of dicts with x, y, brightness_pct keys sorted by hue.

    Raises:
        UnidentifiedImageError: If the bytes are not a valid image.
        ValueError: If no colors could be extracted.
    """
    img = Image.open(io.BytesIO(image_bytes))

    # Normalise orientation from EXIF before any processing
    img = ImageOps.exif_transpose(img)

    # Convert to RGB (handles RGBA, palette, grayscale, etc.)
    if img.mode != "RGB":
        img = img.convert("RGB")

    # Down-sample large images for faster quantization
    max_dimension = 400
    if max(img.size) > max_dimension:
        img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

    # Over-sample: quantize to more colors than needed, then select the
    # most diverse subset. This prevents similar shades from dominating.
    oversample = min(num_colors * 3, 24)
    quantized = img.quantize(
        colors=oversample, method=Image.Quantize.MAXCOVERAGE
    )
    palette = quantized.getpalette()
    if palette is None:
        msg = "Failed to extract color palette from image"
        raise ValueError(msg)

    histogram = quantized.histogram()

    candidates: list[tuple[int, RGBColor]] = []
    for i in range(min(oversample, len(histogram))):
        count = histogram[i]
        if count == 0:
            continue
        r, g, b = palette[i * 3 : (i + 1) * 3]
        if max(r, g, b) < _MIN_CHANNEL:
            continue
        candidates.append((count, RGBColor(r=r, g=g, b=b)))

    if not candidates:
        msg = "No colors could be extracted from image"
        raise ValueError(msg)

    # Sort by pixel count (most dominant first) for diverse selection
    candidates.sort(key=lambda c: c[0], reverse=True)
    colors = _select_diverse_colors(candidates, num_colors)

    # Build result with XY chromaticity, brightness, and hue.
    raw: list[dict[str, float]] = []
    for _count, rgb in colors:
        x, y = _rgb_to_xy(rgb.r, rgb.g, rgb.b)
        luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b
        hue, _, _ = colorsys.rgb_to_hsv(rgb.r / 255, rgb.g / 255, rgb.b / 255)
        raw.append({
            "x": round_xy(x),
            "y": round_xy(y),
            "brightness_raw": luminance / 255 * 100,
            "hue": hue,
        })

    # Sort by hue so colors form a natural spectrum
    raw.sort(key=lambda c: c["hue"])

    result: list[dict[str, float | int]] = []
    for c in raw:
        brightness_pct = (
            max(10, min(100, round(c["brightness_raw"])))
            if extract_brightness
            else 100
        )
        result.append({
            "x": c["x"],
            "y": c["y"],
            "brightness_pct": brightness_pct,
        })

    return result

EXTRACTION_MODE_PALETTE = "palette"
EXTRACTION_MODE_PROJECTION = "projection"
_EXTRACTION_MODES = (EXTRACTION_MODE_PALETTE, EXTRACTION_MODE_PROJECTION)

def validate_extraction_mode(mode: str) -> str:
    """Validate an extraction mode string, returning it unchanged.

    Lives here rather than in the aiohttp view so it can be unit tested without
    view-level test infrastructure. Callers let the ValueError propagate; the
    view already converts extraction errors into a 422.

    Raises:
        ValueError: If the mode is not recognised.
    """
    if mode not in _EXTRACTION_MODES:
        msg = f"Unknown extraction mode: {mode!r}"
        raise ValueError(msg)
    return mode

def _extract_projection(
    image_bytes: bytes,
    segments: int,
    *,
    skip_dark: bool = True,
) -> list[dict[str, float | int] | None]:
    """Project an image across a strip's segments, left to right.

    Runs in an executor thread -- no async calls allowed.

    Unlike _extract_palette, position is meaningful: entry i is the mean colour
    of the i-th vertical slice of the image, and there is no diversity selection
    or hue sorting.

    With skip_dark (the default), columns whose HSP perceived brightness falls
    below PROJECTION_DARK_THRESHOLD yield None instead of a colour.
    Segments carry chromaticity only and every projected colour is emitted at full
    output, so leaving a segment unspecified is the sole means by which projection
    can represent a dark region of the image at all. Returning None here also
    avoids the _extract_palette behaviour that would otherwise apply: _rgb_to_xy
    substitutes the D65 white point for zero-luminance input, which would render a
    black region as a full-brightness white segment. The frontend's
    turn-off-unspecified handling already covers the None entries.

    With skip_dark False every column yields a colour and no None is produced, so
    the whole strip is lit. This is a deliberate user choice, exposed because some
    images otherwise leave large runs of segments dark, and its consequence is the
    one described above: a dark region is lit at full output in its own hue, and a
    black or neutral-grey region takes the D65 white point from _rgb_to_xy and
    renders as a full-brightness white segment. That is the accepted trade-off for
    filling the strip, not a bug to be "fixed" by reinstating the None entries.

    brightness_pct is always 100 and is dropped by the frontend consumer, since
    segments are XY-only. It is present purely for shape-compatibility with
    _extract_palette's output.

    Args:
        image_bytes: Raw image file bytes.
        segments: Number of strip segments to project onto. Clamped to
            1..MAX_PROJECTION_SEGMENTS.
        skip_dark: Whether near-black columns are left unlit (None) rather than
            lit. Defaults to True, the original behaviour.

    Returns:
        List of length `segments` (post-clamp). Each entry is a dict with x, y
        and brightness_pct keys, or None for a near-black column when skip_dark
        is set.

    Raises:
        UnidentifiedImageError: If the bytes are not a valid image.
    """
    requested_segments = segments
    segments = max(1, min(MAX_PROJECTION_SEGMENTS, segments))
    if segments != requested_segments:
        _LOGGER.debug(
            "Projection segment count clamped from %s to %s",
            requested_segments,
            segments,
        )

    img = Image.open(io.BytesIO(image_bytes))

    # Normalise orientation from EXIF before any processing
    img = ImageOps.exif_transpose(img)

    if img.mode != "RGB":
        img = img.convert("RGB")

    # BOX is the definitionally correct filter here: it is an exact area mean per
    # column, which is what "the mean colour of the i-th vertical slice" means.
    # LANCZOS is not a mean -- its negative lobes ring across hard edges, so on a
    # black/yellow boundary it returns (17, 17, 0) for columns whose source pixels
    # are entirely black. That would defeat the dark-column branch below and light
    # genuinely black segments.
    strip = img.resize((segments, 1), Image.Resampling.BOX)

    result: list[dict[str, float | int] | None] = []
    for index in range(segments):
        r, g, b = strip.getpixel((index, 0))
        if skip_dark:
            # HSP perceived brightness, not linear Rec. 601 luma. See
            # PROJECTION_DARK_THRESHOLD in const.py: the linear form caps pure
            # blue below the threshold, making blue unreachable at any intensity.
            perceived = math.sqrt(
                0.299 * (r / 255) ** 2
                + 0.587 * (g / 255) ** 2
                + 0.114 * (b / 255) ** 2
            )
            if perceived < PROJECTION_DARK_THRESHOLD:
                result.append(None)
                continue
        x, y = _rgb_to_xy(r, g, b)
        result.append({
            "x": round_xy(x),
            "y": round_xy(y),
            "brightness_pct": 100,
        })

    return result

async def async_extract_projection(
    hass: HomeAssistant,
    image_bytes: bytes,
    segments: int,
    *,
    skip_dark: bool = True,
) -> list[dict[str, float | int] | None]:
    """Project an image across strip segments (async wrapper).

    Args:
        hass: Home Assistant instance.
        image_bytes: Raw image file bytes.
        segments: Number of strip segments to project onto.
        skip_dark: Whether near-black columns are left unlit. See
            _extract_projection for what turning this off renders.

    Returns:
        List of colour dicts and Nones, one per segment, in strip order. No None
        entries are produced when skip_dark is False.
    """
    # partial rather than positional args: skip_dark is keyword-only and
    # async_add_executor_job forwards positionally.
    return await hass.async_add_executor_job(
        partial(_extract_projection, image_bytes, segments, skip_dark=skip_dark)
    )

def _create_thumbnail(image_bytes: bytes) -> bytes:
    """Create an optimised JPEG thumbnail from image bytes.

    Runs in an executor thread -- no async calls allowed.

    Args:
        image_bytes: Raw image file bytes.

    Returns:
        JPEG bytes of the resized thumbnail.
    """
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img)

    # Convert to RGB (JPEG cannot hold alpha)
    if img.mode in ("RGBA", "LA", "P"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        converted = img.convert("RGBA")
        background.paste(converted, mask=converted.split()[-1])
        img = background
    elif img.mode != "RGB":
        img = img.convert("RGB")

    img.thumbnail(
        (THUMBNAIL_MAX_DIMENSION, THUMBNAIL_MAX_DIMENSION),
        Image.Resampling.LANCZOS,
    )

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=THUMBNAIL_JPEG_QUALITY, optimize=True)
    return buf.getvalue()

async def async_extract_colors(
    hass: HomeAssistant,
    image_bytes: bytes,
    num_colors: int = DEFAULT_EXTRACTED_COLORS,
    *,
    extract_brightness: bool = True,
) -> list[dict[str, float | int]]:
    """Extract dominant colors from an image (async wrapper).

    Args:
        hass: Home Assistant instance.
        image_bytes: Raw image file bytes.
        num_colors: Number of colors to extract.
        extract_brightness: Whether to derive brightness from image luminance.

    Returns:
        List of color dicts with x, y, brightness_pct.
    """
    return await hass.async_add_executor_job(
        _extract_palette, image_bytes, num_colors, extract_brightness
    )

async def async_create_thumbnail(
    hass: HomeAssistant,
    image_bytes: bytes,
) -> bytes:
    """Create an optimised JPEG thumbnail (async wrapper).

    Args:
        hass: Home Assistant instance.
        image_bytes: Raw image file bytes.

    Returns:
        JPEG bytes of the thumbnail.
    """
    return await hass.async_add_executor_job(_create_thumbnail, image_bytes)
