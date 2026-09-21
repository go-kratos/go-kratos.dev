#!/usr/bin/env bash
set -euo pipefail

node scripts/verify-kratos-docs.mjs
printf '%s\n' 'Kratos v3 documentation checks passed.'
