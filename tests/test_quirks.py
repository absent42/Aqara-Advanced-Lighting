"""Tests for ZHA quirk registration precedence.

ZHA resolves a device against the most recently registered quirk for its
(manufacturer, model). zha-quirks ships its own quirks for the T1M and T1
Strip whose 0xFCC0 cluster lacks the effect and segment attributes, and ZHA
registers them when its gateway starts, which on a normal startup happens
after this integration's async_setup. The integration's quirk must still win.

The production sequence can only be reproduced in a fresh interpreter, because
zha-quirks registers its quirks as an import side effect that a single process
runs once. Each check therefore runs in a subprocess.
"""

import json
import subprocess
import sys
from pathlib import Path

import pytest

pytest.importorskip("zha.quirks")
pytest.importorskip("zhaquirks")

QUIRKS_PATH = (
    Path(__file__).resolve().parents[1]
    / "custom_components"
    / "aqara_advanced_lighting"
    / "quirks.py"
)

MODELS = ("lumi.light.acn032", "lumi.light.acn132", "lumi.light.agl001")

# Attributes every backend write path relies on: effect type, speed, T1M
# segment, effect colors, strip segment, effect segment mask.
REQUIRED_ATTRIBUTES = (0x051F, 0x0520, 0x0522, 0x0523, 0x0527, 0x0530)

AQARA_MANUFACTURER_CODE = 0x115F

# Runs in a fresh interpreter: integration quirks first (async_setup), then the
# zha-quirks provider (ZHA gateway start), then resolve one device per model.
PROBE = r"""
import importlib.util
import json
import sys
from unittest.mock import MagicMock

quirks_path, models = sys.argv[1], sys.argv[2].split(",")

spec = importlib.util.spec_from_file_location("aal_quirks", quirks_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
module.register_quirks()

import zhaquirks
zhaquirks.setup()

import zha.quirks as zha_quirks
import zigpy.device
import zigpy.types as t

result = {}
for model in models:
    device = zigpy.device.Device(
        MagicMock(), t.EUI64.convert("54:ef:44:10:01:26:e5:c7"), 0x7E97
    )
    device.node_desc = MagicMock()
    for endpoint_id in (1, 2):
        endpoint = device.add_endpoint(endpoint_id)
        endpoint.profile_id = 0x0104
        endpoint.device_type = 0x0102
        endpoint.status = 1
        for cluster_id in (0x0000, 0x0006, 0x0008, 0x0300, 0xFCC0):
            endpoint.add_input_cluster(cluster_id)
    device.manufacturer = "Aqara"
    device.model = model

    resolved = zha_quirks.DEVICE_REGISTRY.resolve(device)
    entry = getattr(resolved, zha_quirks.QUIRK_REGISTRY_ENTRY_ATTR, None)
    cluster = resolved.endpoints[1].in_clusters[0xFCC0]
    writable = []
    for attribute_id in (0x051F, 0x0520, 0x0522, 0x0523, 0x0527, 0x0530):
        try:
            cluster.find_attribute(attribute_id, manufacturer_code=0x115F)
        except KeyError:
            continue
        writable.append(attribute_id)
    result[model] = {
        "source": entry.source.module if entry and entry.source else None,
        "ep_attribute": cluster.ep_attribute,
        "writable": writable,
    }

print("RESULT " + json.dumps(result))
"""


@pytest.fixture(scope="module")
def resolved_clusters() -> dict[str, dict]:
    """Resolve each model once in a fresh interpreter using the production order."""
    completed = subprocess.run(
        [sys.executable, "-c", PROBE, str(QUIRKS_PATH), ",".join(MODELS)],
        capture_output=True,
        text=True,
        timeout=180,
        check=False,
    )
    assert completed.returncode == 0, completed.stderr
    result_lines = [
        line for line in completed.stdout.splitlines() if line.startswith("RESULT ")
    ]
    assert result_lines, completed.stdout + completed.stderr
    return json.loads(result_lines[-1].removeprefix("RESULT "))


@pytest.mark.parametrize("model", MODELS)
def test_integration_quirk_wins_over_builtin(resolved_clusters, model) -> None:
    """The integration's cluster is applied even when ZHA loads its quirks later."""
    resolved = resolved_clusters[model]
    assert resolved["source"] == "aal_quirks", resolved
    assert resolved["ep_attribute"] == "aqara_opple", resolved


@pytest.mark.parametrize("model", MODELS)
def test_backend_attributes_are_writable(resolved_clusters, model) -> None:
    """Every attribute the ZHA backend writes resolves on the applied cluster."""
    resolved = resolved_clusters[model]
    assert resolved["writable"] == list(REQUIRED_ATTRIBUTES), resolved
