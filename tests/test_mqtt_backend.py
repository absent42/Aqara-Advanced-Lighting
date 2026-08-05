"""Tests for MQTTBackend stale device removal."""

import datetime
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, issue_registry as ir
from homeassistant.util.dt import utcnow

from custom_components.aqara_advanced_lighting.const import (
    CONF_Z2M_BASE_TOPIC,
    DOMAIN,
)

from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

# A supported Aqara model
MODEL_T2 = "lumi.light.agl003"  # MODEL_T2_BULB_E27

# IEEE addresses used across tests
IEEE_A = "0xaaaaaaaaaaaaaaa1"
IEEE_B = "0xbbbbbbbbbbbbbb2"


@pytest.fixture
def mock_config_entry() -> MockConfigEntry:
    """Create a mock config entry at current version (v1.3)."""
    return MockConfigEntry(
        domain=DOMAIN,
        title="Aqara Lighting (zigbee2mqtt)",
        data={CONF_Z2M_BASE_TOPIC: "zigbee2mqtt"},
        unique_id="zigbee2mqtt",
        version=1,
        minor_version=3,
    )


@pytest.fixture
def mock_state_manager():
    """Mock StateManager."""
    with patch(
        "custom_components.aqara_advanced_lighting.StateManager"
    ) as mock_manager_class:
        mock_manager = MagicMock()
        mock_manager.async_load = AsyncMock()
        mock_manager_class.return_value = mock_manager
        yield mock_manager


@pytest.fixture
def mock_cct_sequence_manager():
    """Mock CCTSequenceManager."""
    with patch(
        "custom_components.aqara_advanced_lighting.CCTSequenceManager"
    ) as mock_manager_class:
        mock_manager = MagicMock()
        mock_manager.stop_all_sequences = AsyncMock()
        mock_manager.cleanup = MagicMock()
        mock_manager_class.return_value = mock_manager
        yield mock_manager


@pytest.fixture
def mock_segment_sequence_manager():
    """Mock SegmentSequenceManager."""
    with patch(
        "custom_components.aqara_advanced_lighting.SegmentSequenceManager"
    ) as mock_manager_class:
        mock_manager = MagicMock()
        mock_manager.stop_all_sequences = AsyncMock()
        mock_manager.cleanup = MagicMock()
        mock_manager_class.return_value = mock_manager
        yield mock_manager


@pytest.fixture
def mock_mqtt_wait():
    """Mock mqtt.async_wait_for_mqtt_client."""
    with patch(
        "custom_components.aqara_advanced_lighting.mqtt.async_wait_for_mqtt_client"
    ) as mock_wait:
        mock_wait.return_value = None
        yield mock_wait


def _make_bridge_devices_payload(*ieee_addresses: str) -> str:
    """Build a bridge/devices JSON payload for the given IEEE addresses."""
    devices = []
    for i, ieee in enumerate(ieee_addresses):
        devices.append({
            "ieee_address": ieee,
            "friendly_name": f"device_{i}",
            "model_id": MODEL_T2,
            "manufacturer": "Aqara",
        })
    return json.dumps(devices)


async def _setup_entry_with_real_backend(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
    mock_mqtt_wait,
) -> tuple[MockConfigEntry, list]:
    """Set up the integration with a real MQTTBackend, capturing MQTT subscriptions.

    Returns (entry, subscribe_calls) where subscribe_calls is the list of
    (topic, callback) pairs captured from mqtt.async_subscribe calls.
    """
    subscribe_calls = []

    async def fake_subscribe(hass, topic, callback, **kwargs):
        subscribe_calls.append((topic, callback))
        # Return a callable "unsubscribe" handle
        return MagicMock()

    with patch(
        "homeassistant.components.mqtt.async_subscribe",
        side_effect=fake_subscribe,
    ), patch(
        "homeassistant.components.mqtt.async_publish",
        new_callable=AsyncMock,
    ):
        mock_config_entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
        await hass.async_block_till_done()

    return mock_config_entry, subscribe_calls


