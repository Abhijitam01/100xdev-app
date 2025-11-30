#!/bin/bash
# Script to install the desktop entry for 100xdevs Web Wrapper

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DESKTOP_FILE="$APP_DIR/100xdevs-web-wrapper.desktop"
TARGET_DIR="$HOME/.local/share/applications"
TARGET_FILE="$TARGET_DIR/100xdevs-web-wrapper.desktop"

echo "Installing 100xdevs Web Wrapper desktop entry..."

# Create applications directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy desktop file
if [ -f "$DESKTOP_FILE" ]; then
    cp "$DESKTOP_FILE" "$TARGET_FILE"
    chmod +x "$TARGET_FILE"
    echo "✅ Desktop file copied to $TARGET_FILE"
    
    # Update desktop database
    if command -v update-desktop-database >/dev/null 2>&1; then
        update-desktop-database "$TARGET_DIR"
        echo "✅ Desktop database updated"
    else
        echo "⚠️  update-desktop-database not found, desktop file installed manually"
    fi
    
    echo ""
    echo "✅ Installation complete!"
    echo "You can now find '100xdevs Web Wrapper' in your applications menu."
    echo "The app will open in fullscreen mode when launched."
else
    echo "❌ Error: Desktop file not found at $DESKTOP_FILE"
    exit 1
fi
