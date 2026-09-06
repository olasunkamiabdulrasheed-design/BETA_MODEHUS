import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

const SECTIONS = [
  {
    key: "agbada",
    name: "Agbada & Grand Occasion",
    desc: "Statement agbada sets and embroidered grandeur for weddings, Afang and Owambe.",
  },
  {
    key: "senator",
    name: "Senator & Native",
    desc: "Tailored senator wear with crested details — refined native elegance.",
  },
  {
    key: "ankara",
    name: "Ankara",
    desc: "Bold prints, vibrant colors — everyday and celebration-ready.",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/products/?is_featured=true&page_size=4")
      .then((res) => setFeatured(res.data.results || []))
      .catch(() => setError("Could not load featured products."));
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-midnight-950 py-28 text-center text-white sm:py-36">
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 w-[min(80vw,560px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.10]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(27,27,47,0.55)_60%,#0a0a18_100%)]" />
        <div className="container-bm relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-gold-400">
            For Better Elegance and Luxury
          </p>
          <h1 className="font-display mt-4 text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
            Wear the Elegance, <br className="hidden sm:block" />
            Speak the Luxury
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-midnight-100 sm:text-lg">
            Premium Nigerian fashion — agbada, senator, kaftans, ankara and more.
            Tailored to you, delivered nationwide.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/products" className="btn-gold">
              Shop the collection
            </Link>
            <a href="https://wa.me/2347012124050" className="btn-outline !border-white/40 !text-white hover:!border-gold-500 hover:!text-gold-400">
              Order on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="container-bm grid gap-4 text-center sm:grid-cols-3 sm:gap-5">
          {[
            ["🚚", "Nationwide delivery", "Across all 36 states"],
            ["💳", "Pay online securely", "OPay & card payments"],
            ["📞", "Real human support", "08077063971 / WhatsApp"],
          ].map(([icon, title, sub]) => (
            <div key={title} className="card-bm p-5 text-center transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="text-3xl">{icon}</div>
              <div className="mt-2 font-semibold text-midnight-900">{title}</div>
              <div className="text-sm text-midnight-700">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="container-bm mt-6 text-sm text-red-500">{error}</p>}

      <section className="py-20">
        <div className="container-bm">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl font-bold text-midnight-900">
                Featured pieces
              </h2>
              <p className="mt-1 text-sm text-midnight-700">
                Hand-picked for the season
              </p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-gold-600 hover:text-gold-700">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-midnight-900 py-20 text-white">
        <div className="container-bm grid gap-6 md:grid-cols-3">
          {SECTIONS.map((s) => (
            <div key={s.key} className="card-bm !shadow-none border !border-midnight-700 bg-midnight-800 p-6 transition hover:border-gold-500/70 hover:shadow-lift">
              <h3 className="font-display text-xl font-semibold text-gold-400">{s.name}</h3>
              <p className="mt-2 text-sm text-midnight-100">{s.desc}</p>
              <Link to={`/products?category=${s.key}`} className="mt-4 inline-block text-sm font-semibold text-gold-500 hover:text-gold-400">
                Browse {s.name} →
              </Link>
            </div>
          ))}
        </div>

        <div className="container-bm mt-14 border-t border-midnight-800 pt-12 text-center">
          <h2 className="font-display text-2xl font-bold text-white">Ready to own a piece?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-midnight-200">
            Browse the full collection or talk to us directly on WhatsApp for
            bespoke tailoring and bulk orders.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link to="/products" className="btn-gold">
              Shop now
            </Link>
            <Link to="/about" className="btn-outline !border-white/40 !text-white hover:!border-gold-500 hover:!text-gold-400">
              About us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}