"""Service schema validation for the sequence services.

Home Assistant 2026.9 replaced voluptuous with probatio, which rejects a
schema whose value is a Marker such as vol.Optional(validator). The step
fields must therefore be declared as vol.Optional(key): validator.
"""

import pytest
import voluptuous as vol

from custom_components.aqara_advanced_lighting.services._schemas import (
    SERVICE_SET_DYNAMIC_EFFECT_SCHEMA,
    SERVICE_START_CCT_SEQUENCE_SCHEMA,
    SERVICE_START_DYNAMIC_SCENE_SCHEMA,
    SERVICE_START_SEGMENT_SEQUENCE_SCHEMA,
)

SEGMENT_CALL = {
    "entity_id": "light.zz_probe",
    "step_1_segments": "1-3",
    "step_1_color_1": [255, 0, 0],
    "step_1_duration": 2,
}

CCT_CALL = {
    "entity_id": "light.zz_probe",
    "step_1_color_temp": 3000,
    "step_1_brightness": 50,
    "step_1_transition": 1,
    "step_1_hold": 2,
}


class TestSegmentSequenceStepFields:
    def test_accepts_step_fields(self):
        result = SERVICE_START_SEGMENT_SEQUENCE_SCHEMA(SEGMENT_CALL)
        assert result["step_1_segments"] == "1-3"
        assert result["step_1_color_1"] == [255, 0, 0]
        assert result["step_1_duration"] == 2.0

    def test_step_fields_absent_when_omitted(self):
        result = SERVICE_START_SEGMENT_SEQUENCE_SCHEMA(
            {"entity_id": "light.zz_probe", "preset": "p"}
        )
        assert not any(key.startswith("step_") for key in result)

    def test_rejects_invalid_step_value(self):
        with pytest.raises(vol.Invalid) as excinfo:
            SERVICE_START_SEGMENT_SEQUENCE_SCHEMA(
                {"entity_id": "light.zz_probe", "step_1_duration": "abc"}
            )
        assert excinfo.value.path == ["step_1_duration"]


class TestCctSequenceStepFields:
    def test_accepts_step_fields(self):
        result = SERVICE_START_CCT_SEQUENCE_SCHEMA(CCT_CALL)
        assert result["step_1_color_temp"] == 3000
        assert result["step_1_brightness"] == 50
        assert result["step_1_transition"] == 1.0
        assert result["step_1_hold"] == 2.0

    def test_rejects_invalid_step_value(self):
        with pytest.raises(vol.Invalid) as excinfo:
            SERVICE_START_CCT_SEQUENCE_SCHEMA(
                {"entity_id": "light.zz_probe", "step_1_color_temp": 1}
            )
        assert excinfo.value.path == ["step_1_color_temp"]


@pytest.mark.parametrize(
    "schema",
    [SERVICE_START_SEGMENT_SEQUENCE_SCHEMA, SERVICE_START_CCT_SEQUENCE_SCHEMA],
    ids=["segment_sequence", "cct_sequence"],
)
def test_no_marker_used_as_validator(schema):
    """Every step key must carry its Marker on the key side, for all steps."""
    offenders = [
        key
        for key, validator in schema.schema.items()
        if isinstance(validator, vol.Marker)
    ]
    assert offenders == []


@pytest.mark.parametrize(
    "schema",
    [SERVICE_SET_DYNAMIC_EFFECT_SCHEMA, SERVICE_START_DYNAMIC_SCENE_SCHEMA],
    ids=["dynamic_effect", "dynamic_scene"],
)
class TestAudioEntityDomain:
    """The audio entity is the beat binary sensor for both audio consumers."""

    def test_accepts_binary_sensor(self, schema):
        result = schema(
            {"entity_id": "light.zz_probe", "audio_entity": "binary_sensor.beat"}
        )
        assert result["audio_entity"] == "binary_sensor.beat"

    def test_rejects_other_domain(self, schema):
        with pytest.raises(vol.Invalid) as excinfo:
            schema({"entity_id": "light.zz_probe", "audio_entity": "sensor.level"})
        assert excinfo.value.path == ["audio_entity"]
