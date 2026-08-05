"""ZHA quirk definitions for Aqara lighting devices.

Defines the manufacturer-specific cluster (0xFCC0) with proper attribute
types and exposes hardware config settings as HA entities via QuirksV2.
This replaces direct zigpy internal manipulation with properly typed
cluster definitions that ZHA understands natively.
"""

import logging

_LOGGER = logging.getLogger(__name__)

# Aqara manufacturer code for Zigbee communication
AQARA_MANUFACTURER_CODE = 0x115F

# Cluster ID for Aqara manufacturer-specific attributes
CLUSTER_MANU_SPECIFIC_LUMI = 0xFCC0

# Track registration state to avoid duplicate registration
_quirks_registered = False

def register_quirks() -> None:
    """Register Aqara lighting device quirks with zigpy.

    Called from __init__.py before ZHA backend setup so that devices
    get the custom cluster applied during discovery.
    """
    global _quirks_registered  # noqa: PLW0603
    if _quirks_registered:
        return

    # zha-quirks 2.2 (shipped with HA 2026.8) moved CustomCluster and
    # QuirkBuilder out of zigpy.quirks.v2; the old paths still work but emit
    # DeprecationWarnings. Prefer the new locations, fall back for older cores.
    # See the legacy migration removal tracker.
    try:
        try:
            from zhaquirks.builder import QuirkBuilder
            from zhaquirks.clusters import CustomCluster
        except ImportError:
            from zigpy.quirks.v2 import CustomCluster, QuirkBuilder
        import zigpy.types as t
    except ImportError:
        _LOGGER.warning(
            "zigpy/zhaquirks not available, ZHA quirks will not be registered. "
            "Ensure ZHA integration is installed"
        )
        return

    # --- Custom cluster definition ---

    class AqaraLumiCluster(CustomCluster):
        """Aqara manufacturer-specific cluster (0xFCC0).

        Declares all Aqara lighting attributes with proper zigpy types
        so that reads and writes serialize correctly without manual
        type conversion or attribute registry patching.

        Includes float attribute compensation for ZHA's NumberConfigurationEntity
        which applies int() to all values before writing. Float attributes (t.Single)
        use a multiplier workaround: values are stored as scaled integers in the
        attribute cache and converted back to floats on write.
        """

        cluster_id = CLUSTER_MANU_SPECIFIC_LUMI
        name = "Aqara Opple"
        ep_attribute = "aqara_opple"

        # Float attributes that need multiplier compensation.
        # ZHA's NumberConfigurationEntity does int(value / multiplier) before
        # writing; we undo this in write_attributes and scale reads in
        # _update_attribute so the round-trip is lossless.
        # Maps attribute ID to multiplier:
        _FLOAT_ATTR_MULTIPLIERS = {
            0x0528: 0.01,  # transition_curve_curvature (t.Single, 0.2-6.0)
        }
        # Reverse lookup: attribute name to (attr_id, multiplier)
        _FLOAT_ATTR_BY_NAME = {
            "transition_curve_curvature": (0x0528, 0.01),
        }

        # Attribute names match Z2M converter naming conventions
        attributes = CustomCluster.attributes.copy()
        attributes.update(
            {
                0x0515: ("dimming_range_minimum", t.uint8_t, True),
                0x0516: ("dimming_range_maximum", t.uint8_t, True),
                0x0517: ("power_on_behavior", t.uint8_t, True),
                0x051B: ("length", t.uint8_t, True),
                0x051C: ("audio", t.uint8_t, True),
                0x051D: ("audio_effect", t.uint32_t, True),
                0x051E: ("audio_sensitivity", t.uint8_t, True),
                0x051F: ("effect", t.uint32_t, True),
                0x0520: ("effect_speed", t.uint8_t, True),
                0x0522: ("t1m_segment", t.LVBytes, True),
                0x0523: ("effect_colors", t.LVBytes, True),
                0x0527: ("strip_segment", t.LVBytes, True),
                0x0528: ("transition_curve_curvature", t.Single, True),
                0x052C: ("transition_initial_brightness", t.uint8_t, True),
                0x0530: ("effect_segments", t.LVBytes, True),
            }
        )

        def _update_attribute(self, attrid: int, value: object) -> None:
            """Scale float attribute values for ZHA's multiplier display.

            When the device reports a float value (e.g. 0.2 for curvature),
            scale it to a pseudo-integer (e.g. 20) so that ZHA's
            native_value property (cached_value * multiplier) displays the
            correct user-facing value (20 * 0.01 = 0.2).
            """
            multiplier = self._FLOAT_ATTR_MULTIPLIERS.get(attrid)
            if multiplier is not None and isinstance(value, float):
                value = round(value / multiplier)
            super()._update_attribute(attrid, value)

        async def write_attributes(
            self, attributes: dict, manufacturer: int | None = None
        ) -> list:
            """Write attributes with Aqara manufacturer code.

            Compensates for ZHA's int() cast on float attributes. ZHA's
            NumberConfigurationEntity writes int(user_value / multiplier),
            e.g. int(0.2 / 0.01) = 20. We detect the scaled integer (string
            key + int value) and convert it back to the device float value
            (20 * 0.01 = 0.2). Direct backend writes use integer attribute
            IDs with float values, which pass through unchanged.
            """
            processed = attributes
            for attr_name, val in attributes.items():
                if not isinstance(attr_name, str) or not isinstance(val, int):
                    continue
                entry = self._FLOAT_ATTR_BY_NAME.get(attr_name)
                if entry is not None:
                    _, multiplier = entry
                    if processed is attributes:
                        processed = dict(attributes)
                    processed[attr_name] = float(val) * multiplier
            return await super().write_attributes(
                processed, manufacturer=manufacturer or AQARA_MANUFACTURER_CODE
            )

    # --- Power-on behavior enums (value mappings differ by device family) ---

    class PowerOnBehaviorT1(t.enum8):
        """Power-on behavior for T1M and T1 Strip devices."""

        On = 0x00
        Previous = 0x01
        Off = 0x02

    class PowerOnBehaviorT2(t.enum8):
        """Power-on behavior for T2 bulb devices."""

        Off = 0x00
        On = 0x01
        Reverse = 0x02
        Restore = 0x03

    # --- Effect enums (value mappings differ by device family) ---

    class EffectT2(t.enum8):
        """Dynamic effect types for T2 RGB bulbs."""

        Off = 0x00
        Breathing = 0x01
        Candlelight = 0x02
        Fading = 0x03
        Flash = 0x04

    class EffectT1M(t.enum8):
        """Dynamic effect types for T1M ceiling lights."""

        Flow1 = 0x00
        Flow2 = 0x01
        Fading = 0x02
        Hopping = 0x03
        Breathing = 0x04
        Rolling = 0x05

    class EffectStrip(t.enum8):
        """Dynamic effect types for T1 LED strip."""

        Breathing = 0x00
        Rainbow1 = 0x01
        Chasing = 0x02
        Flash = 0x03
        Hopping = 0x04
        Rainbow2 = 0x05
        Flicker = 0x06
        Dash = 0x07

    # --- Audio enums (T1 Strip on-device music sync) ---

    class AudioEnable(t.enum8):
        """Audio-reactive mode enable/disable."""

        Off = 0x00
        On = 0x01

    class AudioEffect(t.enum8):
        """On-device audio effect types."""

        Random = 0x00
        Blink = 0x01
        Rainbow = 0x02
        Wave = 0x03

    class AudioSensitivity(t.enum8):
        """On-device audio sensitivity levels."""

        Low = 0x00
        High = 0x02

    # --- QuirksV2 registrations ---

    # Manufacturer strings used by Aqara devices in ZHA
    # Different devices may report as "Aqara" or "LUMI"
    _MANUFACTURERS = ("Aqara", "LUMI")

    # T1M ceiling lights (20 and 26 segment variants)
    _T1M_MODELS = ("lumi.light.acn031", "lumi.light.acn032")

    # T1 LED strip
    _T1_STRIP_MODELS = ("lumi.light.acn132",)

    # T2 RGB+CCT bulbs (E26, E27, GU10 110V, GU10 230V)
    _T2_BULB_MODELS = (
        "lumi.light.agl001",
        "lumi.light.agl003",
        "lumi.light.agl005",
        "lumi.light.agl007",
    )

    # T2 CCT-only bulbs (E26, E27, GU10 110V, GU10 230V)
    _T2_CCT_MODELS = (
        "lumi.light.agl002",
        "lumi.light.agl004",
        "lumi.light.agl006",
        "lumi.light.agl008",
    )

    # genLevelCtrl cluster ID for transition time attributes
    CLUSTER_LEVEL_CONTROL = 0x0008

    def _add_common_number_attrs(builder: QuirkBuilder) -> QuirkBuilder:
        """Add dimming range and transition time number entities."""
        return (
            builder.number(
                "dimming_range_minimum",
                AqaraLumiCluster.cluster_id,
                min_value=1,
                max_value=100,
                step=1,
                translation_key="dimming_range_minimum",
                fallback_name="Dimming range minimum",
            )
            .number(
                "dimming_range_maximum",
                AqaraLumiCluster.cluster_id,
                min_value=1,
                max_value=100,
                step=1,
                translation_key="dimming_range_maximum",
                fallback_name="Dimming range maximum",
            )
            .number(
                "on_transition_time",
                CLUSTER_LEVEL_CONTROL,
                min_value=0,
                max_value=10,
                step=0.5,
                multiplier=0.1,
                unit="s",
                translation_key="off_on_duration",
                fallback_name="Off on duration",
            )
            .number(
                "off_transition_time",
                CLUSTER_LEVEL_CONTROL,
                min_value=0,
                max_value=10,
                step=0.5,
                multiplier=0.1,
                unit="s",
                translation_key="on_off_duration",
                fallback_name="On off duration",
            )
        )

    registered_count = 0

    for manufacturer in _MANUFACTURERS:
        # T1M models: dimming range + durations + power-on behavior
        for model in _T1M_MODELS:
            (
                _add_common_number_attrs(
                    QuirkBuilder(manufacturer, model)
                    .replaces(AqaraLumiCluster)
                    .enum(
                        "power_on_behavior",
                        PowerOnBehaviorT1,
                        AqaraLumiCluster.cluster_id,
                        translation_key="power_on_behavior",
                        fallback_name="Power on behavior",
                    )
                )
                .enum(
                    "effect",
                    EffectT1M,
                    AqaraLumiCluster.cluster_id,
                    translation_key="effect",
                    fallback_name="Effect",
                )
                .number(
                    "effect_speed",
                    AqaraLumiCluster.cluster_id,
                    min_value=1,
                    max_value=100,
                    step=1,
                    translation_key="effect_speed",
                    fallback_name="Effect speed",
                )
                .add_to_registry()
            )
            registered_count += 1

        # T1 Strip: dimming range + durations + strip length + power-on behavior
        for model in _T1_STRIP_MODELS:
            (
                _add_common_number_attrs(
                    QuirkBuilder(manufacturer, model)
                    .replaces(AqaraLumiCluster)
                    .enum(
                        "power_on_behavior",
                        PowerOnBehaviorT1,
                        AqaraLumiCluster.cluster_id,
                        translation_key="power_on_behavior",
                        fallback_name="Power on behavior",
                    )
                )
                .number(
                    "length",
                    AqaraLumiCluster.cluster_id,
                    min_value=1,
                    max_value=10,
                    step=0.2,
                    multiplier=0.2,
                    unit="m",
                    translation_key="length",
                    fallback_name="Length",
                )
                .enum(
                    "effect",
                    EffectStrip,
                    AqaraLumiCluster.cluster_id,
                    translation_key="effect",
                    fallback_name="Effect",
                )
                .number(
                    "effect_speed",
                    AqaraLumiCluster.cluster_id,
                    min_value=1,
                    max_value=100,
                    step=1,
                    translation_key="effect_speed",
                    fallback_name="Effect speed",
                )
                .enum(
                    "audio",
                    AudioEnable,
                    AqaraLumiCluster.cluster_id,
                    translation_key="audio",
                    fallback_name="Audio reactive",
                )
                .enum(
                    "audio_effect",
                    AudioEffect,
                    AqaraLumiCluster.cluster_id,
                    translation_key="audio_effect",
                    fallback_name="Audio effect",
                )
                .enum(
                    "audio_sensitivity",
                    AudioSensitivity,
                    AqaraLumiCluster.cluster_id,
                    translation_key="audio_sensitivity",
                    fallback_name="Audio sensitivity",
                )
                .add_to_registry()
            )
            registered_count += 1

        # T2 RGB bulbs: dimming range + durations + transition curve + initial brightness + power-on
        for model in _T2_BULB_MODELS:
            (
                _add_common_number_attrs(
                    QuirkBuilder(manufacturer, model)
                    .replaces(AqaraLumiCluster)
                    .enum(
                        "power_on_behavior",
                        PowerOnBehaviorT2,
                        AqaraLumiCluster.cluster_id,
                        translation_key="power_on_behavior",
                        fallback_name="Power on behavior",
                    )
                )
                .number(
                    "transition_curve_curvature",
                    AqaraLumiCluster.cluster_id,
                    min_value=0.2,
                    max_value=6.0,
                    step=0.01,
                    multiplier=0.01,
                    translation_key="transition_curve_curvature",
                    fallback_name="Transition curve curvature",
                )
                .number(
                    "transition_initial_brightness",
                    AqaraLumiCluster.cluster_id,
                    min_value=0,
                    max_value=50,
                    step=1,
                    translation_key="transition_initial_brightness",
                    fallback_name="Transition initial brightness",
                )
                .enum(
                    "effect",
                    EffectT2,
                    AqaraLumiCluster.cluster_id,
                    translation_key="effect",
                    fallback_name="Effect",
                )
                .number(
                    "effect_speed",
                    AqaraLumiCluster.cluster_id,
                    min_value=1,
                    max_value=100,
                    step=1,
                    translation_key="effect_speed",
                    fallback_name="Effect speed",
                )
                .add_to_registry()
            )
            registered_count += 1

        # T2 CCT bulbs: dimming range + durations + transition curve + initial brightness + power-on
        for model in _T2_CCT_MODELS:
            (
                _add_common_number_attrs(
                    QuirkBuilder(manufacturer, model)
                    .replaces(AqaraLumiCluster)
                    .enum(
                        "power_on_behavior",
                        PowerOnBehaviorT2,
                        AqaraLumiCluster.cluster_id,
                        translation_key="power_on_behavior",
                        fallback_name="Power on behavior",
                    )
                )
                .number(
                    "transition_curve_curvature",
                    AqaraLumiCluster.cluster_id,
                    min_value=0.2,
                    max_value=6.0,
                    step=0.01,
                    multiplier=0.01,
                    translation_key="transition_curve_curvature",
                    fallback_name="Transition curve curvature",
                )
                .number(
                    "transition_initial_brightness",
                    AqaraLumiCluster.cluster_id,
                    min_value=0,
                    max_value=50,
                    step=1,
                    translation_key="transition_initial_brightness",
                    fallback_name="Transition initial brightness",
                )
                .add_to_registry()
            )
            registered_count += 1

    _quirks_registered = True
    _LOGGER.info(
        "Registered %d Aqara lighting device quirks", registered_count
    )
