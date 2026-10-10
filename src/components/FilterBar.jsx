import { Search, X, ArrowUpDown, Users, Grid, List, Check } from 'lucide-react';

export default function FilterBar({
  searchQuery,
  onSearchChange,
  playerFilter,
  onPlayerFilterChange,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  filterInstalledOnly,
  onToggleFilterInstalled,
  totalItems,
  filteredCount,
  installedCount,
}) {
  const playerSlots = [
    { label: 'All', value: '' },
    { label: '2P', value: '2' },
    { label: '3P', value: '3' },
    { label: '4P', value: '4' },
    { label: '5P', value: '5' },
    { label: '6P', value: '6' },
    { label: '7P', value: '7' },
    { label: '8P', value: '8' },
  ];

  const sortOptions = [
    { label: 'Most Downloads', value: 'downloads' },
    { label: 'Newest Date', value: 'create-date' },
    { label: 'Name (A-Z)', value: 'name' },
    { label: 'Rating', value: 'rating' },
    { label: 'File Size', value: 'file-size' },
    { label: 'Player Slots', value: 'players' },
  ];

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-3">
      {/* Top row: Search, Filter Installed, View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-grow max-w-sm">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search maps, author, or keyword..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 pl-9 pr-8 py-1.5 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Installed Only & View Mode */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleFilterInstalled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filterInstalledOnly
                ? 'bg-teal-950/60 border-teal-500/50 text-teal-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            {filterInstalledOnly && <Check className="w-3.5 h-3.5 text-teal-400" />}
            <span>Installed only</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
              {installedCount}
            </span>
          </button>

          <div className="flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              title="Grid View"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              title="List View"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Players filter and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-zinc-800/80">
        {/* Player Count Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
            <Users className="w-3.5 h-3.5" />
            Players:
          </span>
          <div className="flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg gap-0.5">
            {playerSlots.map((slot) => {
              const active = playerFilter === slot.value;
              return (
                <button
                  key={slot.label}
                  type="button"
                  onClick={() => onPlayerFilterChange(slot.value)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    active
                      ? 'bg-teal-600 text-white font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort & Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs text-zinc-500">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-teal-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-zinc-400 font-mono bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
            {totalItems > 0 ? (
              <span>
                <strong className="text-zinc-200">{filteredCount}</strong> of{' '}
                <strong className="text-zinc-400">{totalItems}</strong> maps
              </span>
            ) : (
              <span>Loading...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
