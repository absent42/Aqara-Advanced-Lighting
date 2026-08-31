"""User presets storage for Aqara Advanced Lighting."""

from collections.abc import Awaitable, Callable
from datetime import datetime, timezone
import logging
import uuid
from pathlib import Path
from typing import Any, NotRequired, TypedDict

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError

from .base_store import BaseStore
from .const import (
    DATA_PRESET_STORE,
    DOMAIN,
    PRESET_TYPE_CCT_SEQUENCE,
    PRESET_TYPE_DYNAMIC_SCENE,
    PRESET_TYPE_EFFECT,
    PRESET_TYPE_SEGMENT_PATTERN,
    PRESET_TYPE_SEGMENT_SEQUENCE,
    THUMBNAIL_STORAGE_DIR,
    VALID_PRESET_TYPES,
)
_LOGGER = logging.getLogger(__name__)

def get_preset_store(hass: HomeAssistant) -> PresetStore | None:
    """Get the preset store from hass.data."""
    if DOMAIN not in hass.data:
        _LOGGER.error(
            "Integration domain not found in hass.data - integration may not be set up"
        )
        return None
    preset_store = hass.data[DOMAIN].get(DATA_PRESET_STORE)
    if preset_store is None:
        _LOGGER.error(
            "Preset store not found in hass.data[%s] - this should not happen. "
            "Available keys: %s",
            DOMAIN,
            list(hass.data[DOMAIN].keys()),
        )
    return preset_store

STORAGE_KEY = f"{DOMAIN}.presets"
STORAGE_VERSION = 1
MAX_PRESETS_PER_TYPE = 250
MAX_PRESET_NAME_LENGTH = 200

# Allowed data fields per preset type (excludes managed fields: id, created_at, modified_at)
_ALLOWED_FIELDS: dict[str, set[str]] = {
    PRESET_TYPE_EFFECT: {
        "name",
        "icon",
        "device_type",
        "effect",
        "effect_speed",
        "effect_brightness",
        "effect_colors",
        "effect_segments",
        "thumbnail",
        "audio_config",
    },
    PRESET_TYPE_SEGMENT_PATTERN: {
        "name",
        "icon",
        "device_type",
        "segments",
        "thumbnail",
    },
    PRESET_TYPE_CCT_SEQUENCE: {
        "name",
        "icon",
        "steps",
        "loop_mode",
        "loop_count",
        "end_behavior",
        "mode",
        "solar_steps",
        "schedule_steps",
        "skip_first_in_loop",
        "auto_resume_delay",
    },
    PRESET_TYPE_SEGMENT_SEQUENCE: {
        "name",
        "icon",
        "device_type",
        "steps",
        "loop_mode",
        "loop_count",
        "end_behavior",
        "clear_segments",
        "thumbnail",
    },
    PRESET_TYPE_DYNAMIC_SCENE: {
        "name",
        "icon",
        "colors",
        "transition_time",
        "hold_time",
        "distribution_mode",
        "offset_delay",
        "random_order",
        "loop_mode",
        "loop_count",
        "end_behavior",
        "thumbnail",
        "audio_entity",
        "audio_sensitivity",
        "audio_brightness_curve",
        "audio_brightness_min",
        "audio_brightness_max",
        "audio_color_advance",
        "audio_transition_speed",
        "audio_detection_mode",
        "audio_frequency_zone",
        "audio_silence_behavior",
        "audio_prediction_aggressiveness",
        "audio_latency_compensation_ms",
        "audio_color_by_frequency",
        "audio_rolloff_brightness",
    },
}

def _collect_referenced_thumbnails(data: dict[str, Any]) -> set[str]:
    """Collect thumbnail IDs referenced by presets of every type.

    Deliberately generic over the store's preset-list keys. Effects, segment
    patterns, segment sequences and dynamic scenes can all carry a thumbnail,
    and a thumbnail missed here is deleted as an orphan at startup -- so this
    must never be narrowed back to a single key.
    """
    referenced: set[str] = set()
    for value in data.values():
        if not isinstance(value, list):
            continue
        for preset in value:
            if not isinstance(preset, dict):
                continue
            thumb_id = preset.get("thumbnail")
            if isinstance(thumb_id, str) and thumb_id:
                referenced.add(thumb_id)
    return referenced

