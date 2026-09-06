import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const navLink = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium transition ${
    isActive ? "text-gold-500" : "text-white hover:text-gold-400"
  }`;

export default function Layout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-midnight-950 shadow-lg">
        <div className="bg-gold-500 py-1.5 text-center text-xs font-semibold text-midnight-950">
          For Better Elegance and Luxury — Nationwide delivery across Nigeria
        </div>
        <div className="container-bm flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/img/logo.png" alt="BETA_MODEHUS logo" className="h-12 w-12 rounded-full object-cover" />
            <div className="leading-tight">
              <div className="font-display text-xl font-bold tracking-wide text-white">
                BETA<span className="text-gold-500">MODEHUS</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-midnight-300">
                Better Elegance &amp; Luxury
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={navLink}>
              Home
            </NavLink>
            <NavLink to="/products" className={navLink}>
              Shop
            </NavLink>
            <NavLink to="/cart" className={navLink}>
              <span className="relative">
                Cart
                {itemCount > 0 && (
                  <span className="absolute -right-4 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-midnight-950">
                    {itemCount}
                  </span>
                )}
              </span>
            </NavLink>
            {user?.is_staff && (
              <NavLink to="/admin" className={navLink}>
                Dashboard
              </NavLink>
            )}
            {user ? (
              <>
                <NavLink to="/account" className={navLink}>
                  {user.full_name || user.email}
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium text-midnight-300 hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLink}>
                  Login
                </NavLink>
                <Link to="/signup" className="btn-gold">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-midnight-900 text-midnight-100">
        <div className="container-bm grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="font-display text-lg font-bold text-white">
              BETA<span className="text-gold-500">MODEHUS</span>
            </div>
            <p className="mt-2 text-sm text-midnight-300">
              For Better Elegance and Luxury. Premium Nigerian fashion, delivered
              nationwide.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-500">
              Contact
            </h3>
            <ul className="mt-3 space-y-1 text-sm">
              <li>Hotline: 08077063971</li>
              <li>WhatsApp: 07012124050</li>
              <li>Email: betamodehus@gmail.com</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-500">
              Follow us
            </h3>
            <ul className="mt-3 space-y-1 text-sm">
              <li>TikTok: @beta_modehus01</li>
              <li>Instagram: @beta_modehus01</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-500">
              Location
            </h3>
            <p className="mt-3 text-sm">
              Ibadan South-East, Oyo State,
              <br />
              Nigeria 🇳🇬
            </p>
          </div>
        </div>
        <div className="border-t border-midnight-800 py-4 text-center text-xs text-midnight-300">
          © {new Date().getFullYear()} BETA_MODEHUS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}