"""Test the Aqara Advanced Lighting integration initialization."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, issue_registry as ir

from custom_components.aqara_advanced_lighting import (
    async_remove_config_entry_device,
)
from custom_components.aqara_advanced_lighting.const import (
    BACKEND_ZHA,
    CONF_BACKEND_TYPE,
    CONF_Z2M_BASE_TOPIC,
    DOMAIN,
)
from custom_components.aqara_advanced_lighting.models import (
    AqaraDevice,
    AqaraLightingRuntimeData,
)

from pytest_homeassistant_custom_component.common import MockConfigEntry


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
def mock_config_entry_v1_2() -> MockConfigEntry:
    """Create a mock config entry at v1.2 (triggers v1.3 device migration)."""
    return MockConfigEntry(
        domain=DOMAIN,
        title="Aqara Lighting (zigbee2mqtt)",
        data={CONF_Z2M_BASE_TOPIC: "zigbee2mqtt"},
        unique_id="zigbee2mqtt",
        version=1,
        minor_version=2,
    )


@pytest.fixture
def mock_mqtt_client():
    """Mock MQTTBackend."""
    with patch(
        "custom_components.aqara_advanced_lighting.MQTTBackend"
    ) as mock_client_class:
        mock_client = MagicMock()
        mock_client.async_setup = AsyncMock()
        mock_client.async_shutdown = AsyncMock()
        mock_client_class.return_value = mock_client
        yield mock_client


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


async def test_setup_entry_success(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    mock_mqtt_client: MagicMock,
    mock_state_manager: MagicMock,
    mock_cct_sequence_manager: MagicMock,
    mock_segment_sequence_manager: MagicMock,
    mock_mqtt_wait: AsyncMock,
) -> None:
    """Test successful setup of config entry."""
    mock_config_entry.add_to_hass(hass)

    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()

    assert mock_config_entry.state is ConfigEntryState.LOADED
    assert DOMAIN in hass.data
    assert "entries" in hass.data[DOMAIN]
    assert mock_config_entry.entry_id in hass.data[DOMAIN]["entries"]

    # Verify components were initialized
    mock_mqtt_client.async_setup.assert_called_once()
    mock_state_manager.async_load.assert_called_once()


async def test_setup_entry_mqtt_not_available(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
) -> None:
    """Test setup fails when MQTT is not available."""
    mock_config_entry.add_to_hass(hass)

    with patch(
        "custom_components.aqara_advanced_lighting.mqtt.async_wait_for_mqtt_client",
        side_effect=Exception("MQTT not available"),
    ):
        assert not await hass.config_entries.async_setup(mock_config_entry.entry_id)

    assert mock_config_entry.state is ConfigEntryState.SETUP_RETRY


async def test_unload_entry(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    mock_mqtt_client: MagicMock,
    mock_state_manager: MagicMock,
    mock_cct_sequence_manager: MagicMock,
    mock_segment_sequence_manager: MagicMock,
    mock_mqtt_wait: AsyncMock,
) -> None:
    """Test unloading a config entry."""
    mock_config_entry.add_to_hass(hass)

    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()

    assert mock_config_entry.state is ConfigEntryState.LOADED

    # Unload the entry
    assert await hass.config_entries.async_unload(mock_config_entry.entry_id)
    await hass.async_block_till_done()

    assert mock_config_entry.state is ConfigEntryState.NOT_LOADED

    # Verify cleanup was called
    mock_cct_sequence_manager.stop_all_sequences.assert_called_once()
    mock_cct_sequence_manager.cleanup.assert_called_once()
    mock_segment_sequence_manager.stop_all_sequences.assert_called_once()
    mock_segment_sequence_manager.cleanup.assert_called_once()
    mock_mqtt_client.async_shutdown.assert_called_once()


async def test_reload_entry(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    mock_mqtt_client: MagicMock,
    mock_state_manager: MagicMock,
    mock_cct_sequence_manager: MagicMock,
    mock_segment_sequence_manager: MagicMock,
    mock_mqtt_wait: AsyncMock,
) -> None:
    """Test reloading a config entry."""
    mock_config_entry.add_to_hass(hass)

    # Initial setup
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    assert mock_config_entry.state is ConfigEntryState.LOADED

    # Reload
    assert await hass.config_entries.async_reload(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    assert mock_config_entry.state is ConfigEntryState.LOADED


async def test_setup_does_not_prune_devices_we_own(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    mock_mqtt_client: MagicMock,
    mock_state_manager: MagicMock,
    mock_cct_sequence_manager: MagicMock,
    mock_segment_sequence_manager: MagicMock,
    mock_mqtt_wait: AsyncMock,
) -> None:
    """Setup must leave devices our config entry owns alone.

    Setup used to prune every device whose sole config entry was ours, as a
    standing backstop for the one-time v1.2 -> v1.3 cleanup (covered by
    test_v1_3_migration_removes_all_devices). From HA 2026.8 a device belongs
    to exactly one config entry, so that check matches all of our devices and
    deletes them on every setup -- losing area and name customisation,
    regenerating device IDs, and detaching each device from the pre-migration
    composite that keeps existing device automations resolving to us.

    Covers both shapes the old prune targeted: a device with only our
    identifier, and a partially merged device carrying the mqtt identifier too.
    """
    mock_config_entry.add_to_hass(hass)

    device_reg = dr.async_get(hass)
    our_only = device_reg.async_get_or_create(
        config_entry_id=mock_config_entry.entry_id,
        identifiers={(DOMAIN, "0x00158d0001abcdef")},
        name="bedroom_light",
        manufacturer="Aqara",
        model="T2 LED strip controller",
    )
    partial_merge = device_reg.async_get_or_create(
        config_entry_id=mock_config_entry.entry_id,
        identifiers={
            (DOMAIN, "0x00158d0002abcdef"),
            ("mqtt", "zigbee2mqtt_0x00158d0002abcdef"),
        },
        connections={(dr.CONNECTION_NETWORK_MAC, "00:15:8d:00:02:ab:cd:ef")},
        name="hallway_light",
        manufacturer="Aqara",
        model="T2 LED strip controller",
    )
    our_only_id = our_only.id
    partial_merge_id = partial_merge.id

    # A user customisation a delete/recreate cycle would silently lose
    device_reg.async_update_device(our_only_id, name_by_user="Bedroom Bulb")

    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()

    surviving = device_reg.async_get(our_only_id)
    assert surviving is not None, (
        "a device whose only config entry is ours must survive setup"
    )
    assert surviving.name_by_user == "Bedroom Bulb", (
        "user customisation must survive setup"
    )
    assert device_reg.async_get(partial_merge_id) is not None, (
        "a partially merged device must survive setup"
    )


async def test_migrate_preserves_truly_merged_devices(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    mock_mqtt_client: MagicMock,
    mock_state_manager: MagicMock,
    mock_cct_sequence_manager: MagicMock,
    mock_segment_sequence_manager: MagicMock,
    mock_mqtt_wait: AsyncMock,
) -> None:
    """Test that truly merged devices (multiple config entries) are preserved.

    A device shared between our integration and MQTT/ZHA has multiple config
    entries. The migration must not remove these.
    """
    mock_config_entry.add_to_hass(hass)

    # Create a second config entry to simulate the MQTT integration
    mqtt_config_entry = MockConfigEntry(
        domain="mqtt",
        title="MQTT",
        data={},
        unique_id="mqtt",
    )
    mqtt_config_entry.add_to_hass(hass)

    device_reg = dr.async_get(hass)

    # Create device with MQTT config entry first
    merged_device = device_reg.async_get_or_create(
        config_entry_id=mqtt_config_entry.entry_id,
        identifiers={("mqtt", "zigbee2mqtt_0x00158d0001abcdef")},
        name="bedroom_light",
        manufacturer="Aqara",
        model="E27 CCT led bulb",
    )
    # Add our config entry to the same device
    device_reg.async_get_or_create(
        config_entry_id=mock_config_entry.entry_id,
        identifiers={("mqtt", "zigbee2mqtt_0x00158d0001abcdef")},
    )
    device_reg.async_update_device(
        merged_device.id,
        merge_identifiers={(DOMAIN, "0x00158d0001abcdef")},
    )
    merged_device_id = merged_device.id

    # Verify it has both config entries
    updated = device_reg.async_get(merged_device_id)
    assert len(updated.config_entries) == 2

    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()

    # Truly merged device should still exist
    assert device_reg.async_get(merged_device_id) is not None


async def test_v1_3_migration_removes_all_devices(
    hass: HomeAssistant,
    mock_config_entry_v1_2: MockConfigEntry,
    mock_mqtt_client: MagicMock,
    mock_state_manager: MagicMock,
    mock_cct_sequence_manager: MagicMock,
    mock_segment_sequence_manager: MagicMock,
    mock_mqtt_wait: AsyncMock,
) -> None:
    """Test that v1.3 migration removes ALL devices for clean re-merge.

    Previous versions created devices that conflict with MQTT devices
    (duplicate identifiers). The v1.3 migration removes everything so
    the backend can re-create proper merges with MQTT/ZHA devices.
    """
    mock_config_entry_v1_2.add_to_hass(hass)

    device_reg = dr.async_get(hass)

    # Create an old standalone device (only our identifier)
    standalone = device_reg.async_get_or_create(
        config_entry_id=mock_config_entry_v1_2.entry_id,
        identifiers={(DOMAIN, "0x00158d0001aaaaaa")},
        name="standalone_light",
    )

    # Create a "fake merged" device (our identifier + mqtt identifier,
    # but still a separate device from the real MQTT device)
    fake_merged = device_reg.async_get_or_create(
        config_entry_id=mock_config_entry_v1_2.entry_id,
        identifiers={
            (DOMAIN, "0x00158d0001bbbbbb"),
            ("mqtt", "zigbee2mqtt_0x00158d0001bbbbbb"),
        },
        name="fake_merged_light",
    )

    # Create an old device with stale MAC connection
    mac_device = device_reg.async_get_or_create(
        config_entry_id=mock_config_entry_v1_2.entry_id,
        identifiers={(DOMAIN, "0x00158d0001cccccc")},
        connections={(dr.CONNECTION_NETWORK_MAC, "00:15:8d:00:01:cc:cc:cc")},
        name="mac_light",
    )

    assert device_reg.async_get(standalone.id) is not None
    assert device_reg.async_get(fake_merged.id) is not None
    assert device_reg.async_get(mac_device.id) is not None

    # Setup triggers v1.3 migration (entry is at v1.2)
    assert await hass.config_entries.async_setup(mock_config_entry_v1_2.entry_id)
    await hass.async_block_till_done()

    # ALL devices should have been removed by v1.3 migration
    assert device_reg.async_get(standalone.id) is None
    assert device_reg.async_get(fake_merged.id) is None
    assert device_reg.async_get(mac_device.id) is None


# === ZHA Repair Issue Tests ===


@pytest.fixture
def mock_config_entry_zha() -> MockConfigEntry:
    """Create a mock config entry configured for ZHA backend."""
    return MockConfigEntry(
        domain=DOMAIN,
        title="Aqara Lighting (ZHA)",
        data={CONF_BACKEND_TYPE: BACKEND_ZHA},
        unique_id="zha",
        version=1,
        minor_version=3,
    )


async def test_zha_repair_issue_created_on_import_error(
    hass: HomeAssistant,
    mock_config_entry_zha,
):
    """ImportError (ZHA not installed) creates a repair issue and raises ConfigEntryError."""
    mock_config_entry_zha.add_to_hass(hass)

    with patch(
        "homeassistant.components.zha.helpers.get_zha_gateway",
        side_effect=ImportError("ZHA not installed"),
    ):
        result = await hass.config_entries.async_setup(mock_config_entry_zha.entry_id)

    assert result is False  # ConfigEntryError → setup fails
    issue_reg = ir.async_get(hass)
    issue = issue_reg.async_get_issue(DOMAIN, "zha_not_installed")
    assert issue is not None, "repair issue should be created on ImportError"
    assert issue.severity == ir.IssueSeverity.ERROR


async def test_zha_no_repair_issue_on_value_error(
    hass: HomeAssistant,
    mock_config_entry_zha,
):
    """ValueError (ZHA gateway not ready) raises ConfigEntryNotReady without a repair issue."""
    mock_config_entry_zha.add_to_hass(hass)

    with patch(
        "homeassistant.components.zha.helpers.get_zha_gateway",
        side_effect=ValueError("gateway not ready"),
    ):
        result = await hass.config_entries.async_setup(mock_config_entry_zha.entry_id)

    assert result is False  # ConfigEntryNotReady → setup fails (will retry later)
    issue_reg = ir.async_get(hass)
    issue = issue_reg.async_get_issue(DOMAIN, "zha_not_installed")
    assert issue is None, "no repair issue should be created for ValueError (transient)"


async def test_zha_repair_issue_clears_on_successful_setup(
    hass: HomeAssistant,
    mock_config_entry_zha,
    mock_state_manager,
    mock_cct_sequence_manager,
    mock_segment_sequence_manager,
):
    """Repair issue is deleted when ZHA setup succeeds after a previous ImportError."""
    mock_config_entry_zha.add_to_hass(hass)

    # First: create the issue via ImportError
    with patch(
        "homeassistant.components.zha.helpers.get_zha_gateway",
        side_effect=ImportError("ZHA not installed"),
    ):
        await hass.config_entries.async_setup(mock_config_entry_zha.entry_id)

    issue_reg = ir.async_get(hass)
    assert issue_reg.async_get_issue(DOMAIN, "zha_not_installed") is not None

    # Then: reload with ZHA now available — issue should clear
    # Use the same mock pattern as existing ZHA setup tests
    with patch(
        "custom_components.aqara_advanced_lighting.zha_backend.ZHABackend"
    ) as mock_zha_backend_cls:
        mock_backend = MagicMock()
        mock_backend.async_setup = AsyncMock()
        mock_backend.async_shutdown = AsyncMock()
        mock_zha_backend_cls.return_value = mock_backend
        with patch(
            "homeassistant.components.zha.helpers.get_zha_gateway",
            return_value=MagicMock(),
        ):
            await hass.config_entries.async_reload(mock_config_entry_zha.entry_id)
            await hass.async_block_till_done()

    assert issue_reg.async_get_issue(DOMAIN, "zha_not_installed") is None, \
        "repair issue should be cleared after successful ZHA setup"


async def test_remove_config_entry_device_allows_stale_device(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
) -> None:
    """A device the backend no longer reports can be deleted from the UI.

    On HA 2026.8+ our device is owned solely by our config entry, so no other
    integration offers a removal path for it. Without this hook the device
    card has no delete action and a device that Z2M/ZHA has dropped while we
    were not running can never be cleared by hand.
    """
    mock_config_entry.add_to_hass(hass)
    mock_config_entry.runtime_data = AqaraLightingRuntimeData(
        config_entry=mock_config_entry
    )

    device_reg = dr.async_get(hass)
    device = device_reg.async_get_or_create(
        config_entry_id=mock_config_entry.entry_id,
        identifiers={(DOMAIN, "0x00158d0001abcdef")},
        name="bedroom_light",
    )

    assert (
        await async_remove_config_entry_device(hass, mock_config_entry, device)
        is True
    ), "a device the backend no longer reports must be removable"


async def test_remove_config_entry_device_rejects_live_device(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
) -> None:
    """A device the backend still reports must not be removable.

    Removing it would be futile: the next bridge/devices message or reload
    re-creates it, so accepting the delete would silently do nothing.
    """
    ieee = "0x00158d0001abcdef"
    mock_config_entry.add_to_hass(hass)
    runtime_data = AqaraLightingRuntimeData(config_entry=mock_config_entry)
    runtime_data.aqara_devices[ieee] = AqaraDevice(
        identifier=ieee,
        name="bedroom_light",
        model_id="lumi.light.acn031",
        manufacturer="Aqara",
    )
    mock_config_entry.runtime_data = runtime_data

    device_reg = dr.async_get(hass)
    device = device_reg.async_get_or_create(
        config_entry_id=mock_config_entry.entry_id,
        identifiers={(DOMAIN, ieee)},
        name="bedroom_light",
    )

    assert (
        await async_remove_config_entry_device(hass, mock_config_entry, device)
        is False
    ), "a device the backend still reports must be rejected"


async def test_remove_config_entry_device_allows_device_without_our_identifier(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
) -> None:
    """A device carrying no identifier of ours is not one we provide."""
    mock_config_entry.add_to_hass(hass)
    mock_config_entry.runtime_data = AqaraLightingRuntimeData(
        config_entry=mock_config_entry
    )

    device_reg = dr.async_get(hass)
    device = device_reg.async_get_or_create(
        config_entry_id=mock_config_entry.entry_id,
        identifiers={("mqtt", "zigbee2mqtt_0x00158d0001abcdef")},
        name="orphan",
    )

    assert (
        await async_remove_config_entry_device(hass, mock_config_entry, device)
        is True
    ), "a device with no identifier of ours must be removable"


async def test_remove_config_entry_device_allows_when_entry_not_loaded(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
) -> None:
    """With no runtime data there is no backend to contradict the removal.

    The delete action is offered for a config entry that failed to set up or
    is disabled, where `runtime_data` was never assigned. Reading it directly
    would raise AttributeError and surface as a generic failure.
    """
    mock_config_entry.add_to_hass(hass)

    device_reg = dr.async_get(hass)
    device = device_reg.async_get_or_create(
        config_entry_id=mock_config_entry.entry_id,
        identifiers={(DOMAIN, "0x00158d0001abcdef")},
        name="bedroom_light",
    )

    assert (
        await async_remove_config_entry_device(hass, mock_config_entry, device)
        is True
    ), "an unloaded entry must not block removal"


async def test_setup_entry_offers_device_removal(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    mock_mqtt_client: MagicMock,
    mock_state_manager: MagicMock,
    mock_cct_sequence_manager: MagicMock,
    mock_segment_sequence_manager: MagicMock,
    mock_mqtt_wait: AsyncMock,
) -> None:
    """The device page must offer a delete action for our devices.

    HA derives this from async_remove_config_entry_device living on the
    integration's top-level module, so moving the hook elsewhere would
    silently take the delete action away again.
    """
    mock_config_entry.add_to_hass(hass)

    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()

    assert mock_config_entry.supports_remove_device is True, (
        "async_remove_config_entry_device must be exposed on the integration "
        "module so the device page offers a delete action"
    )
