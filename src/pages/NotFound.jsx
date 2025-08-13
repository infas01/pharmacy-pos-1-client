import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-app-bg text-app-text">
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-semibold">404 — Page Not Found</h1>
        <p className="text-app-muted mt-2">
          The page you are looking for doesn’t exist.
        </p>
        <Link className="btn-primary mt-6 inline-block" to="/dashboard">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
