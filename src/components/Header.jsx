import { FolderOpen, RefreshCw, Settings, MapPin, Globe, HardDrive, Sparkles } from 'lucide-react';

export default function Header({
  selectedVersion,
  onSelectVersion,
  activeTab = 'online',
  onSelectTab,
  currentFolder,
  folderExists,
  installedCount,
  onOpenSetup,
  onOpenFolder,
  onRefresh,
  isLoading,
  appVersion,
  hasUpdate,
  updateInfo,
  onOpenUpdateModal,
}) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Brand GMaps & Primary Navigation Tabs */}
      <div className="flex items-center gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-max">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-600 text-white font-bold text-sm tracking-tight shadow-sm">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-semibold tracking-tight text-zinc-100">
              GMaps
            </h1>
            <span className="text-xs text-zinc-500 font-normal">
              General Maps
            </span>
            <button
              type="button"
              onClick={onOpenUpdateModal}
              title="Click to check for updates"
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              v{appVersion || '1.0.0'}
            </button>
          </div>
        </div>

        {/* Primary View Navigation (Online vs Installed) */}
        <div className="inline-flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
          <button
            type="button"
            onClick={() => onSelectTab('online')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'online'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>Browse Online</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('installed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'installed'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-teal-400" />
            <span>Installed Maps</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === 'installed'
                  ? 'bg-zinc-900 text-teal-300 font-semibold'
                  : 'bg-zinc-950 text-zinc-500'
              }`}
            >
              {installedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Center: Game Version Segmented Control */}
      <div className="inline-flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
        <button
          type="button"
          onClick={() => onSelectVersion('zerohour')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            selectedVersion === 'zerohour'
              ? 'bg-teal-600 text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>Zero Hour</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              selectedVersion === 'zerohour'
                ? 'bg-black/30 text-white'
                : 'bg-zinc-950 text-zinc-500'
            }`}
          >
            500+
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectVersion('classic')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            selectedVersion === 'classic'
              ? 'bg-teal-600 text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>Generals Classic</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              selectedVersion === 'classic'
                ? 'bg-black/30 text-white'
                : 'bg-zinc-950 text-zinc-500'
            }`}
          >
            170+
          </span>
        </button>
      </div>

      {/* Right: Target Folder Status & Actions */}
      <div className="flex items-center gap-2">
        {/* Folder Trigger */}
        <button
          type="button"
          onClick={onOpenSetup}
          title={currentFolder || 'Click to select folder'}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 transition-colors text-left max-w-xs"
        >
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              folderExists ? 'bg-teal-500' : 'bg-amber-500'
            }`}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-zinc-300">
                Maps Folder
              </span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/40">
                {installedCount} installed
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono truncate max-w-[170px]">
              {currentFolder ? currentFolder : 'Not set'}
            </p>
          </div>
          <Settings className="w-3.5 h-3.5 text-zinc-500 ml-1 shrink-0" />
        </button>

        {/* Open Folder in Windows Explorer */}
        {currentFolder && folderExists && (
          <button
            type="button"
            onClick={onOpenFolder}
            title="Open folder in File Explorer"
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
        )}

        {/* Update Notification Badge */}
        {hasUpdate && (
          <button
            type="button"
            onClick={onOpenUpdateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 text-xs font-semibold shadow-sm transition-all animate-pulse"
            title="A new GMaps version is available! Click to update."
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Update v{updateInfo?.version || 'Available'}</span>
          </button>
        )}

        {/* Refresh button (when in online tab) */}
        {activeTab === 'online' && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh online maps"
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-400' : ''}`}
            />
          </button>
        )}
      </div>
    </header>
  );
}
