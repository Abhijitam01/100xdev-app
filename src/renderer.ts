let webview: Electron.WebviewTag | null = null;

interface ElectronAPI {
  openExternal: (url: string) => Promise<void>;
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
  
  if (!webview) {
    console.error('Webview not found!');
    return;
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

  webview.addEventListener('new-window', (event: Electron.NewWindowEvent) => {
    event.preventDefault();
    const url = event.url;
    
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
}

