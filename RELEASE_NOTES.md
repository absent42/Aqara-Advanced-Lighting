# Aqara Advanced Lighting v1.3.2

A compatibility release for Home Assistant 2026.8, which changes how integrations share devices. Two bugs this caused are fixed, and the minimum supported Home Assistant version moves to 2026.6.

## Upgrade Instructions

**Requires Home Assistant 2026.6 or later.** If you are on an earlier version, update Home Assistant first.

1. Update via HACS to v1.3.2
2. Restart Home Assistant
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R), clear HA app cache

Your configuration, presets, and favorites are preserved. Read the two notes below if you are on Home Assistant 2026.8, or if you import preset files exported before April 2026.

---

### Home Assistant 2026.8: your lights now have two device pages

Home Assistant 2026.8 restricts every device to a single integration. This integration can no longer attach itself to the Zigbee2MQTT or ZHA device for a bulb, so each Aqara light now appears as two device pages:

  - the Zigbee2MQTT (or ZHA) device, holding the light entity
  - an Aqara Advanced Lighting device, holding this integration's device triggers and conditions

Home Assistant's "Linked Devices" section on each page links the two together, so you can move between them in one click.

**Your existing automations keep working.** Home Assistant maps references to the old combined device onto both new ones.

Two things do change, and neither can be worked around by this integration:

  - **Areas** are assigned per device, so a bulb's two pages each need their own area
  - **New device automations** must target the Aqara Advanced Lighting device to reach this integration's triggers and conditions

### Fixed

  - **Devices were wiped and re-created on every restart under 2026.8.** This lost area assignments and custom device names each time, and broke the link Home Assistant uses to keep existing automations working. If you already upgraded to 2026.8 and lost device settings, reapply them once after installing this release and they will stick.
  - **Device triggers and conditions stopped working for Zigbee2MQTT users on 2026.8.** The identifier they match on was dropped during Home Assistant's device migration. Automations using Aqara device triggers or conditions will work again after this update.
  - **Device pages showed the wrong firmware version.** Devices separated by the 2026.8 migration kept a copy of the Zigbee2MQTT or ZHA firmware string that never updated. The bulb's own firmware is now reported, or left blank when it does not report one.

### Removed: conversion of pre-April-2026 preset exports

Two audio settings were renamed in v1.3.0, and the conversion for the old names has now been removed.

Presets stored in Home Assistant were converted automatically when you first ran v1.3.0 and are **not affected**. This only matters if you import a preset JSON file that you exported before April 2026: two dynamic scene settings will silently fall back to defaults.

  - Silence behaviour falls back to "slow cycle"
  - Brightness response falls back to the linear 30-100 curve

Everything else in the file imports normally. Re-save the affected scenes after importing to set those two the way you want. Files exported by v1.3.0 or later are unaffected.

### Other changes

  - Removed the remaining v1.3.0 preference conversions, which have had four months to run. If you have not opened the integration since April 2026, two per-user audio override settings revert to their defaults, and a favorites sort still set to "Oldest first" keeps its ordering but shows no drag handles until you switch it to "Custom".
  - Removed the browser-storage import from February 2026, which moved colour history and sort preferences onto the server the first time you opened the panel. It ran per browser, so a browser you have not opened the panel in since then starts from defaults rather than importing what it had saved. Anything already on the server is unaffected, including in that browser.
  - ZHA quirk registration uses the current zha-quirks import paths, silencing deprecation warnings on 2026.8.
  - Dropped frontend compatibility code for Home Assistant releases older than 2026.6. No visible change on supported versions.

## Full Changelog

[View full changelog](https://github.com/absent42/Aqara-Advanced-Lighting/blob/main/CHANGELOG.md#132---2026-08-05)

## Support

- [Report Issues](https://github.com/absent42/Aqara-Advanced-Lighting/issues)
- [Documentation](https://github.com/absent42/Aqara-Advanced-Lighting)
- [Contributing Guidelines](https://github.com/absent42/Aqara-Advanced-Lighting/blob/main/CONTRIBUTING.md)

---

If you find this integration useful, please star the repository

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png)](https://www.buymeacoffee.com/absent42)
