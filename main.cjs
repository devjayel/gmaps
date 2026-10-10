const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const AdmZip = require("adm-zip");
const { autoUpdater } = require("electron-updater");

let mainWindow;

// Auto-updater configuration
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function setupAutoUpdater() {
    autoUpdater.on("checking-for-update", () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("update-status", { status: "checking" });
        }
    });

    autoUpdater.on("update-available", (info) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("update-status", {
                status: "available",
                info: {
                    version: info.version,
                    releaseDate: info.releaseDate,
                    releaseNotes: info.releaseNotes,
                    files: info.files,
                },
            });
        }
    });

    autoUpdater.on("update-not-available", (info) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("update-status", {
                status: "not-available",
                info: {
                    version: info?.version || app.getVersion(),
                },
            });
        }
    });

    autoUpdater.on("download-progress", (progressObj) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("update-status", {
                status: "downloading",
                progress: {
                    percent: Math.round(progressObj.percent),
                    bytesPerSecond: progressObj.bytesPerSecond,
                    transferred: progressObj.transferred,
                    total: progressObj.total,
                },
            });
        }
    });

    autoUpdater.on("update-downloaded", (info) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("update-status", {
                status: "downloaded",
                info: {
                    version: info.version,
                    releaseDate: info.releaseDate,
                },
            });
        }
    });

    autoUpdater.on("error", (err) => {
        console.error("AutoUpdater error:", err);
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("update-status", {
                status: "error",
                error: err?.message || "Failed to check for updates.",
            });
        }
    });
}

// Default map directories on Windows
function getDefaultPaths() {
    const docs = path.join(os.homedir(), "Documents");
    const zhPath = path.join(docs, "Command and Conquer Generals Zero Hour Data", "Maps");
    const classicPath = path.join(docs, "Command and Conquer Generals Data", "Maps");

    return {
        zerohour: {
            path: zhPath,
            exists: fs.existsSync(zhPath),
        },
        classic: {
            path: classicPath,
            exists: fs.existsSync(classicPath),
        },
    };
}

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Read installed maps from a given folder
function getInstalledMaps(targetFolder) {
    if (!targetFolder || !fs.existsSync(targetFolder)) {
        return [];
    }

    try {
        const entries = fs.readdirSync(targetFolder, { withFileTypes: true });
        const mapFolders = [];

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const subPath = path.join(targetFolder, entry.name);
                try {
                    const subFiles = fs.readdirSync(subPath);
                    const mapFile = subFiles.find((f) => f.toLowerCase().endsWith(".map"));
                    const tgaFile = subFiles.find((f) => f.toLowerCase().endsWith(".tga"));
                    const stat = fs.statSync(subPath);

                    let totalBytes = 0;
                    for (const f of subFiles) {
                        try {
                            totalBytes += fs.statSync(path.join(subPath, f)).size;
                        } catch {}
                    }

                    mapFolders.push({
                        name: entry.name,
                        path: subPath,
                        hasMapFile: Boolean(mapFile),
                        mapFileName: mapFile || null,
                        hasTga: Boolean(tgaFile),
                        fileCount: subFiles.length,
                        isGMaps: entry.name.startsWith("[GMAPS]"),
                        sizeBytes: totalBytes,
                        formattedSize: formatBytes(totalBytes),
                        modifiedTime: stat.mtimeMs,
                    });
                } catch {
                    mapFolders.push({
                        name: entry.name,
                        path: subPath,
                        hasMapFile: false,
                        mapFileName: null,
                        hasTga: false,
                        fileCount: 0,
                        isGMaps: entry.name.startsWith("[GMAPS]"),
                        sizeBytes: 0,
                        formattedSize: "0 B",
                        modifiedTime: 0,
                    });
                }
            }
        }

        // Sort by modified time descending (newest first)
        mapFolders.sort((a, b) => b.modifiedTime - a.modifiedTime);

        return mapFolders;
    } catch (err) {
        console.error("Error reading installed maps:", err);
        return [];
    }
}

// Repository cache (in-memory + disk)
const repositoryCache = new Map();

function getDiskCachePath(cacheKey) {
    try {
        const uPath = app.getPath("userData");
        if (!fs.existsSync(uPath)) {
            fs.mkdirSync(uPath, { recursive: true });
        }
        return path.join(uPath, `cnc_maps_${cacheKey}.json`);
    } catch {
        return null;
    }
}

