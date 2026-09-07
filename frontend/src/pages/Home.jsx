import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

const CATEGORIES = [
  {
    key: "agbada",
    name: "Agbada & Grand Occasion",
    desc: "Statement sets for weddings, Afang and Owambe.",
    img: "/hero-fashion.png",
  },
  {
    key: "senator",
    name: "Senator & Native",
    desc: "Refined crested elegance for every day.",
    img: "/hero-native.png",
  },
  {
    key: "ankara",
    name: "Ankara",
    desc: "Bold prints, vibrant and celebration-ready.",
    img: "/hero-fashion.png",
  },
];

const PERKS = [
  ["🚚", "Nationwide delivery", "Across all 36 states, tracked to your door"],
  ["💳", "Pay securely online", "OPay, card and bank payment"],
  ["📞", "Real human support", "Call or WhatsApp before & after your order"],
  ["♻️", "Easy size guidance", "Honest fit info so it's right the first time"],
];

const TESTIMONIALS = [
  {
    quote:
      "The agbada set was flawless — the embroidery is even richer in person. Delivery to Lagos was quick and the WhatsApp support kept me updated the whole way.",
    name: "Adewale O.",
    role: "Wedding, Lagos",
  },
  {
    quote:
      "Finally a Nigerian store that gets it right. Clear photos, real stock, and my senator wear fits perfectly. I'll be back for my next Owambe.",
    name: "Chidinma E.",
    role: "Verified buyer, Abuja",
  },
  {
    quote:
      "Ordered on a Tuesday, had it by Friday. The team even helped me pick a size over WhatsApp. Premium feel, honest price.",
    name: "Tunde A.",
    role: "Verified buyer, Ibadan",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/products/?is_featured=true&page_size=4")
      .then((res) => setFeatured(res.data.results || []))
      .catch(() => setError("Could not load featured products."));
    api
      .get("/products/?sort=newest&page_size=4")
      .then((res) => setLatest(res.data.results || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ---------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden bg-midnight-950">
        <div className="absolute inset-0">
          <img
            src="/hero-fashion.png"
            alt=""
            className="h-full w-full object-cover object-top opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-midnight-950 via-midnight-950/85 to-midnight-950/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(18,18,31,0.55)_100%)]" />
        </div>

        <div className="container-bm relative py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-400">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
              For Better Elegance &amp; Luxury
            </span>
            <h1 className="font-display mt-6 text-4xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              Wear the Elegance,
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent">
                {" "}
                Speak the Luxury
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-midnight-100 sm:text-lg">
              Premium Nigerian fashion — agbada, senator, kaftans and ankara —
              tailored to you and delivered nationwide. From the studio to your
              doorstep, done right.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/products" className="btn-gold !px-8 !py-3 text-base">
                Shop the collection
              </Link>
              <a
                href="https://wa.me/2347012124050"
                className="btn-outline !border-white/40 !px-8 !py-3 text-base !text-white hover:!border-gold-500 hover:!text-gold-400"
              >
                Order on WhatsApp
              </a>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
              {[
                ["4.9★", "Average rating"],
                ["36", "States delivered"],
                ["100%", "Made in Nigeria"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-2xl font-bold text-gold-400">{n}</div>
                  <div className="text-xs uppercase tracking-wider text-midnight-300">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 lg:block">
          <div className="mb-5 flex h-10 w-6 items-start justify-center rounded-full border-2 border-midnight-600 p-1.5">
            <div className="h-2 w-1 animate-bounce rounded-full bg-gold-500" />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- PERK STRIP */}
      <section className="border-b border-midnight-100 bg-white">
        <div className="container-bm grid grid-cols-1 gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map(([icon, title, sub]) => (
            <div key={title} className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-2xl">
                {icon}
              </div>
              <div>
                <div className="text-sm font-bold text-midnight-900">{title}</div>
                <div className="text-xs text-midnight-700">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="container-bm mt-6 text-sm text-red-500">{error}</p>}

      {/* ---------------------------------------------- FEATURED GRID */}
      <section className="py-20">
        <div className="container-bm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Hand-picked for you
              </p>
              <h2 className="font-display mt-2 text-3xl font-bold text-midnight-950 sm:text-4xl">
                Featured pieces
              </h2>
            </div>
            <Link
              to="/products"
              className="group inline-flex items-center gap-1 text-sm font-semibold text-gold-600 hover:text-gold-700"
            >
              View all
              <span className="transition group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------ CATEGORY SHOWCASE */}
      <section className="bg-midnight-950 py-20 text-white">
        <div className="container-bm">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
              Find your look
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold sm:text-4xl">
              Shop by collection
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-midnight-200">
              From grand occasion agbada to sharp everyday senator wear — every
              collection is tailored with premium fabric and care.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c.key}
                to={`/products?category=${c.key}`}
                className="group relative flex h-72 items-end overflow-hidden rounded-2xl border border-midnight-800 shadow-lift"
              >
                <img
                  src={c.img}
                  alt={c.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/40 to-transparent" />
                <div className="relative p-6">
                  <h3 className="font-display text-xl font-bold text-white">{c.name}</h3>
                  <p className="mt-1 text-sm text-midnight-200">{c.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-400">
                    Browse collection
                    <span className="transition group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------- NEW ARRIVALS */}
      {latest.length > 0 && (
        <section className="py-20">
          <div className="container-bm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Just dropped
                </p>
                <h2 className="font-display mt-2 text-3xl font-bold text-midnight-950 sm:text-4xl">
                  New arrivals
                </h2>
              </div>
              <Link to="/products?sort=newest" className="text-sm font-semibold text-gold-600 hover:text-gold-700">
                Browse newest →
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {latest.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------- WHY US / PROMISE */}
      <section className="bg-gold-50 py-20">
        <div className="container-bm grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Our promise
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold text-midnight-950 sm:text-4xl">
              Made to move with you, from Ibadan to everywhere
            </h2>
            <p className="mt-4 text-midnight-700">
              We built BETA_MODEHUS because buying native fashion online was too
              hard. So we did it properly — clear photos, honest stock, secure
              checkout and a real person to talk to.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Premium, hand-selected fabrics",
                "Honest fit guidance before you buy",
                "Tracked nationwide delivery",
                "Friendly support on call & WhatsApp",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-midnight-900">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-midnight-950">
                    ✓
                  </span>
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/about" className="btn-gold">
                Our story
              </Link>
              <a
                href="https://wa.me/2347012124050"
                className="btn-outline"
              >
                Chat with us
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-lift">
              <img
                src="/hero-native.png"
                alt="BETA_MODEHUS premium native wear"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-midnight-100 bg-white p-4 shadow-lift sm:block">
              <div className="font-display text-2xl font-bold text-midnight-950">10k+</div>
              <div className="text-xs text-midnight-700">Happy customers served</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------- TESTIMONIALS */}
      <section className="py-20">
        <div className="container-bm">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Loved by customers
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold text-midnight-950 sm:text-4xl">
              What they're saying
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="card-bm flex flex-col justify-between p-6 transition hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="text-gold-500">★★★★★</div>
                <p className="mt-3 text-sm leading-relaxed text-midnight-900">“{t.quote}”</p>
                <div className="mt-5 border-t border-midnight-100 pt-4">
                  <div className="text-sm font-bold text-midnight-950">{t.name}</div>
                  <div className="text-xs text-midnight-700">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------- FINAL CTA */}
      <section className="container-bm pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-midnight-950 px-6 py-16 text-center text-white shadow-lift sm:px-12">
          <img
            src="/hero-fashion.png"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/70 to-midnight-950/30" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Ready to own a piece?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-midnight-200">
              Browse the full collection or talk to us directly for bespoke
              tailoring and bulk orders.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/products" className="btn-gold !px-8">
                Shop now
              </Link>
              <a
                href="https://wa.me/2347012124050"
                className="btn-outline !border-white/40 !px-8 !text-white hover:!border-gold-500 hover:!text-gold-400"
              >
                WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}