def _fire_bridge_devices(subscribe_calls: list, payload: str) -> None:
    """Fire the bridge/devices callback with the given payload."""
    bridge_topic = "zigbee2mqtt/bridge/devices"
    for topic, callback in subscribe_calls:
        if topic == bridge_topic:
            msg = MagicMock()
            msg.payload = payload
            callback(msg)
            return
    raise AssertionError(f"No subscription found for topic {bridge_topic!r}. Got: {[t for t, _ in subscribe_calls]}")


async def test_stale_device_removed_when_missing_from_bridge_devices(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
    mock_mqtt_wait,
) -> None:
    """Device absent from second bridge/devices message is removed from registry.

    Setup: two devices (A and B) registered via first bridge/devices message.
    Action: second message containing only device A.
    Assert: device B is fully removed; device A remains.
    """
    entry, subscribe_calls = await _setup_entry_with_real_backend(
        hass, mock_config_entry, mock_state_manager,
        mock_cct_sequence_manager, mock_segment_sequence_manager, mock_mqtt_wait,
    )

    # First bridge/devices message — registers both A and B
    first_payload = _make_bridge_devices_payload(IEEE_A, IEEE_B)
    _fire_bridge_devices(subscribe_calls, first_payload)
    await hass.async_block_till_done()

    dr_instance = dr.async_get(hass)
    devices_after_first = dr.async_entries_for_config_entry(dr_instance, entry.entry_id)
    ieee_set = {
        ident_val
        for dev in devices_after_first
        for ident_dom, ident_val in dev.identifiers
        if ident_dom == DOMAIN
    }
    assert IEEE_A in ieee_set, "device A should be registered after first message"
    assert IEEE_B in ieee_set, "device B should be registered after first message"

    runtime = entry.runtime_data
    assert IEEE_A in runtime.devices
    assert IEEE_B in runtime.devices

    # Second bridge/devices message — only device A
    second_payload = _make_bridge_devices_payload(IEEE_A)
    _fire_bridge_devices(subscribe_calls, second_payload)
    await hass.async_block_till_done()

    devices_after_second = dr.async_entries_for_config_entry(dr_instance, entry.entry_id)
    ieee_set_after = {
        ident_val
        for dev in devices_after_second
        for ident_dom, ident_val in dev.identifiers
        if ident_dom == DOMAIN
    }

    # Device B must be gone
    assert IEEE_B not in ieee_set_after, "device B should be removed after second message"
    # Device A must still be present
    assert IEEE_A in ieee_set_after, "device A should remain after second message"

    # Runtime data must also be cleaned up
    assert IEEE_B not in runtime.devices, "device B must be removed from runtime_data.devices"
    assert "device_1" not in runtime.devices_by_name, "device B friendly name must be removed from runtime_data.devices_by_name"
    assert IEEE_B not in runtime.aqara_devices, "device B must be removed from runtime_data.aqara_devices"


