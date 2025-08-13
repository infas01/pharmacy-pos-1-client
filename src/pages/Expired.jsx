import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../lib/axios';

export default function Expired() {
  const [withinDays, setWithinDays] = useState(30);
  const [items, setItems] = useState([]);

  const load = async () => {
    const { data } = await api.get('/products/expired', {
      params: { withinDays },
    });
    setItems(data.items);
  };

  useEffect(() => {
    load();
  }, [withinDays]);

  const status = (dt) => {
    const d = new Date(dt);
    const now = new Date();
    if (d < now) return 'Expired';
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    return `In ${diff} days`;
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
            <div className="text-lg font-semibold">
              Expired / Expiring Products
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-app-muted">Within</span>
              <input
                type="number"
                className="input w-24"
                value={withinDays}
                onChange={(e) => setWithinDays(Number(e.target.value))}
              />
              <span className="text-sm text-app-muted">days</span>
            </div>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-app-muted">
                <tr>
                  <th className="text-left p-3">Product</th>
                  <th className="text-left p-3">Batch</th>
                  <th className="text-left p-3">Expiry</th>
                  <th className="text-left p-3">Qty</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((x, i) => (
                  <tr key={i} className="border-t border-app-border">
                    <td className="p-3">{x.name}</td>
                    <td className="p-3">{x.batches?.batchNo || '-'}</td>
                    <td className="p-3">
                      {x.batches?.expiryDate?.substring(0, 10)}
                    </td>
                    <td className="p-3">{x.batches?.quantity}</td>
                    <td className="p-3">{x.batches?.salePrice}</td>
                    <td className="p-3">{status(x.batches?.expiryDate)}</td>
                  </tr>
                ))}
                {!items?.length && (
                  <tr className="border-t border-app-border">
                    <td className="p-3 text-sm text-app-muted" colSpan={6}>
                      Nothing expiring in this window.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
