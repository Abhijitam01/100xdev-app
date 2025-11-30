import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url: string) => {
    return ipcRenderer.invoke('open-external', url);
  }
});

