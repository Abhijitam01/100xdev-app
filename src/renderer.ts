type WebviewNewWindowEvent = Electron.Event & {
  url: string;
  newGuest?: Electron.WebContents;
};

let webview: Electron.WebviewTag | null = null;

interface ElectronAPI {
  openExternal: (url: string) => Promise<void>;
  onNavigateTab?: (callback: (tab: 'projects' | 'app') => void) => void;
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
  
  if (!webview) {
    console.error('Webview not found!');
    return;
  }

  const setActiveTab = (tab: 'projects' | 'app') => {
    if (!webview) return;

    if (projectsBtn && appBtn) {
      projectsBtn.classList.toggle('active', tab === 'projects');
      appBtn.classList.toggle('active', tab === 'app');
    }

    if (tab === 'projects') {
      webview.src = 'https://projects.100xdevs.com/';
    } else {
      webview.src = 'https://app.100xdevs.com/home';
    }
  };

  if (projectsBtn) {
    projectsBtn.addEventListener('click', () => setActiveTab('projects'));
  }

  if (appBtn) {
    appBtn.addEventListener('click', () => setActiveTab('app'));
  }

  webview.addEventListener('did-start-loading', () => {
    document.body.classList.add('loading');
  });

  webview.addEventListener('did-stop-loading', () => {
    document.body.classList.remove('loading');
  });

  webview.addEventListener('did-finish-load', () => {
    console.log('Page loaded:', webview?.getURL());
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
      setActiveTab(tab);
    });
  }
}

export {};
