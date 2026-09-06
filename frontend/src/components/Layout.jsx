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
            <img src="/logo.png" alt="BETA_MODEHUS logo" className="h-12 w-12 rounded-full object-cover" />
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
            <div className="mt-4 flex gap-3">
              <a
                href="https://www.tiktok.com/@beta_modehus01"
                target="_blank"
                rel="noreferrer"
                aria-label="BETA_MODEHUS on TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-midnight-800 text-gold-400 transition hover:bg-gold-500 hover:text-midnight-950"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/beta_modehus01"
                target="_blank"
                rel="noreferrer"
                aria-label="BETA_MODEHUS on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-midnight-800 text-gold-400 transition hover:bg-gold-500 hover:text-midnight-950"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.83 2.7 21.4.27 17.05.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm6.4-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z" />
                </svg>
              </a>
              <a
                href="https://wa.me/2347012124050"
                target="_blank"
                rel="noreferrer"
                aria-label="Chat with BETA_MODEHUS on WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-midnight-800 text-gold-400 transition hover:bg-gold-500 hover:text-midnight-950"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07a8.06 8.06 0 0 1-2.37-1.47 8.9 8.9 0 0 1-1.64-2.04c-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.21-.24-.59-.49-.51-.67-.52h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.1 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.99h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 1 1 8.4 4.62zM12.04 2.29A10.04 10.04 0 0 0 2.22 17l-1.18 4.32a.65.65 0 0 0 .79.79l4.32-1.18a10.04 10.04 0 1 0 5.88-18.66z" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-500">
              Contact
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li>
                <a href="tel:08077063971" className="transition hover:text-gold-400">Hotline: 08077063971</a>
              </li>
              <li>
                <a href="https://wa.me/2347012124050" target="_blank" rel="noreferrer" className="transition hover:text-gold-400">WhatsApp: 07012124050</a>
              </li>
              <li>
                <a href="mailto:betamodehus@gmail.com" className="transition hover:text-gold-400">Email: betamodehus@gmail.com</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-500">
              Follow us
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li>
                <a href="https://www.tiktok.com/@beta_modehus01" target="_blank" rel="noreferrer" className="transition hover:text-gold-400">TikTok: @beta_modehus01</a>
              </li>
              <li>
                <a href="https://www.instagram.com/beta_modehus01" target="_blank" rel="noreferrer" className="transition hover:text-gold-400">Instagram: @beta_modehus01</a>
              </li>
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
            <Link to="/about" className="mt-3 inline-block text-sm font-semibold text-gold-500 hover:text-gold-400">
              About us →
            </Link>
          </div>
        </div>
        <div className="border-t border-midnight-800 py-4 text-center text-xs text-midnight-300">
          © {new Date().getFullYear()} BETA_MODEHUS. All rights reserved.
        </div>
      </footer>

      <a
        href="https://wa.me/2347012124050?text=Hello%20BETA_MODEHUS%2C%20I%20would%20like%20to%20make%20an%20order."
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
          <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07a8.06 8.06 0 0 1-2.37-1.47 8.9 8.9 0 0 1-1.64-2.04c-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.21-.24-.59-.49-.51-.67-.52h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.1 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.99h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 1 1 8.4 4.62zM12.04 2.29A10.04 10.04 0 0 0 2.22 17l-1.18 4.32a.65.65 0 0 0 .79.79l4.32-1.18a10.04 10.04 0 1 0 5.88-18.66z" />
        </svg>
      </a>
    </div>
  );
}