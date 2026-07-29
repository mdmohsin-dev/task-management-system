import toast from 'react-hot-toast';

/**
 * Shows an inline confirmation toast with Confirm/Cancel buttons instead of
 * the browser's native window.confirm (which looks jarring and can't be
 * styled). Resolves to true if the user confirms, false otherwise.
 * Reused for task create, update, and delete confirmations.
 *
 * Usage:
 *   const confirmed = await confirmToast('Delete this task?');
 *   if (confirmed) { ...proceed... }
 */
export function confirmToast(message) {
  return new Promise((resolve) => {
    const handleChoice = (id, choice) => {
      toast.dismiss(id);
      resolve(choice);
    };

    toast.custom(
      (t) => (
        <div
          className={`pointer-events-auto flex w-80 flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-lg transition-opacity ${
            t.visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-sm text-slate-700">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleChoice(t.id, false)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleChoice(t.id, true)}
              className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-700"
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  });
}