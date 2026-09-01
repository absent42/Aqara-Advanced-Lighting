"""Test image projection across strip segments."""

import io

import pytest
from PIL import Image

from custom_components.aqara_advanced_lighting.const import (
    MAX_PROJECTION_SEGMENTS,
    PROJECTION_DARK_THRESHOLD,
)
from custom_components.aqara_advanced_lighting.image_processor import (
    _extract_projection,
    _rgb_to_xy,
    validate_extraction_mode,
)


def _banded_png(
    bands: list[tuple[int, int, int]],
    band_width: int = 10,
    height: int = 10,
) -> bytes:
    """Build a PNG of equal-width vertical colour bands, left to right."""
    img = Image.new("RGB", (band_width * len(bands), height))
    for index, colour in enumerate(bands):
        for x in range(index * band_width, (index + 1) * band_width):
            for y in range(height):
                img.putpixel((x, y), colour)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_projection_preserves_band_order():
    """Three vertical bands project onto three segments, left to right."""
    red, green, blue = (255, 0, 0), (0, 255, 0), (0, 0, 255)
    result = _extract_projection(_banded_png([red, green, blue]), 3)

    assert len(result) == 3
    for entry, source in zip(result, (red, green, blue), strict=True):
        assert entry is not None
        expected_x, expected_y = _rgb_to_xy(*source)
        assert entry["x"] == pytest.approx(expected_x, abs=0.02)
        assert entry["y"] == pytest.approx(expected_y, abs=0.02)


def test_projection_ignores_source_luminance():
    """The same hue at very different luminance projects identically.

    Segments carry chromaticity only and every projected colour is emitted at
    full output, so a bright red and a dim red are indistinguishable once
    projected. This documents that deliberate limitation rather than asserting
    a hardcoded literal against itself.
    """
    bright_red = (255, 0, 0)
    dim_red = (130, 0, 0)
    result = _extract_projection(_banded_png([bright_red, dim_red]), 2)

    assert all(entry is not None for entry in result)
    assert result[0] == result[1]
    assert [entry["brightness_pct"] for entry in result] == [100, 100]


def test_projection_omits_near_black_columns():
    """A black band yields None, not the D65 white point.

    Regression guard: _rgb_to_xy returns D65 white for zero-luminance input,
    which is right for palette extraction but would render a black region of
    the image as a full-brightness white segment.
    """
    result = _extract_projection(_banded_png([(0, 0, 0), (255, 0, 0)]), 2)

    assert result[0] is None
    assert result[1] is not None


def test_projection_dark_threshold_greys_either_side():
    """Grey 30 falls below the 12 percent threshold, grey 32 sits above it."""
    result = _extract_projection(_banded_png([(30, 30, 30), (32, 32, 32)]), 2)

    assert result[0] is None
    assert result[1] is not None


def test_projection_dark_threshold_is_hsp_not_channel_max_or_luma():
    """Two blues of the same hue land either side of the threshold.

    Pins the threshold and the metric. Neither simpler rule reproduces this
    split: channel-max at 12 percent (about 31/255) would light navy too, since
    its blue channel is 60, and linear Rec. 601 luma would drop both, since blue
    caps at 0.114. _MIN_CHANNEL is not reusable either -- it is shared with
    _extract_palette as a reproducibility floor ("can a light show this
    colour"), and at 5/255 it would light everything here.
    """
    assert PROJECTION_DARK_THRESHOLD == 0.12

    navy = (0, 0, 60)  # channel max 60, HSP about 0.079
    dark_blue = (0, 0, 150)  # channel max 150, HSP about 0.199
    result = _extract_projection(_banded_png([navy, dark_blue]), 2)

    assert result[0] is None
    assert result[1] is not None


def test_projection_keeps_pure_blue():
    """Full-intensity pure blue is lit, guarding against linear luma weighting.

    Under plain Rec. 601 luma blue is capped at its 0.114 coefficient, below the
    0.12 threshold, so blue would be unreachable at any intensity and every blue
    region of an image would project as unlit. HSP squares the channels before
    weighting, lifting pure blue to 0.338. This test is the regression guard: if
    someone simplifies the metric back to the linear form, it fails here.
    """
    result = _extract_projection(_banded_png([(0, 0, 255), (255, 255, 0)]), 2)

    assert result[0] is not None
    assert result[1] is not None


def test_projection_clamps_segments_to_maximum():
    """An absurd segment count is clamped rather than allocating unbounded work."""
    result = _extract_projection(_banded_png([(255, 0, 0)]), 100_000)
    assert len(result) == MAX_PROJECTION_SEGMENTS


def test_projection_clamps_segments_to_minimum():
    """Zero or negative segments clamp up to one."""
    assert len(_extract_projection(_banded_png([(255, 0, 0)]), 0)) == 1
    assert len(_extract_projection(_banded_png([(255, 0, 0)]), -5)) == 1


def test_validate_extraction_mode_accepts_known_modes():
    assert validate_extraction_mode("palette") == "palette"
    assert validate_extraction_mode("projection") == "projection"


def test_validate_extraction_mode_rejects_unknown():
    with pytest.raises(ValueError, match="Unknown extraction mode"):
        validate_extraction_mode("rainbow")


def test_projection_skip_dark_false_lights_every_segment():
    """With skip_dark=False no column is dropped, however dark it is.

    The user opts into this to fill the strip completely; see the docstring on
    _extract_projection for what a black column then renders as.
    """
    image = _banded_png([(0, 0, 0), (10, 10, 10), (0, 0, 60), (255, 0, 0)])
    result = _extract_projection(image, 4, skip_dark=False)

    assert len(result) == 4
    assert all(entry is not None for entry in result)


def test_projection_skip_dark_false_renders_black_as_white_point():
    """A black column comes back as the D65 white point at full output.

    Documents the accepted consequence of skip_dark=False rather than leaving
    it to be rediscovered as a bug: _rgb_to_xy substitutes D65 for
    zero-luminance input, and projection emits every colour at 100 percent.
    """
    image = _banded_png([(0, 0, 0), (255, 0, 0)])
    result = _extract_projection(image, 2, skip_dark=False)

    black_entry = result[0]
    assert black_entry is not None
    expected_x, expected_y = _rgb_to_xy(0, 0, 0)
    assert black_entry["x"] == pytest.approx(expected_x, abs=0.001)
    assert black_entry["y"] == pytest.approx(expected_y, abs=0.001)
    assert black_entry["brightness_pct"] == 100


def test_projection_skip_dark_defaults_to_true():
    """Omitting skip_dark keeps the original drop-dark-columns behaviour."""
    result = _extract_projection(_banded_png([(0, 0, 0), (255, 0, 0)]), 2)

    assert result[0] is None
    assert result[1] is not None
