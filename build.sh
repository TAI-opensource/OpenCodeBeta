#!/bin/bash
set -e
cd "$(dirname "$0")"
cd packages/app
npx vite build