function parseMapItemsFromHtml(html) {
    const rawItems = html.split('<div class="list-group-item list-group-item-action">').slice(1);
    const items = [];

    for (const raw of rawItems) {
        const nameMatch = raw.match(/<h5 class="mb-0[^"]*">\s*<a[^>]*>([^<]+)<\/a>/);
        const detailMatch = raw.match(/href="(\/downloads\/details\/\d+\/)"/);
        const imgMatch = raw.match(/<img src="([^"]+)"/);
        const authorMatch = raw.match(/<i class="bi bi-person"><\/i>\s*([^<]+)/);
        const dlCountMatch = raw.match(/<i class="bi bi-download"><\/i>\s*([^<]+)/);
        const sizeMatch = raw.match(/<div class="small text-muted mt-1">\s*([^<]+)/);
        const dlLinkMatch = raw.match(/href="(\/downloads\/file\/[^"]+)"/);
        const badges = [...raw.matchAll(/<span class="badge[^"]*">([^<]+)<\/span>/g)].map((b) =>
            b[1].trim()
        );
        const descMatch = raw.match(/<div class="mb-1 text-muted small">([\s\S]*?)<\/div>/);

        if (nameMatch) {
            const playerBadge = badges.find((b) => /players?/i.test(b));
            const playerSlots = playerBadge ? parseInt(playerBadge.replace(/\D/g, ""), 10) : null;
            const downloads = dlCountMatch ? parseInt(dlCountMatch[1].replace(/\D/g, ""), 10) || 0 : 0;

            items.push({
                id: detailMatch ? detailMatch[1].replace(/\D/g, "") : Math.random().toString(36).substring(7),
                name: nameMatch[1].trim(),
                detailUrl: detailMatch ? "https://www.cnclabs.com" + detailMatch[1] : null,
                imageUrl: imgMatch ? "https://www.cnclabs.com" + imgMatch[1] : null,
                author: authorMatch ? authorMatch[1].trim() : "Unknown",
                downloads,
                fileSize: sizeMatch ? sizeMatch[1].trim() : "Unknown",
                downloadUrl: dlLinkMatch ? "https://www.cnclabs.com" + dlLinkMatch[1] : null,
                badges,
                playerSlots,
                description: descMatch
                    ? descMatch[1]
                          .replace(/<br\s*\/?>/gi, "\n")
                          .replace(/<[^>]+>/g, "")
                          .replace(/&nbsp;/g, " ")
                          .replace(/&amp;/g, "&")
                          .trim()
                    : "",
            });
        }
    }

    return items;
}

