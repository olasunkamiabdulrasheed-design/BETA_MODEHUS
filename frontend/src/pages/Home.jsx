import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";
import ContactSection from "../components/ContactSection.jsx";

const CATEGORY_FEEDS = [
  { key: "agbada", tag: "Grand occasion", title: "Agbada & Grand Occasion" },
  { key: "senator", tag: "Refined native", title: "Senator & Native Wear" },
  { key: "ankara", tag: "Bold prints", title: "Vibrant Ankara" },
];

const STATS = [
  ["250+", "Handmade pieces"],
  ["36", "States delivered"],
  ["4.9", "Average rating"],
  ["100%", "Made to order"],
];

const BENEFITS = [
  ["Quality fabrics", "Premium materials that drape well and last far beyond one season."],
  ["Hand-finished", "Every piece is cut and finished by experienced tailors."],
  ["Secure payments", "Pay safely with OPay or cards — every order fully tracked."],
  ["Honest delivery", "Clear timelines and doorstep delivery across Nigeria."],
];

const STEPS = [
  ["01", "Browse & choose", "Filter by category, find your fit and add it to your cart."],
  ["02", "Checkout securely", "Pay online with OPay or cards in a few taps."],
  ["03", "Delivered to you", "We package and ship to your door, tracked nationwide."],
];

