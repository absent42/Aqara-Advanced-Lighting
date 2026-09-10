# Aqara Advanced Lighting v1.3.4

Fix release to address issues created by HA breaking changes in ZHA/Zigpy.

## Upgrade Instructions

**Requires Home Assistant 2026.8 or later.** If you are on an earlier version, update Home Assistant first.

1. Update via HACS to v1.3.2
2. Restart Home Assistant
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R), clear HA app cache

---

### Breaking Changes

  - Home Assistant 2026.8 or newer is now required, up from 2026.6. The code that merged this integration's config entry into the Zigbee2MQTT or ZHA device on older cores has been removed, along with the fallbacks for the older zigpy and zha-quirks import paths and attribute definitions. On 2026.8 and later nothing changes: since that release the integration has registered its own device beside the Zigbee2MQTT or ZHA one.

### Fixed

  - Effects, segment patterns and segment sequences failed on the ZHA backend, logging a `KeyError` for every attribute write, whenever ZHA started after this integration: on a first installation where ZHA was added afterwards, or when ZHA's start was delayed and retried. ZHA in Home Assistant 2026.8 and later applies the most recently registered quirk for a model, and zha-quirks now ships its own quirks for the T1M and T1 Strip whose cluster does not define the Aqara effect and segment attributes, so whichever registered last decided whether effects could be written. The integration now loads the built-in zha-quirks before registering its own, so its quirk is applied regardless of the order in which ZHA and this integration start.
  - The one-time ZHA reload that applies the integration's quirks is now decided by inspecting the devices ZHA has resolved, rather than by whether ZHA had finished loading before this integration. A device that ZHA resolved while the integration was still registering its quirks is now corrected as well, the log names the devices a reload is for, and a device that still lacks the quirk after the reload is reported in the log instead of failing silently on its first effect.
  - The ZHA backend looked its devices up under the first ZHA config entry Home Assistant listed, which can be a dismissed ZHA discovery: an ignored or disabled entry created before the real one. Devices were then discovered but no light entity was mapped, the log showed "No HA device found for ZHA device" through six retries, and effects and patterns could not be activated while dynamic scenes still worked. Only loaded ZHA entries are consulted now, and that log line names the entries it tried.
  - The Zigbee2MQTT backend looked the light's own device up the same way when setting the "Connected via" link, so a dismissed Mosquitto discovery left our device card without the link. Only loaded MQTT entries are consulted now.
  - The error shown when a selected light is not a supported Aqara device told ZHA users to pick lights connected via Zigbee2MQTT. It now names both backends.

### Internal

  - The Aqara cluster attributes now declare the Aqara manufacturer code explicitly. zigpy 2.1 deprecates manufacturer-specific attributes without one and logged a warning on every lookup.
  - The test suite no longer carries expected failures. The five tests that asserted the pre-2026.8 shared-device model were rewritten or deleted, and assertions that used `device_registry.async_get_device`, which Home Assistant deprecates for 2027.8, now look devices up per config entry.
  - Eleven leftover `--mdc-icon-button-size` declarations, which Home Assistant stopped reading in 2026.3, were removed from the panel's icon button styles. Each sat beside the `--ha-icon-button-size` declaration that already sizes those buttons, so nothing changes visually. A frontend test now fails if a token the frontend no longer reads is reintroduced.

## Full Changelog

[View full changelog](https://github.com/absent42/Aqara-Advanced-Lighting/blob/main/CHANGELOG.md)

## Support

- [Report Issues](https://github.com/absent42/Aqara-Advanced-Lighting/issues)
- [Documentation](https://github.com/absent42/Aqara-Advanced-Lighting)
- [Contributing Guidelines](https://github.com/absent42/Aqara-Advanced-Lighting/blob/main/CONTRIBUTING.md)

---

If you find this integration useful, please star the repository

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png)](https://www.buymeacoffee.com/absent42)
