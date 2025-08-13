import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../lib/axios';
import Alert from '../components/Alert';

/* ---------- helpers ---------- */
const money = (n) => Number(n || 0).toFixed(2);
const fmtDate = (s) => new Date(s).toLocaleString();

function ProductSearch({ onAdd }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q) return setResults([]);
      const { data } = await api.get('/products', { params: { q, limit: 5 } });
      setResults(data.items);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="relative">
      <input
        className="input"
        placeholder="Search products by name/SKU"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {results.length > 0 && (
        <div className="absolute mt-1 w-full card max-h-60 overflow-auto">
          {results.map((p) => (
            <button
              key={p._id}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
              onClick={() => {
                onAdd(p);
                setResults([]);
                setQ('');
              }}
            >
              <span>{p.name}</span>
              <span className="text-xs text-app-muted">
                Stock: {p.stock || 0}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- all invoices panel (inline) ---------- */
function AllInvoicesPanel({ onBack }) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const limit = 10;

  const load = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.get('/invoices', {
        params: { q, page, limit },
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load invoices');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <section className="lg:col-span-3 card p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-lg font-semibold">All Invoices</div>
        <div className="flex gap-2">
          <input
            className="input w-64"
            placeholder="Search by invoice no…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())}
          />
          <button
            className="btn-outline"
            onClick={() => {
              setPage(1);
              load();
            }}
          >
            Search
          </button>
          <button className="btn-primary" onClick={onBack}>
            Back to POS
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3">
          <Alert kind="error">{error}</Alert>
        </div>
      )}

      <div className="mt-4 overflow-auto border border-app-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="text-app-muted">
            <tr>
              <th className="text-left p-3">Invoice #</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Total</th>
              <th className="text-left p-3">Paid</th>
              <th className="text-left p-3">Method</th>
              <th className="text-left p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((inv) => (
              <tr key={inv._id} className="border-t border-app-border">
                <td className="p-3">{inv.invoiceNo}</td>
                <td className="p-3">{inv.customerName || '-'}</td>
                <td className="p-3">{money(inv.grandTotal)}</td>
                <td className="p-3">{money(inv.paid)}</td>
                <td className="p-3">{inv.paymentMethod}</td>
                <td className="p-3">{fmtDate(inv.createdAt)}</td>
              </tr>
            ))}
            {!items.length && !busy && (
              <tr className="border-t border-app-border">
                <td className="p-3 text-sm text-app-muted" colSpan={6}>
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-3">
        <div className="text-sm text-app-muted">
          Page {page} • {total} total
        </div>
        <div className="flex gap-2">
          <button
            className="btn-outline"
            disabled={busy || page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <button
            className="btn-outline"
            disabled={busy || page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Invoices() {
  const [view, setView] = useState('pos'); // 'pos' | 'all'
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // recent 5
  const [recent, setRecent] = useState([]);
  const [recentBusy, setRecentBusy] = useState(false);

  const money2 = money; // alias to keep JSX tidy

  const loadRecent = async () => {
    setRecentBusy(true);
    try {
      const { data } = await api.get('/invoices', {
        params: { page: 1, limit: 5 },
      });
      setRecent(data.items || []);
    } finally {
      setRecentBusy(false);
    }
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const addToCart = (p) => {
    setCart((c) => {
      const idx = c.findIndex((x) => x.productId === p._id);
      if (idx >= 0) {
        const next = [...c];
        next[idx].qty += 1;
        return next;
      }
      return [
        ...c,
        {
          productId: p._id,
          name: p.name,
          sku: p.sku,
          price: p.batches?.[0]?.salePrice || 0,
          qty: 1,
        },
      ];
    });
  };

  const updateQty = (i, qty) =>
    setCart(cart.map((x, idx) => (idx === i ? { ...x, qty: Number(qty) } : x)));

  const remove = (i) => setCart(cart.filter((_, idx) => idx !== i));

  const subTotal = useMemo(
    () => cart.reduce((s, x) => s + x.qty * x.price, 0),
    [cart]
  );
  const grandTotal = Math.max(subTotal - Number(discount || 0), 0);

  const checkout = async () => {
    try {
      setError('');
      setMessage('');
      const payload = {
        items: cart.map((x) => ({
          productId: x.productId,
          name: x.name,
          sku: x.sku,
          qty: x.qty,
          price: x.price,
        })),
        customerName,
        discount,
        paid,
        paymentMethod,
      };
      const { data } = await api.post('/invoices', payload);
      setMessage(`Invoice ${data.invoiceNo} created`);
      setCart([]);
      setCustomerName('');
      setDiscount(0);
      setPaid(0);
      loadRecent();
    } catch (e) {
      setError(e?.response?.data?.message || 'Checkout failed');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-[auto,1fr] bg-app-bg text-app-text">
      <div className="border-r border-app-border bg-white">
        <Sidebar />
      </div>
      <div className="flex flex-col min-w-0">
        <Topbar />
        {/* Top bar tabs */}
        <div className="px-6 pt-4">
          <div className="inline-flex rounded-lg border border-app-border bg-white p-1">
            <button
              className={`px-3 py-1.5 text-sm rounded-md ${
                view === 'pos'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => setView('pos')}
            >
              New Invoice
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-md ${
                view === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => setView('all')}
            >
              All Invoices
            </button>
          </div>
        </div>
        <main className="p-6 grid lg:grid-cols-3 gap-6">
          {view === 'all' ? (
            <AllInvoicesPanel onBack={() => setView('pos')} />
          ) : (
            <>
              <section className="lg:col-span-2 card p-6">
                <div className="text-lg font-semibold mb-4">New Invoice</div>

                {error && (
                  <div className="mb-3">
                    <Alert kind="error">{error}</Alert>
                  </div>
                )}
                {message && (
                  <div className="mb-3">
                    <Alert kind="success">{message}</Alert>
                  </div>
                )}

                <ProductSearch onAdd={addToCart} />

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-app-muted">
                      <tr>
                        <th className="text-left p-2">Item</th>
                        <th className="text-left p-2">Price</th>
                        <th className="text-left p-2">Qty</th>
                        <th className="text-left p-2">Subtotal</th>
                        <th className="p-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((x, i) => (
                        <tr key={i} className="border-t border-app-border">
                          <td className="p-2">{x.name}</td>
                          <td className="p-2">{x.price}</td>
                          <td className="p-2 w-32">
                            <input
                              type="number"
                              className="input"
                              value={x.qty}
                              onChange={(e) => updateQty(i, e.target.value)}
                            />
                          </td>
                          <td className="p-2">
                            {(x.qty * x.price).toFixed(2)}
                          </td>
                          <td className="p-2 text-right">
                            <button
                              className="btn-outline border-rose-300 text-rose-700 hover:bg-rose-50"
                              onClick={() => remove(i)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!cart.length && (
                        <tr className="border-t border-app-border">
                          <td
                            className="p-2 text-sm text-app-muted"
                            colSpan={5}
                          >
                            No items yet. Search above to add products.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="card p-6 h-fit">
                <div className="text-lg font-semibold mb-4">Payment</div>
                <div className="grid gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Customer
                    </label>
                    <input
                      className="input mt-1"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Discount
                    </label>
                    <input
                      type="number"
                      className="input mt-1"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Paid
                    </label>
                    <input
                      type="number"
                      className="input mt-1"
                      value={paid}
                      onChange={(e) => setPaid(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Method
                    </label>
                    <select
                      className="input mt-1"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card</option>
                      <option value="MIXED">Mixed</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 border-t border-app-border pt-4 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>{Number(discount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg mt-1">
                    <span>Total</span>
                    <span>{grandTotal.toFixed(2)}</span>
                  </div>
                  <button
                    className="btn-primary w-full mt-4"
                    onClick={checkout}
                    disabled={!cart.length}
                  >
                    Checkout
                  </button>
                </div>
              </section>

              {/* Recent invoices */}
              <section className="lg:col-span-3 card p-6">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">Recent invoices</div>
                  <button
                    className="btn-outline"
                    onClick={() => setView('all')}
                  >
                    See all invoices
                  </button>
                </div>

                <div className="mt-4 overflow-auto border border-app-border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="text-app-muted">
                      <tr>
                        <th className="text-left p-3">Invoice #</th>
                        <th className="text-left p-3">Customer</th>
                        <th className="text-left p-3">Total</th>
                        <th className="text-left p-3">Paid</th>
                        <th className="text-left p-3">Method</th>
                        <th className="text-left p-3">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((inv) => (
                        <tr
                          key={inv._id}
                          className="border-t border-app-border"
                        >
                          <td className="p-3">{inv.invoiceNo}</td>
                          <td className="p-3">{inv.customerName || '-'}</td>
                          <td className="p-3">{money(inv.grandTotal)}</td>
                          <td className="p-3">{money(inv.paid)}</td>
                          <td className="p-3">{inv.paymentMethod}</td>
                          <td className="p-3">{fmtDate(inv.createdAt)}</td>
                        </tr>
                      ))}
                      {!recent.length && !recentBusy && (
                        <tr className="border-t border-app-border">
                          <td
                            className="p-3 text-sm text-app-muted"
                            colSpan={6}
                          >
                            No invoices yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
      {/* <AllInvoicesModal open={showAll} onClose={() => setShowAll(false)} /> */}
    </div>
  );
}
