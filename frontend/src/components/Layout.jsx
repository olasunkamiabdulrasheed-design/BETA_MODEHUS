import { useState } from "react";
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
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const go = () => setOpen(false);

  const CartLink = () => (
    <span className="relative">
      Cart
      {itemCount > 0 && (
        <span className="absolute -right-4 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-midnight-950">
          {itemCount}
        </span>
      )}
    </span>
  );

  const DesktopNav = () => {
    const items = (
      <>
        <NavLink to="/" end className={navLink}>
          Home
        </NavLink>
        <NavLink to="/about" className={navLink}>
          About
        </NavLink>
        {!user?.is_staff && (
          <>
            <NavLink to="/products" className={navLink}>
              Shop
            </NavLink>
            <NavLink to="/cart" className={navLink}>
              <CartLink />
            </NavLink>
            <NavLink to="/account" className={navLink}>
              {user?.full_name || user?.email}
            </NavLink>
          </>
        )}
        {user?.is_staff && (
          <NavLink to="/backstage" className={navLink}>
            Dashboard
          </NavLink>
        )}
        {user ? (
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-sm font-medium text-midnight-300 hover:text-white"
          >
            Logout
          </button>
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
      </>
    );
    return <nav className="hidden items-center gap-1 md:flex">{items}</nav>;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-midnight-950 shadow-lg">
        <div className="bg-gold-500 py-1.5 text-center text-xs font-semibold text-midnight-950">
          For Better Elegance and Luxury — Nationwide delivery across Nigeria
        </div>
        <div className="container-bm flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="BETA_MODEHUS logo" className="h-12 w-12 rounded-full object-cover" />
            <div className="leading-tight">
              <div className="font-display text-lg font-bold tracking-wide text-white sm:text-xl">
                BETA<span className="text-gold-500">MODEHUS</span>
              </div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-midnight-300 sm:text-[10px]">
                Better Elegance &amp; Luxury
              </div>
            </div>
          </Link>

          <DesktopNav />

          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-md border border-midnight-800 text-white md:hidden"
          >
            <span className={`h-0.5 w-5 bg-current transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-5 bg-current transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>

        {open && (
          <nav className="border-t border-midnight-800 px-4 pb-4 pt-2 md:hidden">
            {user && !user.is_staff && itemCount > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-midnight-900 px-4 py-3 text-sm text-white">
                <span>{itemCount} item{itemCount === 1 ? "" : "s"} in cart</span>
                <Link to="/cart" onClick={go} className="font-semibold text-gold-400">
                  View cart →
                </Link>
              </div>
            )}
                <NavLink to="/" end onClick={go} className="block px-4 py-3 text-sm font-medium text-white hover:text-gold-400">
                  Home
                </NavLink>
                <NavLink to="/about" onClick={go} className="block px-4 py-3 text-sm font-medium text-white hover:text-gold-400">
                  About us
                </NavLink>
                {user && !user.is_staff && (
                  <>
                    <NavLink to="/products" onClick={go} className="block px-4 py-3 text-sm font-medium text-white hover:text-gold-400">
                      Shop
                    </NavLink>
                    <NavLink to="/cart" onClick={go} className="block px-4 py-3 text-sm font-medium text-white hover:text-gold-400">
                      Cart
                    </NavLink>
                    <NavLink to="/account" onClick={go} className="block px-4 py-3 text-sm font-medium text-white hover:text-gold-400">
                      {user.full_name || user.email}
                    </NavLink>
                  </>
                )}
                {user?.is_staff && (
                  <NavLink to="/backstage" onClick={go} className="block px-4 py-3 text-sm font-medium text-white hover:text-gold-400">
                    Dashboard
                  </NavLink>
                )}
                {user ? (
                  <button onClick={handleLogout} className="block w-full px-4 py-3 text-left text-sm font-medium text-midnight-300 hover:text-white">
                    Logout
                  </button>
                ) : (
                  <>
                    <NavLink to="/login" onClick={go} className="block px-4 py-3 text-sm font-medium text-white hover:text-gold-400">
                      Login
                    </NavLink>
                    <Link to="/signup" onClick={go} className="btn-gold mx-2 mt-2 block text-center">
                      Sign up
                    </Link>
                  </>
                )}
          </nav>
        )}
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
            <Link to="/about" className="mt-3 inline-block text-sm font-semibold text-gold-500 hover:text-gold-400">
              About us →
            </Link>
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