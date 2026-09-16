import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";

export default function Signup() {
  useDocumentTitle("Create account");
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    phone: "",
    password: "",
    password2: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    <div className="container-bm flex justify-center py-16 sm:py-24">
      <div className="w-full max-w-md rounded-[1.5rem] border border-black/5 bg-white p-7 shadow-lift sm:p-9">
        <h1 className="font-display text-3xl font-bold text-midnight-950">
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={set("password")}
                className="input-bm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-midnight-400 transition hover:text-midnight-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="label-bm">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={form.password2}
                onChange={set("password2")}
                className="input-bm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-midnight-400 transition hover:text-midnight-700"
              >
                {showConfirm ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
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