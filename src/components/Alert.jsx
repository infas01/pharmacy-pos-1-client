export default function Alert({ kind = 'info', title, children }) {
  const styles = {
    info: 'border-sky-200 text-sky-800 bg-sky-50',
    success: 'border-emerald-200 text-emerald-800 bg-emerald-50',
    warning: 'border-amber-200 text-amber-900 bg-amber-50',
    error: 'border-rose-200 text-rose-800 bg-rose-50',
  }[kind];

  return (
    <div className={`border rounded-md p-3 ${styles}`}>
      {title && <div className="font-medium mb-1">{title}</div>}
      {children}
    </div>
  );
}
