import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url: string) => {
    return ipcRenderer.invoke('open-external', url);
  },
  onNavigateTab: (callback: (tab: 'projects' | 'app' | 'classx') => void) => {
    ipcRenderer.on('navigate-tab', (_event, tab: 'projects' | 'app' | 'classx') => {
      callback(tab);
    });
  },
  windowControl: (action: 'minimize' | 'maximize' | 'close') => {
    return ipcRenderer.invoke('window-control', action);
  },
  toggleFullscreen: () => {
    return ipcRenderer.invoke('toggle-fullscreen');
  },
  isFullscreen: () => {
    return ipcRenderer.invoke('is-fullscreen');
  },
  enterFullscreen: () => {
    return ipcRenderer.invoke('enter-fullscreen');
  },
  exitFullscreen: () => {
    return ipcRenderer.invoke('exit-fullscreen');
  }
});

