export default function Placeholder({ title }) {
  return (
    <div className="p-6 bg-app-bg text-app-text min-h-screen">
      <div className="card p-6">
        <div className="text-lg font-semibold">{title}</div>
        <p className="text-app-muted mt-2">
          This page will be implemented next.
        </p>
      </div>
    </div>
  );
}
