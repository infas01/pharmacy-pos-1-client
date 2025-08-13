export default function Confirm({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="card w-full max-w-md">
          <div className="px-4 py-3 border-b border-app-border">
            <h3 className="text-base font-semibold">{title || 'Confirm'}</h3>
          </div>
          <div className="p-4 text-sm text-slate-700">{message}</div>
          <div className="px-4 py-3 border-t border-app-border flex justify-end gap-2">
            <button onClick={onCancel} className="btn-outline">
              Cancel
            </button>
            <button onClick={onConfirm} className="btn-primary">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
