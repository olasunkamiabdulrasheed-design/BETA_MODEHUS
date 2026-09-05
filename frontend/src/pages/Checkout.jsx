import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, currency } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const DEFAULT_STATE = "Oyo";

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, loggedIn } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [shipping, setShipping] = useState({ delivery_fee: 0, free_shipping_threshold: null });
  const [form, setForm] = useState({
    full_name: "", phone: "", whatsapp: "", house_number: "", street: "",
    area: "", city: "", state: DEFAULT_STATE, country: "Nigeria", landmark: "",
    delivery_instructions: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");

  useEffect(() => {
    if (!loggedIn) return;
    api.get("/auth/addresses/").then((res) => setAddresses(res.data.results || [])).catch(() => {});
    api.get("/orders/shipping-setting/").then((res) => setShipping(res.data)).catch(() => {});
  }, [loggedIn]);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, full_name: f.full_name || user.full_name || "", phone: f.phone || user.phone || "" }));
  }, [user]);

  if (!loggedIn) {
    return (
      <div className="container-bm py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-midnight-900">Login to checkout</h1>
        <p className="mt-2 text-midnight-700">You need an account to place your order. Your cart is saved.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/login" className="btn-gold">Login</Link>
          <Link to="/signup" className="btn-outline">Create account</Link>
        </div>
      </div>
    );
  }

  const fee = shipping.free_shipping_threshold && subtotal >= Number(shipping.free_shipping_threshold)
    ? 0
    : Number(shipping.delivery_fee || 0);
  const total = subtotal + fee;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const chooseAddress = (a) => {
    setSelectedAddress(String(a.id));
    setForm({
      full_name: a.full_name, phone: a.phone, whatsapp: a.whatsapp || "",
      house_number: a.house_number || "", street: a.street, area: a.area || "",
      city: a.city, state: a.state, country: a.country || "Nigeria",
      landmark: a.landmark || "", delivery_instructions: a.delivery_instructions || "",
    });
  };

  const placeOrder = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await api.post("/orders/", { address: { ...form, is_default: true } });
      navigate(`/orders/${res.data.number}?new=1`);
    } catch (err) {
      const data = err.response?.data || {};
      const first = Object.values(data).flat()[0];
      setError(first || "Could not place your order.");
      setBusy(false);
    }
  };

  return (
    <div className="container-bm py-10">
      <h1 className="font-display text-3xl font-bold text-midnight-900">Checkout</h1>

      {items.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-midnight-700">Your cart is empty.</p>
          <Link to="/products" className="btn-gold mt-4">Continue shopping</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {addresses.length > 0 && (
              <div className="rounded-lg border border-midnight-100 bg-white p-5">
                <h2 className="font-display text-lg font-bold text-midnight-900">Saved addresses</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => chooseAddress(a)}
                      className={`rounded-md border px-3 py-2 text-left text-xs ${
                        selectedAddress === String(a.id)
                          ? "border-gold-500 bg-gold-50 text-gold-700"
                          : "border-midnight-300 text-midnight-700"
                      }`}
                    >
                      <span className="block font-semibold">{a.full_name}</span>
                      {a.house_number} {a.street}, {a.city}, {a.state}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); placeOrder(); }}
              className="rounded-lg border border-midnight-100 bg-white p-5"
            >
              <h2 className="font-display text-lg font-bold text-midnight-900">Delivery details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-bm">Full name</label>
                  <input required value={form.full_name} onChange={set("full_name")} className="input-bm" />
                </div>
                <div>
                  <label className="label-bm">Phone</label>
                  <input required type="tel" value={form.phone} onChange={set("phone")} className="input-bm" />
                </div>
                <div>
                  <label className="label-bm">WhatsApp (optional)</label>
                  <input type="tel" value={form.whatsapp} onChange={set("whatsapp")} className="input-bm" />
                </div>
                <div>
                  <label className="label-bm">House / flat number</label>
                  <input value={form.house_number} onChange={set("house_number")} className="input-bm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-bm">Street address</label>
                  <input required value={form.street} onChange={set("street")} className="input-bm" />
                </div>
                <div>
                  <label className="label-bm">Area / estate</label>
                  <input value={form.area} onChange={set("area")} className="input-bm" />
                </div>
                <div>
                  <label className="label-bm">City</label>
                  <input required value={form.city} onChange={set("city")} className="input-bm" />
                </div>
                <div>
                  <label className="label-bm">State</label>
                  <input required value={form.state} onChange={set("state")} className="input-bm" />
                </div>
                <div>
                  <label className="label-bm">Country</label>
                  <input required value={form.country} onChange={set("country")} className="input-bm" />
                </div>
                <div>
                  <label className="label-bm">Landmark (optional)</label>
                  <input value={form.landmark} onChange={set("landmark")} className="input-bm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-bm">Delivery instructions (optional)</label>
                  <textarea rows="2" value={form.delivery_instructions} onChange={set("delivery_instructions")} className="input-bm" />
                </div>
              </div>
              {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={busy} className="btn-gold mt-5 w-full sm:w-auto">
                {busy ? "Placing order…" : "Place order"}
              </button>
            </form>
          </div>

          <aside className="h-fit rounded-lg border border-midnight-100 bg-white p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-lg font-bold text-midnight-900">Order summary</h2>
            <div className="mt-4 max-h-64 space-y-2 overflow-auto text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-midnight-700">
                  <span className="truncate pr-2">
                    {item.product_name} ×{item.quantity}
                  </span>
                  <span className="font-medium text-midnight-900">{currency(item.line_total)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-midnight-100 pt-3 text-sm">
              <div className="flex justify-between text-midnight-700">
                <span>Subtotal</span>
                <span className="font-medium text-midnight-900">{currency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-midnight-700">
                <span>Delivery</span>
                <span className="font-medium text-midnight-900">
                  {fee === 0 ? (shipping.free_shipping_threshold ? "FREE" : currency(0)) : currency(fee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-midnight-100 pt-3 text-base font-bold text-midnight-900">
                <span>Total</span>
                <span>{currency(total)}</span>
              </div>
            </div>

            <div className="mt-5 rounded-md bg-gold-50 p-3 text-xs text-midnight-700">
              After placing your order you will be taken to the secure OPay payment page.
              Your items are reserved until payment is confirmed.
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}