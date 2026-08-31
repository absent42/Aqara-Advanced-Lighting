#!/usr/bin/env bash
#
# Run the test suite.
#
# Normally the tests need pytest-homeassistant-custom-component. In a Home
# Assistant core dev container that package is usually absent, and no release
# of it targets a 2026.x core, so installing it would downgrade the checkout.
# This script detects that case and stands the fixtures up from core's own
# tests package instead.
#
# Usage:
#   scripts/run-tests.sh                        # everything
#   scripts/run-tests.sh tests/test_init.py     # one file
#   scripts/run-tests.sh -k device_registry     # any pytest arguments
#
# Override the interpreter with PYTHON, or core's location with HA_CORE_PATH.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTHON="${PYTHON:-python3}"

if ! "$PYTHON" -c 'import homeassistant' 2>/dev/null; then
    echo "error: homeassistant is not importable by '$PYTHON'." >&2
    echo "Run this inside the dev container, or set PYTHON to an interpreter" >&2
    echo "that has Home Assistant installed." >&2
    exit 1
fi

# The ordinary case: the plugin is installed, so pytest needs no help.
if "$PYTHON" -c 'import pytest_homeassistant_custom_component' 2>/dev/null; then
    cd "$REPO_ROOT"
    exec "$PYTHON" -m pytest "$@"
fi

# Otherwise borrow the fixtures from the Home Assistant core checkout that
# provides the installed homeassistant package. pytest-homeassistant-custom-
# component is generated from that same tests package.
HA_CORE_PATH="${HA_CORE_PATH:-$("$PYTHON" - <<'PY'
import pathlib
import homeassistant
print(pathlib.Path(homeassistant.__file__).resolve().parent.parent)
PY
)}"

if [[ ! -f "$HA_CORE_PATH/tests/conftest.py" ]]; then
    echo "error: pytest-homeassistant-custom-component is not installed, and no" >&2
    echo "Home Assistant core tests package was found at:" >&2
    echo "  $HA_CORE_PATH" >&2
    echo >&2
    echo "Either 'pip install pytest-homeassistant-custom-component' (note that it" >&2
    echo "pins its own core version), or set HA_CORE_PATH to a core checkout." >&2
    exit 1
fi

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

# Stand in for the plugin. common must be aliased rather than star-imported,
# or names such as async_fire_time_changed go missing.
SHIM="$WORKDIR/shim/pytest_homeassistant_custom_component"
mkdir -p "$SHIM"
cat > "$SHIM/__init__.py" <<'PY'
"""Shim exposing the Home Assistant core test fixtures as the plugin."""
from tests.conftest import *  # noqa: F401,F403
PY
for module in common typing; do
    cat > "$SHIM/$module.py" <<PY
import sys
from tests import $module as _module
sys.modules[__name__] = _module
PY
done

# Our tests/ is a package, so running from the repo root would shadow core's
# 'tests'. Run from a directory where ours is reachable under another name.
RUNDIR="$WORKDIR/run"
mkdir -p "$RUNDIR"
ln -s "$REPO_ROOT/tests" "$RUNDIR/aqara_tests"
ln -s "$REPO_ROOT/custom_components" "$RUNDIR/custom_components"
sed 's|^testpaths = tests$|testpaths = aqara_tests|' \
    "$REPO_ROOT/pytest.ini" > "$RUNDIR/pytest.ini"

# Point any 'tests/...' argument at the renamed copy.
args=()
for arg in "$@"; do
    args+=("${arg/#tests\//aqara_tests/}")
done

# Not exec: that would replace this shell and skip the cleanup trap.
cd "$RUNDIR"
status=0
PYTHONPATH="$WORKDIR/shim:$HA_CORE_PATH${PYTHONPATH:+:$PYTHONPATH}" \
    "$PYTHON" -m pytest "${args[@]}" || status=$?
exit "$status"
