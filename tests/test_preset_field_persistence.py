"""Guard every field the panel editors save against silent field-dropping.

`PresetStore._filter_preset_fields` discards any key not listed in
`_ALLOWED_FIELDS` for the preset type. It does so silently -- no log, no error,
no rejected save. A field an editor sends but the allow-list omits is therefore
silent data loss: the setting appears to save, then reverts on reload.

This module encodes, per preset type, every key the corresponding editor puts
into its save payload, and asserts each one survives the filter. The expected
key lists are deliberately hand-maintained literals rather than parsed out of
the TypeScript at run time: a parser that silently stopped matching would make
this test pass while catching nothing. When an editor gains a payload field,
this test is meant to fail loudly until the field is added both here and to
`_ALLOWED_FIELDS`.

Each list cites the editor and the line the keys were read from, so the source
of truth can be re-checked when it moves.
"""

from custom_components.aqara_advanced_lighting.const import (
    PRESET_TYPE_CCT_SEQUENCE,
    PRESET_TYPE_DYNAMIC_SCENE,
    PRESET_TYPE_EFFECT,
    PRESET_TYPE_SEGMENT_PATTERN,
    PRESET_TYPE_SEGMENT_SEQUENCE,
    VALID_PRESET_TYPES,
)
from custom_components.aqara_advanced_lighting.preset_store import (
    _ALLOWED_FIELDS,
    PresetStore,
)

# Keys each editor's _getPresetData() places in the save payload, including
# the conditionally-added ones. Paths are relative to
# custom_components/aqara_advanced_lighting/frontend_src/src/.
EDITOR_PAYLOAD_FIELDS: dict[str, tuple[str, frozenset[str]]] = {
    # effect-editor.ts:484-513 _getPresetData()
    #   effect_segments added at :498 only for device_type t1_strip
    #   audio_config added at :502 only when audio is enabled
    PRESET_TYPE_EFFECT: (
        "effect-editor.ts:484",
        frozenset(
            {
                "name",
                "icon",
                "thumbnail",
                "device_type",
                "effect",
                "effect_speed",
                "effect_brightness",
                "effect_colors",
                "effect_segments",
                "audio_config",
            }
        ),
    ),
    # pattern-editor.ts:431-449 _getPresetData()
    PRESET_TYPE_SEGMENT_PATTERN: (
        "pattern-editor.ts:431",
        frozenset(
            {
                "name",
                "icon",
                "device_type",
                "segments",
                "turn_off_unspecified",
                "thumbnail",
            }
        ),
    ),
    # cct-sequence-editor.ts:633-673 _getPresetData()
    #   mode/schedule_steps/solar_steps/auto_resume_delay are per-mode branches
    #   loop_count added at :669 only for loop_mode 'count'
    PRESET_TYPE_CCT_SEQUENCE: (
        "cct-sequence-editor.ts:633",
        frozenset(
            {
                "name",
                "icon",
                "mode",
                "schedule_steps",
                "solar_steps",
                "steps",
                "loop_mode",
                "loop_count",
                "end_behavior",
                "skip_first_in_loop",
                "auto_resume_delay",
            }
        ),
    ),
    # segment-sequence-editor.ts:698-761 _getPresetData()
    #   loop_count added at :758 only for loop_mode 'count'
    PRESET_TYPE_SEGMENT_SEQUENCE: (
        "segment-sequence-editor.ts:698",
        frozenset(
            {
                "name",
                "icon",
                "device_type",
                "steps",
                "loop_mode",
                "loop_count",
                "end_behavior",
                "clear_segments",
                "skip_first_in_loop",
                "thumbnail",
            }
        ),
    ),
    # dynamic-scene-editor.ts:868-909 _getPresetData()
    #   loop_count added at :888 only for loop_mode 'count'
    #   audio_* added at :893-906 only when audio is enabled with an entity
    PRESET_TYPE_DYNAMIC_SCENE: (
        "dynamic-scene-editor.ts:868",
        frozenset(
            {
                "name",
                "icon",
                "thumbnail",
                "colors",
                "transition_time",
                "hold_time",
                "distribution_mode",
                "offset_delay",
                "random_order",
                "loop_mode",
                "loop_count",
                "end_behavior",
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
            }
        ),
    ),
}


def test_every_editor_field_survives_the_filter():
    """No field an editor saves may be silently dropped by the allow-list.

    Regression guard for the class of bug where a new editor control is wired
    up but its key is never added to `_ALLOWED_FIELDS`, so the setting is
    discarded on save with no diagnostic (`turn_off_unspecified` on segment
    patterns, `skip_first_in_loop` on segment sequences).
    """
    dropped: dict[str, list[str]] = {}

    for preset_type, (source, fields) in EDITOR_PAYLOAD_FIELDS.items():
        payload = {field: "sentinel" for field in fields}
        survived = PresetStore._filter_preset_fields(payload, preset_type)
        missing = sorted(fields - set(survived))
        if missing:
            dropped[f"{preset_type} (from {source})"] = missing

    assert not dropped, (
        "Editor payload fields dropped by _ALLOWED_FIELDS in preset_store.py. "
        "Each of these is silently discarded on save and reverts on reload: "
        f"{dropped}"
    )


def test_filter_preserves_values_not_just_keys():
    """A surviving key must keep its value unchanged."""
    payload = {"name": "Sunset", "turn_off_unspecified": True}
    survived = PresetStore._filter_preset_fields(
        payload, PRESET_TYPE_SEGMENT_PATTERN
    )
    assert survived["name"] == "Sunset"
    assert survived["turn_off_unspecified"] is True


def test_unknown_fields_are_still_rejected():
    """The allow-list must keep filtering, not degrade into a pass-through."""
    payload = {"name": "Sunset", "definitely_not_a_preset_field": 1}
    survived = PresetStore._filter_preset_fields(
        payload, PRESET_TYPE_SEGMENT_PATTERN
    )
    assert "definitely_not_a_preset_field" not in survived


def test_every_preset_type_has_an_allow_list_and_expectations():
    """Every valid preset type must be covered here and in the allow-list.

    A new preset type that is missing from `_ALLOWED_FIELDS` would bypass
    filtering entirely (`_filter_preset_fields` returns the data unchanged when
    no set is registered); one missing from this module would go unguarded.
    """
    for preset_type in VALID_PRESET_TYPES:
        assert preset_type in _ALLOWED_FIELDS, (
            f"{preset_type} has no _ALLOWED_FIELDS entry, so preset data of "
            "that type is stored unfiltered"
        )
        assert preset_type in EDITOR_PAYLOAD_FIELDS, (
            f"{preset_type} has no expected editor payload recorded in "
            "EDITOR_PAYLOAD_FIELDS, so its fields are unguarded"
        )
