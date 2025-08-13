import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../lib/axios';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import Confirm from '../components/Confirm';

function CategoryForm({ open, onClose, onSaved, initial }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(initial?.name || '');
    setDescription(initial?.description || '');
    setIsActive(initial?.isActive ?? true);
  }, [initial]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const payload = { name, description, isActive };
      if (initial?._id) {
        await api.put(`/categories/${initial._id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed');
    }
  };

  return (
    <Modal
      open={open}
      title={initial ? 'Edit Category' : 'Add Category'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button form="cat-form" className="btn-primary">
            Save
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-3">
          <Alert kind="error">{error}</Alert>
        </div>
      )}
      <form id="cat-form" onSubmit={submit} className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            className="input mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <input
            className="input mt-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="rounded border-app-border text-blue-600 focus:ring-blue-600"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active
        </label>
      </form>
    </Modal>
  );
}

export default function Categories() {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/categories');
      setItems(data);
    } catch {
      setError('Failed to load categories');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const askRemove = (id) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const cancelRemove = () => {
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const confirmRemove = async () => {
    if (!toDeleteId) return;
    try {
      await api.delete(`/categories/${toDeleteId}`);
      setConfirmOpen(false);
      setToDeleteId(null);
      load();
    } catch (e) {
      alert(e?.response?.data?.message || 'Delete failed');
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
            <div className="text-lg font-semibold">Product Categories</div>
            <button
              className="btn-primary"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Add Category
            </button>
          </div>

          {error && <Alert kind="error">{error}</Alert>}

          <div className="card overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead className="text-app-muted">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">Active</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c._id} className="border-t border-app-border">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.description || '-'}</td>
                    <td className="p-3">{c.isActive ? 'Yes' : 'No'}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        className="btn-outline"
                        onClick={() => {
                          setEditing(c);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-outline border-rose-300 text-rose-700 hover:bg-rose-50"
                        onClick={() => askRemove(c._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr className="border-t border-app-border">
                    <td className="p-3 text-sm text-app-muted" colSpan={4}>
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <CategoryForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        initial={editing}
      />
      <Confirm
        open={confirmOpen}
        title="Delete Category"
        message="This will permanently delete the category. Continue?"
        onCancel={cancelRemove}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
