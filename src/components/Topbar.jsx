import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between border-b border-app-border bg-white px-6">
      <div className="text-sm text-slate-600">
        Welcome back,{' '}
        <span className="text-slate-900 font-medium">{user?.username}</span>
      </div>

      <div className="relative">
        <details className="group">
          <summary
            className="list-none flex items-center gap-2 cursor-pointer select-none rounded-md px-3 py-2 bg-white border border-app-border hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50"
            aria-label="Account menu"
          >
            <div className="h-8 w-8 rounded-full bg-blue-100 grid place-items-center text-blue-700 font-semibold">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block text-sm text-slate-700">
              {user?.username}
            </span>
            <ChevronDown
              size={16}
              className="text-slate-600 transition group-open:rotate-180"
            />
          </summary>

          <div className="z-50 absolute right-0 mt-2 w-48 card shadow-card overflow-hidden">
            <Link
              to="/account"
              className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
            >
              <Settings size={16} /> Account Settings
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}
