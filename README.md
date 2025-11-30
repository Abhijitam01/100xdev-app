# 100xdevs Web Wrapper

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An open source Electron application that wraps `https://projects.100xdevs.com/` and `https://app.100xdevs.com/home` in a native desktop wrapper with a tabbed interface, navigation controls, theme toggle, and comprehensive security features.

**Free and open source** - Available for Windows, Linux, and macOS.

## Download

Download the latest release for your platform from [GitHub Releases](https://github.com/Abhijitam01/100xdev-app/releases):

- **Windows**: `.exe` installer or portable `.zip`
- **macOS**: `.dmg` installer or `.zip` archive
- **Linux**: `.deb` package or `.AppImage` (portable)

## Features

- **Tabbed Interface**: Seamlessly switch between Projects and App URLs
- **Navigation Controls**: Back, forward, and reload buttons for webview navigation
- **Theme Toggle**: Dark and light themes with persistent preference storage
- **System Tray**: Quick navigation menu accessible from the system tray
- **Security Features**:
  - Context isolation enabled
  - Node integration disabled
  - Permission requests restricted to trusted origins
  - Untrusted domain navigation blocked
  - External links automatically opened in system browser
  - OAuth redirect detection via webRequest API
- **Deep Linking**: Custom protocol handler skeleton (`myapp://`)
- **Multi-Platform**: Support for Windows, Linux, and macOS
- **Auto-update**: Automatic updates via GitHub Releases
- **Open Source**: MIT licensed, free to use and modify

## Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (package manager)
- Platform-specific build tools (for building packages)

## Installation

### Development Setup

1. Clone or navigate to the project directory:
```bash
cd /home/abhijitam/Desktop/100xdev
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the application in development mode:
```bash
pnpm start
```

## Installation Instructions

### Windows

1. Download the latest `.exe` installer from [GitHub Releases](https://github.com/100xdevs/web-wrapper/releases)
2. Run the installer and follow the setup wizard
3. Launch from Start Menu or Desktop shortcut

**Alternative**: Download the portable `.zip` version, extract, and run `100xdevs-web-wrapper.exe`

### macOS

1. Download the latest `.dmg` file from [GitHub Releases](https://github.com/100xdevs/web-wrapper/releases)
2. Open the DMG file
3. Drag the app to Applications folder
4. Launch from Applications (you may need to allow it in System Preferences > Security)

**Alternative**: Download the `.zip` version, extract, and move to Applications

### Linux

**Debian/Ubuntu (.deb)**:
```bash
# Download the .deb file from GitHub Releases
sudo dpkg -i 100xdevs-web-wrapper_*.deb
sudo apt-get install -f  # Install dependencies if needed
```

**AppImage (Portable)**:
```bash
# Download the .AppImage file from GitHub Releases
chmod +x 100xdevs-web-wrapper-*.AppImage
./100xdevs-web-wrapper-*.AppImage
```

## Building for Production

### Build All Platforms

To build for all platforms (requires running on each platform or using CI/CD):
```bash
pnpm run build:all
```

### Build Specific Platform

**Linux** (builds .deb and AppImage):
```bash
pnpm run build:linux
```

**Windows** (builds NSIS installer and ZIP):
```bash
pnpm run build:win
```

**macOS** (builds DMG and ZIP):
```bash
pnpm run build:mac
```

### Distribution Builds (Without Publishing)

Build without publishing to GitHub Releases:
```bash
pnpm run dist:linux    # Linux only
pnpm run dist:win      # Windows only
pnpm run dist:mac      # macOS only
pnpm run dist:all      # All platforms
```

### Publishing to GitHub Releases

To build and publish to GitHub Releases (requires GitHub token):
```bash
pnpm run release
```

**Note**: Publishing requires a `GH_TOKEN` environment variable with appropriate permissions.

## Development Setup

### For Contributors

1. **Clone the repository**:
```bash
git clone https://github.com/Abhijitam01/100xdev-app.git
cd 100xdev-app
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Start development mode**:
```bash
pnpm start
```

4. **Build for testing**:
```bash
# Build for your current platform
pnpm run build

# Or build for specific platform
pnpm run build:linux
pnpm run build:win
pnpm run build:mac
```

### Platform-Specific Icons

To create proper builds, you'll need platform-specific icons:

- **Windows**: `assets/icon.ico` (16x16, 32x32, 48x48, 256x256 sizes) - **Required for Windows builds**
- **macOS**: `assets/icon.icns` (16x16 to 1024x1024 sizes) - **Required for macOS builds**
- **Linux**: `assets/icon.png` (512x512 recommended) - Already exists

**Note**: Windows and macOS builds will fail without the respective icon files. You can:

1. **Use electron-icon-maker** (recommended):
   ```bash
   npx electron-icon-maker --input=assets/icon.png --output=assets
   ```

2. **Use online converters**: Convert your PNG to ICO (Windows) and ICNS (macOS)

3. **Use platform tools**:
   - macOS: Use `iconutil` or online ICNS converters
   - Windows: Use online ICO converters or image editing software

## Project Structure

```
/
├── package.json          # Project configuration and dependencies
├── main.js               # Main Electron process
├── preload.js            # Preload script with secure IPC bridge
├── LICENSE               # MIT License
├── .github/
│   └── workflows/
│       └── build.yml     # GitHub Actions CI/CD workflow
├── src/
│   ├── index.html       # Main UI with tabs and webview
│   ├── styles.css       # Styling with theme support
│   └── renderer.js      # Renderer process logic
├── assets/
│   ├── icon.png         # Linux icon (512x512)
│   ├── icon.ico         # Windows icon (required for Windows builds)
│   └── icon.icns        # macOS icon (required for macOS builds)
└── README.md            # This file
```

## Security Configuration

The application implements multiple security layers:

1. **Context Isolation**: Enabled to prevent direct access to Node.js APIs from renderer
2. **Node Integration**: Disabled in renderer process
3. **Webview Tag**: Enabled for secure web content embedding
4. **Trusted Origins**: Only `projects.100xdevs.com` and `app.100xdevs.com` are trusted
5. **Navigation Blocking**: Untrusted domain navigation is blocked and opened externally
6. **OAuth Detection**: Redirects are intercepted and logged for security auditing

## Custom Protocol

The application includes a skeleton for custom protocol handling (`myapp://`). To activate:

1. Register the protocol handler in production builds
2. Handle protocol URLs in `main.js`
3. Test with: `myapp://action`

## System Tray

The application creates a system tray icon with the following options:
- **Projects**: Switch to Projects tab and show window
- **App**: Switch to App tab and show window
- **Show Window**: Bring the main window to front
- **Quit**: Exit the application

## Auto-Updates

The application automatically checks for updates on startup when running a packaged version. Updates are delivered via GitHub Releases:

- Updates are checked automatically when the app starts
- Users are notified when updates are available
- Updates can be installed on app restart
- No additional configuration needed

## Contributing

Contributions are welcome! This is an open source project, and we appreciate any help.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Test on your target platform before submitting
- Update documentation if needed
- Ensure all features work across Windows, Linux, and macOS

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Testing Checklist

Use this checklist to verify all features work correctly:

### Basic Functionality
- [ ] Application launches successfully
- [ ] Main window displays correctly
- [ ] Initial page loads (Projects tab by default)
- [ ] Window can be resized and minimized

### Tab Switching
- [ ] Click "Projects" tab switches to `https://projects.100xdevs.com/`
- [ ] Click "App" tab switches to `https://app.100xdevs.com/home`
- [ ] Active tab is visually highlighted
- [ ] Tab state persists when switching between tabs

### Navigation Controls
- [ ] Back button is disabled when no history (on initial load)
- [ ] Back button becomes enabled after navigation
- [ ] Back button navigates to previous page when clicked
- [ ] Forward button works correctly
- [ ] Forward button is disabled when at end of history
- [ ] Reload button refreshes the current page
- [ ] Navigation buttons update state correctly during page loads

### Theme Toggle
- [ ] Click theme toggle switches between dark and light themes
- [ ] Theme preference persists after app restart
- [ ] Theme applies to all UI elements (header, tabs, buttons)
- [ ] Theme icon (sun/moon) updates correctly
- [ ] Smooth transitions between themes

### External Link Handling
- [ ] Links to untrusted domains open in external browser
- [ ] Links within trusted domains (100xdevs.com) load in webview
- [ ] Popup windows are blocked and opened externally
- [ ] Navigation to untrusted domains is prevented in webview

### System Tray
- [ ] System tray icon appears in system tray
- [ ] Right-click shows context menu
- [ ] "Projects" menu item switches to Projects tab
- [ ] "App" menu item switches to App tab
- [ ] "Show Window" brings window to front
- [ ] "Quit" exits the application
- [ ] Clicking tray icon toggles window visibility

### Security Features
- [ ] Permission requests from trusted origins are allowed
- [ ] Permission requests from untrusted origins are denied
- [ ] OAuth redirects are detected and logged (check console)
- [ ] Navigation to untrusted domains is blocked
- [ ] External links open in system browser

### Persistence
- [ ] Webview partition "persist:100xdevs" maintains session data
- [ ] Cookies persist between app restarts
- [ ] Login sessions persist across app restarts
- [ ] Theme preference persists

### Performance
- [ ] Application starts within reasonable time (< 3 seconds)
- [ ] Tab switching is smooth and responsive
- [ ] Navigation within tabs is smooth
- [ ] No memory leaks during extended use

### Linux Packaging (Built Packages)
- [ ] .deb package installs correctly: `sudo dpkg -i dist/*.deb`
- [ ] AppImage runs correctly: `./dist/*.AppImage`
- [ ] Desktop entry file is created correctly
- [ ] Application icon appears in applications menu
- [ ] Application can be launched from desktop environment

### Build Verification
- [ ] Build completes without errors
- [ ] All files are included in package
- [ ] Application runs from built package
- [ ] All features work in packaged application

## Development Notes

### Using pnpm

This project uses `pnpm exec` pattern for scripts to ensure PNPM resolves binaries directly from the store and avoids missing .bin links:

```bash
pnpm exec electron-builder --linux
```

### Icon Replacement

Replace `assets/icon.png` with your own 512x512 PNG icon before building production packages. The icon should:
- Be square (512x512 pixels recommended)
- Have transparency support (PNG format)
- Work well at various sizes (16x16 to 512x512)

### Custom Protocol Development

The custom protocol handler (`myapp://`) is currently a skeleton. To fully implement:

1. Test protocol registration in production builds
2. Add URL parsing and routing logic
3. Handle different protocol actions

## Troubleshooting

### Webview not loading
- Check that `webviewTag: true` is set in `main.js`
- Verify the URLs are accessible from your network
- Check browser console for errors

### Build errors
- Ensure all dependencies are installed: `pnpm install`
- Check Node.js version compatibility
- Verify electron-builder configuration in `package.json`

### Permission errors on Linux
- Ensure proper file permissions on assets
- Check that icon path is correct in build config
- Verify desktop entry file format

### System tray not appearing
- Check desktop environment support
- Verify icon file exists and is readable
- Check for permission issues

## License

MIT

## Contributing

This is a production-ready wrapper application. When modifying:

1. Maintain security best practices
2. Test all features after changes
3. Update version number before building
4. Follow the testing checklist

## Support

For issues related to the wrapped websites, contact 100xdevs support.
For application issues, check the console logs and verify all prerequisites are met.
