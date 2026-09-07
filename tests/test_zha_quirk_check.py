"""Tests for detecting ZHA devices that were resolved without the Aqara quirk."""

from unittest.mock import MagicMock

from custom_components.aqara_advanced_lighting.quirks import (
    AQARA_CLUSTER_EP_ATTRIBUTE,
)
from custom_components.aqara_advanced_lighting.zha_backend import (
    CLUSTER_MANU_SPECIFIC_LUMI,
    find_devices_without_aqara_quirk,
)

MODEL_T1M = "lumi.light.acn032"
IEEE = "54:ef:44:10:01:26:e5:c7"

# ep_attribute of the cluster zha-quirks' own Aqara quirks install
BUILTIN_EP_ATTRIBUTE = "opple_cluster"


def _make_device(model: str, ep_attribute: str | None) -> MagicMock:
    """Build a ZHA device whose endpoint 1 carries a 0xFCC0 cluster, or none."""
    endpoint = MagicMock()
    if ep_attribute is None:
        endpoint.in_clusters = {}
    else:
        cluster = MagicMock()
        cluster.ep_attribute = ep_attribute
        endpoint.in_clusters = {CLUSTER_MANU_SPECIFIC_LUMI: cluster}
    device = MagicMock()
    device.model = model
    device.device.model = model
    device.device.endpoints = {1: endpoint}
    return device


def _make_gateway(**devices: MagicMock) -> MagicMock:
    """Build a gateway whose devices dict is keyed by IEEE string."""
    gateway = MagicMock()
    gateway.devices = dict(devices)
    return gateway


def test_lists_device_carrying_the_builtin_cluster() -> None:
    """A supported device resolved by zha-quirks' own quirk is reported."""
    gateway = _make_gateway(**{IEEE: _make_device(MODEL_T1M, BUILTIN_EP_ATTRIBUTE)})
    assert find_devices_without_aqara_quirk(gateway) == [f"{MODEL_T1M} ({IEEE})"]


def test_accepts_device_carrying_our_cluster() -> None:
    """A supported device carrying the integration's cluster is not reported."""
    gateway = _make_gateway(**{IEEE: _make_device(MODEL_T1M, AQARA_CLUSTER_EP_ATTRIBUTE)})
    assert find_devices_without_aqara_quirk(gateway) == []


def test_lists_device_without_any_aqara_cluster() -> None:
    """A supported device with no 0xFCC0 cluster on endpoint 1 is reported."""
    gateway = _make_gateway(**{IEEE: _make_device(MODEL_T1M, None)})
    assert find_devices_without_aqara_quirk(gateway) == [f"{MODEL_T1M} ({IEEE})"]


def test_ignores_unsupported_models() -> None:
    """Devices outside the supported model list are never reported."""
    gateway = _make_gateway(
        **{IEEE: _make_device("lumi.remote.b1acn01", BUILTIN_EP_ATTRIBUTE)}
    )
    assert find_devices_without_aqara_quirk(gateway) == []
