import { app, BrowserWindow, ipcMain, shell, session, Tray, Menu, nativeImage, globalShortcut } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as fs from 'fs';

const APP_VERSION = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8')).version;

const TRUSTED_ORIGINS = [
  'https://projects.100xdevs.com',
  'https://app.100xdevs.com',
  'https://100xdevs.com'
];

const OAUTH_PROVIDERS = [
  'https://accounts.google.com',
  'https://github.com',
  'https://oauth.100xdevs.com',
  'https://auth.100xdevs.com'
];

const URLS = {
  projects: 'https://projects.100xdevs.com/',
  app: 'https://app.100xdevs.com/home'
};

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const PROTOCOL = 'myapp://';

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    },
    icon: path.join(__dirname, 'assets', 'icon-100xdev.png'),
    show: false,
    autoHideMenuBar: true,
    frame: true,
    titleBarStyle: 'default'
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.setFullScreen(true);
    }
  });

  mainWindow.webContents.once('did-finish-load', () => {
    globalShortcut.register('F11', () => {
      if (mainWindow) {
        const isFullScreen = mainWindow.isFullScreen();
        mainWindow.setFullScreen(!isFullScreen);
      }
    });

    globalShortcut.register('Escape', () => {
      if (mainWindow && mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(false);
      }
    });
  });

  mainWindow.on('closed', () => {
    globalShortcut.unregisterAll();
    mainWindow = null;
  });

  setupSecurityHandlers();
  setupNavigationHandlers();
  setupOAuthDetection();
}

function setupSecurityHandlers(): void {
  const ses = session.fromPartition('persist:100xdevs');

  ses.setPermissionRequestHandler((webContents, permission, callback, details) => {
    try {
      const url = new URL(details.requestingUrl);
      const origin = `${url.protocol}//${url.host}`;
      
      const isTrusted = TRUSTED_ORIGINS.includes(origin);
      const isOAuthProvider = OAUTH_PROVIDERS.some(provider => 
        origin === provider || origin.startsWith(provider + '/')
      );
      
      if (isTrusted || isOAuthProvider) {
        callback(true);
      } else {
        callback(false);
      }
    } catch {
      callback(false);
    }
  });

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

function setupNavigationHandlers(): void {
  const ses = session.fromPartition('persist:100xdevs');

  ses.webRequest.onBeforeRequest((details, callback) => {
    try {
      const url = new URL(details.url);
      const origin = `${url.protocol}//${url.host}`;
      
      const isTrusted = TRUSTED_ORIGINS.some(trusted => 
        origin === trusted || origin.startsWith(trusted + '/')
      );
      
      const isOAuthProvider = OAUTH_PROVIDERS.some(provider =>
        origin === provider || origin.startsWith(provider + '/')
      );
      
      const hasOAuthParams = ['code=', 'access_token=', 'id_token=', 'state=', 'oauth_token=', 'oauth_callback=']
        .some(param => details.url.includes(param));
      
      if (isTrusted || isOAuthProvider || hasOAuthParams) {
        callback({});
        return;
      }
      
      if (!isTrusted && details.resourceType === 'mainFrame') {
        if (details.url.includes('100xdevs.com') || details.url.includes('projects.100xdevs.com')) {
          callback({});
          return;
        }
        shell.openExternal(details.url);
        callback({ cancel: true });
      } else {
        callback({});
      }
    } catch {
      callback({});
    }
  });
}

function setupOAuthDetection(): void {
  const ses = session.fromPartition('persist:100xdevs');

  ses.webRequest.onBeforeRedirect((details) => {
    const url = details.redirectURL || details.url;
    const oauthParams = ['code=', 'access_token=', 'id_token=', 'state=', 'oauth_token=', 'oauth_callback='];
    const isOAuthRedirect = oauthParams.some(param => url.includes(param));
    
    if (isOAuthRedirect) {
      console.log('[OAuth Detection] Allowing OAuth redirect:', url);
    }
  }, {
    urls: ['<all_urls>']
  });
}

function createTray(): void {
  const iconPath = path.join(__dirname, 'assets', 'icon-100xdev.png');
  let icon = nativeImage.createEmpty();
  
  try {
    icon = nativeImage.createFromPath(iconPath);
  } catch (err: any) {
    console.warn('Could not load tray icon:', err.message);
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

ipcMain.handle('open-external', async (event, url: string) => {
  await shell.openExternal(url);
});

ipcMain.on('external-link', (event, url: string) => {
  shell.openExternal(url);
});

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

function handleProtocolUrl(url: string): void {
  console.log('[Custom Protocol] Received URL:', url);
  
  if (url.startsWith(PROTOCOL)) {
    const action = url.replace(PROTOCOL, '');
    console.log('[Custom Protocol] Action:', action);
    
    if (mainWindow) {
      mainWindow.show();
      if (action) {
        mainWindow.webContents.send('protocol-action', action);
      }
    }
  }
}

if (process.platform !== 'darwin') {
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleProtocolUrl(url);
  });
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    
    const protocolUrl = commandLine.find(arg => arg.startsWith(PROTOCOL));
    if (protocolUrl) {
      handleProtocolUrl(protocolUrl);
    }
  });
}

app.whenReady().then(() => {
  const protocolUrl = process.argv.find(arg => arg.startsWith(PROTOCOL));
  if (protocolUrl) {
    handleProtocolUrl(protocolUrl);
  }

  createWindow();
  createTray();

  if (app.isPackaged) {
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'Abhijitam01',
      repo: '100xdev-app'
    });

    autoUpdater.checkForUpdatesAndNotify().catch((err: Error) => {
      console.log('Auto-update check failed:', err.message);
    });

    autoUpdater.on('update-available', () => {
      console.log('Update available');
    });

    autoUpdater.on('update-not-available', () => {
      console.log('No updates available');
    });

    autoUpdater.on('error', (err: Error) => {
      console.log('Auto-updater error:', err.message);
    });

    autoUpdater.on('update-downloaded', () => {
      console.log('Update downloaded, will install on restart');
    });
  }
});

app.on('window-all-closed', () => {
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

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('myapp', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('myapp');
}