class UserEffectPreset(TypedDict):
    """User-defined effect preset."""

    id: str
    name: str
    icon: str | None
    device_type: str | None
    effect: str
    effect_speed: int
    effect_brightness: int | None
    effect_colors: list[dict[str, int]]
    effect_segments: str | None
    audio_config: NotRequired[dict[str, Any]]
    created_at: str
    modified_at: str

class UserSegmentPatternPreset(TypedDict):
    """User-defined segment pattern preset."""

    id: str
    name: str
    icon: str | None
    device_type: str | None
    segments: list[dict[str, Any]]
    created_at: str
    modified_at: str

class UserCCTSequencePreset(TypedDict):
    """User-defined CCT sequence preset."""

    id: str
    name: str
    icon: str | None
    steps: list[dict[str, Any]]
    loop_mode: str
    loop_count: int | None
    end_behavior: str
    created_at: str
    modified_at: str

class UserSegmentSequencePreset(TypedDict):
    """User-defined segment sequence preset."""

    id: str
    name: str
    icon: str | None
    device_type: str | None
    steps: list[dict[str, Any]]
    loop_mode: str
    loop_count: int | None
    end_behavior: str
    clear_segments: NotRequired[bool]
    created_at: str
    modified_at: str

class UserDynamicScenePreset(TypedDict):
    """User-defined dynamic scene preset."""

    id: str
    name: str
    icon: str | None
    colors: list[dict[str, float | int]]  # List of {x, y, brightness_pct}
    transition_time: float
    hold_time: float
    distribution_mode: str
    offset_delay: float
    random_order: bool
    loop_mode: str
    loop_count: int | None
    end_behavior: str
    created_at: str
    modified_at: str
    audio_entity: NotRequired[str | None]
    audio_sensitivity: NotRequired[int]
    audio_brightness_curve: NotRequired[str | None]
    audio_brightness_min: NotRequired[int]
    audio_brightness_max: NotRequired[int]
    audio_silence_behavior: NotRequired[str]
    audio_color_advance: NotRequired[str]
    audio_transition_speed: NotRequired[int]
    audio_detection_mode: NotRequired[str]
    audio_frequency_zone: NotRequired[bool]
    audio_prediction_aggressiveness: NotRequired[int]
    audio_latency_compensation_ms: NotRequired[int]
    audio_color_by_frequency: NotRequired[bool]
    audio_rolloff_brightness: NotRequired[bool]

class PresetsData(TypedDict):
    """Storage data structure for all user presets."""

    effect_presets: list[UserEffectPreset]
    segment_pattern_presets: list[UserSegmentPatternPreset]
    cct_sequence_presets: list[UserCCTSequencePreset]
    segment_sequence_presets: list[UserSegmentSequencePreset]
    dynamic_scene_presets: list[UserDynamicScenePreset]

_DEFAULT_PRESETS_DATA: PresetsData = {
    "effect_presets": [],
    "segment_pattern_presets": [],
    "cct_sequence_presets": [],
    "segment_sequence_presets": [],
    "dynamic_scene_presets": [],
}

