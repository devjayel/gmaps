import { useState } from 'react';
import { Folder, FolderOpen, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-react';

export default function FolderSetupModal({
  isOpen,
  onClose,
  selectedVersion,
  onSelectVersion,
  defaultPaths,
  customFolders,
  onSaveFolder,
  onBrowseFolder,
  onOpenFolder,
  onEnsureFolder,
  installedMaps,
  appVersion,
  onOpenUpdateModal,
}) {
  const currentFolder = customFolders[selectedVersion] || defaultPaths?.[selectedVersion]?.path || '';
  const defaultPathInfo = defaultPaths?.[selectedVersion];
  const isDefaultSelected = currentFolder === defaultPathInfo?.path;

  const [inputFolder, setInputFolder] = useState(currentFolder);

  if (!isOpen) return null;

  const handleBrowse = async () => {
    const res = await onBrowseFolder(inputFolder || defaultPathInfo?.path);
    if (res && res.path) {
      setInputFolder(res.path);
      onSaveFolder(selectedVersion, res.path);
    }
  };

  const handleUseDefault = () => {
    if (defaultPathInfo?.path) {
      setInputFolder(defaultPathInfo.path);
      onSaveFolder(selectedVersion, defaultPathInfo.path);
    }
  };

  const handleCreateFolder = async () => {
    if (inputFolder) {
      const ok = await onEnsureFolder(inputFolder);
      if (ok) {
        onSaveFolder(selectedVersion, inputFolder);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Dialog Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Configure Maps Folder
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select your Command &amp; Conquer installation and maps directory
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dialog Content */}
        <div className="p-6 space-y-5">
          {/* Version Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Game Version
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Zero Hour */}
              <button
                type="button"
                onClick={() => {
                  onSelectVersion('zerohour');
                  setInputFolder(customFolders.zerohour || defaultPaths?.zerohour?.path || '');
                }}
                className={`p-3.5 rounded-lg border text-left transition-colors flex flex-col gap-1.5 ${
                  selectedVersion === 'zerohour'
                    ? 'bg-zinc-800/80 border-teal-500 ring-1 ring-teal-500'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-100">
                    Generals: Zero Hour
                  </span>
                  {selectedVersion === 'zerohour' && (
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  Expansion pack repository (500+ maps)
                </p>
              </button>

              {/* Classic */}
              <button
                type="button"
                onClick={() => {
                  onSelectVersion('classic');
                  setInputFolder(customFolders.classic || defaultPaths?.classic?.path || '');
                }}
                className={`p-3.5 rounded-lg border text-left transition-colors flex flex-col gap-1.5 ${
                  selectedVersion === 'classic'
                    ? 'bg-zinc-800/80 border-teal-500 ring-1 ring-teal-500'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-100">
                    Generals (Classic)
                  </span>
                  {selectedVersion === 'classic' && (
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  Original release repository (170+ maps)
                </p>
              </button>
            </div>
          </div>

          {/* Directory Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-zinc-300">
                Maps Directory
              </label>
              {defaultPathInfo?.exists && !isDefaultSelected && (
                <button
                  type="button"
                  onClick={handleUseDefault}
                  className="text-xs text-teal-400 hover:text-teal-300 underline transition-colors"
                >
                  Use Default Path
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputFolder}
                onChange={(e) => {
                  setInputFolder(e.target.value);
                  onSaveFolder(selectedVersion, e.target.value);
                }}
                placeholder="Path to Maps directory..."
                className="flex-grow bg-zinc-950 border border-zinc-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 px-3 py-2 rounded-lg text-xs font-mono text-zinc-100 placeholder-zinc-500"
              />

              <button
                type="button"
                onClick={handleBrowse}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Folder className="w-3.5 h-3.5 text-zinc-400" />
                Browse
              </button>

              {inputFolder && (
                <button
                  type="button"
                  onClick={() => onOpenFolder(inputFolder)}
                  title="Open in File Explorer"
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg transition-colors shrink-0"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Verification Status */}
            <div className="mt-3 p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start gap-2.5">
              {installedMaps && installedMaps.length > 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-300">
                    <span className="font-semibold text-zinc-100">Verified folder:</span> Found{' '}
                    <span className="text-teal-400 font-semibold">{installedMaps.length}</span> installed maps.
                    Downloaded maps will be installed here directly.
                  </div>
                </>
              ) : inputFolder ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-400 flex-grow">
                    Folder is currently empty or does not exist yet.{' '}
                    <button
                      type="button"
                      onClick={handleCreateFolder}
                      className="text-teal-400 hover:text-teal-300 underline font-medium"
                    >
                      Create Folder
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-400">
                    Please select or browse your game maps directory above.
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Standard Paths Hint */}
          <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-xs text-zinc-400 space-y-1">
            <span className="font-medium text-zinc-300 block">Standard Windows Maps Locations:</span>
            <p className="font-mono text-[11px] text-zinc-400">
              • Zero Hour: <span className="text-zinc-300">Documents\Command and Conquer Generals Zero Hour Data\Maps</span>
            </p>
            <p className="font-mono text-[11px] text-zinc-400">
              • Classic: <span className="text-zinc-300">Documents\Command and Conquer Generals Data\Maps</span>
            </p>
          </div>

          {/* App Info & Update Trigger */}
          <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-zinc-300">GMaps Application</span>
              <p className="text-zinc-500 font-mono text-[11px]">v{appVersion || '1.0.0'} • GitHub Releases</p>
            </div>
            {onOpenUpdateModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUpdateModal();
                }}
                className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-teal-400 hover:text-teal-300 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check for Updates</span>
              </button>
            )}
          </div>
        </div>

        {/* Dialog Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs rounded-lg shadow-sm transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
