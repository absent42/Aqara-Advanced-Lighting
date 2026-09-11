# Aqara Advanced Lighting v1.3.5

Fix release to address issues created by HA breaking changes in HA/ZHA/Zigpy.

## Upgrade Instructions

**Requires Home Assistant 2026.8 or later.** If you are on an earlier version, update Home Assistant first.

1. Update via HACS to v1.3.5
2. Restart Home Assistant
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R), clear HA app cache

---

### Breaking Changes

  - Home Assistant 2026.8 or newer is now required, up from 2026.6. The code that merged this integration's config entry into the Zigbee2MQTT or ZHA device on older cores has been removed, along with the fallbacks for the older zigpy and zha-quirks import paths and attribute definitions. On 2026.8 and later nothing changes: since that release the integration has registered its own device beside the Zigbee2MQTT or ZHA one.

### Fixed

  - `start_segment_sequence` and `start_cct_sequence` rejected every call that carried `step_N_*` fields on Home Assistant 2026.9 and later, with "not a valid value at 'step_1_segments'" or "'step_1_color_temp'" returned before the handler ran. Activating or previewing a custom segment sequence or CCT sequence, including saved presets, failed from the panel, the dashboard card, scripts and Developer Tools; built-in effects, segment patterns and dynamic scenes were unaffected. Home Assistant 2026.9 replaced voluptuous with probatio, which no longer accepts a schema entry whose validator is wrapped in `vol.Optional`. The step fields are now declared with the marker on the key, like the rest of the service schemas.

### Changed

  - `set_dynamic_effect` now requires `audio_entity` to be a `binary_sensor`, as `start_dynamic_scene` already did, and the effect editor's audio entity picker only offers binary sensors. The audio engine treats the entity as the beat signal and only reacts to a state of `on`, so a numeric sensor never produced beats on its own; it only appeared to work when its ESPHome device also exposed an onset binary sensor, which companion discovery found. An effect preset saved with a plain sensor entity is now rejected on activation with an error naming the field, and needs re-pointing at the device's beat binary sensor.

## Full Changelog

[View full changelog](https://github.com/absent42/Aqara-Advanced-Lighting/blob/main/CHANGELOG.md)

## Support

- [Report Issues](https://github.com/absent42/Aqara-Advanced-Lighting/issues)
- [Documentation](https://github.com/absent42/Aqara-Advanced-Lighting)
- [Contributing Guidelines](https://github.com/absent42/Aqara-Advanced-Lighting/blob/main/CONTRIBUTING.md)

---

If you find this integration useful, please star the repository

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png)](https://www.buymeacoffee.com/absent42)
