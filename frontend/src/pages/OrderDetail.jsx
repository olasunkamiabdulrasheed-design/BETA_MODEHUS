import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

export default function OrderDetail() {
  const { number } = useParams();
  const { user, loading } = useAuth();
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(true);
  const [paying, setPaying] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(() => {
    api.get(`/orders/${number}/`)
      .then((res) => {
        setOrder(res.data);
        const status = res.data.payment_status;
        if (status === "SUCCESS") setNotice("Payment received. Thank you!");
      })
      .catch(() => {})
      .finally(() => setBusy(false));
  }, [number]);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user, load]);

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") {
      const refresh = setInterval(load, 3000);
      setTimeout(() => clearInterval(refresh), 60000);
      return () => clearInterval(refresh);
    }
  }, [user, load]);

  const pay = async () => {
    setPaying(true);
    setNotice("");
    try {
      const res = await api.post("/payments/initiate/", {
        order_number: order.number,
        return_url: `${window.location.origin}/payment/callback?order=${order.number}`,
      });
      window.location.href = res.data.payment_url;
    } catch (err) {
      setNotice(err.response?.data?.detail || err.message || "Could not start payment.");
      setPaying(false);
    }
  };

  if (loading) return <div className="container-bm py-16 text-center">Loading…</div>;

  if (!user) {
    return (
      <div className="container-bm py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-midnight-900">Login to view this order</h1>
        <Link to="/login" className="btn-gold mt-4">Login</Link>
      </div>
    );
  }

  if (busy) return <div className="container-bm py-16 text-center">Loading order…</div>;

  if (!order) {
    return (
      <div className="container-bm py-20 text-center">
        <p className="text-midnight-700">Order #{number} not found.</p>
        <Link to="/orders" className="btn-gold mt-4">Back to orders</Link>
      </div>
    );
  }

  const canPay = order.payment_status !== "SUCCESS" &&
    (order.status === "PENDING_PAYMENT" || order.status === "FAILED");

  return (
    <div className="container-bm py-12 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-4xl font-bold text-midnight-950 sm:text-5xl">Order #{order.number}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status] || "bg-midnight-100 text-midnight-700"}`}>
          {order.status_display}
        </span>
      </div>

      {notice && (
        <div className="mt-4 rounded-md border border-gold-300 bg-gold-50 px-4 py-3 text-sm text-midnight-900">
          {notice}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-midnight-100 bg-white p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-midnight-900">Items</h2>
          <div className="mt-3 divide-y divide-midnight-100">
            {order.items.map((it) => (
              <div key={it.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium text-midnight-900">{it.product_name}</div>
                  <div className="text-xs text-midnight-700">
                    {it.variant_label} · {it.sku} · Qty {it.quantity}
                  </div>
                </div>
                <div className="font-semibold text-midnight-900">{currency(it.line_total)}</div>
              </div>
            ))}
          </div>

          <dl className="mt-4 space-y-1 text-sm">
            {[
              ["Delivery name", order.full_name],
              ["Phone", order.phone],
              ["WhatsApp", order.whatsapp || "—"],
              ["Address", `${order.house_number ? order.house_number + ", " : ""}${order.street}, ${order.area ? order.area + ", " : ""}${order.city}, ${order.state}, ${order.country}`],
              ["Landmark", order.landmark || "—"],
              ["Tracking number", order.tracking_number || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-midnight-700">{k}</dt>
                <dd className="text-right font-medium text-midnight-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="h-fit rounded-lg border border-midnight-100 bg-white p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-lg font-bold text-midnight-900">Payment</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-midnight-700">
              <dt>Subtotal</dt>
              <dd className="font-medium text-midnight-900">{currency(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-midnight-700">
              <dt>Delivery</dt>
              <dd className="font-medium text-midnight-900">{currency(order.shipping_fee)}</dd>
            </div>
            <div className="flex justify-between border-t border-midnight-100 pt-3 text-base font-bold text-midnight-900">
              <dt>Total</dt>
              <dd>{currency(order.total)}</dd>
            </div>
          </dl>

          {canPay && (
            <button onClick={pay} disabled={paying} className="btn-gold mt-5 w-full">
              {paying ? "Starting payment…" : "Pay now"}
            </button>
          )}

          <div className="mt-4 text-xs text-midnight-700">
            {order.payment_status === "SUCCESS"
              ? "Payment status: Paid — your order is being processed."
              : order.payment_status === "PENDING"
              ? "Payment pending… refresh to check status."
              : order.payment_status === "FAIL" || order.status === "FAILED"
              ? "Payment failed. Use the Pay now button to try again."
              : "Payment not yet started."}
          </div>
        </aside>
      </div>

      <div className="mt-6">
        <Link to="/orders" className="text-sm font-medium text-gold-600 hover:text-gold-700">
          ← Back to orders
        </Link>
      </div>
    </div>
  );
}