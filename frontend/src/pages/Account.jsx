import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const EMPTY = {
  full_name: "", phone: "", whatsapp: "", house_number: "", street: "",
  area: "", city: "", state: "Oyo", country: "Nigeria", landmark: "",
};

export default function Account() {
  const { user, logout } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [notice, setNotice] = useState("");

  const load = () => {
    api.get("/auth/addresses/").then((res) => setAddresses(res.data.results || [])).catch(() => {});
    api.get("/orders/").then((res) => setOrders(res.data.results || [])).catch(() => {});
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  if (!user) {
    return <div className="container-bm py-20 text-center"><p className="text-midnight-700">Please login.</p></div>;
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveAddress = async (e) => {
    e.preventDefault();
    setNotice("");
    try {
      await api.post("/auth/addresses/", { ...form, is_default: addresses.length === 0 });
      setForm(EMPTY);
      setNotice("Address saved.");
      load();
    } catch (err) {
      setNotice("Could not save address. Check your details.");
    }
  };

  const removeAddress = async (id) => {
    await api.delete(`/auth/addresses/${id}/`);
    load();
  };

  const totalOrders = orders.length;
  const totalSpent = orders
    .filter((o) => o.payment_status === "SUCCESS")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const latest = orders[0];

  return (
    <div className="container-bm py-12 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-4xl font-bold text-midnight-950 sm:text-5xl">My account</h1>
        <button onClick={logout} className="btn-outline">Logout</button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-midnight-100 bg-white p-5">
          <div className="text-xs uppercase tracking-wide text-midnight-700">Welcome</div>
          <div className="mt-1 font-semibold text-midnight-900">{user.full_name || "Customer"}</div>
          <div className="text-sm text-midnight-700">{user.email}</div>
          {user.phone && <div className="text-sm text-midnight-700">{user.phone}</div>}
        </div>
        <div className="rounded-lg border border-midnight-100 bg-white p-5">
          <div className="text-xs uppercase tracking-wide text-midnight-700">Orders placed</div>
          <div className="mt-1 text-2xl font-bold text-midnight-900">{totalOrders}</div>
        </div>
        <div className="rounded-lg border border-midnight-100 bg-white p-5">
          <div className="text-xs uppercase tracking-wide text-midnight-700">Total spent</div>
          <div className="mt-1 text-2xl font-bold text-midnight-900">₦{totalSpent.toLocaleString()}</div>
        </div>
      </div>

      {latest && (
        <div className="mt-4 rounded-lg border border-gold-300 bg-gold-50 p-4 text-sm">
          <span className="font-semibold text-midnight-900">Latest order:</span>{" "}
          <a href={`/orders/${latest.number}`} className="text-gold-700 underline">
            #{latest.number}
          </a>{" "}
          · {latest.status_display} · ₦{latest.total.toLocaleString()}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-midnight-100 bg-white p-5">
          <h2 className="font-display text-lg font-bold text-midnight-900">Addresses</h2>
          {notice && <p className="mt-2 text-sm text-emerald-600">{notice}</p>}
          <div className="mt-3 space-y-2">
            {addresses.length === 0 && <p className="text-sm text-midnight-700">No saved addresses yet.</p>}
            {addresses.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-2 rounded-md border border-midnight-100 p-3 text-sm">
                <div>
                  <span className="font-semibold text-midnight-900">{a.full_name}</span>
                  <div className="text-midnight-700">
                    {a.house_number} {a.street}, {a.area && `${a.area}, `}{a.city}, {a.state}
                  </div>
                  {a.phone && <div className="text-midnight-700">{a.phone}</div>}
                </div>
                <button onClick={() => removeAddress(a.id)} className="text-xs text-red-500 hover:text-red-700">
                  Delete
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={saveAddress} className="mt-5 grid gap-3 border-t border-midnight-100 pt-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label-bm">Full name</label>
              <input required value={form.full_name} onChange={set("full_name")} className="input-bm" />
            </div>
            <div>
              <label className="label-bm">Phone</label>
              <input required type="tel" value={form.phone} onChange={set("phone")} className="input-bm" />
            </div>
            <div>
              <label className="label-bm">WhatsApp</label>
              <input type="tel" value={form.whatsapp} onChange={set("whatsapp")} className="input-bm" />
            </div>
            <div>
              <label className="label-bm">House number</label>
              <input value={form.house_number} onChange={set("house_number")} className="input-bm" />
            </div>
            <div>
              <label className="label-bm">Street</label>
              <input required value={form.street} onChange={set("street")} className="input-bm" />
            </div>
            <div>
              <label className="label-bm">Area</label>
              <input value={form.area} onChange={set("area")} className="input-bm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-bm">City</label>
                <input required value={form.city} onChange={set("city")} className="input-bm" />
              </div>
              <div>
                <label className="label-bm">State</label>
                <input required value={form.state} onChange={set("state")} className="input-bm" />
              </div>
            </div>
            <div>
              <label className="label-bm">Country</label>
              <input required value={form.country} onChange={set("country")} className="input-bm" />
            </div>
            <div className="sm:col-span-2">
              <label className="label-bm">Landmark</label>
              <input value={form.landmark} onChange={set("landmark")} className="input-bm" />
            </div>
            <button className="btn-gold sm:col-span-2">Save address</button>
          </form>
        </div>

        <div className="rounded-lg border border-midnight-100 bg-white p-5">
          <h2 className="font-display text-lg font-bold text-midnight-900">Recent orders</h2>
          <div className="mt-3 space-y-2">
            {orders.length === 0 && <p className="text-sm text-midnight-700">No orders yet.</p>}
            {orders.slice(0, 5).map((o) => (
              <a
                key={o.number}
                href={`/orders/${o.number}`}
                className="flex items-center justify-between rounded-md border border-midnight-100 p-3 text-sm hover:border-gold-400"
              >
                <div>
                  <div className="font-semibold text-midnight-900">#{o.number}</div>
                  <div className="text-xs text-midnight-700">
                    {new Date(o.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-midnight-900">₦{o.total.toLocaleString()}</div>
                  <div className="text-xs text-midnight-700">{o.status_display}</div>
                </div>
              </a>
            ))}
          </div>
          {orders.length > 5 && (
            <a href="/orders" className="mt-3 inline-block text-sm font-medium text-gold-600">
              View all orders →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}