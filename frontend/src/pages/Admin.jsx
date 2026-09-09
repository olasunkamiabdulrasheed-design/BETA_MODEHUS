import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_BADGE = {
  pending_payment: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-sky-50 text-sky-700 border-sky-200",
  shipped: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-midnight-100 text-midnight-700 border-midnight-200",
  refunded: "bg-rose-50 text-rose-700 border-rose-200",
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

const naira = (c) =>
  "₦" +
  Number(c || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  });

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

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f2e8]">
        <div className="text-sm text-midnight-600">Loading admin panel...</div>
      </div>
    );
  }

  if (!user?.is_staff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f2e8] px-5">
        <div className="w-full max-w-md rounded-3xl border border-midnight-100 bg-white p-10 text-center shadow-lift">
          <img
            src="/logo.png"
            alt="BETA_MODEHUS"
            className="mx-auto h-16 w-16 rounded-2xl object-contain"
          />

          <h1 className="font-display mt-6 text-2xl font-bold text-midnight-950">
            Staff only
          </h1>

          <p className="mt-2 text-sm leading-6 text-midnight-600">
            This area is reserved for BETA_MODEHUS administrators.
          </p>

          <Link to="/" className="btn-gold mt-6 inline-flex">
            Back to storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f2e8] text-midnight-950">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-midnight-950/95 shadow-lg backdrop-blur-xl">
        <div className="h-0.5 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500" />
        <div className="container-bm flex min-h-[64px] items-center justify-between gap-3 sm:min-h-[72px] sm:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/logo.png"
              alt="BETA_MODEHUS"
              className="h-10 w-10 shrink-0 rounded-xl bg-white/10 object-contain p-1 ring-1 ring-gold-500/20"
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold tracking-wide text-white">
                  BETA<span className="text-gold-500">MODEHUS</span>
                </span>

                <span className="hidden rounded-full bg-gold-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-midnight-950 sm:inline">
                  Admin
                </span>
              </div>

              <p className="hidden text-[9px] uppercase tracking-[0.25em] text-midnight-400 sm:block">
                Owner management panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:border-gold-500 hover:text-gold-400"
            >
              <span className="hidden sm:inline">View storefront</span>
              <span className="sm:hidden">Store</span>
            </Link>

            <button
              onClick={logout}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-midnight-300 transition hover:border-red-400 hover:text-red-400"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* LAYOUT */}
      <div className="container-bm py-5 lg:py-8">
        <div className="grid gap-4 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-6">
          {/* SIDEBAR */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-midnight-100 bg-white shadow-lift">
              <div className="bg-midnight-950 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt=""
                    className="h-10 w-10 rounded-xl bg-white/10 object-contain p-1 ring-1 ring-gold-500/20"
                  />

                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold text-white">
                      BETA_MODEHUS
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-midnight-300">
                      Owner panel
                    </p>
                  </div>
                </div>

                <div className="mt-3 truncate rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-midnight-300">
                  {user.email}
                </div>
              </div>

              <nav className="admin-scroll no-scrollbar flex gap-1.5 overflow-x-auto p-2.5 lg:flex-col lg:gap-1">
                {NAV.map(([key, label]) => {
                  const active = tab === key;

                  return (
                    <button
                      key={key}
                      onClick={() => setTab(key)}
                      className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition lg:w-full ${
                        active
                          ? "bg-midnight-950 text-gold-400 shadow-soft"
                          : "text-midnight-600 hover:bg-midnight-50 hover:text-midnight-950"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          active ? "bg-gold-500" : "bg-midnight-300"
                        }`}
                      />

                      {label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* CONTENT */}
          <main className="min-w-0">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-600">
                  BETA_MODEHUS
                </p>

                <h1 className="font-display mt-1 text-2xl font-bold text-midnight-950 sm:text-3xl">
                  {NAV.find(([k]) => k === tab)?.[1]}
                </h1>

                <p className="mt-1 text-sm text-midnight-600">
                  {tab === "dashboard" &&
                    "Monitor your store performance and activity."}
                  {tab === "orders" &&
                    "Manage customer orders and fulfilment."}
                  {tab === "products" &&
                    "Manage products, inventory and variants."}
                  {tab === "reviews" &&
                    "Review and moderate customer feedback."}
                  {tab === "settings" &&
                    "Manage delivery and inventory settings."}
                </p>
              </div>

              <div className="hidden rounded-full border border-midnight-100 bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-midnight-500 shadow-sm sm:block">
                Owner access
              </div>
            </div>

            {tab === "dashboard" && (
              <Dashboard onOrders={() => setTab("orders")} />
            )}

            {tab === "orders" && <OrdersTab />}

            {tab === "products" && <ProductsTab />}

            {tab === "reviews" && <ReviewsTab />}

            {tab === "settings" && <SettingsTab />}
          </main>
        </div>
      </div>

      <footer className="border-t border-midnight-100 bg-white py-5 text-center text-[10px] uppercase tracking-[0.2em] text-midnight-500">
        BETA_MODEHUS · Owner Panel · © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({ onOrders }) {
  const [stats, setStats] = useState(null);

  const load = useCallback(() => {
    api
      .get("/orders/admin/stats/")
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  useEffect(load, [load]);

  if (!stats) {
    return (
      <div className="rounded-2xl border border-midnight-100 bg-white p-8 text-sm text-midnight-600 shadow-sm">
        Loading store statistics...
      </div>
    );
  }

  const totalOrders = Object.values(stats.order_counts).reduce(
    (a, b) => a + b,
    0
  );

  const cards = [
    {
      label: "Revenue",
      value: naira(stats.revenue.total),
      hint: "Confirmed paid revenue",
      dot: "bg-gold-500",
      grad: "from-gold-300 to-gold-600",
    },
    {
      label: "Paid today",
      value: naira(stats.revenue.today),
      hint: "Confirmed today",
      dot: "bg-emerald-500",
      grad: "from-emerald-400 to-emerald-600",
    },
    {
      label: "Awaiting fulfilment",
      value: String(stats.pending_fulfillment),
      hint: "Paid orders to dispatch",
      dot: "bg-sky-500",
      grad: "from-sky-400 to-sky-600",
    },
    {
      label: "New customers",
      value: String(stats.new_customers_30d),
      hint: "Accounts in the last 30 days",
      dot: "bg-purple-500",
      grad: "from-purple-400 to-purple-600",
    },
    {
      label: "All orders",
      value: String(totalOrders),
      hint: "Every order placed",
      dot: "bg-midnight-500",
      grad: "from-midnight-400 to-midnight-700",
    },
    {
      label: "Paid orders",
      value: String(stats.revenue.paid_orders),
      hint: "Successfully paid orders",
      dot: "bg-rose-500",
      grad: "from-rose-400 to-rose-600",
    },
  ];

  const [hero, ...rest] = cards;

  return (
    <div className="space-y-6">
      {/* METRICS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {/* FEATURED HERO METRIC */}
        <div className="relative overflow-hidden rounded-2xl bg-midnight-950 p-5 text-white shadow-lift sm:col-span-2 sm:p-6">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-500/20 blur-2xl" />
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-gold-300 to-gold-600" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${hero.dot}`} />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400">
                {hero.label}
              </p>
            </div>

            <p className="grad-gold-text mt-3 font-display text-2xl font-bold leading-none sm:text-4xl">
              {hero.value}
            </p>

            <p className="mt-2 text-xs text-midnight-300">{hero.hint}</p>
          </div>
        </div>

        {/* REGULAR METRICS */}
        {rest.map((card) => (
          <div
            key={card.label}
            className="adm-card group relative overflow-hidden p-5 sm:p-6"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.grad}`}
            />

            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${card.dot}`} />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-midnight-500">
                {card.label}
              </p>
            </div>

            <p className="mt-3 font-display text-2xl font-bold text-midnight-950 sm:text-3xl">
              {card.value}
            </p>

            <p className="mt-1.5 text-xs text-midnight-500">{card.hint}</p>
          </div>
        ))}
      </div>

      {/* PIPELINE */}
      <section className="overflow-hidden rounded-2xl border border-midnight-100 bg-white shadow-sm">
        <div className="border-b border-midnight-100 p-5 sm:p-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold-600">
            Fulfilment
          </p>

          <h2 className="font-display mt-1 text-xl font-bold text-midnight-950">
            Order pipeline
          </h2>
        </div>

        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto no-scrollbar p-4 pb-3 sm:grid sm:snap-none sm:grid-cols-4 sm:overflow-visible sm:p-6">
          {["pending_payment", "processing", "shipped", "delivered"].map(
            (key) => (
              <button
                key={key}
                onClick={onOrders}
                className="group w-40 shrink-0 snap-start rounded-xl border border-midnight-100 bg-white p-4 text-left shadow-soft transition hover:border-gold-300 hover:bg-gold-50/40 sm:w-auto"
              >
                <div className="flex items-center justify-between">
                  <span className="h-2 w-2 rounded-full bg-gold-500" />

                  <span className="text-midnight-300 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <p className="mt-4 text-xs font-semibold text-midnight-600">
                  {STATUS_LABEL[key]}
                </p>

                <p className="mt-1 font-display text-2xl font-bold text-midnight-950">
                  {stats.order_counts[key] || 0}
                </p>
              </button>
            )
          )}
        </div>
      </section>

      {/* LOWER DASHBOARD */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* BESTSELLERS */}
        <section className="rounded-2xl border border-midnight-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold-600">
                Performance
              </p>

              <h2 className="font-display mt-1 text-xl font-bold text-midnight-950">
                Bestsellers
              </h2>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {stats.bestsellers.length === 0 && (
              <p className="rounded-xl bg-midnight-50 p-4 text-sm text-midnight-600">
                No sales yet.
              </p>
            )}

            {stats.bestsellers.map((b, i) => (
              <div
                key={b.product_name}
                className="flex items-center gap-3 rounded-xl border border-midnight-100 bg-white p-3 shadow-soft transition hover:border-gold-300"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-midnight-950 font-display text-[11px] font-bold text-gold-400">
                  {i + 1}
                </span>

                {b.thumbnail ? (
                  <img
                    src={b.thumbnail}
                    alt=""
                    loading="lazy"
                    className="h-11 w-11 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-11 w-11 shrink-0 rounded-lg bg-midnight-100" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-midnight-900">
                    {b.product_name}
                  </p>

                  <p className="mt-0.5 text-[11px] text-midnight-500">
                    {b.units_sold} sold
                  </p>
                </div>

                <p className="shrink-0 rounded-full border border-gold-200 bg-gold-50 px-2.5 py-1 text-xs font-bold text-midnight-900">
                  {naira(b.revenue)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* STOCK */}
        <section className="rounded-2xl border border-midnight-100 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold-600">
            Inventory
          </p>

          <h2 className="font-display mt-1 text-xl font-bold text-midnight-950">
            Low stock
          </h2>

          <div className="mt-5 space-y-3">
            {stats.low_stock.length === 0 && (
              <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                All inventory levels are healthy.
              </p>
            )}

            {stats.low_stock.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-midnight-100 bg-white p-3 shadow-soft"
              >
                {p.thumbnail ? (
                  <img
                    src={p.thumbnail}
                    alt=""
                    loading="lazy"
                    className="h-11 w-11 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-11 w-11 shrink-0 rounded-lg bg-midnight-100" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-midnight-900">
                    {p.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-midnight-500">
                    Inventory
                  </p>
                </div>

                <span
                  className={`adm-badge ${
                    p.remaining_stock === 0
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {p.remaining_stock} left
                </span>
              </div>
            ))}
          </div>

          <div className="mt-7 border-t border-midnight-100 pt-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-midnight-500">
              Recent orders
            </p>

            <div className="mt-3 space-y-2">
              {stats.recent_orders.map((o) => (
                <Link
                  key={o.number}
                  to={`/orders/${o.number}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-midnight-100 bg-white px-3 py-2.5 text-sm shadow-soft transition hover:border-gold-300 hover:bg-gold-50/40"
                >
                  <span className="flex min-w-0 items-center gap-2 text-midnight-800">
                    <span className="rounded-md bg-midnight-950 px-1.5 py-0.5 font-display text-[10px] font-bold text-gold-400">
                      #{o.number}
                    </span>
                    <span className="truncate">{o.full_name || "Customer"}</span>
                  </span>

                  <span className="shrink-0 font-semibold text-midnight-950">
                    {naira(o.total)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   ORDERS
========================================================= */

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

  const load = useCallback(
    async (statusVal = filter, q = query, append = false) => {
      setLoading(true);
      setNotice("");

      const params = new URLSearchParams();

      if (statusVal) params.set("status", statusVal);
      if (q) params.set("q", q);

      const url = `/orders/?page=1&${params.toString()}`;

      try {
        const res = await api.get(url);

        setOrders((prev) =>
          append ? [...prev, ...res.data.results] : res.data.results
        );

        setNextPage(res.data.next);
      } catch {
        setNotice("Could not load orders.");
      } finally {
        setLoading(false);
      }
    },
    [filter, query]
  );

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

      if (actionKey === "shipped") {
        payload.tracking_number = tracking.trim();
      }

      const res = await api.put(
        `/orders/admin/${detail.number}/`,
        payload
      );

      setDetail(res.data);
      setTracking(res.data.tracking_number || "");

      setOrders((prev) =>
        prev.map((o) =>
          o.number === detail.number
            ? { ...o, status: res.data.status }
            : o
        )
      );

      setNotice(`Order marked as ${STATUS_LABEL[actionKey]}.`);
    } catch (err) {
      const data = err.response?.data || {};
      const msg =
        Object.values(data).flat()[0] || "Action failed.";

      setNotice(String(msg));
    } finally {
      setBusy(false);
    }
  };

  const filters = [
    "",
    "pending_payment",
    "processing",
    "shipped",
    "delivered",
    "failed",
    "cancelled",
    "refunded",
  ];

  return (
    <div>
      {/* FILTER BAR */}
      <div className="adm-toolbar !p-4 sm:!p-5">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f || "all"}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                filter === f
                  ? "border-midnight-950 bg-midnight-950 text-gold-400 shadow-soft"
                  : "border-midnight-100 bg-midnight-50 text-midnight-600 hover:border-gold-300"
              }`}
            >
              {f ? STATUS_LABEL[f] : "All orders"}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            load("", query);
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, name or phone..."
            className="input-bm min-w-0 flex-1"
          />

          <button type="submit" className="btn-gold shrink-0">
            Search
          </button>
        </form>
      </div>

      {notice && (
        <div className="mt-4 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-midnight-800">
          {notice}
        </div>
      )}

      {/* ORDERS */}
      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-midnight-600">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-midnight-200 bg-white p-10 text-center">
            <p className="font-semibold text-midnight-900">
              No orders found
            </p>

            <p className="mt-1 text-sm text-midnight-500">
              Try changing your filters or search term.
            </p>
          </div>
        ) : (
          orders.map((o) => (
            <div
              key={o.number}
              className="adm-card overflow-hidden"
            >
              <button
                onClick={() =>
                  expanded === o.number
                    ? setExpanded(null)
                    : openDetail(o.number)
                }
                className="w-full p-4 text-left transition hover:bg-gold-50/20 sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-midnight-950">
                        #{o.number}
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${
                          STATUS_BADGE[o.status]
                        }`}
                      >
                        {STATUS_LABEL[o.status]}
                      </span>
                    </div>

                    <p className="mt-2 truncate text-xs text-midnight-500">
                      {o.full_name || "Customer"} ·{" "}
                      {new Date(o.created_at).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>

                    {o.tracking_number && (
                      <p className="mt-1 text-xs text-midnight-500">
                        Tracking: {o.tracking_number}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="font-display text-lg font-bold text-midnight-950">
                      {naira(o.total)}
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-wider text-gold-600">
                      {expanded === o.number
                        ? "Close details"
                        : "View details"}
                    </p>
                  </div>
                </div>
              </button>

              {expanded === o.number && detail && (
                <div className="border-t border-midnight-100 bg-midnight-50/40 p-4 sm:p-5">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* ITEMS */}
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold-600">
                        Order contents
                      </p>

                      <div className="mt-3 space-y-2">
                        {detail.items.map((it) => (
                          <div
                            key={it.id}
                            className="flex items-center justify-between gap-4 rounded-xl border border-midnight-100 bg-white p-3 text-sm"
                          >
                            <span className="min-w-0 truncate text-midnight-800">
                              {it.product_name} ×{it.quantity}
                            </span>

                            <span className="shrink-0 font-semibold text-midnight-950">
                              {naira(it.line_total)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <dl className="mt-5 divide-y divide-midnight-100 rounded-xl border border-midnight-100 bg-white">
                        {[
                          ["Phone", detail.phone],
                          ["WhatsApp", detail.whatsapp || "—"],
                          [
                            "Address",
                            `${detail.house_number ? detail.house_number + ", " : ""}${detail.street}, ${detail.city}, ${detail.state}`,
                          ],
                          ["Payment", detail.payment_status_display],
                        ].map(([k, v]) => (
                          <div
                            key={k}
                            className="flex justify-between gap-5 p-3 text-sm"
                          >
                            <dt className="text-midnight-500">{k}</dt>
                            <dd className="max-w-[55%] text-right font-medium text-midnight-900 sm:max-w-[65%]">
                              {v}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    {/* STATUS */}
                    <div className="lg:border-l lg:border-midnight-100 lg:pl-6">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold-600">
                        Fulfilment
                      </p>

                      {detail.status === "shipped" && (
                        <input
                          value={tracking}
                          onChange={(e) => setTracking(e.target.value)}
                          placeholder="Tracking number"
                          className="input-bm mt-4 w-full"
                        />
                      )}

                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <button
                          onClick={() => action("processing")}
                          disabled={busy}
                          className="btn-outline"
                        >
                          Mark processing
                        </button>

                        <button
                          onClick={() => action("shipped")}
                          disabled={busy}
                          className="btn-outline"
                        >
                          Mark shipped
                        </button>

                        <button
                          onClick={() => action("delivered")}
                          disabled={busy}
                          className="btn-gold"
                        >
                          Mark delivered
                        </button>

                        <button
                          onClick={() => action("cancelled")}
                          disabled={busy}
                          className="btn-outline !text-red-500"
                        >
                          Cancel order
                        </button>

                        <button
                          onClick={() => action("refunded")}
                          disabled={busy}
                          className="btn-outline !text-red-500 sm:col-span-2"
                        >
                          Mark refunded
                        </button>
                      </div>

                      {detail.is_finalized && (
                        <div className="mt-4 rounded-xl border border-midnight-100 bg-white p-4 text-xs leading-5 text-midnight-600">
                          This order is finalized and can no longer be
                          changed.
                        </div>
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
        <button
          onClick={() => load(filter, query, true)}
          className="btn-outline mt-5 w-full"
        >
          Load more orders
        </button>
      )}
    </div>
  );
}

/* =========================================================
   PRODUCTS
========================================================= */

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

      const res = await api.get(
        `/admin/products/?${params.toString()}`
      );

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
      {/* PRODUCT TOOLBAR */}
      <div className="adm-toolbar !p-4 sm:!p-5">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {PRODUCT_FLAGS.map(([key, label]) => (
            <button
              key={key || "all"}
              onClick={() => setFlag(key)}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${
                flag === key
                  ? "border-midnight-950 bg-midnight-950 text-gold-400"
                  : "border-midnight-100 bg-midnight-50 text-midnight-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-bm w-full"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-midnight-400"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <button
            onClick={() => setEditing({ _new: true })}
            className="btn-gold"
          >
            + Add product
          </button>
        </div>
      </div>

      {notice && (
        <div className="mt-4 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm">
          {notice}
        </div>
      )}

      {editing && (
        <ProductEditor
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={afterSave}
        />
      )}

      {/* TABLE */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-midnight-100 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-sm text-midnight-600">
            Loading products...
          </p>
        ) : products.length === 0 ? (
          <p className="p-8 text-center text-sm text-midnight-600">
            No products match.
          </p>
        ) : (
          <>
            {/* MOBILE CARDS */}
            <div className="divide-y divide-midnight-100 md:hidden">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-4">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-midnight-100 font-bold text-midnight-400">
                      {p.name.slice(0, 1)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-midnight-950">
                      {p.name}
                    </p>

                    <p className="mt-0.5 text-xs text-midnight-500">
                      {p.category_name} · {naira(p.min_price || p.price)}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`adm-badge ${
                          p.total_stock === 0
                            ? "border-red-200 bg-red-50 text-red-700"
                            : p.total_stock <= 5
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {p.total_stock} left
                      </span>

                      {p.is_featured && (
                        <span className="adm-badge border-gold-200 bg-gold-100 text-gold-700">
                          Featured
                        </span>
                      )}

                      <span className="text-xs font-medium text-midnight-600">
                        {p.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <button
                      onClick={() => setEditing(p)}
                      className="btn-outline !px-3 !py-1.5 text-xs"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        api
                          .patch(`/admin/products/${p.id}/`, {
                            is_active: !p.is_active,
                          })
                          .then(afterSave)
                      }
                      className="text-[11px] font-semibold text-midnight-600 hover:underline"
                    >
                      {p.is_active ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-midnight-100 bg-[#fcfbf8] text-[9px] uppercase tracking-[0.15em] text-midnight-500">
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Sold</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-midnight-50 last:border-0 hover:bg-gold-50/20"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-midnight-100 font-bold text-midnight-400">
                            {p.name.slice(0, 1)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-midnight-950">
                            {p.name}
                          </p>

                          <p className="mt-0.5 text-xs text-midnight-500">
                            {p.category_name}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {naira(p.min_price || p.price)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                          p.total_stock === 0
                            ? "border-red-200 bg-red-50 text-red-700"
                            : p.total_stock <= 5
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {p.total_stock}{" "}
                        {p.total_stock === 1 ? "unit" : "units"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-midnight-600">
                      {p.units_sold}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            p.is_active
                              ? "bg-emerald-500"
                              : "bg-midnight-300"
                          }`}
                        />

                        <span className="text-xs font-medium text-midnight-700">
                          {p.status}
                        </span>
                      </div>

                      {p.is_featured && (
                        <span className="mt-1 inline-block rounded bg-gold-100 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-gold-700">
                          FEATURED
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            api
                              .patch(`/admin/products/${p.id}/`, {
                                is_featured: !p.is_featured,
                              })
                              .then(afterSave)
                          }
                          className="text-xs font-semibold text-gold-700 hover:underline"
                        >
                          {p.is_featured ? "Unfeature" : "Feature"}
                        </button>

                        <button
                          onClick={() =>
                            api
                              .patch(`/admin/products/${p.id}/`, {
                                is_active: !p.is_active,
                              })
                              .then(afterSave)
                          }
                          className="text-xs font-semibold text-midnight-600 hover:underline"
                        >
                          {p.is_active ? "Disable" : "Enable"}
                        </button>

                        <button
                          onClick={() => setEditing(p)}
                          className="btn-outline !px-3 !py-1.5 text-xs"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT EDITOR
========================================================= */

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
    api
      .get("/catalog/categories/")
      .then((r) => setCats(r.data))
      .catch(() => {});

    api
      .get("/catalog/brands/")
      .then((r) => setBrands(r.data))
      .catch(() => {});

    if (!isNew && product.slug) {
      api
        .get(`/catalog/products/${product.slug}/`)
        .then((r) => {
          setVariants(r.data.variants || []);

          if (r.data.sku) {
            setForm((f) => ({
              ...f,
              sku: r.data.sku,
            }));
          }
        })
        .catch(() => {});

      api
        .get(`/admin/products/${product.id}/images/`)
        .then((r) => setImages(r.data))
        .catch(() => {});
    }
  }, [isNew, product.slug]);

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.value,
    }));

  const setBool = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.checked,
    }));

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

      if (form.brand_id) {
        payload.brand_id = Number(form.brand_id);
      }

      if (isNew) {
        await api.post("/admin/products/", payload);
        onSaved({ message: "Product created." });
      } else {
        await api.patch(`/admin/products/${product.id}/`, payload);
        onSaved({ message: "Product updated." });
      }
    } catch (err) {
      const data = err.response?.data || {};
      const msg =
        Object.values(data).flat()[0] || "Could not save product.";

      setError(String(msg));
    } finally {
      setBusy(false);
    }
  };

  const deleteProduct = async () => {
    if (
      !window.confirm(
        `Delete "${product.name}" and all its variants?`
      )
    ) {
      return;
    }

    setBusy(true);

    try {
      await api.delete(`/admin/products/${product.id}/`);
      onSaved({ message: "Product deleted." });
    } catch {
      setError(
        "Could not delete product — it may have orders attached."
      );
      setBusy(false);
    }
  };

  const patchVariant = async (id, data) => {
    try {
      const res = await api.patch(`/admin/variants/${id}/`, data);

      setVariants((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, ...res.data } : v
        )
      );

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
      const res = await api.post(
        `/admin/products/${product.id}/images/`,
        fd
      );

      setImages((prev) => [...prev, res.data]);
    } catch {
      setError("Could not upload image.");
    } finally {
      e.target.value = "";
    }
  };

  const removeImage = async (img) => {
    try {
      await api.delete(
        `/admin/products/${product.id}/images/${img.id}/`
      );

      setImages((prev) =>
        prev.filter((i) => i.id !== img.id)
      );
    } catch {
      setError("Could not delete image.");
    }
  };

  const setPrimary = async (img) => {
    try {
      await api.patch(
        `/admin/products/${product.id}/images/${img.id}/`,
        { is_primary: true }
      );

      setImages((prev) =>
        prev.map((i) => ({
          ...i,
          is_primary: i.id === img.id,
        }))
      );
    } catch {
      setError("Could not set primary image.");
    }
  };

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-midnight-100 bg-white shadow-lift">
      {/* EDITOR HEADER */}
      <div className="flex min-w-0 items-center justify-between gap-3 border-b border-midnight-100 bg-midnight-950 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold-500">
            Catalogue
          </p>

          <h2 className="font-display mt-1 truncate text-xl font-bold text-white">
            {isNew ? "Add product" : `Edit — ${product.name}`}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-xl text-midnight-300 transition hover:border-gold-500 hover:text-gold-400"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="p-5 sm:p-7">
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={save} className="grid gap-7 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="label-bm">Product name *</label>
              <input
                value={form.name}
                onChange={set("name")}
                required
                className="input-bm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-bm">Category *</label>

                <select
                  value={form.category_id}
                  onChange={set("category_id")}
                  required
                  className="input-bm"
                >
                  <option value="">Choose...</option>

                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-bm">Brand</label>

                <select
                  value={form.brand_id}
                  onChange={set("brand_id")}
                  className="input-bm"
                >
                  <option value="">None</option>

                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-bm">Base price (₦) *</label>

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.price}
                  onChange={set("price")}
                  required
                  className="input-bm"
                />
              </div>

              <div>
                <label className="label-bm">SKU</label>

                <input
                  value={form.sku}
                  onChange={set("sku")}
                  placeholder="Optional"
                  className="input-bm"
                />
              </div>
            </div>

            <div>
              <label className="label-bm">Short description</label>

              <input
                value={form.short_description}
                onChange={set("short_description")}
                className="input-bm"
              />
            </div>

            <div>
              <label className="label-bm">Description</label>

              <textarea
                value={form.description}
                onChange={set("description")}
                rows={5}
                className="input-bm"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="label-bm">Status</label>

              <select
                value={form.status}
                onChange={set("status")}
                className="input-bm"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-midnight-100 bg-midnight-50 p-4 text-sm font-medium text-midnight-800">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={setBool("is_active")}
                />
                Active product
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-midnight-100 bg-midnight-50 p-4 text-sm font-medium text-midnight-800">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={setBool("is_featured")}
                />
                Featured product
              </label>
            </div>

            {/* IMAGES */}
            {!isNew && (
              <div className="rounded-2xl border border-midnight-100 p-4">
                <h3 className="font-display font-bold text-midnight-950">
                  Product images
                </h3>

                <p className="mt-1 text-xs leading-5 text-midnight-500">
                  Manage the gallery and choose the primary image.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((img) => (
                    <div key={img.id}>
                      <img
                        src={img.url}
                        alt={img.alt_text || "product"}
                        className={`aspect-square w-full rounded-xl border object-cover ${
                          img.is_primary
                            ? "border-gold-500 ring-2 ring-gold-500/30"
                            : "border-midnight-100"
                        }`}
                      />

                      <div className="mt-2 flex items-center justify-between gap-2">
                        {img.is_primary ? (
                          <span className="text-[10px] font-bold uppercase text-gold-700">
                            Primary
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPrimary(img)}
                            className="text-[10px] font-semibold text-gold-700 hover:underline"
                          >
                            Make primary
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeImage(img)}
                          className="text-[10px] font-semibold text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <label className="btn-outline mt-4 inline-flex cursor-pointer !px-4 !py-2 text-xs">
                  + Upload image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={uploadImage}
                  />
                </label>
              </div>
            )}

            {/* VARIANTS */}
            {!isNew && (
              <div className="rounded-2xl border border-midnight-100 p-4">
                <h3 className="font-display font-bold text-midnight-950">
                  Variants & stock
                </h3>

                <p className="mt-1 text-xs leading-5 text-midnight-500">
                  Edit variant pricing and stock directly.
                </p>

                <div className="mt-4 space-y-2">
                  {variants.length === 0 && (
                    <p className="rounded-xl bg-midnight-50 p-4 text-xs text-midnight-500">
                      No active variants yet.
                    </p>
                  )}

                  {variants.map((v) => (
                    <div
                      key={v.id}
                      className="rounded-xl border border-midnight-100 p-3"
                    >
                      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-midnight-900">
                            {n(v.size)}
                            {v.color ? ` · ${v.color}` : ""}
                          </p>

                          <p className="mt-0.5 text-[10px] text-midnight-500">
                            {v.is_in_stock ? "In stock" : "Out of stock"}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            defaultValue={v.price ?? ""}
                            placeholder="Price"
                            className="input-bm w-24 !py-2 text-xs"
                            onBlur={(e) =>
                              e.target.value !==
                                String(v.price ?? "") &&
                              patchVariant(v.id, {
                                price:
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                              })
                            }
                          />

                          <input
                            type="number"
                            min="0"
                            defaultValue={v.stock}
                            className="input-bm w-20 !py-2 text-xs"
                            onBlur={(e) =>
                              Number(e.target.value) !== v.stock &&
                              patchVariant(v.id, {
                                stock: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 border-t border-midnight-100 pt-5">
              <button
                type="submit"
                disabled={busy}
                className="btn-gold"
              >
                {busy
                  ? "Saving..."
                  : isNew
                  ? "Create product"
                  : "Save changes"}
              </button>

              {!isNew && (
                <button
                  type="button"
                  onClick={deleteProduct}
                  disabled={busy}
                  className="btn-outline !text-red-500"
                >
                  Delete
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const n = (s) => s || "Default";

/* =========================================================
   REVIEWS
========================================================= */

function ReviewsTab() {
  const [filter, setFilter] = useState("pending");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);

    const url = filter
      ? `/reviews/?status=${filter}`
      : "/reviews/";

    api
      .get(url)
      .then((res) => setReviews(res.data.results || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(load, [load]);

  const moderate = async (id, statusVal) => {
    await api.patch(`/reviews/${id}/moderate/`, {
      status: statusVal,
    });

    load();
  };

  return (
    <div>
      {/* REVIEW FILTERS */}
      <div className="adm-toolbar !p-4 sm:!p-5">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {["pending", "approved", "rejected", ""].map((f) => (
            <button
              key={f || "all"}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                filter === f
                  ? "border-midnight-950 bg-midnight-950 text-gold-400 shadow-soft"
                  : "border-midnight-100 bg-midnight-50 text-midnight-600 hover:border-gold-300"
              }`}
            >
              {f
                ? f[0].toUpperCase() + f.slice(1)
                : "All reviews"}
            </button>
          ))}
        </div>
      </div>

      {/* REVIEW LIST */}
      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-midnight-600">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-midnight-200 bg-white p-10 text-center">
            <p className="font-semibold text-midnight-900">
              No reviews here
            </p>

            <p className="mt-1 text-sm text-midnight-500">
              There are currently no reviews in this category.
            </p>
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="adm-card p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-midnight-950">
                    {r.user_name}
                  </p>

                  <p className="mt-1 text-xs text-midnight-500">
                    Review for #{r.product}
                  </p>
                </div>

                <span
                  className={`adm-badge ${
                    r.status === "approved"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : r.status === "rejected"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {r.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm tracking-widest text-gold-600">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>

                {r.verified_purchase && (
                  <span className="adm-badge border-emerald-200 bg-emerald-50 text-emerald-700">
                    Verified purchase
                  </span>
                )}
              </div>

              {r.comment && (
                <p className="mt-4 rounded-xl bg-midnight-50 p-4 text-sm leading-6 text-midnight-800">
                  {r.comment}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] text-midnight-500">
                  {new Date(r.created_at).toLocaleString("en-NG")}
                </p>

                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        moderate(r.id, "approved")
                      }
                      className="btn-gold !px-4 !py-2 text-xs"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        moderate(r.id, "rejected")
                      }
                      className="btn-outline !px-4 !py-2 text-xs !text-red-500"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsTab() {
  const [form, setForm] = useState({
    delivery_fee: "0",
    free_shipping_threshold: "",
    low_stock_threshold: 5,
  });

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api
      .get("/orders/shipping-setting/")
      .then((res) =>
        setForm({
          delivery_fee: res.data.delivery_fee,
          free_shipping_threshold:
            res.data.free_shipping_threshold ?? "",
          low_stock_threshold: res.data.low_stock_threshold,
        })
      )
      .catch(() => {});
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice("");

    try {
      const payload = {
        delivery_fee: Number(form.delivery_fee || 0),
        free_shipping_threshold:
          form.free_shipping_threshold === ""
            ? null
            : Number(form.free_shipping_threshold),
        low_stock_threshold: Number(
          form.low_stock_threshold || 0
        ),
      };

      await api.patch(
        "/orders/shipping-setting/",
        payload
      );

      setNotice("Settings saved successfully.");
    } catch {
      setNotice("Could not save settings.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="max-w-2xl overflow-hidden rounded-2xl border border-midnight-100 bg-white shadow-soft">
        <div className="bg-midnight-950 p-6 sm:p-7">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold-500">
            Configuration
          </p>

          <h2 className="font-display mt-1 text-2xl font-bold text-white">
            Store settings
          </h2>

          <p className="mt-2 text-xs leading-5 text-midnight-300">
            Control delivery pricing and inventory alerts.
          </p>
        </div>

        <div className="p-6 sm:p-7">
          {notice && (
            <div
              className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
                notice.includes("successfully")
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {notice}
            </div>
          )}

          <form onSubmit={save} className="space-y-5">
            <div>
              <label className="label-bm">
                Standard delivery fee (₦)
              </label>

              <input
                type="number"
                min="0"
                step="any"
                required
                value={form.delivery_fee}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    delivery_fee: e.target.value,
                  }))
                }
                className="input-bm"
              />
            </div>

            <div>
              <label className="label-bm">
                Free delivery over (₦)
              </label>

              <input
                type="number"
                min="0"
                step="any"
                value={form.free_shipping_threshold}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    free_shipping_threshold: e.target.value,
                  }))
                }
                className="input-bm"
              />

              <p className="mt-1.5 text-[10px] text-midnight-500">
                Leave empty to disable free delivery.
              </p>
            </div>

            <div>
              <label className="label-bm">
                Low-stock alert threshold
              </label>

              <input
                type="number"
                min="0"
                value={form.low_stock_threshold}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    low_stock_threshold: e.target.value,
                  }))
                }
                className="input-bm"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-gold w-full sm:w-auto"
            >
              {busy ? "Saving..." : "Save settings"}
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-2xl rounded-2xl border border-midnight-100 bg-white p-5 shadow-soft sm:p-6">
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold-600">
          Advanced management
        </p>

        <h3 className="font-display mt-1 text-lg font-bold text-midnight-950">
          Django administration
        </h3>

        <p className="mt-2 text-sm leading-6 text-midnight-600">
          Use the existing Django administration area for deeper
          catalogue and system management.
        </p>

        <a
          href="http://127.0.0.1:8000/vault/"
          className="mt-4 inline-flex text-sm font-semibold text-gold-700 hover:underline"
        >
          Open Django admin →
        </a>
      </section>
    </div>
  );
}