import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, currency } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_COLORS = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  FAILED: "bg-red-100 text-red-700",
  PROCESSING: "bg-sky-100 text-sky-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-midnight-100 text-midnight-700",
};

export default function Orders() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get("/orders/").then((res) => setOrders(res.data.results || res.data || []))
      .catch(() => {})
      .finally(() => setBusy(false));
  }, [user]);

  if (loading) return <div className="container-bm py-16 text-center">Loading…</div>;

  if (!user) {
    return (
      <div className="container-bm py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-midnight-900">Login to view your orders</h1>
        <Link to="/login" className="btn-gold mt-4">Login</Link>
      </div>
    );
  }

  return (
    <div className="container-bm py-12 sm:py-16">
      <h1 className="font-display text-4xl font-bold text-midnight-950 sm:text-5xl">Orders</h1>

      {busy ? (
        <p className="mt-6 text-midnight-700">Loading your orders…</p>
      ) : orders.length === 0 ? (
        <div className="mt-6 text-center">
          <p className="text-midnight-700">You have no orders yet.</p>
          <Link to="/products" className="btn-gold mt-4">Start shopping</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <Link
              key={o.number}
              to={`/orders/${o.number}`}
              className="block rounded-2xl border border-black/5 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-lift"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-midnight-900">Order #{o.number}</div>
                  <div className="text-xs text-midnight-700">
                    {new Date(o.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[o.status] || "bg-midnight-100 text-midnight-700"}`}>
                    {o.status_display || o.status}
                  </span>
                  <div className="mt-1 font-bold text-midnight-900">{currency(o.total)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}