async function fetchCnCLabsMaps({ version, forceRefresh = false }) {
    const isZH = version !== "classic";
    const cacheKey = isZH ? "zerohour" : "classic";
    const baseUrl = isZH
        ? "https://www.cnclabs.com/maps/generals/zerohour-maps.aspx"
        : "https://www.cnclabs.com/maps/generals/maps.aspx";

    // 1. Check in-memory cache (valid for 60 minutes unless forceRefresh)
    if (!forceRefresh && repositoryCache.has(cacheKey)) {
        const cached = repositoryCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 60 * 60 * 1000) {
            return cached.data;
        }
    }

    // 2. Check disk cache file
    const diskPath = getDiskCachePath(cacheKey);
    if (!forceRefresh && diskPath && fs.existsSync(diskPath)) {
        try {
            const raw = fs.readFileSync(diskPath, "utf-8");
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
                repositoryCache.set(cacheKey, { timestamp: parsed.timestamp || Date.now(), data: parsed });
                // If disk cache is fresher than 2 hours, return it
                if (Date.now() - (parsed.timestamp || 0) < 2 * 60 * 60 * 1000) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error("Error reading disk cache:", e);
        }
    }

    try {
        // Fetch page 1 first to determine total pages and count
        const page1Res = await fetch(baseUrl + "?page=1", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
        });

        if (!page1Res.ok) {
            throw new Error(`Failed to fetch from C&C Labs (HTTP ${page1Res.status})`);
        }

        const page1Html = await page1Res.text();
        const page1Items = parseMapItemsFromHtml(page1Html);

        // Discover maxPage
        const pageOfMatch = page1Html.match(/Page\s+(\d+)\s+of\s+(\d+)/i);
        const pageNumbers = [...page1Html.matchAll(/[?&](?:amp;)?page=(\d+)/gi)].map((m) =>
            parseInt(m[1], 10)
        );

        let maxPage = 1;
        if (pageOfMatch) {
            maxPage = parseInt(pageOfMatch[2], 10);
        } else if (pageNumbers.length > 0) {
            maxPage = Math.max(...pageNumbers);
        } else {
            maxPage = isZH ? 21 : 7;
        }

        // Fetch remaining pages in small batches to respect rate limits
        const pageList = [];
        for (let p = 2; p <= maxPage; p++) {
            pageList.push(p);
        }

        const remainingResults = [];
        const CONCURRENCY = 3;
        const DELAY_BETWEEN_BATCHES_MS = 250;

        for (let i = 0; i < pageList.length; i += CONCURRENCY) {
            const batch = pageList.slice(i, i + CONCURRENCY);
            const batchResults = await Promise.all(
                batch.map(async (p) => {
                    try {
                        const r = await fetch(`${baseUrl}?page=${p}`, {
                            headers: {
                                "User-Agent":
                                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                                Accept: "text/html",
                            },
                        });
                        if (!r.ok) {
                            console.warn(`Page ${p} returned HTTP ${r.status}`);
                            return [];
                        }
                        const h = await r.text();
                        return parseMapItemsFromHtml(h);
                    } catch (err) {
                        console.error(`Error fetching page ${p}:`, err);
                        return [];
                    }
                })
            );
            remainingResults.push(...batchResults.flat());

            if (i + CONCURRENCY < pageList.length) {
                await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
            }
        }

        const allItems = [page1Items, ...remainingResults].flat();

        // Deduplicate items by detailUrl or name
        const seen = new Set();
        const uniqueItems = [];
        for (const item of allItems) {
            const key = item.detailUrl || item.name;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueItems.push(item);
            }
        }

        const result = {
            version: cacheKey,
            items: uniqueItems,
            totalItems: uniqueItems.length,
            maxPage,
            timestamp: Date.now(),
        };

        repositoryCache.set(cacheKey, { timestamp: Date.now(), data: result });

        if (diskPath) {
            try {
                fs.writeFileSync(diskPath, JSON.stringify(result), "utf-8");
            } catch (e) {
                console.error("Failed to write disk cache:", e);
            }
        }

        return result;
    } catch (err) {
        console.error("fetchCnCLabsMaps error:", err);
        // Fallback to in-memory cache if network failed
        if (repositoryCache.has(cacheKey)) {
            return repositoryCache.get(cacheKey).data;
        }
        // Fallback to disk cache if available
        if (diskPath && fs.existsSync(diskPath)) {
            try {
                const raw = fs.readFileSync(diskPath, "utf-8");
                return JSON.parse(raw);
            } catch {}
        }
        throw err;
    }
}

