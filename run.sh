#!/bin/bash
# Helper script to run the Electron app with proper PATH setup

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Add pnpm to PATH if not already there
export PATH="$HOME/.local/share/pnpm:$PATH"

# Check if pnpm exists
PNPM_PATH="$HOME/.local/share/pnpm/pnpm"
if [ ! -f "$PNPM_PATH" ]; then
    echo "Error: pnpm not found at $PNPM_PATH" >&2
    exit 1
fi

# Check if package.json exists
if [ ! -f "$SCRIPT_DIR/package.json" ]; then
    echo "Error: package.json not found in $SCRIPT_DIR" >&2
    exit 1
fi

# Run the app - redirect errors to a log file
exec "$PNPM_PATH" start 2>&1
