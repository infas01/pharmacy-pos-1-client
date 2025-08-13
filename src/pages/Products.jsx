import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../lib/axios';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import Confirm from '../components/Confirm';

function BatchEditor({ batches, setBatches }) {
  const add = () =>
    setBatches([
      ...batches,
      { batchNo: '', expiryDate: '', quantity: 0, costPrice: 0, salePrice: 0 },
    ]);

  const update = (i, k, v) =>
    setBatches(batches.map((b, idx) => (idx === i ? { ...b, [k]: v } : b)));

  const remove = (i) => setBatches(batches.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          Batches
        </label>
        <button className="btn-primary" type="button" onClick={add}>
          Add Batch
        </button>
      </div>

      {!batches.length && (
        <div className="card p-4 text-sm text-app-muted">
          No batches added. Click <span className="font-medium">Add Batch</span>{' '}
          to begin.
        </div>
      )}

      {batches.map((b, i) => (
        <div key={i} className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-700">
              Batch {i + 1}
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="btn-outline border-rose-300 text-rose-700 hover:bg-rose-50"
            >
              Remove
            </button>
          </div>

          {/* Row 1: Batch No | Expiry date */}
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Batch No
              </label>
              <input
                className="input mt-1"
                placeholder="e.g., B-2025-01"
                value={b.batchNo}
                onChange={(e) => update(i, 'batchNo', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Expiry date
              </label>
              <input
                type="date"
                className="input mt-1"
                value={b.expiryDate?.substring(0, 10) || ''}
                onChange={(e) => update(i, 'expiryDate', e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Qty | Cost | Price */}
          <div className="grid gap-3 sm:grid-cols-3 mt-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Qty
              </label>
              <input
                type="number"
                min="0"
                className="input mt-1 text-right"
                placeholder="0"
                value={b.quantity}
                onChange={(e) => update(i, 'quantity', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Cost
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input mt-1 text-right"
                placeholder="0.00"
                value={b.costPrice}
                onChange={(e) => update(i, 'costPrice', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input mt-1 text-right"
                placeholder="0.00"
                value={b.salePrice}
                onChange={(e) => update(i, 'salePrice', Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductForm({ open, onClose, onSaved, initial }) {
  const [form, setForm] = useState(
    initial || {
      name: '',
      sku: '',
      barcode: '',
      category: '',
      brand: '',
      unit: 'pcs',
    }
  );
  const [batches, setBatches] = useState(initial?.batches || []);
  const [cats, setCats] = useState([]);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const payload = { ...form, batches };
      if (initial?._id) await api.put(`/products/${initial._id}`, payload);
      else await api.post('/products', payload);
      onSaved();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed');
    }
  };

  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data));
  }, []);
  useEffect(() => {
    setForm(
      initial || {
        name: '',
        sku: '',
        barcode: '',
        category: '',
        brand: '',
        unit: 'pcs',
      }
    );
    setBatches(initial?.batches || []);
  }, [initial]);

  return (
    <Modal
      open={open}
      title={initial ? 'Edit Product' : 'Add Product'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button form="prod-form" className="btn-primary" type="submit">
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
      <form id="prod-form" onSubmit={submit} className="grid gap-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              className="input mt-1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              className="input mt-1"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Select</option>
              {cats.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              SKU
            </label>
            <input
              className="input mt-1"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Barcode
            </label>
            <input
              className="input mt-1"
              value={form.barcode}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Brand
            </label>
            <input
              className="input mt-1"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Unit
            </label>
            <input
              className="input mt-1"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />
          </div>
        </div>

        <BatchEditor batches={batches} setBatches={setBatches} />
      </form>
    </Modal>
  );
}

export default function Products() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/products', {
        params: { q, page, limit },
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      setError('Failed to load products');
    }
  };
  useEffect(() => {
    load();
  }, [q, page]); // eslint-disable-line react-hooks/exhaustive-deps

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
    await api.delete(`/products/${toDeleteId}`);
    setConfirmOpen(false);
    setToDeleteId(null);
    load();
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
            <div className="text-lg font-semibold">Products</div>
            <button
              className="btn-primary"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Add Product
            </button>
          </div>

          {error && <Alert kind="error">{error}</Alert>}

          <div className="mb-4">
            <input
              className="input max-w-md"
              placeholder="Search name/SKU/Barcode"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-app-muted">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">SKU</th>
                  <th className="text-left p-3">Stock</th>
                  <th className="text-left p-3">Batches</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p._id} className="border-t border-app-border">
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{p.sku || '-'}</td>
                    <td className="p-3">{p.stock || 0}</td>
                    <td className="p-3">{p.batches?.length || 0}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        className="btn-outline"
                        onClick={() => {
                          setEditing(p);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-outline border-rose-300 text-rose-700 hover:bg-rose-50"
                        onClick={() => askRemove(p._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr className="border-t border-app-border">
                    <td className="p-3 text-sm text-app-muted" colSpan={5}>
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-3 gap-2">
            <button
              className="btn-outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <div className="px-3 py-1 text-sm text-app-muted">Page {page}</div>
            <button
              className="btn-outline"
              disabled={page * limit >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </main>
      </div>

      <ProductForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        initial={editing}
      />
      <Confirm
        open={confirmOpen}
        title="Delete Product"
        message="This will permanently delete the product. Continue?"
        onCancel={cancelRemove}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
