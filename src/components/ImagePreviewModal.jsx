import { X } from 'lucide-react';

export default function ImagePreviewModal({ isOpen, onClose, imageUrl, title }) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col cursor-default"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <span className="text-xs font-medium text-zinc-200">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 flex items-center justify-center bg-zinc-950 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[75vh] w-auto object-contain rounded"
          />
        </div>
      </div>
    </div>
  );
}
