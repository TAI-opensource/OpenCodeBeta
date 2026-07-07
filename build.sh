#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building app..."
cd packages/app
npx vite build

echo "Build complete!"
