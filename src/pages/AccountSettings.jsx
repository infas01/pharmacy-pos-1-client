import { useState } from 'react';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import Alert from '../components/Alert';

export default function AccountSettings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put('/users/me/password', { currentPassword, newPassword });
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-[auto,1fr] bg-app-bg text-app-text">
      <div className="border-r border-app-border bg-white">
        <Sidebar />
      </div>
      <div className="flex flex-col min-w-0">
        <Topbar />
        <main className="p-6 max-w-3xl">
          <div className="card p-6">
            <h2 className="text-lg font-semibold">Account Settings</h2>
            <div className="text-sm text-app-muted mt-1">
              Manage your account and password
            </div>

            <div className="mt-6 grid gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Username
                </label>
                <input
                  className="input mt-1"
                  value={user?.username || ''}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Role
                </label>
                <input
                  className="input mt-1"
                  value={user?.role || ''}
                  disabled
                />
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-8 grid gap-4">
              {error && <Alert kind="error">{error}</Alert>}
              {success && <Alert kind="success">{success}</Alert>}

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Current Password
                </label>
                <input
                  type="password"
                  className="input mt-1"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="input mt-1"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="input mt-1"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button className="btn-primary" disabled={loading}>
                  {loading ? 'Saving…' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