async def test_stale_device_removal_skips_sole_owner_if_other_entries_present(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
    mock_mqtt_wait,
) -> None:
    """Stale merged device has our entry_id removed but device itself stays.

    When a device is shared with the MQTT integration (two config entries),
    stale removal must call async_update_device(remove_config_entry_id=...)
    instead of async_remove_device, so the MQTT integration's device survives.
    """
    # Create a second config entry to simulate the MQTT integration
    mqtt_config_entry = MockConfigEntry(
        domain="mqtt",
        title="MQTT",
        data={},
        unique_id="mqtt_test",
    )
    mqtt_config_entry.add_to_hass(hass)

    entry, subscribe_calls = await _setup_entry_with_real_backend(
        hass, mock_config_entry, mock_state_manager,
        mock_cct_sequence_manager, mock_segment_sequence_manager, mock_mqtt_wait,
    )

    # First: register device A via bridge/devices (creates our device)
    first_payload = _make_bridge_devices_payload(IEEE_A)
    _fire_bridge_devices(subscribe_calls, first_payload)
    await hass.async_block_till_done()

    dr_instance = dr.async_get(hass)
    our_devices = dr.async_entries_for_config_entry(dr_instance, entry.entry_id)
    device_a = next(
        (
            dev for dev in our_devices
            for ident_dom, ident_val in dev.identifiers
            if ident_dom == DOMAIN and ident_val == IEEE_A
        ),
        None,
    )
    assert device_a is not None, "device A should be registered"

    # Simulate merging: add the MQTT config entry to device A
    dr_instance.async_update_device(
        device_a.id,
        add_config_entry_id=mqtt_config_entry.entry_id,
    )
    merged = dr_instance.async_get(device_a.id)
    assert len(merged.config_entries) == 2, "device should now have two config entries"

    device_a_id = device_a.id

    # Second bridge/devices — empty (device A is now stale)
    second_payload = json.dumps([])
    _fire_bridge_devices(subscribe_calls, second_payload)
    await hass.async_block_till_done()

    # Device should still exist (not fully removed) because MQTT still owns it
    surviving_device = dr_instance.async_get(device_a_id)
    assert surviving_device is not None, (
        "merged device should still exist after stale removal "
        "(MQTT config entry still owns it)"
    )

    # But OUR config entry should no longer be among its config entries
    assert entry.entry_id not in surviving_device.config_entries, (
        "our config entry should be removed from the merged device"
    )


async def test_non_stale_devices_unchanged(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
    mock_mqtt_wait,
) -> None:
    """Devices present in both messages are untouched.

    When both A and B appear in the second bridge/devices message,
    neither should be removed from the device registry or runtime data.
    """
    entry, subscribe_calls = await _setup_entry_with_real_backend(
        hass, mock_config_entry, mock_state_manager,
        mock_cct_sequence_manager, mock_segment_sequence_manager, mock_mqtt_wait,
    )

    # First bridge/devices message — registers both A and B
    first_payload = _make_bridge_devices_payload(IEEE_A, IEEE_B)
    _fire_bridge_devices(subscribe_calls, first_payload)
    await hass.async_block_till_done()

    dr_instance = dr.async_get(hass)
    devices_after_first = dr.async_entries_for_config_entry(dr_instance, entry.entry_id)
    assert len(devices_after_first) == 2

    # Second bridge/devices message — same two devices
    second_payload = _make_bridge_devices_payload(IEEE_A, IEEE_B)
    _fire_bridge_devices(subscribe_calls, second_payload)
    await hass.async_block_till_done()

    devices_after_second = dr.async_entries_for_config_entry(dr_instance, entry.entry_id)
    ieee_set = {
        ident_val
        for dev in devices_after_second
        for ident_dom, ident_val in dev.identifiers
        if ident_dom == DOMAIN
    }

    assert IEEE_A in ieee_set, "device A should remain unchanged"
    assert IEEE_B in ieee_set, "device B should remain unchanged"
    assert len(devices_after_second) == 2, "no devices should have been removed"

    runtime = entry.runtime_data
    assert IEEE_A in runtime.devices
    assert IEEE_B in runtime.devices
    assert IEEE_A in runtime.aqara_devices
    assert IEEE_B in runtime.aqara_devices


async def test_repair_issue_created_when_bridge_not_responding(
    hass: HomeAssistant,
    mock_config_entry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
    mock_mqtt_wait,
):
    """If no bridge/devices message arrives within 120s, a repair issue is created."""
    await _setup_entry_with_real_backend(
        hass, mock_config_entry, mock_state_manager,
        mock_cct_sequence_manager, mock_segment_sequence_manager, mock_mqtt_wait,
    )

    # Advance time by 120 seconds — timer fires
    async_fire_time_changed(hass, utcnow() + datetime.timedelta(seconds=121))
    await hass.async_block_till_done()

    issue_reg = ir.async_get(hass)
    issue = issue_reg.async_get_issue(DOMAIN, "z2m_bridge_not_responding")
    assert issue is not None, "repair issue should be created after 120s with no bridge response"
    assert issue.severity == ir.IssueSeverity.WARNING