// Download and install map into destination folder
async function installMap({ downloadUrl, mapName, targetFolder, refererUrl, detailUrl }) {
    if (!downloadUrl) {
        throw new Error("No download URL provided for this map.");
    }
    if (!targetFolder) {
        throw new Error("No destination folder selected.");
    }

    // Ensure target folder exists
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
    }

    // 1. Fetch zip archive with retry, token refresh and backoff
    let currentDownloadUrl = downloadUrl;
    let arrayBuffer = null;
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const res = await fetch(currentDownloadUrl, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    Referer: refererUrl || detailUrl || "https://www.cnclabs.com/maps/generals/zerohour-maps.aspx",
                },
            });

            if (res.status === 429) {
                console.warn(`[GMaps] Download attempt ${attempt} hit HTTP 429 rate limit.`);
                if (attempt < maxAttempts) {
                    // Backoff delay before retry
                    await new Promise((r) => setTimeout(r, 2000 * attempt));

                    // If detailUrl is provided, refresh token by re-fetching detail page
                    if (detailUrl) {
                        try {
                            const detailRes = await fetch(detailUrl, {
                                headers: {
                                    "User-Agent":
                                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                                    Accept: "text/html",
                                },
                            });
                            if (detailRes.ok) {
                                const detailHtml = await detailRes.text();
                                const freshMatch = detailHtml.match(/href="(\/downloads\/file\/[^"]+)"/);
                                if (freshMatch) {
                                    currentDownloadUrl = "https://www.cnclabs.com" + freshMatch[1];
                                    console.log("[GMaps] Refreshed download token from detail page.");
                                }
                            }
                        } catch (e) {
                            console.warn("[GMaps] Failed to scrape fresh token:", e.message);
                        }
                    }
                    continue;
                } else {
                    throw new Error("C&C Labs is temporarily limiting requests (HTTP 429: Too Many Requests). Please wait 10-15 seconds before trying again.");
                }
            }

            if (!res.ok) {
                if (attempt < maxAttempts) {
                    await new Promise((r) => setTimeout(r, 1500));
                    continue;
                }
                throw new Error(`Failed to download map file (HTTP ${res.status})`);
            }

            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("text/html")) {
                const text = await res.text();
                if (text.includes("Too Many Requests")) {
                    throw new Error("C&C Labs is temporarily limiting requests (HTTP 429: Too Many Requests). Please wait 10-15 seconds before trying again.");
                }
                // If token expired, try to refresh via detail page if we have attempts left
                if (detailUrl && attempt < maxAttempts) {
                    console.warn(`[GMaps] Received HTML page instead of zip, attempting token refresh.`);
                    await new Promise((r) => setTimeout(r, 1500));
                    try {
                        const detailRes = await fetch(detailUrl, {
                            headers: {
                                "User-Agent":
                                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                                Accept: "text/html",
                            },
                        });
                        if (detailRes.ok) {
                            const detailHtml = await detailRes.text();
                            const freshMatch = detailHtml.match(/href="(\/downloads\/file\/[^"]+)"/);
                            if (freshMatch) {
                                currentDownloadUrl = "https://www.cnclabs.com" + freshMatch[1];
                                continue;
                            }
                        }
                    } catch (e) {
                        console.warn("[GMaps] Token refresh failed:", e.message);
                    }
                }
                throw new Error("Received an unexpected HTML response from C&C Labs instead of a map archive.");
            }

            arrayBuffer = await res.arrayBuffer();
            break;
        } catch (err) {
            if (attempt >= maxAttempts) {
                throw err;
            }
            console.warn(`[GMaps] Download attempt ${attempt} failed: ${err.message}. Retrying...`);
            await new Promise((r) => setTimeout(r, 1500));
        }
    }

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error("The downloaded archive is empty or invalid.");
    }
    const buffer = Buffer.from(arrayBuffer);
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    if (entries.length === 0) {
        throw new Error("The downloaded archive is empty or invalid.");
    }

    // Sanitize map name and format folder with [GMAPS] {map name} prefix
    const safeMapName = mapName.replace(/[/\\?%*:|"<>]/g, "").trim() || "CustomMap";
    const finalFolderName = `[GMAPS] ${safeMapName}`;
    const destFolder = path.join(targetFolder, finalFolderName);

    if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true });
    }

    // Determine if zip entries all share a single top-level directory
    const parts = entries.map((e) => e.entryName.split(/[\/\\]/).filter(Boolean));
    const firstRoots = new Set(parts.map((p) => p[0]));
    const hasCommonRoot =
        firstRoots.size === 1 &&
        entries.some((e) => e.entryName.includes("/") || e.entryName.includes("\\"));
    const rootDirName = hasCommonRoot ? [...firstRoots][0] : null;

    for (const entry of entries) {
        let relPath = entry.entryName;
        if (rootDirName) {
            if (relPath.startsWith(rootDirName + "/") || relPath.startsWith(rootDirName + "\\")) {
                relPath = relPath.slice(rootDirName.length + 1);
            } else if (relPath === rootDirName || relPath === rootDirName + "/") {
                continue;
            }
        }
        if (!relPath) continue;

        const outPath = path.join(destFolder, relPath);
        if (entry.isDirectory) {
            if (!fs.existsSync(outPath)) fs.mkdirSync(outPath, { recursive: true });
        } else {
            const outDir = path.dirname(outPath);
            if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
            fs.writeFileSync(outPath, entry.getData());
        }
    }

    return {
        success: true,
        mapName,
        folderName: finalFolderName,
        installedPath: destFolder,
    };
}

