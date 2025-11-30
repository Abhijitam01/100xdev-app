const { app, BrowserWindow, ipcMain, shell, protocol, session, Tray, Menu, nativeImage, globalShortcut } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// App version and metadata
const APP_VERSION = require('./package.json').version;

// Trusted origins for security
const TRUSTED_ORIGINS = [
  'https://projects.100xdevs.com',
  'https://app.100xdevs.com',
  'https://100xdevs.com'
];

// Common OAuth providers - allow these for authentication flows
const OAUTH_PROVIDERS = [
  'https://accounts.google.com',
  'https://github.com',
  'https://oauth.100xdevs.com',
  'https://auth.100xdevs.com'
];

// URLs for the two tabs
const URLS = {
  projects: 'https://projects.100xdevs.com/',
  app: 'https://app.100xdevs.com/home'
};

let mainWindow = null;
let tray = null;

// Custom protocol handler skeleton
const PROTOCOL = 'myapp://';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: true, // Start in fullscreen mode
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false // Disable sandbox for Linux compatibility
    },
    icon: path.join(__dirname, 'assets', 'icon-100xdev.png'),
    show: false,
    autoHideMenuBar: true, // Hide menu bar in fullscreen
    frame: true, // Keep window frame for exit controls
    titleBarStyle: 'default'
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Ensure fullscreen is set
    mainWindow.setFullScreen(true);
  });

  // Register keyboard shortcuts when window is ready
  mainWindow.webContents.once('did-finish-load', () => {
    // Register F11 to toggle fullscreen
    globalShortcut.register('F11', () => {
      if (mainWindow) {
        const isFullScreen = mainWindow.isFullScreen();
        mainWindow.setFullScreen(!isFullScreen);
      }
    });

    // Register Escape to exit fullscreen
    globalShortcut.register('Escape', () => {
      if (mainWindow && mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(false);
      }
    });
  });

  mainWindow.on('closed', () => {
    // Unregister all shortcuts when window closes
    globalShortcut.unregisterAll();
    mainWindow = null;
  });

  // Setup security handlers
  setupSecurityHandlers();
  setupNavigationHandlers();
  setupOAuthDetection();
}

function setupSecurityHandlers() {
  const ses = session.fromPartition('persist:100xdevs');

  // Permission handler - allow trusted origins and OAuth providers
  ses.setPermissionRequestHandler((webContents, permission, callback, details) => {
    try {
      const url = new URL(details.requestingUrl);
      const origin = `${url.protocol}//${url.host}`;
      
      const isTrusted = TRUSTED_ORIGINS.includes(origin);
      const isOAuthProvider = OAUTH_PROVIDERS.some(provider => 
        origin === provider || origin.startsWith(provider + '/')
      );
      
      // Allow permissions for trusted origins and OAuth providers
      if (isTrusted || isOAuthProvider) {
        callback(true);
      } else {
        callback(false);
      }
    } catch {
      callback(false);
    }
  });

  // Permission check handler - allow OAuth providers
  ses.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    try {
      const url = new URL(requestingOrigin);
      const origin = `${url.protocol}//${url.host}`;
      
      const isTrusted = TRUSTED_ORIGINS.includes(origin);
      const isOAuthProvider = OAUTH_PROVIDERS.some(provider => 
        origin === provider || origin.startsWith(provider + '/')
      );
      
      return isTrusted || isOAuthProvider;
    } catch {
      return false;
    }
  });
}

function setupNavigationHandlers() {
  const ses = session.fromPartition('persist:100xdevs');

  // Allow navigation - only block actual external navigation, not OAuth redirects
  ses.webRequest.onBeforeRequest((details, callback) => {
    try {
      const url = new URL(details.url);
      const origin = `${url.protocol}//${url.host}`;
      
      // Check if it's a trusted origin
      const isTrusted = TRUSTED_ORIGINS.some(trusted => 
        origin === trusted || origin.startsWith(trusted + '/')
      );
      
      // Check if it's an OAuth provider
      const isOAuthProvider = OAUTH_PROVIDERS.some(provider =>
        origin === provider || origin.startsWith(provider + '/')
      );
      
      // Check if URL contains OAuth parameters (redirect callback)
      const hasOAuthParams = ['code=', 'access_token=', 'id_token=', 'state=', 'oauth_token=', 'oauth_callback=']
        .some(param => details.url.includes(param));
      
      // Allow: trusted origins, OAuth providers, or OAuth callbacks
      if (isTrusted || isOAuthProvider || hasOAuthParams) {
        callback({});
        return;
      }
      
      // Only block main frame navigation to completely unrelated sites
      // Allow all subresources (images, scripts, etc.)
      if (!isTrusted && details.resourceType === 'mainFrame') {
        // Check if it's a redirect back to our domain (OAuth callback)
        if (details.url.includes('100xdevs.com') || details.url.includes('projects.100xdevs.com')) {
          callback({});
          return;
        }
        // Open truly external links in system browser
        shell.openExternal(details.url);
        callback({ cancel: true });
      } else {
        // Allow all subresources
        callback({});
      }
    } catch {
      // On error, allow the request
      callback({});
    }
  });
}

