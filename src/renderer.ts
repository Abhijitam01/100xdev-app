type WebviewNewWindowEvent = Electron.Event & {
  url: string;
  newGuest?: Electron.WebContents;
};

let webview: Electron.WebviewTag | null = null;
type TabKey = 'projects' | 'app' | 'classx';
let isFullscreenMode = false;
let currentTab: TabKey = 'projects';

interface ElectronAPI {
  openExternal: (url: string) => Promise<void>;
  onNavigateTab?: (callback: (tab: TabKey) => void) => void;
  windowControl?: (action: 'minimize' | 'maximize' | 'close') => void;
  toggleFullscreen?: () => Promise<boolean>;
  isFullscreen?: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeWebview();
});

function initializeWebview(): void {
  webview = document.getElementById('main-webview') as Electron.WebviewTag;
  const projectsBtn = document.getElementById('tab-projects') as HTMLButtonElement | null;
  const appBtn = document.getElementById('tab-app') as HTMLButtonElement | null;
  const classxBtn = document.getElementById('tab-classx') as HTMLButtonElement | null;
  const winMinimizeBtn = document.getElementById('win-minimize') as HTMLButtonElement | null;
  const winMaximizeBtn = document.getElementById('win-maximize') as HTMLButtonElement | null;
  const winCloseBtn = document.getElementById('win-close') as HTMLButtonElement | null;
  
  if (!webview) {
    console.error('Webview not found!');
    return;
  }

  // Wire up window controls
  if (winMinimizeBtn && window.electronAPI?.windowControl) {
    winMinimizeBtn.addEventListener('click', () => {
      console.log('[Fullscreen Debug] Minimize button clicked');
      window.electronAPI?.windowControl?.('minimize');
    });
  }

  if (winMaximizeBtn && window.electronAPI?.windowControl) {
    winMaximizeBtn.addEventListener('click', () => {
      console.log('[Fullscreen Debug] Maximize button clicked');
      window.electronAPI?.windowControl?.('maximize');
    });
  }

  if (winCloseBtn && window.electronAPI?.windowControl) {
    winCloseBtn.addEventListener('click', () => {
      console.log('[Fullscreen Debug] Close button clicked');
      window.electronAPI?.windowControl?.('close');
    });
  }

  const setActiveTab = (tab: TabKey) => {
    if (!webview) return;

    console.log('[Fullscreen Debug] Setting active tab:', tab);
    currentTab = tab;

    if (projectsBtn && appBtn && classxBtn) {
      projectsBtn.classList.toggle('active', tab === 'projects');
      appBtn.classList.toggle('active', tab === 'app');
      classxBtn.classList.toggle('active', tab === 'classx');
    }

    if (tab === 'projects') {
      webview.src = 'https://projects.100xdevs.com/';
    } else if (tab === 'app') {
      webview.src = 'https://app.100xdevs.com/home';
    } else {
      webview.src = 'https://harkirat.classx.co.in/new-courses/14/content?activeTab=Content';
    }

    // Auto-enter fullscreen mode when ClassX tab is selected
    if (tab === 'classx' && !isFullscreenMode) {
      console.log('[Fullscreen Debug] ClassX tab selected, entering fullscreen mode');
      toggleFullscreenMode();
    } else if (tab !== 'classx' && isFullscreenMode) {
      console.log('[Fullscreen Debug] Leaving ClassX tab, exiting fullscreen mode');
      exitFullscreenMode();
    }
  };

  const toggleFullscreenMode = () => {
    console.log('[Fullscreen Debug] Toggling fullscreen mode. Current state:', isFullscreenMode);
    isFullscreenMode = !isFullscreenMode;
    document.body.classList.toggle('fullscreen-mode', isFullscreenMode);
    console.log('[Fullscreen Debug] Fullscreen mode state after toggle:', isFullscreenMode);
    
    // Also toggle Electron window fullscreen if available
    if (window.electronAPI?.toggleFullscreen) {
      window.electronAPI.toggleFullscreen().then((isFullscreen: boolean) => {
        console.log('[Fullscreen Debug] Electron window fullscreen state:', isFullscreen);
      }).catch((err: Error) => {
        console.error('[Fullscreen Debug] Error toggling Electron fullscreen:', err);
      });
    }
  };

  const exitFullscreenMode = () => {
    if (isFullscreenMode) {
      console.log('[Fullscreen Debug] Exiting fullscreen mode');
      isFullscreenMode = false;
      document.body.classList.remove('fullscreen-mode');
      
      if (window.electronAPI?.toggleFullscreen) {
        window.electronAPI.isFullscreen?.().then((isFullscreen: boolean) => {
          if (isFullscreen) {
            window.electronAPI?.toggleFullscreen?.();
          }
        });
      }
    }
  };

  if (projectsBtn) {
    projectsBtn.addEventListener('click', () => setActiveTab('projects'));
  }

  if (appBtn) {
    appBtn.addEventListener('click', () => setActiveTab('app'));
  }

  if (classxBtn) {
    classxBtn.addEventListener('click', () => setActiveTab('classx'));
  }

  webview.addEventListener('did-start-loading', () => {
    document.body.classList.add('loading');
  });

  webview.addEventListener('did-stop-loading', () => {
    document.body.classList.remove('loading');
  });

  webview.addEventListener('did-finish-load', () => {
    const url = webview?.getURL();
    console.log('[Fullscreen Debug] Page loaded:', url);
    console.log('[Fullscreen Debug] Current tab:', currentTab);
    console.log('[Fullscreen Debug] Fullscreen mode:', isFullscreenMode);
    
    // If ClassX page loaded and not in fullscreen, enter fullscreen
    if (url?.includes('classx.co.in') && currentTab === 'classx' && !isFullscreenMode) {
      console.log('[Fullscreen Debug] ClassX page loaded, entering fullscreen');
      toggleFullscreenMode();
    }
  });

  webview.addEventListener('did-fail-load', (event: Electron.DidFailLoadEvent) => {
    console.error('Webview load failed:', event.errorDescription);
    document.body.classList.remove('loading');
  });

  webview.addEventListener('will-navigate', (event: Electron.WillNavigateEvent) => {
    console.log('Navigating to:', event.url);
  });

  webview.addEventListener('new-window', (event: Event) => {
    event.preventDefault();
    const newWindowEvent = event as unknown as WebviewNewWindowEvent;
    const url = newWindowEvent.url;
    
    if (url.includes('100xdevs.com') || 
        url.includes('classx.co.in') ||
        url.includes('oauth') || 
        url.includes('auth') ||
        url.includes('accounts.google.com') ||
        url.includes('github.com')) {
      if (webview) {
        webview.src = url;
      }
    } else if (window.electronAPI) {
      window.electronAPI.openExternal(url);
    }
  });

  webview.addEventListener('did-navigate', (event: Electron.DidNavigateEvent) => {
    console.log('Navigated to:', event.url);
  });

  webview.addEventListener('did-navigate-in-page', (event: Electron.DidNavigateInPageEvent) => {
    console.log('In-page navigation to:', event.url);
  });

  // React to tray menu / external navigation requests
  if (window.electronAPI?.onNavigateTab) {
    window.electronAPI.onNavigateTab((tab) => {
      console.log('[Fullscreen Debug] Navigation requested from tray:', tab);
      setActiveTab(tab);
    });
  }

  // Add keyboard shortcut for fullscreen toggle (F11)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'F11') {
      event.preventDefault();
      console.log('[Fullscreen Debug] F11 pressed, toggling fullscreen');
      toggleFullscreenMode();
    } else if (event.key === 'Escape' && isFullscreenMode && currentTab === 'classx') {
      event.preventDefault();
      console.log('[Fullscreen Debug] Escape pressed, exiting fullscreen');
      exitFullscreenMode();
    }
  });

  // Add double-click on top bar to toggle fullscreen (when visible)
  const topBar = document.querySelector('.top-bar');
  if (topBar) {
    topBar.addEventListener('dblclick', () => {
      if (currentTab === 'classx') {
        console.log('[Fullscreen Debug] Top bar double-clicked, toggling fullscreen');
        toggleFullscreenMode();
      }
    });
  }
}

export {};
