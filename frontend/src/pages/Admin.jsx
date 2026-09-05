import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_BADGE = {
  pending_payment: "bg-amber-100 text-amber-800",
  processing: "bg-sky-100 text-sky-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-midnight-100 text-midnight-700",
  refunded: "bg-rose-100 text-rose-700",
};

const STATUS_LABEL = {
  pending_payment: "Pending payment",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  failed: "Failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const naira = (c) => "₦" + Number(c || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 });

const TABS = [
  ["dashboard", "Dashboard"],
  ["orders", "Orders"],
  ["reviews", "Reviews"],
  ["settings", "Settings"],
];

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState("dashboard");

  if (authLoading) return <div className="container-bm py-16 text-center">Loading…</div>;

  if (!user?.is_staff) {
    return (
      <div className="container-bm py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-midnight-900">Staff only</h1>
        <p className="mt-2 text-midnight-700">This area is for BETA_MODEHUS administrators.</p>
        <Link to="/" className="btn-gold mt-4">Back home</Link>
      </div>
    );
  }

  return (
    <div className="container-bm py-10">
      <h1 className="font-display text-3xl font-bold text-midnight-900">Admin dashboard</h1>
      <div className="mt-4 flex flex-wrap gap-2 border-b border-midnight-100 pb-3">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab === key
                ? "bg-midnight-900 text-gold-400"
                : "bg-white text-midnight-700 hover:bg-midnight-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "dashboard" && <Dashboard />}
        {tab === "orders" && <OrdersTab onToDashboard={() => setTab("dashboard")} />}
        {tab === "reviews" && <ReviewsTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

/* ---------- Dashboard ---------- */

function Dashboard() {
  const [stats, setStats] = useState(null);

  const load = useCallback(() => {
    api.get("/orders/admin/stats/").then(setStats).catch(() => {});
  }, []);

  useEffect(load, [load]);

  if (!stats) return <p className="text-midnight-700">Loading stats…</p>;

  const cards = [
    ["Revenue (paid)", naira(stats.revenue.total), "Total confirmed income"],
    ["Paid today", naira(stats.revenue.today), "Confirmed payments today"],
    ["Orders", String(stats.recent_orders.length ? Object.values(stats.order_counts).reduce((a, b) => a + b, 0) : 0), "All orders placed"],
    ["Awaiting fulfilment", String(stats.pending_fulfillment), "Paid but not yet delivered"],
    ["New customers (30d)", String(stats.new_customers_30d), "Accounts created this month"],
    ["Paid orders", String(stats.revenue.paid_orders), "Orders with confirmed payment"],
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value, hint]) => (
          <div key={label} className="rounded-lg border border-midnight-100 bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-midnight-700">{label}</div>
            <div className="mt-1 font-display text-2xl font-bold text-midnight-900">{value}</div>
            <div className="mt-1 text-xs text-midnight-700">{hint}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-lg border border-midnight-100 bg-white p-5">
          <h2 className="font-display text-lg font-bold text-midnight-900">Order status</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(stats.order_counts).map(([key, count]) => (
              <span key={key} className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[key] || "bg-midnight-100 text-midnight-700"}`}>
                {STATUS_LABEL[key] || key}: {count}
              </span>
            ))}
          </div>
          <h3 className="mt-6 font-display text-sm font-bold text-midnight-900">Bestsellers</h3>
          <div className="mt-2 space-y-2">
            {stats.bestsellers.length === 0 && <p className="text-sm text-midnight-700">No sales yet.</p>}
            {stats.bestsellers.map((b) => (
              <div key={b.product_name} className="flex justify-between text-sm">
                <span className="truncate pr-2 text-midnight-900">{b.product_name}</span>
                <span className="shrink-0 font-medium text-midnight-700">
                  {b.units_sold} sold · {naira(b.revenue)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-midnight-100 bg-white p-5">
          <h2 className="font-display text-lg font-bold text-midnight-900">Low stock</h2>
          <div className="mt-3 space-y-2">
            {stats.low_stock.length === 0 && <p className="text-sm text-midnight-700">All good — nothing low.</p>}
            {stats.low_stock.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-midnight-900">{p.name}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${p.remaining_stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>
                  {p.remaining_stock} left
                </span>
              </div>
            ))}
          </div>
          <h3 className="mt-6 font-display text-sm font-bold text-midnight-900">Recent orders</h3>
          <div className="mt-2 space-y-2">
            {stats.recent_orders.map((o) => (
              <Link key={o.number} to={`/orders/${o.number}`} className="flex justify-between text-sm hover:text-gold-600">
                <span className="truncate pr-2 text-midnight-900">
                  #{o.number} · {o.full_name || "Customer"}
                </span>
                <span className="shrink-0 font-medium text-midnight-700">{naira(o.total)}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- Orders ---------- */

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [tracking, setTracking] = useState("");

  const load = useCallback(async (statusVal = filter, q = query, append = false) => {
    setLoading(true);
    setNotice("");
    const params = new URLSearchParams();
    if (statusVal) params.set("status", statusVal);
    if (q) params.set("q", q);
    const url = `/orders/?page=1&${params.toString()}`;
    try {
      const res = await api.get(url);
      setOrders(append ? (prev) => [...prev, ...res.data.results] : res.data.results);
      setNextPage(res.data.next);
    } catch {
      setNotice("Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, [filter, query]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (number) => {
    setExpanded(number);
    setDetail(null);
    try {
      const res = await api.get(`/orders/${number}/`);
      setDetail(res.data);
      setTracking(res.data.tracking_number || "");
    } catch {
      /* ignore */
    }
  };

  const action = async (actionKey) => {
    if (!detail) return;
    if (actionKey === "shipped" && !tracking.trim()) {
      setNotice("A tracking number is required to ship this order.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const payload = { action: actionKey };
      if (actionKey === "shipped") payload.tracking_number = tracking.trim();
      const res = await api.put(`/orders/admin/${detail.number}/`, payload);
      setDetail(res.data);
      setTracking(res.data.tracking_number || "");
      setOrders((prev) => prev.map((o) => (o.number === detail.number ? { ...o, status: res.data.status } : o)));
      setNotice(`Order marked as ${STATUS_LABEL[actionKey]}.`);
    } catch (err) {
      const data = err.response?.data || {};
      const msg = Object.values(data).flat()[0] || "Action failed.";
      setNotice(String(msg));
    } finally {
      setBusy(false);
    }
  };

  const filters = ["", "pending_payment", "processing", "shipped", "delivered", "failed", "cancelled", "refunded"];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f || "all"}
            onClick={() => { setFilter(f); }}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === f ? "bg-midnight-900 text-gold-400" : "bg-white text-midnight-700"}`}
          >
            {f ? STATUS_LABEL[f] : "All"}
          </button>
        ))}
        <form
          onSubmit={(e) => { e.preventDefault(); setFilter(""); }}
          className="ml-auto flex gap-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search number / name / phone…"
            className="input-bm w-64"
          />
          <button
            type="submit"
            onClick={() => load("", query)}
            className="btn-outline"
          >
            Search
          </button>
        </form>
      </div>

      {notice && <div className="mt-4 rounded-md border border-gold-300 bg-gold-50 px-4 py-3 text-sm">{notice}</div>}

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-midnight-700">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="text-midnight-700">No orders match.</p>
        ) : (
          orders.map((o) => (
            <div key={o.number} className="rounded-lg border border-midnight-100 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <button onClick={() => openDetail(o.number)} className="font-semibold text-midnight-900 hover:text-gold-600">
                    #{o.number}
                  </button>
                  <div className="text-xs text-midnight-700">
                    {o.full_name || "Customer"} · {new Date(o.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                  {o.tracking_number && <div className="text-xs text-midnight-700">Tracking: {o.tracking_number}</div>}
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[o.status]}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                  <div className="mt-1 font-bold text-midnight-900">{naira(o.total)}</div>
                </div>
              </div>

              {expanded === o.number && detail && (
                <div className="border-t border-midnight-100 p-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wide text-midnight-700">Items</h4>
                      <ul className="mt-2 space-y-1 text-sm">
                        {detail.items.map((it) => (
                          <li key={it.id} className="flex justify-between">
                            <span>{it.product_name} ×{it.quantity}</span>
                            <span className="font-medium">{naira(it.line_total)}</span>
                          </li>
                        ))}
                      </ul>
                      <dl className="mt-3 space-y-1 text-sm">
                        {[
                          ["Phone", detail.phone],
                          ["WhatsApp", detail.whatsapp || "—"],
                          ["Address", `${detail.house_number ? detail.house_number + ", " : ""}${detail.street}, ${detail.city}, ${detail.state}`],
                          ["Payment", detail.payment_status_display],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-4">
                            <dt className="text-midnight-700">{k}</dt>
                            <dd className="text-right font-medium">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <div className="lg:border-l lg:border-midnight-100 lg:pl-4">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-midnight-700">Update status</h4>
                      {detail.status === "shipped" && (
                        <input
                          value={tracking}
                          onChange={(e) => setTracking(e.target.value)}
                          placeholder="Tracking number"
                          className="input-bm mt-3 w-full"
                        />
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => action("processing")} disabled={busy} className="btn-outline">Mark processing</button>
                        <button onClick={() => action("shipped")} disabled={busy} className="btn-outline">Mark shipped</button>
                        <button onClick={() => action("delivered")} disabled={busy} className="btn-gold">Mark delivered</button>
                        <button onClick={() => action("cancelled")} disabled={busy} className="btn-outline !text-red-500">Cancel order</button>
                        <button onClick={() => action("refunded")} disabled={busy} className="btn-outline !text-red-500">Refunded</button>
                      </div>
                      {detail.is_finalized && (
                        <p className="mt-3 text-xs text-midnight-700">This order is finalized (delivered/cancelled/refunded) and can no longer be changed.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {nextPage && (
        <button onClick={() => load(filter, query, true)} className="btn-outline mt-4">
          Load more
        </button>
      )}
    </div>
  );
}

/* ---------- Reviews ---------- */

function ReviewsTab() {
  const [filter, setFilter] = useState("pending");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const url = filter ? `/reviews/?status=${filter}` : "/reviews/";
    api.get(url)
      .then((res) => setReviews(res.data.results || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(load, [load]);

  const moderate = async (id, statusVal) => {
    await api.patch(`/reviews/${id}/moderate/`, { status: statusVal });
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {["pending", "approved", "rejected", ""].map((f) => (
          <button
            key={f || "all"}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === f ? "bg-midnight-900 text-gold-400" : "bg-white text-midnight-700"}`}
          >
            {f ? f[0].toUpperCase() + f.slice(1) : "All"}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-midnight-700">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="text-midnight-700">No reviews here.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="rounded-lg border border-midnight-100 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-midnight-900">{r.user_name}</span>
                  <span className="text-xs text-midnight-700"> on #{r.product}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.status === "approved" ? "bg-emerald-100 text-emerald-800" : r.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>
                  {r.status}
                </span>
              </div>
              <div className="mt-1 text-sm">
                <span className="text-gold-600">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                {r.verified_purchase && <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">VERIFIED PURCHASE</span>}
              </div>
              {r.comment && <p className="mt-1 text-sm text-midnight-900">{r.comment}</p>}
              <div className="mt-2 text-xs text-midnight-700">{new Date(r.created_at).toLocaleString("en-NG")}</div>
              {r.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => moderate(r.id, "approved")} className="btn-gold">Approve</button>
                  <button onClick={() => moderate(r.id, "rejected")} className="btn-outline !text-red-500">Reject</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ---------- Settings ---------- */

function SettingsTab() {
  const [form, setForm] = useState({ delivery_fee: "0", free_shipping_threshold: "", low_stock_threshold: 5 });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.get("/orders/shipping-setting/")
      .then((res) => setForm({
        delivery_fee: res.data.delivery_fee,
        free_shipping_threshold: res.data.free_shipping_threshold ?? "",
        low_stock_threshold: res.data.low_stock_threshold,
      }))
      .catch(() => {});
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const payload = {
        delivery_fee: Number(form.delivery_fee || 0),
        free_shipping_threshold: form.free_shipping_threshold === "" ? null : Number(form.free_shipping_threshold),
        low_stock_threshold: Number(form.low_stock_threshold || 0),
      };
      await api.patch("/orders/shipping-setting/", payload);
      setNotice("Settings saved.");
    } catch {
      setNotice("Could not save settings.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-lg rounded-lg border border-midnight-100 bg-white p-6">
      <h2 className="font-display text-lg font-bold text-midnight-900">Store settings</h2>
      {notice && <p className="mt-2 text-sm text-emerald-600">{notice}</p>}
      <form onSubmit={save} className="mt-4 space-y-4">
        <div>
          <label className="label-bm">Standard delivery fee (₦)</label>
          <input
            type="number" min="0" step="any" required
            value={form.delivery_fee}
            onChange={(e) => setForm((f) => ({ ...f, delivery_fee: e.target.value }))}
            className="input-bm"
          />
        </div>
        <div>
          <label className="label-bm">Free delivery over (₦) — leave empty to disable</label>
          <input
            type="number" min="0" step="any"
            value={form.free_shipping_threshold}
            onChange={(e) => setForm((f) => ({ ...f, free_shipping_threshold: e.target.value }))}
            className="input-bm"
          />
        </div>
        <div>
          <label className="label-bm">Low-stock alert threshold</label>
          <input
            type="number" min="0"
            value={form.low_stock_threshold}
            onChange={(e) => setForm((f) => ({ ...f, low_stock_threshold: e.target.value }))}
            className="input-bm"
          />
        </div>
        <button type="submit" disabled={busy} className="btn-gold">
          {busy ? "Saving…" : "Save settings"}
        </button>
      </form>
      <p className="mt-4 text-xs text-midnight-700">
        Tip: edit products, categories, images and inventory in the Django admin at{" "}
        <a href="http://127.0.0.1:8000/admin/" className="text-gold-600 underline">/admin/</a>.
      </p>
    </div>
  );
}