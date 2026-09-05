import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    phone: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signup(form);
      navigate("/");
    } catch (err) {
      const data = err.response?.data || {};
      const first = Object.values(data).flat()[0];
      setError(first || "Signup failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-bm flex justify-center py-16">
      <div className="w-full max-w-md rounded-xl border border-midnight-100 bg-white p-8 shadow-md">
        <h1 className="font-display text-2xl font-bold text-midnight-900">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-midnight-700">
          Join BETA_MODEHUS for faster checkout and order tracking.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label-bm">Full name</label>
            <input required value={form.full_name} onChange={set("full_name")} className="input-bm" />
          </div>
          <div>
            <label className="label-bm">Email</label>
            <input type="email" required value={form.email} onChange={set("email")} className="input-bm" />
          </div>
          <div>
            <label className="label-bm">Phone</label>
            <input type="tel" required value={form.phone} onChange={set("phone")} className="input-bm" placeholder="08012345678" />
          </div>
          <div>
            <label className="label-bm">Password</label>
            <input type="password" required value={form.password} onChange={set("password")} className="input-bm" />
          </div>
          <div>
            <label className="label-bm">Confirm password</label>
            <input type="password" required value={form.password2} onChange={set("password2")} className="input-bm" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={busy} className="btn-gold w-full">
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-midnight-700">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-gold-600 hover:text-gold-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}