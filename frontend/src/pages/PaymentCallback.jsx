import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_TEXT = {
  SUCCESS: "Payment successful!",
  PENDING: "Payment pending. This can take a moment…",
  FAIL: "Payment failed.",
  CLOSE: "Payment window was closed.",
  INITIAL: "Payment not confirmed yet.",
};

export default function PaymentCallback() {
  const [params] = useSearchParams();
  const { user, loading } = useAuth();
  const reference = params.get("reference");
  const order = params.get("order");
  const [status, setStatus] = useState("PENDING");
  const [attempts, setAttempts] = useState(0);
  const [busy, setBusy] = useState(Boolean(reference));

  useEffect(() => {
    if (!user || !reference) return;
    let cancelled = false;
    let timer = null;
    setStatus("PENDING");

    const check = async () => {
      try {
        const res = await api.get(`/payments/status/?reference=${reference}`);
        if (cancelled) return;
        setStatus(res.data.status);
        if (res.data.status === "SUCCESS" || res.data.status === "FAIL" || res.data.status === "CLOSE") {
          clearInterval(timer);
          setBusy(false);
          return;
        }
      } catch {
        /* retry */
      }
      setAttempts((a) => {
        if (a >= 25) {
          clearInterval(timer);
          setBusy(false);
          return a;
        }
        return a + 1;
      });
    };

    check();
    timer = setInterval(check, 2000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [user, reference]);

  if (loading) return <div className="container-bm py-16 text-center">Loading…</div>;

  return (
    <div className="container-bm flex flex-col items-center py-24 text-center">
      <div className="rounded-full bg-midnight-900 p-5 text-3xl text-gold-400">
        {status === "SUCCESS" ? "✓" : status === "FAIL" ? "✕" : "…"}
      </div>
      <h1 className="font-display mt-4 text-2xl font-bold text-midnight-900">
        {reference ? (STATUS_TEXT[status] || "Checking payment status…") : "Payment"}
      </h1>
      <p className="mt-2 text-sm text-midnight-700">
        {reference ? `Reference: ${reference}` : "Processing your payment…"}
      </p>
      {!busy && (
        <Link to={order ? `/orders/${order}` : "/orders"} className="btn-gold mt-6">
          View your order
        </Link>
      )}
      {!reference && !user && (
        <Link to="/login" className="btn-gold mt-6">Login</Link>
      )}
    </div>
  );
}