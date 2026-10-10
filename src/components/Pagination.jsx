import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  maxPage,
  onPageChange,
  isLoading,
}) {
  const [jumpPage, setJumpPage] = useState('');

  const safeMaxPage = Math.max(1, maxPage || 1);
  const safeCurrentPage = Math.min(Math.max(1, currentPage || 1), safeMaxPage);

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;

    for (let i = 1; i <= safeMaxPage; i++) {
      if (
        i === 1 ||
        i === safeMaxPage ||
        (i >= safeCurrentPage - delta && i <= safeCurrentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const handleJump = (e) => {
    e.preventDefault();
    const p = parseInt(jumpPage, 10);
    if (!isNaN(p) && p >= 1 && p <= safeMaxPage) {
      onPageChange(p);
      setJumpPage('');
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-1 border-t border-zinc-800/80">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        {/* First */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage === 1 || isLoading}
          title="First Page"
          className="p-1.5 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1 || isLoading}
          title="Previous Page"
          className="p-1.5 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numbers */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-1.5 text-xs text-zinc-600 font-mono">
                  ...
                </span>
              );
            }

            const isActive = p === safeCurrentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                disabled={isLoading}
                className={`h-7 min-w-[28px] px-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white font-semibold shadow-sm'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeMaxPage || isLoading}
          title="Next Page"
          className="p-1.5 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last */}
        <button
          type="button"
          onClick={() => onPageChange(safeMaxPage)}
          disabled={safeCurrentPage === safeMaxPage || isLoading}
          title="Last Page"
          className="p-1.5 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      {/* Info & Jump */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-400 font-mono">
          Page <strong className="text-zinc-200">{safeCurrentPage}</strong> of{' '}
          <strong className="text-zinc-300">{safeMaxPage}</strong>
        </span>

        {safeMaxPage > 1 && (
          <form onSubmit={handleJump} className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={safeMaxPage}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              placeholder="Jump"
              className="w-14 bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs px-2 py-1 rounded-md focus:outline-none focus:border-teal-500 text-center font-mono"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium rounded-md transition-colors"
            >
              Go
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
