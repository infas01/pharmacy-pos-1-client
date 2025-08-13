import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../lib/axios';
import Alert from '../components/Alert';
import SalesChart from '../components/SalesChart';

const fmtLKR = (n) =>
  `LKR ${Number(n || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [salesToday, setSalesToday] = useState(0);
  const [invoicesToday, setInvoicesToday] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState(0);

  const [totalSales, setTotalSales] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [series, setSeries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMetrics = async () => {
    setError('');
    setLoading(true);
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const [prodRes, expRes, invRes, statsRes] = await Promise.all([
        api.get('/products', { params: { onlyActive: true, limit: 1 } }),
        api.get('/products/expired', { params: { withinDays: 30 } }),
        api.get('/invoices', {
          params: {
            dateFrom: start.toISOString(),
            dateTo: end.toISOString(),
            limit: 1000,
          },
        }),
        api.get('/invoices/stats', { params: { days: 30 } }),
      ]);

      setActiveProducts(prodRes.data.total || 0);
      setExpiringSoon((expRes.data.items || []).length || 0);

      const items = invRes.data.items || [];
      setInvoicesToday(items.length);
      const todayTotal = items.reduce(
        (s, i) => s + Number(i.grandTotal || 0),
        0
      );
      setSalesToday(todayTotal);

      setTotalSales(Number(statsRes.data.totalSales || 0));
      setTotalInvoices(Number(statsRes.data.totalInvoices || 0));
      setSeries(statsRes.data.series || []);
    } catch (e) {
      setError(
        e?.response?.data?.message || 'Failed to load dashboard metrics'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const kpis = [
    { kpi: 'Total Sales', value: loading ? '—' : fmtLKR(totalSales) },
    { kpi: 'Total Invoices', value: loading ? '—' : String(totalInvoices) },
    { kpi: "Today's Sales", value: loading ? '—' : fmtLKR(salesToday) },
    { kpi: 'Invoices (Today)', value: loading ? '—' : String(invoicesToday) },
    { kpi: 'Active Products', value: loading ? '—' : String(activeProducts) },
    { kpi: 'Expiring ≤ 30 days', value: loading ? '—' : String(expiringSoon) },
  ];

  return (
    <div className="min-h-screen bg-app-bg text-app-text md:grid md:grid-cols-[auto,1fr]">
      <div className="border-r border-app-border bg-white">
        <Sidebar />
      </div>
      <div className="flex flex-col min-w-0">
        <Topbar />

        <main className="p-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {error && (
            <div className="col-span-full">
              <Alert kind="error">{error}</Alert>
            </div>
          )}

          {kpis.map((x) => (
            <div key={x.kpi} className="card p-5">
              <div className="text-sm text-app-muted">{x.kpi}</div>
              <div className="text-2xl font-semibold mt-2">{x.value}</div>
            </div>
          ))}

          {/* Sales last 30 days */}
          <section className="col-span-full card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold">Sales — Last 30 Days</div>
              <button
                className="btn-outline h-9"
                onClick={loadMetrics}
                disabled={loading}
              >
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
            <SalesChart data={series} height={260} />
          </section>

          {/* Quick actions */}
          {/* <section className="col-span-full card p-6">
            <div className="text-lg font-semibold">Quick Actions</div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="btn-primary"
                onClick={() => navigate('/invoices')}
              >
                New Invoice
              </button>
              <button
                className="btn-primary"
                onClick={() => navigate('/products')}
              >
                Add Product
              </button>
              <button
                className="btn-primary"
                onClick={() => navigate('/expired')}
              >
                Check Expiries
              </button>
            </div>
          </section> */}
        </main>
      </div>
    </div>
  );
}
