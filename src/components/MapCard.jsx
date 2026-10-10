import { useState } from 'react';
import { Download, Check, ExternalLink, User, Eye, Layers, CheckCircle2, Loader2, Maximize2 } from 'lucide-react';

export default function MapCard({
  map,
  isInstalled,
  installState,
  onInstall,
  onOpenDetails,
  onPreviewImage,
  onOpenExternal,
  viewMode = 'grid',
}) {
  const [imgError, setImgError] = useState(false);

  const isInstalling = installState === 'downloading' || installState === 'extracting';
  const installedStatus = isInstalled || installState === 'installed';

  if (viewMode === 'list') {
    return (
      <div className="bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3 transition-colors flex items-center justify-between gap-4">
        {/* Thumbnail & Title */}
        <div className="flex items-center gap-3.5 min-w-0 flex-grow">
          <div
            onClick={() => onPreviewImage(map.imageUrl, map.name)}
            className="relative w-16 h-12 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 cursor-pointer group/thumb"
          >
            {!imgError && map.imageUrl ? (
              <img
                src={map.imageUrl}
                alt={map.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-600 font-mono text-[9px]">
                No image
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-grow">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                onClick={() => onOpenDetails(map)}
                className="text-sm font-semibold text-zinc-100 hover:text-teal-400 transition-colors cursor-pointer truncate max-w-md"
              >
                {map.name}
              </h3>
              {map.badges &&
                map.badges.map((b, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/40"
                  >
                    {b}
                  </span>
                ))}
              {installedStatus && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-teal-400" />
                  Installed
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 font-mono">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-zinc-500" />
                {map.author || 'Unknown'}
              </span>
              <span>•</span>
              <span className="text-zinc-300">{map.fileSize}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-zinc-400">
                <Download className="w-3 h-3 text-zinc-500" />
                {map.downloads}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpenDetails(map)}
            title="View Details"
            className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>

          {map.detailUrl && (
            <button
              type="button"
              onClick={() => onOpenExternal(map.detailUrl)}
              title="Open C&C Labs Page"
              className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onInstall(map)}
            disabled={isInstalling}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
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
                <span>Install</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Grid Card View (shadcn style)
  return (
    <div className="bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-colors flex flex-col justify-between">
      {/* Thumbnail */}
      <div>
        <div className="relative aspect-[16/10] bg-zinc-950 overflow-hidden border-b border-zinc-800 group/img">
          {!imgError && map.imageUrl ? (
            <img
              src={map.imageUrl}
              alt={map.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-600 text-xs gap-1.5">
              <Layers className="w-6 h-6 text-zinc-700" />
              <span>Map Preview</span>
            </div>
          )}

          {/* Quick enlarge button */}
          <button
            type="button"
            onClick={() => onPreviewImage(map.imageUrl, map.name)}
            title="Enlarge image"
            className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 hover:bg-zinc-800 text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Badges Overlay */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 flex-wrap">
            <div className="flex items-center gap-1 flex-wrap">
              {map.badges &&
                map.badges.map((b, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-900/90 text-zinc-200 border border-zinc-700/50 backdrop-blur"
                  >
                    {b}
                  </span>
                ))}
            </div>

            {installedStatus && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1 backdrop-blur font-mono">
                <CheckCircle2 className="w-3 h-3 text-teal-400" />
                Installed
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5 space-y-2">
          {/* Title */}
          <h3
            onClick={() => onOpenDetails(map)}
            className="text-sm font-semibold text-zinc-100 hover:text-teal-400 transition-colors cursor-pointer line-clamp-1"
            title={map.name}
          >
            {map.name}
          </h3>

          {/* Author & Stats */}
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono pb-1 border-b border-zinc-800/80">
            <div className="flex items-center gap-1 truncate max-w-[130px]" title={map.author}>
              <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{map.author || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-zinc-300">{map.fileSize}</span>
              <span className="flex items-center gap-1 text-zinc-400">
                <Download className="w-3 h-3 text-zinc-500" />
                {map.downloads}
              </span>
            </div>
          </div>

          {/* Description */}
          <p
            onClick={() => onOpenDetails(map)}
            className="text-xs text-zinc-400 leading-relaxed line-clamp-2 cursor-pointer hover:text-zinc-200 transition-colors"
          >
            {map.description || 'No description available.'}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3.5 pt-0 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenDetails(map)}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>

          {map.detailUrl && (
            <button
              type="button"
              onClick={() => onOpenExternal(map.detailUrl)}
              className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Open C&C Labs Page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Install Button */}
        <button
          type="button"
          onClick={() => onInstall(map)}
          disabled={isInstalling}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
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
              <span>Install</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