const TESTIMONIALS = [
  {
    name: "Adaeze O.",
    city: "Lagos",
    text: "The agbada fit perfectly for my wedding. Delivery to Lagos was fast and the quality is truly unmatched.",
  },
  {
    name: "Tunde A.",
    city: "Ibadan",
    text: "Ordered a senator set for work — sharp, comfortable and it arrived earlier than promised.",
  },
  {
    name: "Ngozi U.",
    city: "Abuja",
    text: "Bought the ankara two-piece for a family event. What I received matched the photos exactly.",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categoryPreview, setCategoryPreview] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/products/?is_featured=true&page_size=4")
      .then((res) => setFeatured(res.data.results || []))
      .catch(() => setError("Could not load featured products."));
  }, []);

  useEffect(() => {
    CATEGORY_FEEDS.forEach(({ key }) => {
      api
        .get(`/products/?category=${key}&page_size=1&sort=newest`)
        .then((res) => {
          const p = res.data.results?.[0];
          if (p?.primary_image) {
            setCategoryPreview((prev) => ({ ...prev, [key]: p.primary_image }));
          }
        })
        .catch(() => {});
    });
  }, []);

  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-midnight-950 text-white">
        <div className="absolute inset-0">
          <img
            src="/hero-fashion.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-top opacity-40 sm:opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-midnight-950 via-midnight-950/85 to-midnight-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-transparent to-midnight-950/70" />
        </div>

        <div className="container-bm relative py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.42em] text-gold-400">
              <span className="h-px w-10 bg-gold-500" />
              For Better Elegance and Luxury
            </p>
            <h1 className="font-display mt-5 text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
              Wear the Elegance,
              <br />
              <span className="bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300 bg-clip-text text-transparent">
                Speak the Luxury
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-midnight-100 sm:text-lg">
              Premium Nigerian fashion — agbada, senator, kaftans and ankara.
              Designed to make you unforgettable, tailored to fit, delivered
              nationwide.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/products" className="btn-gold !px-8 !py-3.5 !text-base">
                Shop the collection
              </Link>
              <a
                href="https://wa.me/2347012124050"
                className="btn-outline !border-white/40 !px-8 !py-3.5 !text-base !text-white hover:!border-gold-500 hover:!text-gold-400"
              >
                Order on WhatsApp
              </a>
            </div>

            <div className="mt-12 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 border-t border-white/15 pt-8 sm:grid-cols-4">
              {STATS.map(([value, label]) => (
                <div key={label}>
                  <div className="font-display text-2xl font-bold text-white sm:text-3xl">
                    {value}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-midnight-300">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 hidden rounded-2xl border border-white/15 bg-midnight-900/70 p-5 backdrop-blur-sm lg:block">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-12 w-12 rounded-xl object-contain" />
            <div>
              <div className="font-display text-lg font-bold text-gold-400">4.9 / 5</div>
              <div className="text-xs text-midnight-200">120+ happy customers</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- MARQUEE ---------- */}
      <section className="overflow-hidden border-y border-gold-500/30 bg-midnight-900 py-4">
        <div className="bm-marquee flex w-max whitespace-nowrap">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center">
              {["Agbada", "Senator", "Kaftan", "Ankara", "Bespoke tailoring", "Nationwide delivery"].map((word) => (
                <span key={`${dup}-${word}`} className="flex items-center text-sm font-semibold uppercase tracking-[0.3em] text-gold-400">
                  <span className="px-6">{word}</span>
                  <span className="text-gold-600">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CATEGORY TILES ---------- */}
      <section className="py-16 sm:py-20">
        <div className="container-bm">
          <div className="max-w-2xl">
            <p className="eyebrow">Shop by occasion</p>
            <h2 className="font-display mt-2 text-3xl font-bold text-midnight-900 sm:text-4xl">
              Find your style
            </h2>
            <p className="mt-2 text-midnight-700">
              From grand celebrations to sharp everyday native wear — three
              signature collections.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {CATEGORY_FEEDS.map(({ key, tag, title }) => (
              <Link
                key={key}
                to={`/products?category=${key}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-midnight-100 bg-midnight-50 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <img
                  src={categoryPreview[key] || "/hero-fashion.png"}
                  alt={title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-950/85 via-midnight-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-400">
                    {tag}
                  </span>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="font-display text-lg font-bold text-white">{title}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-midnight-950 transition group-hover:bg-white">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FEATURED ---------- */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-bm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Hand-picked</p>
              <h2 className="font-display mt-2 text-3xl font-bold text-midnight-900 sm:text-4xl">
                Featured pieces
              </h2>
            </div>
            <Link to="/products" className="group inline-flex items-center gap-2 text-sm font-semibold text-gold-700 hover:text-gold-600">
              View the full collection
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- BRAND / BENEFITS SPLIT ---------- */}
      <section className="py-16 sm:py-20">
        <div className="container-bm grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <img
              src="/hero-native.png"
              alt="BETA_MODEHUS craftsmanship"
              className="w-full rounded-2xl object-cover shadow-lift"
            />
            <div className="absolute -bottom-6 -right-4 rounded-2xl border border-midnight-100 bg-white p-5 shadow-lift sm:-right-6">
              <div className="font-display text-3xl font-bold text-midnight-900">Est.</div>
              <div className="text-xs uppercase tracking-wider text-midnight-700">
                Better Elegance
                <br />
                & Luxury
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow">Why BETA_MODEHUS</p>
            <h2 className="font-display mt-2 text-3xl font-bold text-midnight-900 sm:text-4xl">
              Fashion that feels as good as it looks
            </h2>
            <p className="mt-4 leading-relaxed text-midnight-700">
              We built BETA_MODEHUS because buying native fashion online was
              hard — blurry photos, uncertain sizes and deliveries that never
              arrived. So we did it properly.
            </p>
            <ul className="mt-7 space-y-4">
              {BENEFITS.map(([title, desc]) => (
                <li key={title} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500 font-display text-sm font-bold text-midnight-950">
                    ✓
                  </span>
                  <div>
                    <div className="font-semibold text-midnight-900">{title}</div>
                    <div className="mt-0.5 text-sm leading-relaxed text-midnight-700">{desc}</div>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/about" className="btn-dark mt-8">
              Read our story
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="bg-midnight-950 py-16 text-white sm:py-20">
        <div className="container-bm">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow !text-gold-400">Simple & secure</p>
            <h2 className="font-display mt-2 text-3xl font-bold sm:text-4xl">
              From cart to doorstep in three steps
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {STEPS.map(([num, title, desc], i) => (
              <div
                key={num}
                className="relative rounded-2xl border border-midnight-700 bg-midnight-900 p-7 transition hover:border-gold-500/60"
              >
                <span className="font-display text-5xl font-bold text-gold-500/25">
                  {num}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-midnight-200">{desc}</p>
                {i < STEPS.length - 1 && (
                  <span className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-gold-500 sm:block">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="py-16 sm:py-20">
        <div className="container-bm">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Customer love</p>
            <h2 className="font-display mt-2 text-3xl font-bold text-midnight-900 sm:text-4xl">
              Trusted across Nigeria
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map(({ name, city, text }) => (
              <figure key={name} className="card-bm flex flex-col p-7">
                <div className="text-sm tracking-wider text-gold-500">★★★★★</div>
                <blockquote className="mt-4 flex-1 leading-relaxed text-midnight-700">
                  "{text}"
                </blockquote>
                <figcaption className="mt-6 border-t border-midnight-100 pt-4">
                  <div className="font-semibold text-midnight-900">{name}</div>
                  <div className="text-xs text-midnight-700">{city} · Nigeria</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CONTACT ---------- */}
      <ContactSection />

      {/* ---------- FINAL CTA ---------- */}
      <section className="relative overflow-hidden bg-gold-500 py-16 text-midnight-950 sm:py-20">
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 w-[min(70vw,480px)] -translate-x-1/2 -translate-y-1/2 opacity-15"
        />
        <div className="container-bm relative text-center">
          <h2 className="font-display mx-auto max-w-2xl text-3xl font-bold sm:text-5xl">
            Ready to own a piece?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-midnight-900">
            Browse the collection or talk to us directly on WhatsApp for bespoke
            tailoring and bulk orders.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/products" className="btn-dark !px-8 !py-3.5 !text-base">
              Shop now
            </Link>
            <a
              href="https://wa.me/2347012124050"
              className="btn-outline !border-midnight-900/40 !px-8 !py-3.5 !text-base !text-midnight-950 hover:!border-midnight-950"
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}