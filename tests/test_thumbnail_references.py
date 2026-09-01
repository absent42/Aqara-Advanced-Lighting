"""Test thumbnail reference collection for orphan cleanup."""

from unittest.mock import MagicMock

from custom_components.aqara_advanced_lighting.const import (
    PRESET_TYPE_DYNAMIC_SCENE,
    PRESET_TYPE_EFFECT,
    PRESET_TYPE_SEGMENT_PATTERN,
    PRESET_TYPE_SEGMENT_SEQUENCE,
    THUMBNAIL_STORAGE_DIR,
)
from custom_components.aqara_advanced_lighting.preset_store import (
    _ALLOWED_FIELDS,
    PresetStore,
    _collect_referenced_thumbnails,
)


def test_collects_from_every_preset_type():
    """Thumbnails on any preset type must be seen as referenced.

    Regression guard: collection used to scan dynamic_scene_presets only, so a
    thumbnail belonging to any other preset type was treated as an orphan and
    deleted at startup.
    """
    data = {
        "dynamic_scene_presets": [{"id": "a", "thumbnail": "thumb-scene"}],
        "effect_presets": [{"id": "b", "thumbnail": "thumb-effect"}],
        "segment_pattern_presets": [{"id": "c", "thumbnail": "thumb-pattern"}],
        "segment_sequence_presets": [{"id": "d", "thumbnail": "thumb-sequence"}],
    }

    assert _collect_referenced_thumbnails(data) == {
        "thumb-scene",
        "thumb-effect",
        "thumb-pattern",
        "thumb-sequence",
    }


def test_ignores_presets_without_thumbnails():
    data = {"effect_presets": [{"id": "a"}, {"id": "b", "thumbnail": None}]}
    assert _collect_referenced_thumbnails(data) == set()


def test_tolerates_non_list_and_non_dict_values():
    """Store data holds bookkeeping keys alongside preset lists."""
    data = {
        "version": 1,
        "effect_presets": [{"id": "a", "thumbnail": "keep"}, "junk"],
        "pending_thumbnails": {},
    }
    assert _collect_referenced_thumbnails(data) == {"keep"}


def test_empty_store_references_nothing():
    assert _collect_referenced_thumbnails({}) == set()


def test_ignores_non_string_thumbnail_values():
    """Non-string thumbnail values must not reach the referenced set.

    A stored int would collect as 123 and never match the "123" file stem, so
    the file is deleted anyway; a stored dict or list raises TypeError on
    set.add, which find_orphans' caller swallows at debug level, silently
    disabling cleanup forever. Field filtering checks keys, not value types,
    so an authenticated client can persist either.
    """
    data = {
        "effect_presets": [
            {"id": "a", "thumbnail": 123},
            {"id": "b", "thumbnail": {"nested": "dict"}},
            {"id": "c", "thumbnail": ["list"]},
            {"id": "d", "thumbnail": "real"},
        ]
    }
    assert _collect_referenced_thumbnails(data) == {"real"}


def test_thumbnail_allowed_on_every_thumbnail_bearing_preset_type():
    """Every preset type that can carry an image must permit the field.

    Silent failure mode: _filter_preset_fields drops an unlisted thumbnail
    from the payload, add_preset then never persists the pending image, and
    the user loses it with no error until they reload.
    """
    for preset_type in (
        PRESET_TYPE_EFFECT,
        PRESET_TYPE_SEGMENT_PATTERN,
        PRESET_TYPE_SEGMENT_SEQUENCE,
        PRESET_TYPE_DYNAMIC_SCENE,
    ):
        assert "thumbnail" in _ALLOWED_FIELDS[preset_type]


async def test_cleanup_deletes_only_unreferenced_thumbnail_files(tmp_path):
    """End-to-end guard on the cleanup call site, not just the helper.

    The helper being correct is not enough: re-narrowing the call site to
    dynamic scenes alone deletes every other type's image while leaving the
    helper and its unit tests green.
    """
    thumb_dir = tmp_path / ".storage" / THUMBNAIL_STORAGE_DIR
    thumb_dir.mkdir(parents=True)
    for stem in ("t-scene", "t-effect", "t-pattern", "t-seqstep", "t-real-orphan"):
        (thumb_dir / f"{stem}.jpg").write_bytes(b"x")

    async def run_job(func, *args):
        return func(*args)

    hass = MagicMock()
    hass.config.path = lambda rel: str(tmp_path / rel)
    hass.async_add_executor_job = run_job

    store = object.__new__(PresetStore)
    store.hass = hass
    store._data = {
        "effect_presets": [{"id": "b", "thumbnail": "t-effect"}],
        "segment_pattern_presets": [{"id": "c", "thumbnail": "t-pattern"}],
        "cct_sequence_presets": [],
        "segment_sequence_presets": [{"id": "d", "thumbnail": "t-seqstep"}],
        "dynamic_scene_presets": [{"id": "a", "thumbnail": "t-scene"}],
    }

    await store._async_cleanup_orphaned_thumbnails()

    assert sorted(path.name for path in thumb_dir.iterdir()) == [
        "t-effect.jpg",
        "t-pattern.jpg",
        "t-scene.jpg",
        "t-seqstep.jpg",
    ]
