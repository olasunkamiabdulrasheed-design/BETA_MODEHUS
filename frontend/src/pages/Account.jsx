import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const EMPTY = {
  full_name: "",
  phone: "",
  whatsapp: "",
  house_number: "",
  street: "",
  area: "",
  city: "",
  state: "Oyo",
  country: "Nigeria",
  landmark: "",
};

export default function Account() {
  const { user, logout } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [notice, setNotice] = useState("");

  const load = () => {
    api
      .get("/auth/addresses/")
      .then((res) => setAddresses(res.data.results || []))
      .catch(() => {});

    api
      .get("/orders/")
      .then((res) => setOrders(res.data.results || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  if (!user) {
    return (
      <main className="min-h-[70vh] bg-midnight-50">
        <div className="container-bm flex min-h-[70vh] items-center justify-center py-20">
          <div className="w-full max-w-md rounded-2xl border border-midnight-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-midnight-950">
              <span className="h-5 w-5 rounded-full border-2 border-gold-500" />
            </div>

            <h1 className="font-display mt-6 text-2xl font-bold text-midnight-950">
              Account Required
            </h1>

            <p className="mt-3 text-sm leading-6 text-midnight-600">
              Please login to access your account, saved addresses and orders.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.value,
    }));

  const saveAddress = async (e) => {
    e.preventDefault();
    setNotice("");

    try {
      await api.post("/auth/addresses/", {
        ...form,
        is_default: addresses.length === 0,
      });

      setForm(EMPTY);
      setNotice("Address saved successfully.");
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
    <main className="min-h-screen bg-midnight-50">
      {/* PAGE HEADER */}
      <section className="relative overflow-hidden bg-midnight-950 text-white">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-gold-500/5 blur-3xl" />

        <div className="absolute inset-0 opacity-[0.025]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "70px 70px",
            }}
          />
        </div>

        <div className="container-bm relative py-12 sm:py-16">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold-400">
                BETA_MODEHUS
              </p>

              <h1 className="font-display mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                My Account
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-midnight-300">
                Manage your personal details, delivery addresses and orders
                from one place.
              </p>
            </div>

            <button
              onClick={logout}
              className="inline-flex w-fit items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:border-gold-500 hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        </div>
      </section>

      {/* ACCOUNT CONTENT */}
      <div className="container-bm py-10 sm:py-14">
        {/* SUMMARY CARDS */}
        <section className="grid gap-4 sm:grid-cols-3">
          {/* PROFILE */}
          <div className="group rounded-2xl border border-midnight-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-midnight-500">
                  Welcome
                </p>

                <h2 className="mt-2 font-display text-xl font-bold text-midnight-950">
                  {user.full_name || "Customer"}
                </h2>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-midnight-950">
                <span className="text-sm font-bold text-gold-500">
                  {(user.full_name || "C").charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="mt-5 border-t border-midnight-100 pt-4">
              <p className="truncate text-sm text-midnight-600">{user.email}</p>

              {user.phone && (
                <p className="mt-1 text-sm text-midnight-600">
                  {user.phone}
                </p>
              )}
            </div>
          </div>

          {/* ORDERS */}
          <div className="rounded-2xl border border-midnight-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-midnight-500">
                Orders placed
              </p>

              <span className="h-2 w-2 rounded-full bg-gold-500" />
            </div>

            <div className="mt-5">
              <span className="font-display text-4xl font-bold text-midnight-950">
                {totalOrders}
              </span>
            </div>

            <p className="mt-2 text-xs text-midnight-500">
              Total orders associated with your account
            </p>
          </div>

          {/* SPENDING */}
          <div className="rounded-2xl border border-midnight-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-midnight-500">
                Total spent
              </p>

              <span className="text-xs font-bold text-gold-600">NGN</span>
            </div>

            <div className="mt-5">
              <span className="font-display text-3xl font-bold text-midnight-950">
                ₦{totalSpent.toLocaleString()}
              </span>
            </div>

            <p className="mt-2 text-xs text-midnight-500">
              Based on successfully paid orders
            </p>
          </div>
        </section>

        {/* LATEST ORDER */}
        {latest && (
          <section className="mt-5 overflow-hidden rounded-2xl border border-gold-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-center gap-4">
                <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-gold-50 sm:flex">
                  <div className="h-5 w-5 rounded border-2 border-gold-600" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-700">
                    Latest order
                  </p>

                  <a
                    href={`/orders/${latest.number}`}
                    className="mt-1 inline-block font-display text-lg font-bold text-midnight-950 transition hover:text-gold-600"
                  >
                    #{latest.number}
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-midnight-50 px-4 py-2 font-medium text-midnight-700">
                  {latest.status_display}
                </span>

                <span className="font-bold text-midnight-950">
                  ₦{Number(latest.total).toLocaleString()}
                </span>

                <a
                  href={`/orders/${latest.number}`}
                  className="font-semibold text-gold-700 transition hover:text-gold-600"
                >
                  View order
                </a>
              </div>
            </div>
          </section>
        )}

        {/* MAIN GRID */}
        <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          {/* ADDRESSES */}
          <section className="rounded-2xl border border-midnight-100 bg-white shadow-sm">
            <div className="border-b border-midnight-100 p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-600">
                    Delivery
                  </p>

                  <h2 className="font-display mt-1 text-2xl font-bold text-midnight-950">
                    Saved Addresses
                  </h2>
                </div>

                <div className="hidden h-10 w-10 items-center justify-center rounded-full border border-midnight-100 sm:flex">
                  <span className="h-3 w-3 rounded-full border-2 border-gold-500" />
                </div>
              </div>

              {notice && (
                <div
                  className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                    notice.includes("successfully")
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-600"
                  }`}
                >
                  {notice}
                </div>
              )}
            </div>

            <div className="p-6 sm:p-7">
              {/* SAVED ADDRESS LIST */}
              <div className="space-y-3">
                {addresses.length === 0 && (
                  <div className="rounded-xl border border-dashed border-midnight-200 bg-midnight-50 px-5 py-8 text-center">
                    <p className="text-sm font-medium text-midnight-800">
                      No saved addresses yet.
                    </p>

                    <p className="mt-1 text-xs text-midnight-500">
                      Add your delivery address below for faster checkout.
                    </p>
                  </div>
                )}

                {addresses.map((a) => (
                  <div
                    key={a.id}
                    className="group rounded-xl border border-midnight-100 p-4 transition duration-300 hover:border-gold-300 hover:bg-gold-50/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-midnight-950">
                            {a.full_name}
                          </span>

                          {a.is_default && (
                            <span className="rounded-full bg-gold-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-gold-700">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-midnight-600">
                          {a.house_number} {a.street},{" "}
                          {a.area && `${a.area}, `}
                          {a.city}, {a.state}
                        </p>

                        {a.phone && (
                          <p className="mt-1 text-xs text-midnight-500">
                            {a.phone}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => removeAddress(a.id)}
                        className="shrink-0 text-xs font-semibold text-red-500 transition hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ADD ADDRESS FORM */}
              <div className="mt-8 border-t border-midnight-100 pt-7">
                <div className="mb-5">
                  <h3 className="font-display text-lg font-bold text-midnight-950">
                    Add New Address
                  </h3>

                  <p className="mt-1 text-xs text-midnight-500">
                    Enter your delivery details carefully.
                  </p>
                </div>

                <form
                  onSubmit={saveAddress}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <div className="sm:col-span-2">
                    <label className="label-bm">Full name</label>
                    <input
                      required
                      value={form.full_name}
                      onChange={set("full_name")}
                      className="input-bm"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="label-bm">Phone</label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      className="input-bm"
                      placeholder="Phone number"
                    />
                  </div>

                  <div>
                    <label className="label-bm">WhatsApp</label>
                    <input
                      type="tel"
                      value={form.whatsapp}
                      onChange={set("whatsapp")}
                      className="input-bm"
                      placeholder="WhatsApp number"
                    />
                  </div>

                  <div>
                    <label className="label-bm">House number</label>
                    <input
                      value={form.house_number}
                      onChange={set("house_number")}
                      className="input-bm"
                      placeholder="House number"
                    />
                  </div>

                  <div>
                    <label className="label-bm">Street</label>
                    <input
                      required
                      value={form.street}
                      onChange={set("street")}
                      className="input-bm"
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <label className="label-bm">Area</label>
                    <input
                      value={form.area}
                      onChange={set("area")}
                      className="input-bm"
                      placeholder="Area"
                    />
                  </div>

                  <div>
                    <label className="label-bm">City</label>
                    <input
                      required
                      value={form.city}
                      onChange={set("city")}
                      className="input-bm"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="label-bm">State</label>
                    <input
                      required
                      value={form.state}
                      onChange={set("state")}
                      className="input-bm"
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label className="label-bm">Country</label>
                    <input
                      required
                      value={form.country}
                      onChange={set("country")}
                      className="input-bm"
                      placeholder="Country"
                    />
                  </div>

                  <div>
                    <label className="label-bm">Landmark</label>
                    <input
                      value={form.landmark}
                      onChange={set("landmark")}
                      className="input-bm"
                      placeholder="Nearby landmark"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-gold mt-2 sm:col-span-2"
                  >
                    Save Address
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* ORDERS */}
          <section className="h-fit rounded-2xl border border-midnight-100 bg-white shadow-sm">
            <div className="border-b border-midnight-100 p-6 sm:p-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-600">
                  Order history
                </p>

                <h2 className="font-display mt-1 text-2xl font-bold text-midnight-950">
                  Recent Orders
                </h2>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <div className="space-y-3">
                {orders.length === 0 && (
                  <div className="rounded-xl border border-dashed border-midnight-200 bg-midnight-50 px-5 py-10 text-center">
                    <p className="font-medium text-midnight-800">
                      No orders yet.
                    </p>

                    <p className="mt-2 text-xs leading-5 text-midnight-500">
                      Your completed purchases will appear here.
                    </p>
                  </div>
                )}

                {orders.slice(0, 5).map((o) => (
                  <a
                    key={o.number}
                    href={`/orders/${o.number}`}
                    className="group block rounded-xl border border-midnight-100 p-4 transition duration-300 hover:border-gold-300 hover:bg-gold-50/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-display font-bold text-midnight-950 transition group-hover:text-gold-700">
                          #{o.number}
                        </div>

                        <div className="mt-1 text-xs text-midnight-500">
                          {new Date(o.created_at).toLocaleDateString(
                            "en-NG",
                            {
                              dateStyle: "medium",
                            }
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-midnight-950">
                          ₦{Number(o.total).toLocaleString()}
                        </div>

                        <div className="mt-1 text-xs text-gold-700">
                          {o.status_display}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-midnight-100 pt-3">
                      <span className="text-[10px] uppercase tracking-wider text-midnight-400">
                        View order details
                      </span>

                      <span className="text-sm font-semibold text-midnight-950 transition group-hover:translate-x-1 group-hover:text-gold-600">
                        →
                      </span>
                    </div>
                  </a>
                ))}
              </div>

              {orders.length > 5 && (
                <a
                  href="/orders"
                  className="mt-5 flex items-center justify-center rounded-xl border border-midnight-200 px-5 py-3 text-sm font-semibold text-midnight-950 transition duration-300 hover:border-gold-500 hover:bg-gold-50"
                >
                  View All Orders
                </a>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}