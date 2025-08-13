import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../lib/axios';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import Confirm from '../components/Confirm';
import { useAuth } from '../context/AuthContext';

function UserForm({ open, onClose, onSaved }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Cashier');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.post('/users', { username, password, role });
      onSaved();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || 'Create failed');
    }
  };

  useEffect(() => {
    if (!open) {
      setUsername('');
      setPassword('');
      setRole('Cashier');
      setError('');
    }
  }, [open]);

  return (
    <Modal
      open={open}
      title="Create User"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button form="user-form" className="btn-primary">
            Create
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-3">
          <Alert kind="error">{error}</Alert>
        </div>
      )}

      <form id="user-form" onSubmit={submit} className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Username
          </label>
          <input
            className="input mt-1"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            className="input mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            className="input mt-1"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option>Admin</option>
            <option>Sub Admin</option>
            <option>Cashier</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}

export default function Users() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState(null); // 'reset' | 'delete'
  const [targetId, setTargetId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/users');
      setItems(data);
    } catch {
      setError('Failed to load users');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id, role) => {
    await api.put(`/users/${id}`, { role });
    load();
  };

  const askReset = (id) => {
    setTargetId(id);
    setConfirmKind('reset');
    setConfirmOpen(true);
  };
  const askRemove = (id) => {
    setTargetId(id);
    setConfirmKind('delete');
    setConfirmOpen(true);
  };

  const onCancelConfirm = () => {
    setConfirmOpen(false);
    setConfirmKind(null);
    setTargetId(null);
  };

  const onConfirmAction = async () => {
    if (!targetId) return;
    try {
      if (confirmKind === 'reset') {
        await api.put(`/users/${targetId}/reset-password`, {});
        alert('Password reset to default: Password@123');
      } else if (confirmKind === 'delete') {
        await api.delete(`/users/${targetId}`);
      }
      load();
    } finally {
      onCancelConfirm();
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-[auto,1fr] bg-app-bg text-app-text">
      <div className="border-r border-app-border bg-white">
        <Sidebar />
      </div>
      <div className="flex flex-col min-w-0">
        <Topbar />
        <main className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold">Users</div>
            {['Admin'].includes(user?.role) && (
              <button className="btn-primary" onClick={() => setOpen(true)}>
                Create User
              </button>
            )}
          </div>

          {error && <Alert kind="error">{error}</Alert>}

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-app-muted">
                <tr>
                  <th className="text-left p-3">Username</th>
                  <th className="text-left p-3">Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u._id} className="border-t border-app-border">
                    <td className="p-3">{u.username}</td>
                    <td className="p-3">
                      <select
                        className="input"
                        value={u.role}
                        onChange={(e) => changeRole(u._id, e.target.value)}
                        disabled={
                          user?.role === 'Sub Admin' && u.role === 'Admin'
                        }
                      >
                        <option>Admin</option>
                        <option>Sub Admin</option>
                        <option>Cashier</option>
                      </select>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        className="btn-outline"
                        onClick={() => askReset(u._id)}
                      >
                        Reset Password
                      </button>
                      <button
                        className="btn-outline border-rose-300 text-rose-700 hover:bg-rose-50"
                        onClick={() => askRemove(u._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr className="border-t border-app-border">
                    <td className="p-3 text-sm text-app-muted" colSpan={3}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <UserForm open={open} onClose={() => setOpen(false)} onSaved={load} />
      <Confirm
        open={confirmOpen}
        title={confirmKind === 'reset' ? 'Reset Password' : 'Delete User'}
        message={
          confirmKind === 'reset'
            ? "Reset this user's password to the default value?"
            : 'This will permanently delete the user. Continue?'
        }
        onCancel={onCancelConfirm}
        onConfirm={onConfirmAction}
      />
    </div>
  );
}
