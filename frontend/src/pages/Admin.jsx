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

const NAV = [
  ["dashboard", "Dashboard"],
  ["orders", "Orders"],
  ["products", "Products"],
  ["reviews", "Reviews"],
  ["settings", "Settings"],
];

export default function Admin() {
  const { user, logout, loading: authLoading } = useAuth();
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
    <div className="min-h-screen bg-[#f7f5f0]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-midnight-950/95 shadow-lg backdrop-blur-xl">
        <div className="container-bm flex items-center justify-between gap-2 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/logo.png" alt="BETA_MODEHUS" className="h-10 w-10 shrink-0 rounded-xl bg-white/10 object-contain p-1 ring-1 ring-gold-500/20" />
            <div className="min-w-0 leading-tight">
              <div className="flex flex-wrap items-center gap-2 font-display text-base font-bold tracking-wide text-white sm:text-lg">
                BETA<span className="text-gold-500">MODEHUS</span>
                <span className="hidden rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-midnight-950 sm:inline">Admin</span>
              </div>
              <div className="hidden truncate text-[10px] uppercase tracking-[0.2em] text-midnight-300 sm:block">
                Owner panel · separate system
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link to="/" className="btn-outline !border-white/30 !px-3 !py-2 text-xs !text-white hover:!border-gold-500 hover:!text-gold-400">
              <span className="hidden sm:inline">View storefront →</span>
              <span className="sm:hidden">Store →</span>
            </Link>
            <button onClick={logout} className="rounded-full border border-midnight-700 px-3 py-2 text-xs font-semibold text-midnight-300 hover:border-red-400 hover:text-red-400">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container-bm py-6 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card-bm overflow-hidden shadow-lift">
              <div className="bg-midnight-950 px-4 py-5 sm:px-5">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="" className="h-10 w-10 shrink-0 rounded-xl bg-white/10 object-contain p-1 ring-1 ring-gold-500/20" />
                  <div className="min-w-0">
                    <div className="font-display text-sm font-bold text-white">BETA_MODEHUS</div>
                    <div className="truncate text-[11px] text-midnight-300">Owner panel</div>
                  </div>
                </div>
                <div className="mt-3 hidden truncate rounded-xl bg-white/10 px-2.5 py-1.5 text-[11px] text-gold-200 sm:block">{user.email}</div>
              </div>
              <nav className="admin-scroll flex gap-1.5 overflow-x-auto p-2 lg:flex-col">
                {NAV.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition lg:w-full ${
                      tab === key
                        ? "bg-gradient-to-b from-midnight-800 to-midnight-950 text-gold-400 shadow-soft"
                        : "text-midnight-700 hover:bg-midnight-100"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${tab === key ? "bg-gold-500" : "bg-midnight-300"}`}
                    />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h1 className="font-display text-2xl font-bold text-midnight-900">
                  {NAV.find(([k]) => k === tab)?.[1]}
                </h1>
                <p className="text-sm text-midnight-700">
                  {tab === "dashboard" && "Your store at a glance"}
                  {tab === "orders" && "Fulfil and track customer orders"}
                  {tab === "products" && "Catalog, stock and variants"}
                  {tab === "reviews" && "Moderate customer feedback"}
                  {tab === "settings" && "Delivery fees and store rules"}
                </p>
              </div>
            </div>

            {tab === "dashboard" && <Dashboard onOrders={() => setTab("orders")} />}
            {tab === "orders" && <OrdersTab />}
            {tab === "products" && <ProductsTab />}
            {tab === "reviews" && <ReviewsTab />}
            {tab === "settings" && <SettingsTab />}
          </main>
        </div>
      </div>

      <footer className="border-t border-midnight-200 bg-white py-4 text-center text-xs text-midnight-700">
        BETA_MODEHUS Owner panel· © {new Date().getFullYear()} · protected area
      </footer>
    </div>
  );
}

/* ---------- Dashboard ---------- */

function Dashboard({ onOrders }) {
  const [stats, setStats] = useState(null);

const load = useCallback(() => {
    api.get("/orders/admin/stats/").then((res) => setStats(res.data)).catch(() => {});
  }, []);

  useEffect(load, [load]);

  if (!stats) return <p className="text-midnight-700">Loading stats…</p>;

  const totalOrders = Object.values(stats.order_counts).reduce((a, b) => a + b, 0);

  const cards = [
    { label: "Revenue (paid)", value: naira(stats.revenue.total), hint: "Confirmed income", accent: "bg-gold-400", tone: "text-midnight-900" },
    { label: "Paid today", value: naira(stats.revenue.today), hint: "Confirmed today", accent: "bg-emerald-400", tone: "text-emerald-700" },
    { label: "Awaiting fulfilment", value: String(stats.pending_fulfillment), hint: "Paid — need dispatch", accent: "bg-sky-400", tone: "text-sky-700" },
    { label: "New customers (30d)", value: String(stats.new_customers_30d), hint: "Accounts this month", accent: "bg-purple-400", tone: "text-purple-700" },
    { label: "All orders", value: String(totalOrders), hint: "Every order placed", accent: "bg-midnight-400", tone: "text-midnight-700" },
    { label: "Paid orders", value: String(stats.revenue.paid_orders), hint: "Confirmed payment", accent: "bg-rose-400", tone: "text-rose-700" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card-bm overflow-hidden shadow-lift">
            <div className={`h-1.5 ${c.accent}`} />
            <div className="p-4 sm:p-5">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-midnight-700 sm:text-xs">{c.label}</div>
              <div className={`mt-1 truncate font-display text-lg font-bold sm:text-2xl ${c.tone}`}>{c.value}</div>
              <div className="mt-1 hidden text-xs text-midnight-700 sm:block">{c.hint}</div>
            </div>
          </div>
        ))}
      </div>

      <section className="card-bm p-5">
        <h2 className="font-display text-lg font-bold text-midnight-900">Order pipeline</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {["pending_payment", "processing", "shipped", "delivered"].map((key) => (
            <button
              key={key}
              onClick={onOrders}
              className="rounded-xl border border-midnight-100 p-3 text-left transition hover:border-gold-400 hover:bg-gold-50"
            >
              <div className="text-xs font-semibold text-midnight-700">{STATUS_LABEL[key]}</div>
              <div className="mt-1 font-display text-xl font-bold text-midnight-900">{stats.order_counts[key] || 0}</div>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-bm p-5">
          <h2 className="font-display text-lg font-bold text-midnight-900">Bestsellers</h2>
          <div className="mt-3 space-y-3">
            {stats.bestsellers.length === 0 && <p className="text-sm text-midnight-700">No sales yet.</p>}
            {stats.bestsellers.map((b, i) => (
              <div key={b.product_name} className="flex items-center gap-3 text-sm">
                <span className="w-5 shrink-0 text-center font-display text-xs font-bold text-midnight-300">{i + 1}</span>
                {b.thumbnail && (
                  <img src={b.thumbnail} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-lg border border-midnight-100 object-cover" />
                )}
                <span className="min-w-0 flex-1 truncate text-midnight-900">{b.product_name}</span>
                <span className="shrink-0 text-xs font-medium text-midnight-700 sm:text-sm">{b.units_sold} sold · {naira(b.revenue)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card-bm p-5">
          <h2 className="font-display text-lg font-bold text-midnight-900">Low stock</h2>
          <div className="mt-3 space-y-3">
            {stats.low_stock.length === 0 && <p className="text-sm text-emerald-600">All good — nothing low.</p>}
            {stats.low_stock.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-3">
                  {p.thumbnail && (
                    <img src={p.thumbnail} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-lg border border-midnight-100 object-cover" />
                  )}
                  <span className="truncate text-midnight-900">{p.name}</span>
                </div>
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
                <span className="truncate pr-2 text-midnight-900">#{o.number} · {o.full_name || "Customer"}</span>
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
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === f ? "bg-midnight-900 text-gold-400" : "bg-white text-midnight-700"}`}
          >
            {f ? STATUS_LABEL[f] : "All"}
          </button>
        ))}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="ml-auto flex gap-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search number / name / phone…"
            className="input-bm w-64"
          />
          <button type="submit" onClick={() => load("", query)} className="btn-outline">Search</button>
        </form>
      </div>

      {notice && <div className="mt-4 rounded-md border border-gold-300 bg-gold-50 px-4 py-4 text-sm">{notice}</div>}

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-midnight-700">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="text-midnight-700">No orders match.</p>
        ) : (
          orders.map((o) => (
            <div key={o.number} className="rounded-xl border border-midnight-100 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <button onClick={() => openDetail(o.number)} className="font-semibold text-midnight-900 hover:text-gold-600">#{o.number}</button>
                  <div className="text-xs text-midnight-700">
                    {o.full_name || "Customer"} · {new Date(o.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                  {o.tracking_number && <div className="text-xs text-midnight-700">Tracking: {o.tracking_number}</div>}
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
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
                        <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Tracking number" className="input-bm mt-3 w-full" />
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

      {nextPage && <button onClick={() => load(filter, query, true)} className="btn-outline mt-4">Load more</button>}
    </div>
  );
}

/* ---------- Products ---------- */

const PRODUCT_FLAGS = [
  ["", "All"],
  ["featured", "Featured"],
  ["inactive", "Inactive"],
  ["out", "Out of stock"],
];

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [flag, setFlag] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (flag) params.set("flag", flag);
      const res = await api.get(`/admin/products/?${params.toString()}`);
      setProducts(res.data);
    } catch {
      setNotice("Could not load products.");
    } finally {
      setLoading(false);
    }
  }, [search, flag]);

  useEffect(() => {
    load();
  }, [load]);

  const afterSave = async (saved) => {
    setEditing(null);
    setNotice(saved.message || "Saved.");
    await load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {PRODUCT_FLAGS.map(([key, label]) => (
          <button
            key={key || "all"}
            onClick={() => setFlag(key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${flag === key ? "bg-midnight-900 text-gold-400" : "bg-white text-midnight-700"}`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="input-bm w-56"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-midnight-500 hover:text-midnight-900"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <button onClick={() => setEditing({ _new: true })} className="btn-gold">+ Add product</button>
        </div>
      </div>

      {notice && <div className="mt-4 rounded-md border border-gold-300 bg-gold-50 px-4 py-4 text-sm">{notice}</div>}
      {editing && (
        <ProductEditor
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={afterSave}
        />
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-midnight-100 bg-white shadow-sm">
        {loading ? (
          <p className="p-5 text-sm text-midnight-700">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="p-5 text-sm text-midnight-700">No products match.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-midnight-100 text-xs uppercase tracking-wide text-midnight-700">
                <th className="px-4 py-4">Product</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">Stock</th>
                <th className="px-4 py-4">Sold</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-midnight-50 last:border-0 hover:bg-gold-50/50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-midnight-100 text-xs font-bold text-midnight-500">
                          {p.name.slice(0, 1)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-midnight-900">{p.name}</div>
                        <div className="text-xs text-midnight-700">{p.category_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-midnight-900">{naira(p.min_price || p.price)}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.total_stock === 0 ? "bg-red-100 text-red-700" : p.total_stock <= 5 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                      {p.total_stock} {p.total_stock === 1 ? "unit" : "units"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-midnight-700">{p.units_sold}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${p.is_active ? "bg-emerald-500" : "bg-midnight-300"}`} />
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-midnight-100 text-midnight-700"}`}>
                        {p.status}
                      </span>
                      {p.is_featured && <span className="rounded bg-gold-100 px-1.5 py-0.5 text-[10px] font-bold text-gold-600">FEATURED</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => api.patch(`/admin/products/${p.id}/`, { is_featured: !p.is_featured }).then(afterSave)}
                        className="text-xs font-semibold text-gold-600 hover:underline"
                      >
                        {p.is_featured ? "Unfeature" : "Feature"}
                      </button>
                      <button
                        onClick={() => api.patch(`/admin/products/${p.id}/`, { is_active: !p.is_active }).then(afterSave)}
                        className="text-xs font-semibold text-midnight-700 hover:underline"
                      >
                        {p.is_active ? "Disable" : "Enable"}
                      </button>
                      <button onClick={() => setEditing(p)} className="btn-outline !px-2 !py-1 text-xs">Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductEditor({ product, onClose, onSaved }) {
  const isNew = Boolean(product._new);
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: product.name || "",
    category_id: product.category_id || "",
    brand_id: product.brand_id || "",
    price: product.price ?? "",
    short_description: "",
    description: "",
    sku: "",
    status: product.status || "published",
    is_featured: product.is_featured || false,
    is_active: product.is_active ?? true,
  });

  useEffect(() => {
    api.get("/catalog/categories/").then((r) => setCats(r.data));
    api.get("/catalog/brands/").then((r) => setBrands(r.data));
    if (!isNew && product.slug) {
      api.get(`/catalog/products/${product.slug}/`)
        .then((r) => {
          setVariants(r.data.variants || []);
          if (r.data.sku) setForm((f) => ({ ...f, sku: r.data.sku }));
        })
        .catch(() => {});
      api.get(`/admin/products/${product.id}/images/`)
        .then((r) => setImages(r.data))
        .catch(() => {});
    }
  }, [isNew, product.slug]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setBool = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        category_id: form.category_id,
        price: Number(form.price),
        status: form.status,
        is_featured: form.is_featured,
        is_active: form.is_active,
        short_description: form.short_description,
        description: form.description,
        sku: form.sku,
      };
      if (form.brand_id) payload.brand_id = Number(form.brand_id);
      if (isNew) {
        await api.post("/admin/products/", payload);
        onSaved({ message: "Product created." });
      } else {
        await api.patch(`/admin/products/${product.id}/`, payload);
        onSaved({ message: "Product updated." });
      }
    } catch (err) {
      const data = err.response?.data || {};
      const msg = Object.values(data).flat()[0] || "Could not save product.";
      setError(String(msg));
    } finally {
      setBusy(false);
    }
  };

  const deleteProduct = async () => {
    if (!window.confirm(`Delete "${product.name}" and all its variants?`)) return;
    setBusy(true);
    try {
      await api.delete(`/admin/products/${product.id}/`);
      onSaved({ message: "Product deleted." });
    } catch {
      setError("Could not delete product — it may have orders attached.");
      setBusy(false);
    }
  };

  const patchVariant = async (id, data) => {
    try {
      const res = await api.patch(`/admin/variants/${id}/`, data);
      setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...res.data } : v)));
      return true;
    } catch {
      return false;
    }
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    fd.append("is_primary", String(images.length === 0));
    try {
      const res = await api.post(`/admin/products/${product.id}/images/`, fd);
      setImages((prev) => [...prev, res.data]);
    } catch {
      setError("Could not upload image.");
    } finally {
      e.target.value = "";
    }
  };

  const removeImage = async (img) => {
    try {
      await api.delete(`/admin/products/${product.id}/images/${img.id}/`);
      setImages((prev) => prev.filter((i) => i.id !== img.id));
    } catch {
      setError("Could not delete image.");
    }
  };

  const setPrimary = async (img) => {
    try {
      await api.patch(`/admin/products/${product.id}/images/${img.id}/`, { is_primary: true });
      setImages((prev) => prev.map((i) => ({ ...i, is_primary: i.id === img.id })));
    } catch {
      setError("Could not set primary image.");
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-midnight-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-midnight-900">
          {isNew ? "Add product" : `Edit — ${product.name}`}
        </h2>
        <button onClick={onClose} className="text-midnight-500 hover:text-midnight-900" aria-label="Close">×</button>
      </div>

      {error && <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">{error}</div>}

      <form onSubmit={save} className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="label-bm">Product name *</label>
            <input value={form.name} onChange={set("name")} required className="input-bm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-bm">Category *</label>
              <select value={form.category_id} onChange={set("category_id")} required className="input-bm">
                <option value="">Choose…</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-bm">Brand</label>
              <select value={form.brand_id} onChange={set("brand_id")} className="input-bm">
                <option value="">None</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-bm">Base price (₦) *</label>
              <input type="number" min="0" step="any" value={form.price} onChange={set("price")} required className="input-bm" />
            </div>
            <div>
              <label className="label-bm">SKU</label>
              <input value={form.sku} onChange={set("sku")} placeholder="optional" className="input-bm" />
            </div>
          </div>
          <div>
            <label className="label-bm">Short description</label>
            <input value={form.short_description} onChange={set("short_description")} className="input-bm" />
          </div>
          <div>
            <label className="label-bm">Description</label>
            <textarea value={form.description} onChange={set("description")} rows={4} className="input-bm" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label-bm">Status</label>
            <select value={form.status} onChange={set("status")} className="input-bm">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-4 rounded-lg border border-midnight-100 bg-midnight-50/60 p-4">
            <label className="flex items-center gap-2 text-sm text-midnight-900">
              <input type="checkbox" checked={form.is_active} onChange={setBool("is_active")} /> In stock / active
            </label>
            <label className="flex items-center gap-2 text-sm text-midnight-900">
              <input type="checkbox" checked={form.is_featured} onChange={setBool("is_featured")} /> Featured on home
            </label>
          </div>

          {!isNew && (
            <div className="rounded-lg border border-midnight-100 p-4">
              <h3 className="font-display text-sm font-bold text-midnight-900">Images</h3>
              <p className="mt-1 text-xs text-midnight-700">
                The first image is the main product photo. Upload JPG/PNG/WebP files.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {images.map((img) => (
                  <div key={img.id} className="relative w-24">
                    <img
                      src={img.url}
                      alt={img.alt_text || "product"}
                      className={`h-24 w-24 rounded-md border object-cover ${img.is_primary ? "border-gold-500 ring-2 ring-gold-500/50" : "border-midnight-200"}`}
                    />
                    <div className="mt-1 flex items-center justify-center gap-2">
                      {!img.is_primary ? (
                        <button type="button" onClick={() => setPrimary(img)} className="text-[11px] font-semibold text-gold-600 hover:underline">Make main</button>
                      ) : (
                        <span className="text-[11px] font-semibold text-gold-600">Main</span>
                      )}
                      <button type="button" onClick={() => removeImage(img)} className="text-[11px] font-semibold text-red-500 hover:underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <label className="btn-outline mt-3 inline-flex cursor-pointer !px-3 !py-2 text-xs">
                + Upload image
                <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
              </label>
            </div>
          )}

          {!isNew && (
            <div className="rounded-lg border border-midnight-100 p-4">
              <h3 className="font-display text-sm font-bold text-midnight-900">Variants &amp; stock</h3>
              <p className="mt-1 text-xs text-midnight-700">
                Edit stock and price inline. Add new sizes/colours in the Django admin.
              </p>
              <div className="mt-3 space-y-2">
                {variants.length === 0 && <p className="text-xs text-midnight-700">No active variants yet.</p>}
                {variants.map((v) => (
                  <div key={v.id} className="flex flex-wrap items-center gap-2 rounded-md border border-midnight-100 p-2 text-sm">
                    <span className="min-w-[90px] font-medium text-midnight-900">{n(v.size)} {v.color ? "· " + v.color : ""}</span>
                    <span className="text-xs text-midnight-700">{v.is_in_stock ? "In stock" : "Out"}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <input
                        type="number" min="0"
                        defaultValue={v.price ?? ""}
                        placeholder="price"
                        className="input-bm w-24 !py-1 text-xs"
                        onBlur={(e) => e.target.value !== String(v.price ?? "") && patchVariant(v.id, { price: e.target.value === "" ? null : Number(e.target.value) })}
                      />
                      <input
                        type="number" min="0"
                        defaultValue={v.stock}
                        className="input-bm w-20 !py-1 text-xs"
                        onBlur={(e) => Number(e.target.value) !== v.stock && patchVariant(v.id, { stock: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <button type="submit" disabled={busy} className="btn-gold">{busy ? "Saving…" : isNew ? "Create product" : "Save changes"}</button>
            {!isNew && (
              <button type="button" onClick={deleteProduct} disabled={busy} className="btn-outline !text-red-500">Delete product</button>
            )}
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}

const n = (s) => s || "Default";

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
            <div key={r.id} className="rounded-xl border border-midnight-100 bg-white p-4 shadow-sm">
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
    <div className="max-w-lg rounded-xl border border-midnight-100 bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg font-bold text-midnight-900">Store settings</h2>
      {notice && <p className="mt-2 text-sm text-emerald-600">{notice}</p>}
      <form onSubmit={save} className="mt-4 space-y-4">
        <div>
          <label className="label-bm">Standard delivery fee (₦)</label>
          <input type="number" min="0" step="any" required value={form.delivery_fee} onChange={(e) => setForm((f) => ({ ...f, delivery_fee: e.target.value }))} className="input-bm" />
        </div>
        <div>
          <label className="label-bm">Free delivery over (₦) — leave empty to disable</label>
          <input type="number" min="0" step="any" value={form.free_shipping_threshold} onChange={(e) => setForm((f) => ({ ...f, free_shipping_threshold: e.target.value }))} className="input-bm" />
        </div>
        <div>
          <label className="label-bm">Low-stock alert threshold</label>
          <input type="number" min="0" value={form.low_stock_threshold} onChange={(e) => setForm((f) => ({ ...f, low_stock_threshold: e.target.value }))} className="input-bm" />
        </div>
        <button type="submit" disabled={busy} className="btn-gold">{busy ? "Saving…" : "Save settings"}</button>
      </form>
      <p className="mt-4 text-xs text-midnight-700">
        Tip: manage product images, galleries and extra categories in the Django admin at{" "}
        <a href="http://127.0.0.1:8000/vault/" className="text-gold-600 underline">/vault/</a>.
      </p>
    </div>
  );
}