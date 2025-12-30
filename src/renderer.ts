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
  enterFullscreen?: () => Promise<boolean>;
  exitFullscreen?: () => Promise<boolean>;
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

  // Handle fullscreen requests from webview content - set up early
  webview.addEventListener('enter-html-full-screen', () => {
    console.log('[Fullscreen Debug] enter-html-full-screen event fired');
    if (window.electronAPI?.enterFullscreen) {
      window.electronAPI.enterFullscreen().then(() => {
        console.log('[Fullscreen Debug] Electron window entered fullscreen successfully');
      }).catch((err: Error) => {
        console.error('[Fullscreen Debug] Error entering fullscreen:', err);
      });
    } else {
      console.warn('[Fullscreen Debug] enterFullscreen API not available');
    }
  });

  webview.addEventListener('leave-html-full-screen', () => {
    console.log('[Fullscreen Debug] leave-html-full-screen event fired');
    if (window.electronAPI?.exitFullscreen) {
      window.electronAPI.exitFullscreen().then(() => {
        console.log('[Fullscreen Debug] Electron window exited fullscreen successfully');
      }).catch((err: Error) => {
        console.error('[Fullscreen Debug] Error exiting fullscreen:', err);
      });
    } else {
      console.warn('[Fullscreen Debug] exitFullscreen API not available');
    }
  });

  webview.addEventListener('did-start-loading', () => {
    document.body.classList.add('loading');
  });

  webview.addEventListener('did-stop-loading', () => {
    document.body.classList.remove('loading');
  });

  // Inject link override script when DOM is ready (runs earlier than did-finish-load)
  webview.addEventListener('dom-ready', () => {
    if (currentTab === 'projects' && webview) {
        console.log('[Navigation Debug] DOM ready, injecting link override script');
        try {
          webview.executeJavaScript(`
            (function() {
              console.log('[Injected Script] Setting up link override for projects tab');
              
              // Function to override links
              function overrideLinks() {
                // Override all existing links with target="_blank"
                document.querySelectorAll('a[target="_blank"]').forEach(function(link) {
                  link.removeAttribute('target');
                  link.addEventListener('click', function(e) {
                    console.log('[Injected Script] Link clicked:', this.href);
                    if (this.href && this.href.includes('projects.100xdevs.com')) {
                      e.preventDefault();
                      window.location.href = this.href;
                    }
                  });
                });
              }
              
              // Run immediately
              overrideLinks();
              
              // Run again after a short delay to catch dynamically loaded content
              setTimeout(overrideLinks, 1000);
              
              // Also handle window.open calls
              const originalOpen = window.open;
              window.open = function(url, target, features) {
                console.log('[Injected Script] window.open called:', url);
                if (url && (url.includes('projects.100xdevs.com') || url.startsWith('/'))) {
                  if (url.startsWith('/')) {
                    url = window.location.origin + url;
                  }
                  window.location.href = url;
                  return null;
                }
                return originalOpen.apply(window, arguments);
              };
              
              // Use MutationObserver to catch dynamically added links
              const observer = new MutationObserver(function(mutations) {
                overrideLinks();
              });
              
              observer.observe(document.body, {
                childList: true,
                subtree: true
              });
            })();
          `).catch((err: Error) => {
            console.warn('[Navigation Debug] Could not inject script on dom-ready:', err.message);
          });
        } catch (err: any) {
          console.warn('[Navigation Debug] Script injection on dom-ready failed:', err.message);
        }
      }
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

    // Inject fullscreen API interception script for all tabs
    if (webview) {
      try {
        webview.executeJavaScript(`
          (function() {
            console.log('[Injected Script] Setting up fullscreen API interception');
            
            // Store original methods
            const originalRequestFullscreen = Element.prototype.requestFullscreen || 
                                              Element.prototype.webkitRequestFullscreen || 
                                              Element.prototype.mozRequestFullScreen || 
                                              Element.prototype.msRequestFullscreen;
            
            const originalExitFullscreen = document.exitFullscreen || 
                                          document.webkitExitFullscreen || 
                                          document.mozCancelFullScreen || 
                                          document.msExitFullscreen;
            
            // Override requestFullscreen to ensure it works
            if (originalRequestFullscreen) {
              Element.prototype.requestFullscreen = function() {
                console.log('[Injected Script] requestFullscreen called on element:', this);
                // Call original - this should trigger the webview event
                const result = originalRequestFullscreen.apply(this, arguments);
                console.log('[Injected Script] requestFullscreen result:', result);
                return result;
              };
              
              // Also override vendor-specific methods
              if (Element.prototype.webkitRequestFullscreen) {
                Element.prototype.webkitRequestFullscreen = Element.prototype.requestFullscreen;
              }
              if (Element.prototype.mozRequestFullScreen) {
                Element.prototype.mozRequestFullScreen = Element.prototype.requestFullscreen;
              }
              if (Element.prototype.msRequestFullscreen) {
                Element.prototype.msRequestFullscreen = Element.prototype.requestFullscreen;
              }
            }
            
            // Override exitFullscreen
            if (originalExitFullscreen) {
              document.exitFullscreen = function() {
                console.log('[Injected Script] exitFullscreen called');
                return originalExitFullscreen.apply(this, arguments);
              };
              
              if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen = document.exitFullscreen;
              }
              if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen = document.exitFullscreen;
              }
              if (document.msExitFullscreen) {
                document.msExitFullscreen = document.exitFullscreen;
              }
            }
            
            // Log fullscreen changes for debugging
            const handleFullscreenChange = function() {
              const isFullscreen = !!(document.fullscreenElement || 
                                     document.webkitFullscreenElement || 
                                     document.mozFullScreenElement || 
                                     document.msFullscreenElement);
              console.log('[Injected Script] Fullscreen changed:', isFullscreen);
            };
            
            document.addEventListener('fullscreenchange', handleFullscreenChange);
            document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.addEventListener('mozfullscreenchange', handleFullscreenChange);
            document.addEventListener('MSFullscreenChange', handleFullscreenChange);
            
            // Also try to enable fullscreen if it's not enabled
            if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled) {
              console.warn('[Injected Script] Fullscreen API appears to be disabled');
            } else {
              console.log('[Injected Script] Fullscreen API is enabled');
            }
            
            console.log('[Injected Script] Fullscreen API interception setup complete');
          })();
        `).catch((err: Error) => {
          console.warn('[Fullscreen Debug] Could not inject fullscreen interception script:', err.message);
        });
      } catch (err: any) {
        console.warn('[Fullscreen Debug] Fullscreen interception script injection failed:', err.message);
      }
    }

    // Inject script to handle links that might open in new windows
    // This ensures all links in projects tab open in the same webview
    if (currentTab === 'projects' && webview) {
      try {
        webview.executeJavaScript(`
          (function() {
            console.log('[Injected Script] Overriding link behavior for projects tab');
            // Override all links with target="_blank" to open in same window
            document.addEventListener('click', function(e) {
              const link = e.target.closest('a');
              if (link && link.target === '_blank') {
                console.log('[Injected Script] Intercepting link with target="_blank":', link.href);
                e.preventDefault();
                e.stopPropagation();
                window.location.href = link.href;
                return false;
              }
            }, true);
            
            // Also handle window.open calls
            const originalOpen = window.open;
            window.open = function(url, target, features) {
              console.log('[Injected Script] Intercepting window.open:', url);
              if (url && url.includes('projects.100xdevs.com')) {
                window.location.href = url;
                return null;
              }
              return originalOpen.apply(window, arguments);
            };
          })();
        `).catch((err: Error) => {
          console.warn('[Navigation Debug] Could not inject script:', err.message);
        });
      } catch (err: any) {
        console.warn('[Navigation Debug] Script injection failed:', err.message);
      }
    }
  });

  webview.addEventListener('did-fail-load', (event: Electron.DidFailLoadEvent) => {
    console.error('Webview load failed:', event.errorDescription);
    document.body.classList.remove('loading');
  });

  webview.addEventListener('will-navigate', (event: Electron.WillNavigateEvent) => {
    const url = event.url;
    console.log('[Navigation Debug] Will navigate to:', url);
    console.log('[Navigation Debug] Current tab:', currentTab);
    
    // Allow navigation within the same domain
    // This ensures links clicked in projects tab navigate in-place
    if (currentTab === 'projects' && url.includes('projects.100xdevs.com')) {
      console.log('[Navigation Debug] Allowing navigation within projects domain');
      // Navigation is allowed by default, just log it
    } else if (currentTab === 'app' && url.includes('app.100xdevs.com')) {
      console.log('[Navigation Debug] Allowing navigation within app domain');
    } else if (currentTab === 'classx' && url.includes('classx.co.in')) {
      console.log('[Navigation Debug] Allowing navigation within classx domain');
    }
    // Navigation will proceed normally
  });

  webview.addEventListener('new-window', (event: Event) => {
    event.preventDefault();
    const newWindowEvent = event as unknown as WebviewNewWindowEvent;
    const url = newWindowEvent.url;
    
    console.log('[Navigation Debug] New window requested:', url);
    console.log('[Navigation Debug] Current tab:', currentTab);
    
    // For projects tab, open all links in the same webview
    if (currentTab === 'projects') {
      console.log('[Navigation Debug] Projects tab - opening in same webview');
      if (webview) {
        webview.src = url;
      }
      return;
    }
    
    // For other tabs, check domain matching
    if (url.includes('100xdevs.com') || 
        url.includes('classx.co.in') ||
        url.includes('appx-play.classx.co.in') ||
        url.includes('oauth') || 
        url.includes('auth') ||
        url.includes('accounts.google.com') ||
        url.includes('github.com')) {
      console.log('[Navigation Debug] Trusted domain - opening in same webview');
      if (webview) {
        webview.src = url;
      }
    } else {
      console.log('[Navigation Debug] External domain - opening in external browser');
      if (window.electronAPI) {
        window.electronAPI.openExternal(url);
      }
    }
  });

  webview.addEventListener('did-navigate', (event: Electron.DidNavigateEvent) => {
    console.log('[Navigation Debug] Navigated to:', event.url);
    console.log('[Navigation Debug] Current tab:', currentTab);
  });

  webview.addEventListener('did-navigate-in-page', (event: Electron.DidNavigateInPageEvent) => {
    console.log('[Navigation Debug] In-page navigation to:', event.url);
  });

  // Handle guest webview creation (another way links might open)
  webview.addEventListener('did-attach', () => {
    console.log('[Navigation Debug] Webview attached');
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
    } else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'I') {
      // Ctrl+Shift+I or Cmd+Shift+I - handled by main process
    } else if (event.key === 'F12') {
      // F12 - handled by main process
    } else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'J') {
      // Ctrl+Shift+J or Cmd+Shift+J - Open webview DevTools
      event.preventDefault();
      if (webview) {
        console.log('[Debug] Opening webview DevTools');
        webview.openDevTools();
      }
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
