import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await login(email, password);
      navigate(user?.is_staff ? "/backstage" : "/");
    } catch (err) {
      setError(
        err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || "Login failed."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-bm flex justify-center py-16">
      <div className="w-full max-w-md rounded-xl border border-midnight-100 bg-white p-8 shadow-md">
        <h1 className="font-display text-2xl font-bold text-midnight-900">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-midnight-700">
          Login to your BETA_MODEHUS account.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label-bm">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-bm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label-bm">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-bm"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={busy} className="btn-gold w-full">
            {busy ? "Logging in…" : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-midnight-700">
          New here?{" "}
          <Link to="/signup" className="font-semibold text-gold-600 hover:text-gold-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}