// Simplified renderer - webview plus minimal tab controls
let webview = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initializeWebview();
});

function initializeWebview() {
  webview = document.getElementById('main-webview');
  const projectsBtn = document.getElementById('tab-projects');
  const appBtn = document.getElementById('tab-app');

  if (!webview) {
    console.error('Webview not found!');
    return;
  }

  const setActiveTab = (tab) => {
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

  // Webview event handlers
  webview.addEventListener('did-start-loading', () => {
    document.body.classList.add('loading');
  });

  webview.addEventListener('did-stop-loading', () => {
    document.body.classList.remove('loading');
  });

  webview.addEventListener('did-finish-load', () => {
    console.log('Page loaded:', webview.getURL());
  });

  webview.addEventListener('did-fail-load', (event) => {
    console.error('Webview load failed:', event.errorDescription);
    document.body.classList.remove('loading');
  });

  // Handle navigation events - allow all navigation for OAuth
  webview.addEventListener('will-navigate', (event) => {
    // Allow all navigation - don't block OAuth redirects
    console.log('Navigating to:', event.url);
  });

  // Handle new window events - allow popups for OAuth
  webview.addEventListener('new-window', (event) => {
    // Allow OAuth popups within the app
    event.preventDefault();
    const url = event.url;
    
    // Check if it's an OAuth URL or trusted domain
    if (url.includes('100xdevs.com') || 
        url.includes('oauth') || 
        url.includes('auth') ||
        url.includes('accounts.google.com') ||
        url.includes('github.com')) {
      // Open in the same webview for OAuth flows
      webview.src = url;
    } else if (window.electronAPI) {
      // Only open truly external links in system browser
      window.electronAPI.openExternal(url);
    }
  });

  // Handle navigation to track URL changes
  webview.addEventListener('did-navigate', (event) => {
    console.log('Navigated to:', event.url);
  });

  webview.addEventListener('did-navigate-in-page', (event) => {
    console.log('In-page navigation to:', event.url);
  });

  // React to tray / external navigation requests when available
  if (window.electronAPI && typeof window.electronAPI.onNavigateTab === 'function') {
    window.electronAPI.onNavigateTab((tab) => {
      setActiveTab(tab);
    });
  }
}