async def test_repair_issue_not_created_when_bridge_responds_in_time(
    hass: HomeAssistant,
    mock_config_entry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
    mock_mqtt_wait,
):
    """If bridge responds before 120s, no repair issue is created."""
    entry, subscribe_calls = await _setup_entry_with_real_backend(
        hass, mock_config_entry, mock_state_manager,
        mock_cct_sequence_manager, mock_segment_sequence_manager, mock_mqtt_wait,
    )

    # Bridge responds before timer fires
    payload = _make_bridge_devices_payload(IEEE_A)
    _fire_bridge_devices(subscribe_calls, payload)
    await hass.async_block_till_done()

    # Advance past 120s
    async_fire_time_changed(hass, utcnow() + datetime.timedelta(seconds=121))
    await hass.async_block_till_done()

    issue_reg = ir.async_get(hass)
    issue = issue_reg.async_get_issue(DOMAIN, "z2m_bridge_not_responding")
    assert issue is None, "no repair issue should be created if bridge responded in time"


async def test_repair_issue_clears_when_bridge_responds_late(
    hass: HomeAssistant,
    mock_config_entry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
    mock_mqtt_wait,
):
    """If repair issue was created, it clears when bridge finally responds."""
    entry, subscribe_calls = await _setup_entry_with_real_backend(
        hass, mock_config_entry, mock_state_manager,
        mock_cct_sequence_manager, mock_segment_sequence_manager, mock_mqtt_wait,
    )

    # Timer fires — issue created
    async_fire_time_changed(hass, utcnow() + datetime.timedelta(seconds=121))
    await hass.async_block_till_done()

    issue_reg = ir.async_get(hass)
    assert issue_reg.async_get_issue(DOMAIN, "z2m_bridge_not_responding") is not None

    # Bridge responds late
    payload = _make_bridge_devices_payload(IEEE_A)
    _fire_bridge_devices(subscribe_calls, payload)
    await hass.async_block_till_done()

    assert issue_reg.async_get_issue(DOMAIN, "z2m_bridge_not_responding") is None, \
        "repair issue should clear when bridge finally responds"


async def test_repair_timer_cancelled_on_teardown(
    hass: HomeAssistant,
    mock_config_entry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
    mock_mqtt_wait,
):
    """Unloading the integration cancels the 120s timer and clears any issue."""
    entry, _ = await _setup_entry_with_real_backend(
        hass, mock_config_entry, mock_state_manager,
        mock_cct_sequence_manager, mock_segment_sequence_manager, mock_mqtt_wait,
    )

    # Unload — should cancel timer and clean up
    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()

    # Timer should no longer fire an issue
    async_fire_time_changed(hass, utcnow() + datetime.timedelta(seconds=121))
    await hass.async_block_till_done()

    issue_reg = ir.async_get(hass)
    assert issue_reg.async_get_issue(DOMAIN, "z2m_bridge_not_responding") is None, \
        "no repair issue should appear after unload cancels the timer"


async def test_device_survives_config_entry_reload(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
    mock_mqtt_wait,
) -> None:
    """Setting up the entry again must not delete devices we already own.

    Regression: setup used to prune every device whose sole config entry was
    ours. From HA 2026.8 a device belongs to exactly one config entry, so that
    check matched all of our devices and deleted them on every reload, losing
    area/name customisation and regenerating device IDs.
    """
    entry, subscribe_calls = await _setup_entry_with_real_backend(
        hass, mock_config_entry, mock_state_manager,
        mock_cct_sequence_manager, mock_segment_sequence_manager, mock_mqtt_wait,
    )

    _fire_bridge_devices(subscribe_calls, _make_bridge_devices_payload(IEEE_A))
    await hass.async_block_till_done()

    dr_instance = dr.async_get(hass)
    device_before = dr_instance.async_get_device(identifiers={(DOMAIN, IEEE_A)})
    assert device_before is not None, "device A should be registered"
    device_id_before = device_before.id

    # Give it a user customisation that a delete/recreate cycle would lose
    dr_instance.async_update_device(device_id_before, name_by_user="Kitchen Bulb")

    with patch(
        "homeassistant.components.mqtt.async_subscribe",
        side_effect=AsyncMock(return_value=MagicMock()),
    ), patch(
        "homeassistant.components.mqtt.async_publish",
        new_callable=AsyncMock,
    ):
        assert await hass.config_entries.async_reload(entry.entry_id)
        await hass.async_block_till_done()

    device_after = dr_instance.async_get_device(identifiers={(DOMAIN, IEEE_A)})
    assert device_after is not None, "device must survive an entry reload"
    assert device_after.id == device_id_before, (
        "device ID must be stable across reloads so device automations and "
        "the pre-migration composite link keep resolving"
    )
    assert device_after.name_by_user == "Kitchen Bulb", (
        "user customisation must survive an entry reload"
    )