class PresetStore(BaseStore[PresetsData]):
    """Manages global user presets storage."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the preset store."""
        super().__init__(hass, STORAGE_VERSION, STORAGE_KEY, {**_DEFAULT_PRESETS_DATA})
        self._update_callbacks: list[Callable[[], Awaitable[None]]] = []
        self._suppress_callbacks: bool = False

    def register_update_callback(
        self, callback: Callable[[], Awaitable[None]]
    ) -> Callable[[], None]:
        """Register a callback to be notified when presets change.

        Args:
            callback: Async function to call when presets are modified

        Returns:
            Function to call to unregister the callback
        """
        self._update_callbacks.append(callback)

        def unregister() -> None:
            if callback in self._update_callbacks:
                self._update_callbacks.remove(callback)

        return unregister

    async def _notify_update_callbacks(self) -> None:
        """Notify all registered callbacks that presets have changed."""
        if self._suppress_callbacks:
            return
        for callback in self._update_callbacks:
            try:
                await callback()
            except Exception:
                _LOGGER.exception("Error in preset update callback")

    async def async_load(self) -> None:
        """Load presets from storage."""
        data = await self._store.async_load()
        if data is not None:
            # Ensure all keys exist with defaults
            self._data = {
                "effect_presets": data.get("effect_presets", []),
                "segment_pattern_presets": data.get("segment_pattern_presets", []),
                "cct_sequence_presets": data.get("cct_sequence_presets", []),
                "segment_sequence_presets": data.get("segment_sequence_presets", []),
                "dynamic_scene_presets": data.get("dynamic_scene_presets", []),
            }

        _LOGGER.debug(
            "Loaded user presets: %d effects, %d patterns, %d CCT sequences, %d segment sequences, %d dynamic scenes",
            len(self._data["effect_presets"]),
            len(self._data["segment_pattern_presets"]),
            len(self._data["cct_sequence_presets"]),
            len(self._data["segment_sequence_presets"]),
            len(self._data["dynamic_scene_presets"]),
        )

        # Clean up orphaned thumbnails from previous sessions
        await self._async_cleanup_orphaned_thumbnails()

    async def async_save(self) -> None:
        """Save presets to storage."""
        await self._store.async_save(self._data)
        _LOGGER.debug("Saved user presets")

    def _get_storage_key(self, preset_type: str) -> str:
        """Get the storage key for a preset type."""
        return f"{preset_type}_presets"

    def _get_timestamp(self) -> str:
        """Get current timestamp in ISO format."""
        return datetime.now(timezone.utc).isoformat()

    def get_all_presets(self, preset_type: str | None = None) -> dict[str, list[Any]]:
        """Get all presets, optionally filtered by type.

        Args:
            preset_type: Optional preset type to filter by

        Returns:
            Dictionary with preset lists by type
        """
        if preset_type is not None and preset_type in VALID_PRESET_TYPES:
            key = self._get_storage_key(preset_type)
            return {key: self._data.get(key, [])}
        return dict(self._data)

    def get_preset(self, preset_type: str, preset_id: str) -> dict[str, Any] | None:
        """Get a single preset by type and ID.

        Args:
            preset_type: The type of preset
            preset_id: The preset ID

        Returns:
            The preset if found, None otherwise
        """
        if preset_type not in VALID_PRESET_TYPES:
            return None

        key = self._get_storage_key(preset_type)
        presets = self._data.get(key, [])
        for preset in presets:
            if preset["id"] == preset_id:
                return preset
        return None

    def get_preset_by_name(self, preset_type: str, name: str) -> dict[str, Any] | None:
        """Get a preset by type and name.

        Args:
            preset_type: The type of preset
            name: The preset name

        Returns:
            The preset if found, None otherwise
        """
        if preset_type not in VALID_PRESET_TYPES:
            return None

        key = self._get_storage_key(preset_type)
        presets = self._data.get(key, [])
        for preset in presets:
            if preset["name"].lower() == name.lower():
                return preset
        return None

    @staticmethod
    def _filter_preset_fields(
        preset_data: dict[str, Any], preset_type: str
    ) -> dict[str, Any]:
        """Filter preset data to only include allowed fields for the type."""
        allowed = _ALLOWED_FIELDS.get(preset_type)
        if not allowed:
            return preset_data
        return {k: v for k, v in preset_data.items() if k in allowed}

    async def add_preset(
        self, preset_type: str, preset_data: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Add a new preset.

        Args:
            preset_type: The type of preset
            preset_data: The preset data (without id, created_at, modified_at)

        Returns:
            The created preset with generated fields, or None if invalid type
        """
        if preset_type not in VALID_PRESET_TYPES:
            return None

        key = self._get_storage_key(preset_type)

        # Enforce per-type count limit
        if len(self._data[key]) >= MAX_PRESETS_PER_TYPE:
            raise ServiceValidationError(
                f"Maximum of {MAX_PRESETS_PER_TYPE} {preset_type} presets reached",
                translation_domain=DOMAIN,
                translation_key="preset_limit_reached",
            )

        # Enforce name length limit
        name = preset_data.get("name", "")
        if isinstance(name, str) and len(name) > MAX_PRESET_NAME_LENGTH:
            raise ServiceValidationError(
                f"Preset name exceeds {MAX_PRESET_NAME_LENGTH} characters",
                translation_domain=DOMAIN,
                translation_key="preset_name_too_long",
            )

        # Enforce name uniqueness within the same preset type
        if name:
            existing = self._data[key]
            if any(p.get("name") == name for p in existing):
                raise ServiceValidationError(
                    f"A {preset_type} preset named '{name}' already exists",
                    translation_domain=DOMAIN,
                    translation_key="preset_name_duplicate",
                )

        filtered_data = self._filter_preset_fields(preset_data, preset_type)
        timestamp = self._get_timestamp()

        preset = {
            "id": str(uuid.uuid4()),
            **filtered_data,
            "created_at": timestamp,
            "modified_at": timestamp,
        }

        # Persist pending thumbnail to disk if present
        if preset.get("thumbnail"):
            await self._async_persist_pending_thumbnail(preset["thumbnail"])

        self._data[key].append(preset)
        await self.async_save()
        await self._notify_update_callbacks()

        _LOGGER.debug(
            "Added %s preset '%s' with ID %s",
            preset_type,
            preset.get("name"),
            preset["id"],
        )
        return preset

    async def update_preset(
        self, preset_type: str, preset_id: str, preset_data: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Update an existing preset.

        Args:
            preset_type: The type of preset
            preset_id: The preset ID to update
            preset_data: The updated preset data

        Returns:
            The updated preset, or None if not found
        """
        if preset_type not in VALID_PRESET_TYPES:
            return None

        key = self._get_storage_key(preset_type)
        presets = self._data.get(key, [])

        # Enforce name uniqueness (excluding the preset being updated)
        name = preset_data.get("name", "")
        if name:
            if any(
                p.get("name") == name and p["id"] != preset_id for p in presets
            ):
                raise ServiceValidationError(
                    f"A {preset_type} preset named '{name}' already exists",
                    translation_domain=DOMAIN,
                    translation_key="preset_name_duplicate",
                )

        for i, preset in enumerate(presets):
            if preset["id"] == preset_id:
                filtered_data = self._filter_preset_fields(preset_data, preset_type)

                old_thumb = preset.get("thumbnail")
                new_thumb = filtered_data.get("thumbnail")

                # Persist pending thumbnail to disk if a new one is provided
                if new_thumb and new_thumb != old_thumb:
                    await self._async_persist_pending_thumbnail(new_thumb)

                # Clean up old thumbnail from disk if replaced
                if old_thumb and new_thumb and old_thumb != new_thumb:
                    await self._async_delete_thumbnail(old_thumb)

                # Preserve id and created_at, update modified_at
                updated_preset = {
                    **preset,
                    **filtered_data,
                    "id": preset_id,
                    "created_at": preset["created_at"],
                    "modified_at": self._get_timestamp(),
                }
                self._data[key][i] = updated_preset
                await self.async_save()
                await self._notify_update_callbacks()

                _LOGGER.debug(
                    "Updated %s preset '%s' (ID: %s)",
                    preset_type,
                    updated_preset.get("name"),
                    preset_id,
                )
                return updated_preset

        return None

    async def delete_preset(self, preset_type: str, preset_id: str) -> bool:
        """Delete a preset and its associated thumbnail if present.

        Args:
            preset_type: The type of preset
            preset_id: The preset ID to delete

        Returns:
            True if deleted, False if not found
        """
        if preset_type not in VALID_PRESET_TYPES:
            return False

        key = self._get_storage_key(preset_type)

        # Find the preset before removing so we can clean up its thumbnail
        thumbnail_id: str | None = None
        for preset in self._data[key]:
            if preset["id"] == preset_id:
                thumbnail_id = preset.get("thumbnail")
                break

        original_length = len(self._data[key])
        self._data[key] = [p for p in self._data[key] if p["id"] != preset_id]

        if len(self._data[key]) < original_length:
            await self.async_save()
            await self._notify_update_callbacks()
            _LOGGER.debug("Deleted %s preset with ID %s", preset_type, preset_id)

            # Clean up thumbnail file if present
            if thumbnail_id:
                await self._async_delete_thumbnail(thumbnail_id)

            return True

        return False

    async def _async_delete_thumbnail(self, thumbnail_id: str) -> None:
        """Delete a thumbnail file from storage (best-effort)."""
        thumb_path = Path(
            self.hass.config.path(
                f".storage/{THUMBNAIL_STORAGE_DIR}/{thumbnail_id}.jpg"
            )
        )

        def delete_file() -> None:
            try:
                if thumb_path.exists():
                    thumb_path.unlink()
                    _LOGGER.debug("Deleted thumbnail %s", thumbnail_id)
            except OSError as ex:
                _LOGGER.warning("Failed to delete thumbnail %s: %s", thumbnail_id, ex)

        await self.hass.async_add_executor_job(delete_file)

    async def _async_persist_pending_thumbnail(self, thumbnail_id: str) -> None:
        """Move a pending thumbnail from memory to disk storage.

        Called when a preset with a thumbnail is saved. The thumbnail bytes
        are held in memory until this point to avoid orphaned files.
        """
        pending: dict[str, bytes] = self.hass.data.get(DOMAIN, {}).get(
            "pending_thumbnails", {}
        )
        thumb_bytes = pending.pop(thumbnail_id, None)
        if thumb_bytes is None:
            _LOGGER.debug(
                "Pending thumbnail %s not found in memory (may already be saved)",
                thumbnail_id,
            )
            return

        thumb_dir = Path(self.hass.config.path(f".storage/{THUMBNAIL_STORAGE_DIR}"))
        thumb_path = thumb_dir / f"{thumbnail_id}.jpg"

        def write_file() -> None:
            thumb_dir.mkdir(parents=True, exist_ok=True)
            thumb_path.write_bytes(thumb_bytes)

        await self.hass.async_add_executor_job(write_file)
        _LOGGER.debug("Persisted thumbnail %s to disk", thumbnail_id)

    async def _async_cleanup_orphaned_thumbnails(self) -> None:
        """Remove thumbnail files not referenced by any preset.

        Runs at startup to clean up thumbnails orphaned by browser tab
        closures, HA restarts during extraction, or other edge cases.
        """
        thumb_dir = Path(self.hass.config.path(f".storage/{THUMBNAIL_STORAGE_DIR}"))

        def find_orphans() -> list[Path]:
            if not thumb_dir.is_dir():
                return []

            # Collect thumbnail IDs referenced by presets of every type
            referenced = _collect_referenced_thumbnails(self._data)

            # Find files on disk that are not referenced
            orphans: list[Path] = []
            for path in thumb_dir.iterdir():
                if path.suffix == ".jpg" and path.stem not in referenced:
                    orphans.append(path)
            return orphans

        def delete_orphans(orphans: list[Path]) -> int:
            count = 0
            for path in orphans:
                try:
                    path.unlink()
                    count += 1
                except OSError:
                    pass
            return count

        try:
            orphans = await self.hass.async_add_executor_job(find_orphans)
            if orphans:
                deleted = await self.hass.async_add_executor_job(
                    delete_orphans, orphans
                )
                _LOGGER.info("Cleaned up %d orphaned thumbnail(s)", deleted)
        except Exception:
            _LOGGER.debug("Thumbnail cleanup skipped", exc_info=True)

    async def duplicate_preset(
        self, preset_type: str, preset_id: str, new_name: str | None = None
    ) -> dict[str, Any] | None:
        """Duplicate a preset with a new ID.

        Args:
            preset_type: The type of preset
            preset_id: The preset ID to duplicate
            new_name: Optional new name for the duplicate

        Returns:
            The new preset, or None if source not found
        """
        source_preset = self.get_preset(preset_type, preset_id)
        if source_preset is None:
            return None

        # Create a copy without id, created_at, modified_at, or thumbnail
        # (thumbnail files are not duplicated, user can re-extract if needed)
        preset_data = {
            k: v
            for k, v in source_preset.items()
            if k not in ("id", "created_at", "modified_at", "thumbnail")
        }

        # Set new name
        if new_name:
            preset_data["name"] = new_name
        else:
            preset_data["name"] = f"{source_preset['name']} (copy)"

        return await self.add_preset(preset_type, preset_data)

    async def export_user_presets(
        self, preset_ids: list[str] | None = None
    ) -> dict[str, Any]:
        """Export user-created presets to a dictionary.

        Args:
            preset_ids: Optional list of preset IDs to export.
                If None, exports all presets.

        Returns:
            Dictionary with version, timestamp, counts, and preset data
        """
        all_presets = self.get_all_presets()

        # Filter by IDs if provided
        if preset_ids is not None:
            id_set = set(preset_ids)
            filtered: dict[str, list[dict[str, Any]]] = {}
            for key in (
                "effect_presets",
                "segment_pattern_presets",
                "cct_sequence_presets",
                "segment_sequence_presets",
                "dynamic_scene_presets",
            ):
                filtered[key] = [
                    p for p in all_presets.get(key, []) if p.get("id") in id_set
                ]
            export_presets = filtered
        else:
            export_presets = all_presets

        preset_counts = {
            key: len(export_presets.get(key, []))
            for key in (
                "effect_presets",
                "segment_pattern_presets",
                "cct_sequence_presets",
                "segment_sequence_presets",
                "dynamic_scene_presets",
            )
        }

        export_data = {
            "version": 1,
            "timestamp": self._get_timestamp(),
            "preset_counts": preset_counts,
            "data": export_presets,
        }

        _LOGGER.debug(
            "Exported %d presets (%d effects, %d patterns, %d CCT sequences, %d segment sequences, %d dynamic scenes)",
            sum(preset_counts.values()),
            preset_counts["effect_presets"],
            preset_counts["segment_pattern_presets"],
            preset_counts["cct_sequence_presets"],
            preset_counts["segment_sequence_presets"],
            preset_counts["dynamic_scene_presets"],
        )

        return export_data

    def _generate_unique_name(self, base_name: str, existing_names: set[str]) -> str:
        """Generate a unique preset name by appending (2), (3), etc.

        Args:
            base_name: The original preset name
            existing_names: Set of names already in use

        Returns:
            Unique name not in existing_names set
        """
        if base_name not in existing_names:
            return base_name

        for counter in range(2, 1002):
            new_name = f"{base_name} ({counter})"
            if new_name not in existing_names:
                return new_name

        # Fallback with UUID suffix if all counters are taken
        return f"{base_name} ({uuid.uuid4().hex[:8]})"

    def _validate_preset_structure(
        self, preset_data: dict[str, Any], preset_type: str
    ) -> None:
        """Validate preset structure matches expected TypedDict format.

        Args:
            preset_data: The preset dictionary to validate
            preset_type: One of: effect, segment_pattern, cct_sequence, segment_sequence

        Raises:
            ServiceValidationError: If validation fails
        """
        # Required fields for each preset type
        required_fields = {
            PRESET_TYPE_EFFECT: {"name", "effect", "effect_speed", "effect_colors"},
            PRESET_TYPE_SEGMENT_PATTERN: {"name", "segments"},
            PRESET_TYPE_CCT_SEQUENCE: {
                "name",
                "steps",
                "loop_mode",
                "end_behavior",
            },
            PRESET_TYPE_SEGMENT_SEQUENCE: {
                "name",
                "steps",
                "loop_mode",
                "end_behavior",
            },
            PRESET_TYPE_DYNAMIC_SCENE: {
                "name",
                "colors",
                "transition_time",
                "hold_time",
                "distribution_mode",
                "loop_mode",
                "end_behavior",
            },
        }

        if preset_type not in required_fields:
            raise ServiceValidationError(
                f"Invalid preset type: {preset_type}",
                translation_domain=DOMAIN,
                translation_key="invalid_preset_type",
            )

        # Check required fields
        missing_fields = required_fields[preset_type] - preset_data.keys()
        if missing_fields:
            raise ServiceValidationError(
                f"Missing required fields for {preset_type}: {missing_fields}",
                translation_domain=DOMAIN,
                translation_key="missing_preset_fields",
                translation_placeholders={"fields": ", ".join(missing_fields)},
            )

        # Validate color format for effect presets
        if preset_type == PRESET_TYPE_EFFECT:
            if not isinstance(preset_data.get("effect_colors"), list):
                raise ServiceValidationError(
                    "Colors must be a list",
                    translation_domain=DOMAIN,
                    translation_key="invalid_color_format",
                )
            for color in preset_data["effect_colors"]:
                if not isinstance(color, dict) or "x" not in color or "y" not in color:
                    raise ServiceValidationError(
                        "Each color must be in XY format with x and y keys",
                        translation_domain=DOMAIN,
                        translation_key="invalid_color_format",
                    )

        # Validate segment sequence colors
        if preset_type == PRESET_TYPE_SEGMENT_SEQUENCE:
            if not isinstance(preset_data.get("steps"), list):
                raise ServiceValidationError(
                    "Steps must be a list",
                    translation_domain=DOMAIN,
                    translation_key="invalid_preset_structure",
                )
            for step in preset_data["steps"]:
                if "colors" in step:
                    if not isinstance(step["colors"], list):
                        raise ServiceValidationError(
                            "Step colors must be a list",
                            translation_domain=DOMAIN,
                            translation_key="invalid_color_format",
                        )
                    for color in step["colors"]:
                        if (
                            not isinstance(color, dict)
                            or "x" not in color
                            or "y" not in color
                        ):
                            raise ServiceValidationError(
                                "Each color must be in XY format with x and y keys",
                                translation_domain=DOMAIN,
                                translation_key="invalid_color_format",
                            )

        # Validate dynamic scene colors
        if preset_type == PRESET_TYPE_DYNAMIC_SCENE:
            if not isinstance(preset_data.get("colors"), list):
                raise ServiceValidationError(
                    "Colors must be a list",
                    translation_domain=DOMAIN,
                    translation_key="invalid_color_format",
                )
            if not (1 <= len(preset_data["colors"]) <= 8):
                raise ServiceValidationError(
                    "Dynamic scene must have 1-8 colors",
                    translation_domain=DOMAIN,
                    translation_key="invalid_color_count",
                )
            for color in preset_data["colors"]:
                if not isinstance(color, dict) or "x" not in color or "y" not in color:
                    raise ServiceValidationError(
                        "Each color must have x and y coordinates",
                        translation_domain=DOMAIN,
                        translation_key="invalid_color_format",
                    )

    async def import_presets(self, import_data: dict[str, Any]) -> dict[str, int]:
        """Import presets from backup data with conflict resolution.

        Args:
            import_data: Dictionary matching export format

        Returns:
            Dictionary with counts of imported presets per type

        Raises:
            ServiceValidationError: If data structure is invalid
            HomeAssistantError: If storage operations fail
        """
        # Validate top-level structure
        required_top_keys = {"version", "data"}
        if not all(key in import_data for key in required_top_keys):
            raise ServiceValidationError(
                "Invalid backup file structure",
                translation_domain=DOMAIN,
                translation_key="invalid_backup_structure",
            )

        if import_data["version"] != 1:
            raise ServiceValidationError(
                f"Unsupported backup version: {import_data['version']}",
                translation_domain=DOMAIN,
                translation_key="unsupported_backup_version",
                translation_placeholders={"version": str(import_data["version"])},
            )

        data = import_data["data"]

        # Suppress per-preset callbacks during bulk import
        self._suppress_callbacks = True

        # Get current presets to check for name conflicts
        current_presets = self.get_all_presets()

        # Track import counts
        imported_counts = {
            "effect_presets": 0,
            "segment_pattern_presets": 0,
            "cct_sequence_presets": 0,
            "segment_sequence_presets": 0,
            "dynamic_scene_presets": 0,
        }

        try:
            # Import effect presets
            if "effect_presets" in data:
                existing_names = {p["name"] for p in current_presets["effect_presets"]}
                for preset in data["effect_presets"]:
                    self._validate_preset_structure(preset, PRESET_TYPE_EFFECT)

                    # Generate unique name if conflict
                    original_name = preset["name"]
                    unique_name = self._generate_unique_name(
                        original_name, existing_names
                    )

                    # Create new preset with unique ID and name
                    new_preset_data = {
                        "name": unique_name,
                        "icon": preset.get("icon"),
                        "device_type": preset.get("device_type"),
                        "effect": preset["effect"],
                        "effect_speed": preset["effect_speed"],
                        "effect_brightness": preset.get("effect_brightness"),
                        "effect_colors": preset["effect_colors"],
                        "effect_segments": preset.get("effect_segments"),
                    }

                    await self.add_preset(PRESET_TYPE_EFFECT, new_preset_data)
                    existing_names.add(unique_name)
                    imported_counts["effect_presets"] += 1

            # Import segment pattern presets
            if "segment_pattern_presets" in data:
                existing_names = {
                    p["name"] for p in current_presets["segment_pattern_presets"]
                }
                for preset in data["segment_pattern_presets"]:
                    self._validate_preset_structure(preset, PRESET_TYPE_SEGMENT_PATTERN)

                    original_name = preset["name"]
                    unique_name = self._generate_unique_name(
                        original_name, existing_names
                    )

                    new_preset_data = {
                        "name": unique_name,
                        "icon": preset.get("icon"),
                        "device_type": preset.get("device_type"),
                        "segments": preset["segments"],
                    }

                    await self.add_preset(PRESET_TYPE_SEGMENT_PATTERN, new_preset_data)
                    existing_names.add(unique_name)
                    imported_counts["segment_pattern_presets"] += 1

            # Import CCT sequence presets
            if "cct_sequence_presets" in data:
                existing_names = {
                    p["name"] for p in current_presets["cct_sequence_presets"]
                }
                for preset in data["cct_sequence_presets"]:
                    self._validate_preset_structure(preset, PRESET_TYPE_CCT_SEQUENCE)

                    original_name = preset["name"]
                    unique_name = self._generate_unique_name(
                        original_name, existing_names
                    )

                    new_preset_data = {
                        "name": unique_name,
                        "icon": preset.get("icon"),
                        "steps": preset["steps"],
                        "loop_mode": preset["loop_mode"],
                        "loop_count": preset.get("loop_count"),
                        "end_behavior": preset["end_behavior"],
                    }

                    await self.add_preset(PRESET_TYPE_CCT_SEQUENCE, new_preset_data)
                    existing_names.add(unique_name)
                    imported_counts["cct_sequence_presets"] += 1

            # Import segment sequence presets
            if "segment_sequence_presets" in data:
                existing_names = {
                    p["name"] for p in current_presets["segment_sequence_presets"]
                }
                for preset in data["segment_sequence_presets"]:
                    self._validate_preset_structure(
                        preset, PRESET_TYPE_SEGMENT_SEQUENCE
                    )

                    original_name = preset["name"]
                    unique_name = self._generate_unique_name(
                        original_name, existing_names
                    )

                    new_preset_data = {
                        "name": unique_name,
                        "icon": preset.get("icon"),
                        "device_type": preset.get("device_type"),
                        "steps": preset["steps"],
                        "loop_mode": preset["loop_mode"],
                        "loop_count": preset.get("loop_count"),
                        "end_behavior": preset["end_behavior"],
                    }

                    # Include clear_segments if present
                    if "clear_segments" in preset:
                        new_preset_data["clear_segments"] = preset["clear_segments"]

                    await self.add_preset(PRESET_TYPE_SEGMENT_SEQUENCE, new_preset_data)
                    existing_names.add(unique_name)
                    imported_counts["segment_sequence_presets"] += 1

            # Import dynamic scene presets
            if "dynamic_scene_presets" in data:
                existing_names = {
                    p["name"] for p in current_presets.get("dynamic_scene_presets", [])
                }
                for preset in data["dynamic_scene_presets"]:
                    self._validate_preset_structure(preset, PRESET_TYPE_DYNAMIC_SCENE)

                    original_name = preset["name"]
                    unique_name = self._generate_unique_name(
                        original_name, existing_names
                    )

                    new_preset_data = {
                        "name": unique_name,
                        "icon": preset.get("icon"),
                        "colors": preset["colors"],
                        "transition_time": preset["transition_time"],
                        "hold_time": preset["hold_time"],
                        "distribution_mode": preset["distribution_mode"],
                        "offset_delay": preset.get("offset_delay", 0.0),
                        "random_order": preset.get("random_order", False),
                        "loop_mode": preset["loop_mode"],
                        "loop_count": preset.get("loop_count"),
                        "end_behavior": preset["end_behavior"],
                        "audio_entity": preset.get("audio_entity"),
                        "audio_sensitivity": preset.get("audio_sensitivity"),
                        "audio_brightness_curve": preset.get("audio_brightness_curve"),
                        "audio_brightness_min": preset.get("audio_brightness_min"),
                        "audio_brightness_max": preset.get("audio_brightness_max"),
                        "audio_silence_behavior": preset.get("audio_silence_behavior"),
                        "audio_color_advance": preset.get("audio_color_advance"),
                        "audio_transition_speed": preset.get("audio_transition_speed"),
                        "audio_detection_mode": preset.get("audio_detection_mode"),
                        "audio_frequency_zone": preset.get("audio_frequency_zone"),
                        "audio_prediction_aggressiveness": preset.get("audio_prediction_aggressiveness"),
                        "audio_latency_compensation_ms": preset.get("audio_latency_compensation_ms"),
                        "audio_color_by_frequency": preset.get("audio_color_by_frequency"),
                        "audio_rolloff_brightness": preset.get("audio_rolloff_brightness"),
                    }

                    await self.add_preset(PRESET_TYPE_DYNAMIC_SCENE, new_preset_data)
                    existing_names.add(unique_name)
                    imported_counts["dynamic_scene_presets"] += 1
        finally:
            # Always re-enable callbacks even if import fails partway
            self._suppress_callbacks = False

        # Notify once for the entire import batch
        if sum(imported_counts.values()) > 0:
            await self._notify_update_callbacks()

        _LOGGER.info(
            "Imported %d presets (%d effects, %d patterns, %d CCT sequences, %d segment sequences, %d dynamic scenes)",
            sum(imported_counts.values()),
            imported_counts["effect_presets"],
            imported_counts["segment_pattern_presets"],
            imported_counts["cct_sequence_presets"],
            imported_counts["segment_sequence_presets"],
            imported_counts["dynamic_scene_presets"],
        )

        return imported_counts
