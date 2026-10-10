import { X, Download, Check, ExternalLink, CheckCircle2, Loader2, FileText } from 'lucide-react';

export default function MapDetailsModal({
  isOpen,
  onClose,
  map,
  isInstalled,
  installState,
  onInstall,
  onOpenExternal,
}) {
  if (!isOpen || !map) return null;

  const isInstalling = installState === 'downloading' || installState === 'extracting';
  const installedStatus = isInstalled || installState === 'installed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              {map.name}
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              By {map.author || 'Unknown'} • {map.fileSize} • {map.downloads} downloads
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Map Preview Image */}
          {map.imageUrl && (
            <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800">
              <img
                src={map.imageUrl}
                alt={map.name}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                {map.badges &&
                  map.badges.map((b, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-900/90 text-zinc-200 border border-zinc-700/50 backdrop-blur"
                    >
                      {b}
                    </span>
                  ))}
                {installedStatus && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1 backdrop-blur font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    Installed
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block mb-0.5">Author</span>
              <span className="text-xs font-semibold text-zinc-200 truncate block">
                {map.author || 'Unknown'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block mb-0.5">File Size</span>
              <span className="text-xs font-semibold text-zinc-200 block font-mono">
                {map.fileSize || 'N/A'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block mb-0.5">Downloads</span>
              <span className="text-xs font-semibold text-zinc-200 block font-mono">
                {map.downloads || '0'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block mb-0.5">Player Slots</span>
              <span className="text-xs font-semibold text-zinc-200 block">
                {map.playerSlots ? `${map.playerSlots} Players` : 'Multiplayer'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              Description &amp; Briefing
            </h3>
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto">
              {map.description || 'No description provided by author.'}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/50 shrink-0">
          <div>
            {map.detailUrl && (
              <button
                type="button"
                onClick={() => onOpenExternal(map.detailUrl)}
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View on C&amp;C Labs
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => onInstall(map)}
              disabled={isInstalling}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                installedStatus
                  ? 'bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700/50'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-sm'
              }`}
            >
              {isInstalling ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-300" />
                  <span>{installState === 'downloading' ? 'Downloading...' : 'Extracting...'}</span>
                </>
              ) : installedStatus ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-400" />
                  <span>Re-install</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Install Map</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
