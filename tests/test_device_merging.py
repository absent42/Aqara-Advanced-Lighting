"""Test how our devices sit beside Zigbee2MQTT's in the device registry.

Since Home Assistant 2026.8 a device belongs to exactly one config entry and
identifiers and connections are unique per config entry, so an Aqara light has
two device entries: the one Zigbee2MQTT or ZHA owns, carrying the light entity,
and ours, carrying the device triggers and conditions. Ours also carries the
MQTT identifier so the frontend's "Linked Devices" element cross-links the two.
These tests pin the registry behaviour the MQTT backend relies on.
"""

import pytest

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr

from custom_components.aqara_advanced_lighting.const import (
    CONF_Z2M_BASE_TOPIC,
    DOMAIN,
)

from pytest_homeassistant_custom_component.common import MockConfigEntry

# Test constants matching a typical Aqara Zigbee device
TEST_IEEE = "0x00158d0001abcdef"
TEST_MAC = "00:15:8d:00:01:ab:cd:ef"
MQTT_IDENTIFIER = ("mqtt", f"zigbee2mqtt_bridge_{TEST_IEEE}")
OUR_IDENTIFIER = (DOMAIN, TEST_IEEE)


@pytest.fixture
def z2m_config_entry() -> MockConfigEntry:
    """Create a mock config entry simulating Zigbee2MQTT."""
    return MockConfigEntry(
        domain="mqtt",
        title="Zigbee2MQTT",
        data={"broker": "localhost"},
        unique_id="z2m_bridge",
    )


@pytest.fixture
def aal_config_entry() -> MockConfigEntry:
    """Create a mock config entry for Aqara Advanced Lighting."""
    return MockConfigEntry(
        domain=DOMAIN,
        title="Aqara Lighting (zigbee2mqtt)",
        data={CONF_Z2M_BASE_TOPIC: "zigbee2mqtt"},
        unique_id="zigbee2mqtt",
    )


def _register_z2m_device(
    device_reg: dr.DeviceRegistry, entry: MockConfigEntry
) -> dr.DeviceEntry:
    """Register the light the way Zigbee2MQTT discovery does."""
    return device_reg.async_get_or_create(
        config_entry_id=entry.entry_id,
        connections={(dr.CONNECTION_NETWORK_MAC, TEST_MAC)},
        identifiers={MQTT_IDENTIFIER},
        name="Bedroom Light",
        manufacturer="Aqara",
        model="T2 RGB+CCT bulb (E27)",
    )


def _register_our_device(
    device_reg: dr.DeviceRegistry, entry: MockConfigEntry
) -> dr.DeviceEntry:
    """Register the light the way MQTTBackend does: our device, both identifiers."""
    return device_reg.async_get_or_create(
        config_entry_id=entry.entry_id,
        connections={(dr.CONNECTION_NETWORK_MAC, TEST_MAC)},
        identifiers={OUR_IDENTIFIER, MQTT_IDENTIFIER},
    )


async def test_our_device_is_separate_from_the_z2m_device(
    hass: HomeAssistant,
    z2m_config_entry: MockConfigEntry,
    aal_config_entry: MockConfigEntry,
) -> None:
    """Registering after Z2M creates our own device instead of joining Z2M's."""
    z2m_config_entry.add_to_hass(hass)
    aal_config_entry.add_to_hass(hass)
    device_reg = dr.async_get(hass)

    z2m_device = _register_z2m_device(device_reg, z2m_config_entry)
    aal_device = _register_our_device(device_reg, aal_config_entry)

    assert aal_device.id != z2m_device.id
    assert aal_device.primary_config_entry == aal_config_entry.entry_id
    assert aal_device.identifiers == {OUR_IDENTIFIER, MQTT_IDENTIFIER}

    # Z2M's device is left untouched
    z2m_device = device_reg.async_get(z2m_device.id)
    assert z2m_device.primary_config_entry == z2m_config_entry.entry_id
    assert z2m_device.identifiers == {MQTT_IDENTIFIER}

    # Each is found by identifier under its own config entry
    ours = device_reg.async_get_device_by_identifier(
        OUR_IDENTIFIER, aal_config_entry.entry_id
    )
    theirs = device_reg.async_get_device_by_identifier(
        MQTT_IDENTIFIER, z2m_config_entry.entry_id
    )
    assert ours is not None and ours.id == aal_device.id
    assert theirs is not None and theirs.id == z2m_device.id


async def test_registration_order_does_not_change_the_outcome(
    hass: HomeAssistant,
    z2m_config_entry: MockConfigEntry,
    aal_config_entry: MockConfigEntry,
) -> None:
    """Our device registered before Z2M's is not absorbed when Z2M registers later."""
    z2m_config_entry.add_to_hass(hass)
    aal_config_entry.add_to_hass(hass)
    device_reg = dr.async_get(hass)

    aal_device = _register_our_device(device_reg, aal_config_entry)
    z2m_device = _register_z2m_device(device_reg, z2m_config_entry)

    assert z2m_device.id != aal_device.id
    assert z2m_device.primary_config_entry == z2m_config_entry.entry_id
    assert z2m_device.identifiers == {MQTT_IDENTIFIER}

    aal_device = device_reg.async_get(aal_device.id)
    assert aal_device is not None
    assert aal_device.primary_config_entry == aal_config_entry.entry_id
    assert aal_device.identifiers == {OUR_IDENTIFIER, MQTT_IDENTIFIER}
