import { useState } from 'react';
import {
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function UpdateModal({
  isOpen,
  onClose,
  currentVersion,
  updateStatus,
  updateInfo,
  downloadProgress,
  errorMessage,
  isDevMode,
  onCheckForUpdates,
  onDownloadUpdate,
  onQuitAndInstall,
  onOpenExternal,
}) {
  const [isStartingDownload, setIsStartingDownload] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsStartingDownload(true);
    try {
      await onDownloadUpdate();
    } catch {
      setIsStartingDownload(false);
    }
  };

  const newVersion = updateInfo?.version || 'Latest';
  const releaseDate = updateInfo?.releaseDate
    ? new Date(updateInfo.releaseDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const releaseNotes = updateInfo?.releaseNotes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-600/20 text-teal-400 border border-teal-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                GMaps Software Update
              </h2>
              <p className="text-[11px] text-zinc-400 font-mono">
                Current version: v{currentVersion || '1.0.0'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Status 1: Checking for updates */}
          {updateStatus === 'checking' && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
              <div>
                <p className="text-sm font-medium text-zinc-200">Checking for updates...</p>
                <p className="text-xs text-zinc-500 mt-1">Connecting to GitHub Releases repository</p>
              </div>
            </div>
          )}

          {/* Status 2: Update Available */}
          {updateStatus === 'available' && (
            <div className="space-y-4">
              {/* Version Bump Banner */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-teal-950/40 via-zinc-900 to-zinc-900 border border-teal-500/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    New Version Available
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 font-mono">
                    <span className="text-xs text-zinc-400">v{currentVersion || '1.0.0'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-sm font-bold text-teal-300">v{newVersion}</span>
                    {releaseDate && (
                      <span className="text-[11px] text-zinc-500 ml-1">({releaseDate})</span>
                    )}
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded bg-teal-500/10 text-teal-400 text-xs font-medium border border-teal-500/20">
                  Ready to download
                </div>
              </div>

              {/* Release Notes */}
              {releaseNotes && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                    What&apos;s New in v{newVersion}
                  </span>
                  <div className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-300 font-sans leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line">
                    {typeof releaseNotes === 'string'
                      ? releaseNotes.replace(/<[^>]+>/g, '')
                      : 'Improvements and bug fixes.'}
                  </div>
                </div>
              )}

              <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                <span>Verified release from official devjayel/gmaps repository.</span>
              </div>
            </div>
          )}

          {/* Status 3: Downloading */}
          {updateStatus === 'downloading' && (
            <div className="space-y-4 py-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-200">
                  Downloading GMaps v{newVersion}...
                </span>
                <span className="font-mono text-teal-400 font-semibold">
                  {downloadProgress?.percent || 0}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300 ease-out"
                  style={{ width: `${downloadProgress?.percent || 0}%` }}
                />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>
                  {formatBytes(downloadProgress?.transferred)} / {formatBytes(downloadProgress?.total)}
                </span>
                <span>
                  {downloadProgress?.bytesPerSecond
                    ? `${formatBytes(downloadProgress.bytesPerSecond)}/s`
                    : 'Calculating speed...'}
                </span>
              </div>
            </div>
          )}

          {/* Status 4: Update Downloaded (Ready to install) */}
          {updateStatus === 'downloaded' && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-emerald-300">
                    Update Ready to Install
                  </h3>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    GMaps v{newVersion} has been downloaded and verified. Restart now to complete the update, or continue using GMaps and it will install automatically next time you launch.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status 5: Up to date (No update available) */}
          {updateStatus === 'not-available' && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-200">
                  You are up to date!
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  GMaps v{currentVersion || '1.0.0'} is currently the newest version available.
                </p>
              </div>
            </div>
          )}

          {/* Status 6: Dev Mode Notice */}
          {isDevMode && updateStatus !== 'available' && updateStatus !== 'downloading' && (
            <div className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-400 space-y-2">
              <div className="flex items-center gap-1.5 font-medium text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Development Mode Detected</span>
              </div>
              <p className="leading-relaxed">
                The auto-updater connects to GitHub Releases on packaged installer builds (.exe). In development mode, check updates or download releases directly from GitHub.
              </p>
            </div>
          )}

          {/* Status 7: Error */}
          {updateStatus === 'error' && (
            <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Update Check Error</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                {errorMessage || 'Unable to check for updates. Please check your network connection.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/50">
          <button
            type="button"
            onClick={() => onOpenExternal('https://github.com/devjayel/gmaps/releases')}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>GitHub Releases</span>
          </button>

          <div className="flex items-center gap-2">
            {updateStatus === 'available' && (
              <button
                type="button"
                onClick={handleDownload}
                disabled={isStartingDownload}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isStartingDownload ? 'Starting...' : 'Download Update'}</span>
              </button>
            )}

            {updateStatus === 'downloaded' && (
              <button
                type="button"
                onClick={onQuitAndInstall}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restart &amp; Install Now</span>
              </button>
            )}

            {(updateStatus === 'not-available' || updateStatus === 'error' || isDevMode) && (
              <button
                type="button"
                onClick={onCheckForUpdates}
                className="px-3.5 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Again</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
