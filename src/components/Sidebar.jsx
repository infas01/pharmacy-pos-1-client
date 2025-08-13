import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Boxes,
  Tag,
  TimerReset,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

const linkBase = 'nav-link';

function NavList({ onAfterClick }) {
  const { user } = useAuth();
  const isAdminLike = user?.role === 'Admin' || user?.role === 'Sub Admin';

  const nav = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      end: true,
    },
    { to: '/invoices', label: 'Invoices', icon: <Receipt size={18} /> },
    { to: '/products', label: 'Products', icon: <Boxes size={18} /> },
    { to: '/categories', label: 'Products Category', icon: <Tag size={18} /> },
    {
      to: '/expired',
      label: 'Expired Products',
      icon: <TimerReset size={18} />,
    },
  ];

  const adminNav = [
    { to: '/users', label: 'Users', icon: <Users size={18} /> },
  ];

  return (
    <>
      {/* <div className="px-4 h-16 flex items-center justify-between border-b border-app-border">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white font-semibold">
            Rx
          </span>
          <span className="text-base font-semibold text-slate-900">
            Pharmacy POS
          </span>
        </div>
        {user?.role && (
          <span className="text-xs text-app-muted">{user.role}</span>
        )}
      </div> */}

      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'nav-link-active' : ''}`
            }
            onClick={onAfterClick}
          >
            {icon}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {isAdminLike && (
        <div className="p-3 border-t border-app-border">
          <div className="mb-2 text-xs font-medium text-app-muted">
            Administration
          </div>
          <div className="space-y-1">
            {adminNav.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? 'nav-link-active' : ''}`
                }
                onClick={onAfterClick}
              >
                {icon}
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function Sidebar() {
  const { sidebarOpen, closeSidebar } = useUI();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-app-border bg-white">
        <NavList />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/30"
            onClick={closeSidebar}
            aria-hidden="true"
          />
          <div className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-app-border flex flex-col">
            <div className="flex items-center justify-between h-16 px-4 border-b border-app-border">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white font-semibold">
                  Rx
                </span>
                <span className="text-base font-semibold text-slate-900">
                  Pharmacy POS
                </span>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-app-border hover:bg-slate-50"
                aria-label="Close sidebar"
                onClick={closeSidebar}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <NavList onAfterClick={closeSidebar} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