async def test_single_config_entry_registry_keeps_our_identifier(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
    mock_mqtt_wait,
) -> None:
    """On HA 2026.8+ we register our own device with both identifiers.

    Regression: the pre-2026.8 merge path passed only the mqtt identifier to
    async_get_or_create and added (DOMAIN, ieee) in a second
    async_update_device(merge_identifiers=...) call. On 2026.8+ the first
    re-registration REPLACES the identifiers copied from a split composite
    device, and merge_identifiers against a synthesized composite is silently
    dropped -- so (DOMAIN, ieee) disappeared and every device trigger and
    condition stopped resolving.

    Asserts on the registry calls we make rather than on resulting registry
    state: this suite runs against a pre-2026.8 core where identifiers are
    still globally unique, so async_get_or_create would match the MQTT
    integration's device by the shared mqtt identifier and merge into it.
    Per-config-entry uniqueness cannot be simulated by patching the flag.
    """
    mqtt_config_entry = MockConfigEntry(
        domain="mqtt", title="MQTT", data={}, unique_id="mqtt_test",
    )
    mqtt_config_entry.add_to_hass(hass)

    entry, subscribe_calls = await _setup_entry_with_real_backend(
        hass, mock_config_entry, mock_state_manager,
        mock_cct_sequence_manager, mock_segment_sequence_manager, mock_mqtt_wait,
    )

    # The MQTT integration already owns a device for this bulb
    dr_instance = dr.async_get(hass)
    mqtt_identifier = ("mqtt", f"zigbee2mqtt_{IEEE_A}")
    dr_instance.async_get_or_create(
        config_entry_id=mqtt_config_entry.entry_id,
        identifiers={mqtt_identifier},
        name="MQTT Light",
    )

    registry_cls = type(dr_instance)
    with patch(
        "custom_components.aqara_advanced_lighting.mqtt_backend."
        "_SINGLE_CONFIG_ENTRY_REGISTRY",
        True,
    ), patch.object(
        registry_cls, "async_get_or_create", autospec=True,
        side_effect=registry_cls.async_get_or_create,
    ) as spy_create, patch.object(
        registry_cls, "async_update_device", autospec=True,
        side_effect=registry_cls.async_update_device,
    ) as spy_update:
        _fire_bridge_devices(subscribe_calls, _make_bridge_devices_payload(IEEE_A))
        await hass.async_block_till_done()

    our_creates = [
        call for call in spy_create.call_args_list
        if call.kwargs.get("config_entry_id") == entry.entry_id
    ]
    assert our_creates, "we must register a device under our own config entry"
    identifiers = our_creates[-1].kwargs["identifiers"]

    assert (DOMAIN, IEEE_A) in identifiers, (
        "our device must carry (DOMAIN, ieee) or device triggers and "
        "conditions cannot resolve it"
    )
    assert mqtt_identifier in identifiers, (
        "our device must keep the mqtt identifier so the frontend "
        "'Linked Devices' element cross-links it with the MQTT light; "
        "linking is by shared identifier or connection"
    )

    # We must not reach into the MQTT integration's device
    assert not [
        call for call in spy_update.call_args_list
        if "merge_identifiers" in call.kwargs
    ], (
        "helper integrations must not mutate another integration's device "
        "on HA 2026.8+; merge_identifiers against a synthesized composite "
        "is silently dropped anyway"
    )
