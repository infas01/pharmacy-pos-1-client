export default function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="card w-full max-w-lg">
          <div className="px-4 py-3 border-b border-app-border">
            <h3 className="text-base font-semibold">{title}</h3>
          </div>
          <div className="p-4">{children}</div>
          {footer && (
            <div className="px-4 py-3 border-t border-app-border flex justify-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
