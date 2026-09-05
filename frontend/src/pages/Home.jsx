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
      <section className="bg-midnight-900 py-20 text-center text-white">
        <div className="container-bm">
          <p className="text-xs uppercase tracking-[0.35em] text-gold-500">
            For Better Elegance and Luxury
          </p>
          <h1 className="font-display mt-4 text-4xl font-bold sm:text-5xl">
            Wear the Elegance, <br className="hidden sm:block" />
            Speak the Luxury
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-midnight-100">
            Premium Nigerian fashion — agbada, senator, kaftans, ankara and more.
            Tailored to you, delivered nationwide.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/products" className="btn-gold">
              Shop the collection
            </Link>
            <a href="https://wa.me/2347012124050" className="btn-outline !border-white/40 !text-white hover:!border-gold-500 hover:!text-gold-400">
              Order on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="bg-gold-50 py-10">
        <div className="container-bm grid gap-6 text-center sm:grid-cols-3">
          {[
            ["🚚", "Nationwide delivery", "Across all 36 states"],
            ["💳", "Pay online securely", "OPay & card payments"],
            ["📞", "Real human support", "08077063971 / WhatsApp"],
          ].map(([icon, title, sub]) => (
            <div key={title} className="rounded-lg bg-white p-5 shadow-sm">
              <div className="text-3xl">{icon}</div>
              <div className="mt-2 font-semibold text-midnight-900">{title}</div>
              <div className="text-sm text-midnight-700">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="container-bm mt-6 text-sm text-red-500">{error}</p>}

      <section className="py-14">
        <div className="container-bm">
          <div className="flex items-end justify-between">
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
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-midnight-900 py-14 text-white">
        <div className="container-bm grid gap-10 md:grid-cols-3">
          {SECTIONS.map((s) => (
            <div key={s.key} className="rounded-lg border border-midnight-700 bg-midnight-800 p-6">
              <h3 className="font-display text-xl font-semibold text-gold-400">{s.name}</h3>
              <p className="mt-2 text-sm text-midnight-100">{s.desc}</p>
              <Link to={`/products?category=${s.key}`} className="mt-4 inline-block text-sm font-semibold text-gold-500 hover:text-gold-400">
                Browse {s.name} →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}