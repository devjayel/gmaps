import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import MapCard from './components/MapCard';
import MapDetailsModal from './components/MapDetailsModal';
import ImagePreviewModal from './components/ImagePreviewModal';
import FolderSetupModal from './components/FolderSetupModal';
import InstalledMapsView from './components/InstalledMapsView';
import Pagination from './components/Pagination';
import Toast from './components/Toast';
import UpdateModal from './components/UpdateModal';
import {
  AlertTriangle,
  Folder,
  Loader2,
} from 'lucide-react';

const PAGE_SIZE = 24;

export default function App() {
  const mainRef = useRef(null);

  // Navigation tab: 'online' | 'installed'
  const [activeTab, setActiveTab] = useState('online');

  // Game version state: 'zerohour' | 'classic'
  const [selectedVersion, setSelectedVersion] = useState(() => {
    return localStorage.getItem('cnc_selected_version') || 'zerohour';
  });

  // Stored custom folder paths
  const [customFolders, setCustomFolders] = useState(() => {
    try {
      const stored = localStorage.getItem('cnc_custom_folders');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Default paths detected on OS
  const [defaultPaths, setDefaultPaths] = useState(null);

  // Installed maps in the active folder
  const [installedMaps, setInstalledMaps] = useState([]);

  // C&C Labs Maps state
  const [mapsList, setMapsList] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Sorting for online maps
  const [searchQuery, setSearchQuery] = useState('');
  const [playerFilter, setPlayerFilter] = useState('');
  const [sortOption, setSortOption] = useState('downloads');
  const [viewMode, setViewMode] = useState('grid');
  const [filterInstalledOnly, setFilterInstalledOnly] = useState(false);

  // Install progress tracking: { [mapId]: 'idle' | 'downloading' | 'extracting' | 'installed' | 'error' }
  const [installStates, setInstallStates] = useState({});

  // Modals
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [activeDetailsMap, setActiveDetailsMap] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [toast, setToast] = useState(null);

  // Auto-updater state
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [updateStatus, setUpdateStatus] = useState('idle');
  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);

  const showToast = useCallback((type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Listen for auto-updater events & fetch app version
  useEffect(() => {
    if (window.electronAPI?.getAppVersion) {
      window.electronAPI
        .getAppVersion()
        .then((v) => {
          if (v) setAppVersion(v);
        })
        .catch(() => {});
    }

    if (window.electronAPI?.onUpdateStatus) {
      const unsubscribe = window.electronAPI.onUpdateStatus((data) => {
        if (!data) return;

        setUpdateStatus(data.status);

        if (data.status === 'available') {
          setUpdateInfo(data.info);
          showToast(
            'info',
            'Update Available',
            `GMaps v${data.info?.version} is available for download!`
          );
        } else if (data.status === 'downloading') {
          setDownloadProgress(data.progress);
        } else if (data.status === 'downloaded') {
          setUpdateInfo(data.info);
          showToast(
            'success',
            'Update Ready',
            `GMaps v${data.info?.version} downloaded. Restart to install!`
          );
        } else if (data.status === 'error') {
          setUpdateError(data.error);
        }
      });

      return () => unsubscribe();
    }
  }, [showToast]);

  const handleCheckForUpdates = async () => {
    if (!window.electronAPI?.checkForUpdates) return;
    setUpdateStatus('checking');
    setUpdateError(null);
    setIsUpdateModalOpen(true);

    try {
      const res = await window.electronAPI.checkForUpdates();
      if (res?.isDev) {
        setIsDevMode(true);
        setUpdateStatus('not-available');
      }
    } catch (err) {
      console.error('Check for updates failed:', err);
      setUpdateStatus('error');
      setUpdateError(err.message || 'Failed to check for updates.');
    }
  };

  const handleDownloadUpdate = async () => {
    if (!window.electronAPI?.downloadUpdate) return;
    setUpdateStatus('downloading');
    try {
      await window.electronAPI.downloadUpdate();
    } catch (err) {
      console.error('Download update failed:', err);
      setUpdateStatus('error');
      setUpdateError(err.message || 'Failed to download update.');
    }
  };

  const handleQuitAndInstall = () => {
    if (window.electronAPI?.quitAndInstall) {
      window.electronAPI.quitAndInstall();
    }
  };

  // Compute active maps folder for current version
  const currentFolder = useMemo(() => {
    return customFolders[selectedVersion] || defaultPaths?.[selectedVersion]?.path || '';
  }, [customFolders, defaultPaths, selectedVersion]);

  // Check if active folder exists
  const folderExists = useMemo(() => {
    if (!currentFolder) return false;
    if (customFolders[selectedVersion]) return true;
    return defaultPaths?.[selectedVersion]?.exists ?? false;
  }, [currentFolder, customFolders, defaultPaths, selectedVersion]);

  // Load OS defaults on mount
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getDefaultPaths().then((paths) => {
        setDefaultPaths(paths);
      }).catch((err) => {
        console.error('Failed to get default paths:', err);
      });
    }
  }, []);

  // Fetch installed maps when currentFolder changes
  const refreshInstalledMaps = useCallback(async () => {
    if (!currentFolder || !window.electronAPI) return;
    try {
      const maps = await window.electronAPI.getInstalledMaps(currentFolder);
      setInstalledMaps(maps || []);
    } catch (err) {
      console.error('Failed to get installed maps:', err);
    }
  }, [currentFolder]);

  useEffect(() => {
    refreshInstalledMaps();
  }, [refreshInstalledMaps]);

  // Fetch maps from C&C Labs
  const loadMaps = useCallback(
    async (forceRefresh = false) => {
      setIsLoading(true);
      setError(null);

      try {
        if (window.electronAPI) {
          const res = await window.electronAPI.fetchMaps({
            version: selectedVersion,
            forceRefresh,
          });

          setMapsList(res.items || []);
          setTotalItems(res.totalItems || res.items?.length || 0);
        } else {
          setMapsList([]);
          setTotalItems(0);
        }
      } catch (err) {
        console.error('Failed to load C&C Labs maps:', err);
        setError(err.message || 'Failed to load maps from C&C Labs.');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedVersion]
  );

  useEffect(() => {
    loadMaps(false);
  }, [loadMaps]);

  const handleSelectVersion = (version) => {
    if (version === selectedVersion) return;
    setSelectedVersion(version);
    localStorage.setItem('cnc_selected_version', version);
    setCurrentPage(1);
    setSearchQuery('');
  };

  const handleSaveFolder = (version, folderPath) => {
    const updated = { ...customFolders, [version]: folderPath };
    setCustomFolders(updated);
    localStorage.setItem('cnc_custom_folders', JSON.stringify(updated));
    showToast('success', 'Folder Saved', `Maps folder for ${version === 'zerohour' ? 'Zero Hour' : 'Generals Classic'} saved.`);
  };

  const handleBrowseFolder = async (defaultPath) => {
    if (!window.electronAPI) return null;
    return await window.electronAPI.selectFolder(defaultPath);
  };

  const handleOpenFolder = async (folderPath) => {
    if (!folderPath || !window.electronAPI) return;
    await window.electronAPI.openFolder(folderPath);
  };

  const handleEnsureFolder = async (folderPath) => {
    if (!folderPath || !window.electronAPI) return false;
    const ok = await window.electronAPI.ensureFolder(folderPath);
    if (ok) {
      showToast('success', 'Folder Created', `Directory created at ${folderPath}`);
      refreshInstalledMaps();
    } else {
      showToast('error', 'Error', 'Failed to create directory.');
    }
    return ok;
  };

  const handleOpenExternal = async (url) => {
    if (!url || !window.electronAPI) return;
    await window.electronAPI.openExternal(url);
  };

  // Map Installation Handler
  const handleInstallMap = async (map) => {
    if (!currentFolder) {
      setIsSetupModalOpen(true);
      showToast('error', 'Folder Required', 'Please set your game maps directory first.');
      return;
    }

    if (!map.downloadUrl) {
      showToast('error', 'Unavailable', 'No download link available for this map.');
      return;
    }

    setInstallStates((prev) => ({ ...prev, [map.id]: 'downloading' }));

    try {
      setTimeout(() => {
        setInstallStates((prev) => (prev[map.id] === 'downloading' ? { ...prev, [map.id]: 'extracting' } : prev));
      }, 600);

      const refererUrl =
        selectedVersion === 'classic'
          ? 'https://www.cnclabs.com/maps/generals/maps.aspx'
          : 'https://www.cnclabs.com/maps/generals/zerohour-maps.aspx';

      const result = await window.electronAPI.installMap({
        downloadUrl: map.downloadUrl,
        detailUrl: map.detailUrl,
        mapName: map.name,
        targetFolder: currentFolder,
        refererUrl,
      });

      if (result.success) {
        setInstallStates((prev) => ({ ...prev, [map.id]: 'installed' }));
        showToast('success', 'Installed', `Installed into folder: ${result.folderName}`);
        refreshInstalledMaps();
      }
    } catch (err) {
      console.error('Installation failed:', err);
      setInstallStates((prev) => ({ ...prev, [map.id]: 'error' }));
      const is429 =
        err?.message?.includes('429') ||
        err?.message?.toLowerCase().includes('too many requests') ||
        err?.message?.toLowerCase().includes('rate limit');

      if (is429) {
        showToast(
          'error',
          'Rate Limited (HTTP 429)',
          'C&C Labs is temporarily limiting requests. Please wait 10-15 seconds and try again.'
        );
      } else {
        showToast('error', 'Installation Failed', err.message || 'Failed to download or extract map.');
      }
    }
  };

  // Delete installed map handler
  const handleDeleteMap = async (mapFolderName) => {
    if (!window.electronAPI || !currentFolder) return;
    try {
      await window.electronAPI.deleteInstalledMap({
        targetFolder: currentFolder,
        mapFolderName,
      });
      showToast('success', 'Map Removed', `"${mapFolderName}" was deleted from maps folder.`);
      refreshInstalledMaps();
    } catch (err) {
      console.error('Failed to delete map:', err);
      showToast('error', 'Delete Failed', err.message || 'Could not delete map folder.');
    }
  };

  // Match installed map helper (case-insensitive substring/normalized match)
  const isMapInstalled = useCallback(
    (map) => {
      if (!installedMaps || installedMaps.length === 0) return false;
      const cleanOnline = map.name.toLowerCase().replace(/[^a-z0-9]/g, '');

      return installedMaps.some((inst) => {
        // Strip [GMAPS] prefix for comparison
        const baseName = inst.name.replace(/^\[GMAPS\]\s*/i, '');
        const cleanInst = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (cleanInst === cleanOnline) return true;
        if (cleanInst.includes(cleanOnline) || cleanOnline.includes(cleanInst)) return true;

        if (inst.mapFileName) {
          const cleanMapFile = inst.mapFileName.replace(/\.map$/i, '').toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanMapFile === cleanOnline || cleanOnline.includes(cleanMapFile) || cleanMapFile.includes(cleanOnline)) {
            return true;
          }
        }
        return false;
      });
    },
    [installedMaps]
  );

  const filteredMaps = useMemo(() => {
    let result = mapsList;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const cleanQ = q.replace(/[^a-z0-9]/g, '');
      result = result.filter((m) => {
        const nameMatch = m.name.toLowerCase().includes(q);
        const authorMatch = m.author && m.author.toLowerCase().includes(q);
        const descMatch = m.description && m.description.toLowerCase().includes(q);
        const cleanNameMatch = cleanQ.length >= 2 && m.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanQ);
        return nameMatch || authorMatch || descMatch || cleanNameMatch;
      });
    }

    if (playerFilter) {
      const slot = parseInt(playerFilter, 10);
      result = result.filter((m) => m.playerSlots === slot);
    }

    if (filterInstalledOnly) {
      result = result.filter((m) => isMapInstalled(m) || installStates[m.id] === 'installed');
    }

    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case 'downloads':
          return (b.downloads || 0) - (a.downloads || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'players':
          return (b.playerSlots || 0) - (a.playerSlots || 0);
        case 'file-size': {
          const parseSize = (s) => {
            if (!s) return 0;
            const match = s.match(/([\d.]+)\s*(MB|KB|Bytes)/i);
            if (!match) return 0;
            const num = parseFloat(match[1]);
            const unit = match[2].toUpperCase();
            if (unit === 'MB') return num * 1024 * 1024;
            if (unit === 'KB') return num * 1024;
            return num;
          };
          return parseSize(b.fileSize) - parseSize(a.fileSize);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [mapsList, searchQuery, playerFilter, sortOption, filterInstalledOnly, isMapInstalled, installStates]);

  const maxPage = Math.max(1, Math.ceil(filteredMaps.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), maxPage);

  const pagedMaps = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredMaps.slice(start, start + PAGE_SIZE);
  }, [filteredMaps, safeCurrentPage]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, playerFilter, sortOption, filterInstalledOnly, selectedVersion]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 select-none overflow-hidden font-sans">
      {/* App Header */}
      <Header
        selectedVersion={selectedVersion}
        onSelectVersion={handleSelectVersion}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentFolder={currentFolder}
        folderExists={folderExists}
        installedCount={installedMaps.length}
        onOpenSetup={() => setIsSetupModalOpen(true)}
        onOpenFolder={() => handleOpenFolder(currentFolder)}
        onRefresh={() => loadMaps(true)}
        isLoading={isLoading}
        appVersion={appVersion}
        hasUpdate={updateStatus === 'available' || updateStatus === 'downloaded'}
        updateInfo={updateInfo}
        onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
      />

      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Setup Banner (if folder missing) */}
        {(!currentFolder || !folderExists) && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-800 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Select your Maps Directory
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Set your Command &amp; Conquer {selectedVersion === 'zerohour' ? 'Zero Hour' : 'Classic'} maps folder to enable 1-click map installation.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSetupModalOpen(true)}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs rounded-lg shadow-sm transition-colors shrink-0"
            >
              Configure Folder
            </button>
          </div>
        )}

        {/* Tab 1: Installed Maps View */}
        {activeTab === 'installed' ? (
          <InstalledMapsView
            installedMaps={installedMaps}
            onOpenFolder={handleOpenFolder}
            onDeleteMap={handleDeleteMap}
            currentFolder={currentFolder}
          />
        ) : (
          /* Tab 2: Browse Online Maps */
          <>
            {/* Filter and Search Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              playerFilter={playerFilter}
              onPlayerFilterChange={setPlayerFilter}
              sortOption={sortOption}
              onSortChange={setSortOption}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              filterInstalledOnly={filterInstalledOnly}
              onToggleFilterInstalled={() => setFilterInstalledOnly(!filterInstalledOnly)}
              totalItems={totalItems}
              filteredCount={filteredMaps.length}
              installedCount={installedMaps.length}
            />

            {/* Content Listing */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    Loading maps from C&amp;C Labs...
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Fetching {selectedVersion === 'zerohour' ? 'Zero Hour' : 'Generals Classic'} maps repository
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-3 max-w-md mx-auto my-12">
                <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto" />
                <h3 className="text-sm font-semibold text-zinc-100">
                  Unable to load maps
                </h3>
                <p className="text-xs text-zinc-400 leading-normal">{error}</p>
                <button
                  type="button"
                  onClick={() => loadMaps(currentPage)}
                  className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredMaps.length === 0 ? (
              <div className="p-10 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center space-y-2.5 max-w-sm mx-auto my-12">
                <Folder className="w-7 h-7 text-zinc-600 mx-auto" />
                <h3 className="text-sm font-semibold text-zinc-200">
                  No maps found
                </h3>
                <p className="text-xs text-zinc-400">
                  {searchQuery
                    ? `No results for "${searchQuery}".`
                    : filterInstalledOnly
                    ? 'No maps on this online page match your installed maps. View all 144 installed maps in the "Installed Maps" tab.'
                    : 'No maps matching the active filter.'}
                </p>
                {filterInstalledOnly && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('installed')}
                    className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Go to Installed Maps ({installedMaps.length})
                  </button>
                )}
                {(searchQuery || playerFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setPlayerFilter('');
                    }}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors ml-2"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5'
                    : 'space-y-2'
                }
              >
                {pagedMaps.map((map) => (
                  <MapCard
                    key={map.id}
                    map={map}
                    viewMode={viewMode}
                    isInstalled={isMapInstalled(map)}
                    installState={installStates[map.id] || 'idle'}
                    onInstall={handleInstallMap}
                    onOpenDetails={setActiveDetailsMap}
                    onPreviewImage={(url, name) => setPreviewImage({ url, title: name })}
                    onOpenExternal={handleOpenExternal}
                  />
                ))}
              </div>
            )}

            {/* Pagination for Online Maps */}
            {!isLoading && !error && filteredMaps.length > 0 && (
              <Pagination
                currentPage={safeCurrentPage}
                maxPage={maxPage}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </main>

      {/* Setup Modal */}
      <FolderSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        selectedVersion={selectedVersion}
        onSelectVersion={handleSelectVersion}
        defaultPaths={defaultPaths}
        customFolders={customFolders}
        onSaveFolder={handleSaveFolder}
        onBrowseFolder={handleBrowseFolder}
        onOpenFolder={handleOpenFolder}
        onEnsureFolder={handleEnsureFolder}
        installedMaps={installedMaps}
        appVersion={appVersion}
        onOpenUpdateModal={handleCheckForUpdates}
      />

      {/* Details Modal */}
      <MapDetailsModal
        isOpen={!!activeDetailsMap}
        onClose={() => setActiveDetailsMap(null)}
        map={activeDetailsMap}
        isInstalled={activeDetailsMap ? isMapInstalled(activeDetailsMap) : false}
        installState={activeDetailsMap ? installStates[activeDetailsMap.id] : 'idle'}
        onInstall={handleInstallMap}
        onOpenExternal={handleOpenExternal}
      />

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage?.url}
        title={previewImage?.title}
      />

      {/* Software Auto-Updater Modal */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        currentVersion={appVersion}
        updateStatus={updateStatus}
        updateInfo={updateInfo}
        downloadProgress={downloadProgress}
        errorMessage={updateError}
        isDevMode={isDevMode}
        onCheckForUpdates={handleCheckForUpdates}
        onDownloadUpdate={handleDownloadUpdate}
        onQuitAndInstall={handleQuitAndInstall}
        onOpenExternal={handleOpenExternal}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}