// Delete an installed map folder
function deleteInstalledMap({ targetFolder, mapFolderName }) {
    if (!targetFolder || !mapFolderName) {
        throw new Error("Invalid target folder or map name.");
    }

    // Protect against directory traversal
    const safeName = path.basename(mapFolderName);
    const fullPath = path.join(targetFolder, safeName);

    if (!fs.existsSync(fullPath)) {
        throw new Error("Map folder does not exist.");
    }

    fs.rmSync(fullPath, { recursive: true, force: true });
    return { success: true, folderName: safeName };
}

// IPC Registration
function registerIpcHandlers() {
    ipcMain.handle("get-default-paths", () => {
        return getDefaultPaths();
    });

    ipcMain.handle("select-folder", async (event, defaultPath) => {
        const result = await dialog.showOpenDialog(mainWindow, {
            title: "Select C&C Generals Maps Folder",
            defaultPath: defaultPath && fs.existsSync(defaultPath) ? defaultPath : os.homedir(),
            properties: ["openDirectory", "createDirectory"],
        });

        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }

        const selected = result.filePaths[0];
        return {
            path: selected,
            exists: fs.existsSync(selected),
        };
    });

    ipcMain.handle("ensure-folder", (event, folderPath) => {
        if (!folderPath) return false;
        try {
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }
            return true;
        } catch (err) {
            console.error("Failed to ensure folder:", err);
            return false;
        }
    });

    ipcMain.handle("open-folder", async (event, folderPath) => {
        if (!folderPath) return false;
        try {
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }
            await shell.openPath(folderPath);
            return true;
        } catch (err) {
            console.error("Failed to open folder:", err);
            return false;
        }
    });

    ipcMain.handle("open-external", async (event, url) => {
        if (!url) return false;
        await shell.openExternal(url);
        return true;
    });

    ipcMain.handle("get-installed-maps", (event, targetFolder) => {
        return getInstalledMaps(targetFolder);
    });

    ipcMain.handle("fetch-maps", async (event, params) => {
        return await fetchCnCLabsMaps(params);
    });

    ipcMain.handle("install-map", async (event, params) => {
        return await installMap(params);
    });

    ipcMain.handle("delete-installed-map", (event, params) => {
        return deleteInstalledMap(params);
    });

    // Auto Updater IPC Handlers
    ipcMain.handle("get-app-version", () => {
        return app.getVersion();
    });

    ipcMain.handle("check-for-updates", async () => {
        if (!app.isPackaged) {
            return {
                isDev: true,
                version: app.getVersion(),
                message: "Auto-updater is active in packaged production releases.",
            };
        }
        try {
            const result = await autoUpdater.checkForUpdates();
            return {
                isDev: false,
                version: app.getVersion(),
                updateInfo: result?.updateInfo || null,
            };
        } catch (err) {
            console.error("[GMaps] Check for updates error:", err);
            throw err;
        }
    });

    ipcMain.handle("download-update", async () => {
        try {
            await autoUpdater.downloadUpdate();
            return { success: true };
        } catch (err) {
            console.error("[GMaps] Download update error:", err);
            throw err;
        }
    });

    ipcMain.handle("quit-and-install", () => {
        setImmediate(() => {
            autoUpdater.quitAndInstall();
        });
        return true;
    });
}

// Completely disable and remove the application menu
Menu.setApplicationMenu(null);

app.on("ready", () => {
    registerIpcHandlers();
    setupAutoUpdater();

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 840,
        resizable: false,
        maximizable: false,
        fullscreenable: false,
        backgroundColor: "#09090b",
        title: "GMaps - General Maps",
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Remove window menu completely on Windows/Linux
    mainWindow.setMenu(null);
    mainWindow.removeMenu();
    mainWindow.setMenuBarVisibility(false);

    const isDev = !app.isPackaged && process.env.NODE_ENV !== "production";

    if (isDev) {
        mainWindow.loadURL("http://localhost:5173").catch(() => {
            mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
        });
    } else {
        mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
    }

    // Check for updates automatically in production release after initial launch
    if (app.isPackaged) {
        setTimeout(() => {
            autoUpdater.checkForUpdates().catch((err) => {
                console.warn("[GMaps] Initial update check failed:", err.message);
            });
        }, 4000);
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
