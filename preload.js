const { contextBridge, ipcRenderer } = require('electron');

// Minimal API - just what's needed
contextBridge.exposeInMainWorld('electronAPI', {
  // Open URL in external browser (for truly external links)
  openExternal: (url) => {
    return ipcRenderer.invoke('open-external', url);
  }
});