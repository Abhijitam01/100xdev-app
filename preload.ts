import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url: string) => {
    return ipcRenderer.invoke('open-external', url);
  },
  onNavigateTab: (callback: (tab: 'projects' | 'app') => void) => {
    ipcRenderer.on('navigate-tab', (_event, tab: 'projects' | 'app') => {
      callback(tab);
    });
  }
});

