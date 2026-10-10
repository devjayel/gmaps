const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    getDefaultPaths: () => ipcRenderer.invoke("get-default-paths"),
    selectFolder: (defaultPath) => ipcRenderer.invoke("select-folder", defaultPath),
    ensureFolder: (folderPath) => ipcRenderer.invoke("ensure-folder", folderPath),
    openFolder: (folderPath) => ipcRenderer.invoke("open-folder", folderPath),
    openExternal: (url) => ipcRenderer.invoke("open-external", url),
    getInstalledMaps: (targetFolder) => ipcRenderer.invoke("get-installed-maps", targetFolder),
    fetchMaps: (params) => ipcRenderer.invoke("fetch-maps", params),
    installMap: (params) => ipcRenderer.invoke("install-map", params),
    deleteInstalledMap: (params) => ipcRenderer.invoke("delete-installed-map", params),
});
