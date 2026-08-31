"""Tests for ZHABackend stale device removal."""

import asyncio
import contextlib
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.device_registry import CONNECTION_ZIGBEE

from custom_components.aqara_advanced_lighting.const import (
    BACKEND_ZHA,
    CONF_BACKEND_TYPE,
    DOMAIN,
)

from pytest_homeassistant_custom_component.common import MockConfigEntry

# A supported Aqara model (MODEL_T2_BULB_E27)
MODEL_T2 = "lumi.light.agl003"

# IEEE addresses used across tests
IEEE_A = "0xaaaaaaaaaaaaaaa1"
IEEE_B = "0xbbbbbbbbbbbbbb2"


@pytest.fixture
def mock_config_entry_zha() -> MockConfigEntry:
    """Create a mock ZHA config entry at current version (v1.3)."""
    return MockConfigEntry(
        domain=DOMAIN,
        title="Aqara Lighting (ZHA)",
        data={CONF_BACKEND_TYPE: BACKEND_ZHA},
        unique_id="zha",
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


def _make_zha_device(ieee_str: str, model: str = MODEL_T2) -> MagicMock:
    """Build a mock ZHA device object for the given IEEE address and model."""
    device = MagicMock()
    device.model = model
    device.manufacturer = "Aqara"
    device.name = f"device_{ieee_str[-4:]}"
    # Underlying zigpy device (for raw model resolution)
    device.device = MagicMock()
    device.device.model = model
    return device


def _make_gateway(*ieee_addresses: str) -> MagicMock:
    """Build a mock ZHA gateway whose devices dict contains the given IEEE addresses."""
    gateway = MagicMock()
    # ZHA uses EUI64 objects as keys; our code calls str(ieee) on them.
    # We use plain strings here — _resolve_zha_model checks device.model directly.
    devices: dict[str, MagicMock] = {}
    for ieee in ieee_addresses:
        devices[ieee] = _make_zha_device(ieee)
    gateway.devices = devices
    return gateway


async def _setup_entry_with_real_zha_backend(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
    gateway: MagicMock,
) -> MockConfigEntry:
    """Set up the integration with a real ZHABackend backed by a mocked ZHA gateway.

    Patches get_zha_gateway at the canonical location used by ZHA helpers.
    Returns the loaded config entry.
    """
    with patch(
        "homeassistant.components.zha.helpers.get_zha_gateway",
        return_value=gateway,
    ):
        mock_config_entry.add_to_hass(hass)
        assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
        await hass.async_block_till_done()

    return mock_config_entry


async def test_stale_zha_device_removed_when_missing_from_scan(
    hass: HomeAssistant,
    mock_config_entry_zha: MockConfigEntry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
) -> None:
    """Device absent from ZHA gateway at setup is removed from device registry.

    Setup: pre-register device_a and device_b in HA device registry.
    Mock ZHA gateway returns only device_a.
    Assert: device_b is removed; device_a remains; device_b absent from runtime_data.
    """
    mock_config_entry_zha.add_to_hass(hass)

    # Pre-register both devices in the HA device registry under our config entry.
    device_reg = dr.async_get(hass)
    device_a = device_reg.async_get_or_create(
        config_entry_id=mock_config_entry_zha.entry_id,
        identifiers={(DOMAIN, IEEE_A)},
        connections={(CONNECTION_ZIGBEE, IEEE_A)},
        name="device_a",
        manufacturer="Aqara",
        model="T2 Bulb",
    )
    device_b = device_reg.async_get_or_create(
        config_entry_id=mock_config_entry_zha.entry_id,
        identifiers={(DOMAIN, IEEE_B)},
        connections={(CONNECTION_ZIGBEE, IEEE_B)},
        name="device_b",
        manufacturer="Aqara",
        model="T2 Bulb",
    )
    device_a_id = device_a.id
    device_b_id = device_b.id

    # ZHA gateway only returns device_a — device_b was removed from ZHA.
    gateway = _make_gateway(IEEE_A)

    with patch(
        "homeassistant.components.zha.helpers.get_zha_gateway",
        return_value=gateway,
    ):
        assert await hass.config_entries.async_setup(mock_config_entry_zha.entry_id)
        await hass.async_block_till_done()

    # device_a should still be registered
    assert device_reg.async_get(device_a_id) is not None, (
        "device_a should remain in the device registry"
    )

    # device_b should have been removed (sole config entry owner)
    assert device_reg.async_get(device_b_id) is None, (
        "device_b should be removed from the device registry"
    )

    # runtime_data must be clean too
    runtime = mock_config_entry_zha.runtime_data
    assert IEEE_B not in runtime.aqara_devices, (
        "device_b should not be in runtime_data.aqara_devices"
    )
    # device_a was discovered by the scan so it IS in runtime_data
    assert IEEE_A in runtime.aqara_devices, (
        "device_a should be in runtime_data.aqara_devices"
    )


async def test_stale_zha_merged_device_releases_claim_only(
    hass: HomeAssistant,
    mock_config_entry_zha: MockConfigEntry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
) -> None:
    """Stale merged device has our entry_id removed but the device itself survives.

    When device_a is shared between our config entry and a second config entry
    (e.g. ZHA integration), stale removal must call
    async_update_device(remove_config_entry_id=...) rather than
    async_remove_device, so the other integration's device is not destroyed.
    """
    # A second config entry simulating the ZHA integration owning the device.
    zha_config_entry = MockConfigEntry(
        domain="zha",
        title="ZHA",
        data={},
        unique_id="zha_main",
    )
    zha_config_entry.add_to_hass(hass)

    mock_config_entry_zha.add_to_hass(hass)

    device_reg = dr.async_get(hass)

    # Create device_a with BOTH config entries (merged device).
    device_a = device_reg.async_get_or_create(
        config_entry_id=zha_config_entry.entry_id,
        identifiers={("zha", IEEE_A)},
        name="device_a",
        manufacturer="Aqara",
        model="T2 Bulb",
    )
    # Add our config entry and our identifier to the same device.
    device_reg.async_update_device(
        device_a.id,
        add_config_entry_id=mock_config_entry_zha.entry_id,
        merge_identifiers={(DOMAIN, IEEE_A)},
    )
    merged = device_reg.async_get(device_a.id)
    assert len(merged.config_entries) == 2, (
        "device_a should have two config entries before setup"
    )
    device_a_id = device_a.id

    # ZHA gateway returns no devices — device_a is stale from our perspective.
    gateway = _make_gateway()  # empty

    with patch(
        "homeassistant.components.zha.helpers.get_zha_gateway",
        return_value=gateway,
    ):
        assert await hass.config_entries.async_setup(mock_config_entry_zha.entry_id)
        await hass.async_block_till_done()

    # Device should still exist because ZHA still owns it.
    surviving = device_reg.async_get(device_a_id)
    assert surviving is not None, (
        "merged device_a should still exist after stale removal "
        "(ZHA config entry still owns it)"
    )

    # But OUR config entry should have been released.
    assert mock_config_entry_zha.entry_id not in surviving.config_entries, (
        "our config entry should be removed from the merged device"
    )


async def test_non_stale_zha_devices_unchanged(
    hass: HomeAssistant,
    mock_config_entry_zha: MockConfigEntry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
) -> None:
    """Devices present in the ZHA gateway scan are not removed.

    Pre-register device_a. ZHA gateway returns device_a.
    After setup device_a is still registered with our config entry.
    """
    mock_config_entry_zha.add_to_hass(hass)

    device_reg = dr.async_get(hass)
    device_a = device_reg.async_get_or_create(
        config_entry_id=mock_config_entry_zha.entry_id,
        identifiers={(DOMAIN, IEEE_A)},
        connections={(CONNECTION_ZIGBEE, IEEE_A)},
        name="device_a",
        manufacturer="Aqara",
        model="T2 Bulb",
    )
    device_a_id = device_a.id

    # ZHA gateway returns device_a — it is NOT stale.
    gateway = _make_gateway(IEEE_A)

    with patch(
        "homeassistant.components.zha.helpers.get_zha_gateway",
        return_value=gateway,
    ):
        assert await hass.config_entries.async_setup(mock_config_entry_zha.entry_id)
        await hass.async_block_till_done()

    # device_a must still be registered.
    still_there = device_reg.async_get(device_a_id)
    assert still_there is not None, (
        "device_a should remain registered when present in ZHA gateway"
    )
    assert mock_config_entry_zha.entry_id in still_there.config_entries, (
        "our config entry should still be on device_a"
    )

    # Also present in runtime_data.
    assert IEEE_A in mock_config_entry_zha.runtime_data.aqara_devices, (
        "device_a should be in runtime_data.aqara_devices"
    )


async def test_device_links_to_zha_device_via_device_id(
    hass: HomeAssistant,
    mock_config_entry_zha: MockConfigEntry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
) -> None:
    """Our device declares the ZHA device as its via device.

    Since 2026.8 our device is a separate card from the light's. Pointing
    via_device_id at the ZHA device gives it a "Connected via" link back to
    the light.
    """
    zha_config_entry = MockConfigEntry(
        domain="zha", title="ZHA", data={}, unique_id="zha_main",
    )
    zha_config_entry.add_to_hass(hass)
    mock_config_entry_zha.add_to_hass(hass)

    device_reg = dr.async_get(hass)
    zha_device = device_reg.async_get_or_create(
        config_entry_id=zha_config_entry.entry_id,
        identifiers={("zha", IEEE_A)},
        name="ZHA Light",
    )

    gateway = _make_gateway(IEEE_A)
    with patch(
        "homeassistant.components.zha.helpers.get_zha_gateway",
        return_value=gateway,
    ):
        assert await hass.config_entries.async_setup(mock_config_entry_zha.entry_id)
        await hass.async_block_till_done()

    our_device = device_reg.async_get_device_by_identifier(
        (DOMAIN, IEEE_A), mock_config_entry_zha.entry_id
    )
    assert our_device is not None, "we must register our own device"
    assert our_device.via_device_id == zha_device.id, (
        "our device must point at the ZHA device as its via device"
    )


async def test_device_registers_when_zha_device_not_yet_known(
    hass: HomeAssistant,
    mock_config_entry_zha: MockConfigEntry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
) -> None:
    """Registration must survive ZHA's own device not being registered yet.

    async_get_or_create raises DeviceInfoError for a via_device_id that is not
    a registered device, so the link has to be skipped rather than guessed.
    """
    mock_config_entry_zha.add_to_hass(hass)

    gateway = _make_gateway(IEEE_A)
    with patch(
        "homeassistant.components.zha.helpers.get_zha_gateway",
        return_value=gateway,
    ):
        assert await hass.config_entries.async_setup(mock_config_entry_zha.entry_id)
        await hass.async_block_till_done()

    device_reg = dr.async_get(hass)
    our_device = device_reg.async_get_device_by_identifier(
        (DOMAIN, IEEE_A), mock_config_entry_zha.entry_id
    )
    assert our_device is not None, (
        "a missing ZHA device must not stop us registering ours"
    )
    assert our_device.via_device_id is None, "there is no via device to link to"


def _get_zha_backend(hass: HomeAssistant, entry: MockConfigEntry):
    """Return the live ZHABackend instance for a config entry."""
    return hass.data[DOMAIN]["entries"][entry.entry_id]["backend"]


async def test_entity_mapping_retry_cancelled_on_shutdown(
    hass: HomeAssistant,
    mock_config_entry_zha: MockConfigEntry,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
) -> None:
    """A pending mapping retry must not outlive the config entry.

    The retry runs for up to 30 seconds and writes entity_mapping_ready on
    runtime_data. Left running across a reload it would keep writing to the
    unloaded entry's data, and it also held up anything waiting on Home
    Assistant's pending tasks for the whole 30 seconds.
    """
    # A device with no matching light entity leaves the mapping not ready,
    # which is what schedules the retry.
    gateway = _make_gateway(IEEE_A)
    entry = await _setup_entry_with_real_zha_backend(
        hass, mock_config_entry_zha, mock_state_manager,
        mock_cct_sequence_manager, mock_segment_sequence_manager, gateway,
    )
    backend = _get_zha_backend(hass, entry)

    task = backend._mapping_retry_task
    assert task is not None, "an empty mapping must schedule a retry"
    assert not task.done(), "the retry should still be pending"

    await backend.async_shutdown()

    assert backend._mapping_retry_task is None, (
        "shutdown must drop the retry so it cannot outlive the entry"
    )

    # cancel() only requests cancellation; await the task to let the loop
    # deliver it before asserting on the outcome.
    with contextlib.suppress(asyncio.CancelledError):
        await task
    assert task.cancelled(), "the pending retry must be cancelled"