function setupOAuthDetection() {
  const ses = session.fromPartition('persist:100xdevs');

  // Allow all redirects - don't block OAuth flows
  ses.webRequest.onBeforeRedirect((details) => {
    const url = details.redirectURL || details.url;
    
    // Log OAuth redirects for debugging
    const oauthParams = ['code=', 'access_token=', 'id_token=', 'state=', 'oauth_token=', 'oauth_callback='];
    const isOAuthRedirect = oauthParams.some(param => url.includes(param));
    
    if (isOAuthRedirect) {
      console.log('[OAuth Detection] Allowing OAuth redirect:', url);
    }
  }, {
    urls: ['<all_urls>']
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  let icon = nativeImage.createEmpty();
  
  try {
    icon = nativeImage.createFromPath(iconPath);
  } catch (err) {
    console.warn('Could not load tray icon:', err.message);
    // Create a small placeholder icon
    icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  }

  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Projects',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('navigate-tab', 'projects');
          mainWindow.show();
        }
      }
    },
    {
      label: 'App',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('navigate-tab', 'app');
          mainWindow.show();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Show Window',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('100xdevs Web Wrapper');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
}

// Custom protocol handler skeleton
// Protocol registration is done via setAsDefaultProtocolClient below
// URL handling is done via handleProtocolUrl function above

// IPC Handlers
ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

ipcMain.on('external-link', (event, url) => {
  shell.openExternal(url);
});

// Fullscreen handlers
ipcMain.handle('toggle-fullscreen', () => {
  if (mainWindow) {
    const isFullScreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFullScreen);
    return !isFullScreen;
  }
  return false;
});

ipcMain.handle('is-fullscreen', () => {
  return mainWindow ? mainWindow.isFullScreen() : false;
});

// Handle custom protocol URLs (Linux/Windows)
function handleProtocolUrl(url) {
  console.log('[Custom Protocol] Received URL:', url);
  
  if (url.startsWith(PROTOCOL)) {
    const action = url.replace(PROTOCOL, '');
    console.log('[Custom Protocol] Action:', action);
    
    // Handle different protocol actions here
    if (mainWindow) {
      mainWindow.show();
      if (action) {
        // Could send action to renderer process
        mainWindow.webContents.send('protocol-action', action);
      }
    }
  }
}

// Handle protocol on Linux/Windows
if (process.platform !== 'darwin') {
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleProtocolUrl(url);
  });
}

// Handle protocol via command line args (Linux/Windows)
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    
    // Check for protocol URL in command line
    const protocolUrl = commandLine.find(arg => arg.startsWith(PROTOCOL));
    if (protocolUrl) {
      handleProtocolUrl(protocolUrl);
    }
  });
}

// App event handlers
app.whenReady().then(() => {
  // Check for protocol URL in initial command line args
  const protocolUrl = process.argv.find(arg => arg.startsWith(PROTOCOL));
  if (protocolUrl) {
    handleProtocolUrl(protocolUrl);
  }

  createWindow();
  createTray();

  // Configure auto-updater for GitHub Releases
  if (app.isPackaged) {
    // Configure auto-updater
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'Abhijitam01',
      repo: '100xdev-app'
    });

    // Check for updates on startup (non-blocking)
    autoUpdater.checkForUpdatesAndNotify().catch(err => {
      console.log('Auto-update check failed (expected in development or if not published):', err.message);
    });

    // Listen for update events
    autoUpdater.on('update-available', () => {
      console.log('Update available');
    });

    autoUpdater.on('update-not-available', () => {
      console.log('No updates available');
    });

    autoUpdater.on('error', (err) => {
      console.log('Auto-updater error:', err.message);
    });

    autoUpdater.on('update-downloaded', () => {
      console.log('Update downloaded, will install on restart');
    });
  }
});

app.on('window-all-closed', () => {
  // Don't quit on macOS when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  if (tray) {
    tray.destroy();
  }
});

// Register custom protocol handler skeleton
// In production, this makes the app handle myapp:// URLs
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('myapp', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('myapp');
}
