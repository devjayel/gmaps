import { useState, useMemo } from 'react';
import { Search, X, FolderOpen, Trash2, ArrowUpDown, HardDrive, FileText, CheckCircle2 } from 'lucide-react';
import Pagination from './Pagination';

export default function InstalledMapsView({
  installedMaps,
  onOpenFolder,
  onDeleteMap,
  currentFolder,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyGMaps, setOnlyGMaps] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  const filtered = useMemo(() => {
    let result = [...installedMaps];

    if (onlyGMaps) {
      result = result.filter((m) => m.isGMaps);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.mapFileName && m.mapFileName.toLowerCase().includes(q))
      );
    }

    if (sortOption === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'size') {
      result.sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0));
    } else {
      // newest
      result.sort((a, b) => (b.modifiedTime || 0) - (a.modifiedTime || 0));
    }

    return result;
  }, [installedMaps, onlyGMaps, searchQuery, sortOption]);

  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedMaps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const gmapsCount = useMemo(() => {
    return installedMaps.filter((m) => m.isGMaps).length;
  }, [installedMaps]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Control Bar */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-grow max-w-sm">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search installed map folders..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 pl-9 pr-8 py-1.5 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setOnlyGMaps(!onlyGMaps);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                onlyGMaps
                  ? 'bg-teal-950/60 border-teal-500/50 text-teal-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <span>[GMAPS] Prefix Only</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                {gmapsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenFolder(currentFolder)}
              title="Open Maps folder in Windows File Explorer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 text-xs font-medium transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />
              <span>Open in Explorer</span>
            </button>
          </div>
        </div>

        {/* Sort & Count row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-zinc-800/80">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs text-zinc-500">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="newest">Recently Modified</option>
              <option value="name">Folder Name (A-Z)</option>
              <option value="size">Disk Size</option>
            </select>
          </div>

          <div className="text-xs text-zinc-400 font-mono bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
            Showing <strong className="text-zinc-200">{filtered.length}</strong> installed maps in{' '}
            <strong className="text-zinc-400 font-sans">{currentFolder ? 'game directory' : 'none'}</strong>
          </div>
        </div>
      </div>

      {/* Installed Maps Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center space-y-2 max-w-sm mx-auto my-12">
          <HardDrive className="w-7 h-7 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-200">
            No installed maps found
          </h3>
          <p className="text-xs text-zinc-400">
            {searchQuery
              ? `No maps match "${searchQuery}".`
              : 'No custom maps installed in this directory.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {pagedMaps.map((inst) => (
            <div
              key={inst.path}
              className="bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3.5 transition-colors flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Header Tag & Folder Name */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-grow">
                    {inst.isGMaps && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 font-semibold mb-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        GMAPS
                      </span>
                    )}
                    <h4
                      className="text-xs font-semibold text-zinc-100 truncate hover:text-teal-400 transition-colors cursor-pointer"
                      title={inst.name}
                      onClick={() => onOpenFolder(inst.path)}
                    >
                      {inst.name}
                    </h4>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-2 space-y-1 text-xs text-zinc-400 font-mono">
                  {inst.mapFileName && (
                    <div className="flex items-center gap-1.5 truncate text-[11px] text-zinc-300" title={inst.mapFileName}>
                      <FileText className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span className="truncate">{inst.mapFileName}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                    <span>{inst.formattedSize || 'N/A'}</span>
                    <span>{inst.fileCount} {inst.fileCount === 1 ? 'file' : 'files'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => onOpenFolder(inst.path)}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                  title="Open this map's folder in Explorer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Open Folder</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteMap(inst.name)}
                  className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  title="Delete/Uninstall this map"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          maxPage={maxPage}
          onPageChange={setCurrentPage}
          isLoading={false}
        />
      )}
    </div>
  );
}
