#!/usr/bin/env bash
echo "Optional. k3d not required for zero-cost path."
command -v k3d >/dev/null || exit 0
