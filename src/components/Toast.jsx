import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-slide-up">
      <div className="flex items-start gap-3 p-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-xl max-w-sm">
        <div className="shrink-0 mt-0.5">
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          ) : isError ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : (
            <Info className="w-4 h-4 text-zinc-400" />
          )}
        </div>

        <div className="min-w-0 flex-grow">
          {toast.title && (
            <h4 className="text-xs font-semibold text-zinc-100 mb-0.5">
              {toast.title}
            </h4>
          )}
          <p className="text-xs text-zinc-400 leading-normal">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
