import { Link } from "react-router-dom";

const VALUES = [
  {
    image: "/logo.png",
    title: "Hand-finished tailoring",
    description:
      "Every piece is thoughtfully cut and finished with attention to detail, from refined senator styles to statement agbada.",
  },
  {
    image: "/logo.png",
    title: "Premium fabrics",
    description:
      "We focus on quality fabrics, refined textures and timeless finishes designed to elevate your wardrobe.",
  },
  {
    image: "/logo.png",
    title: "Nationwide delivery",
    description:
      "Shop from anywhere in Nigeria. We carefully prepare your order and deliver it to your doorstep.",
  },
  {
    image: "/logo.png",
    title: "Human support",
    description:
      "Need help choosing a style or placing an order? Our team is available through phone and WhatsApp.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Browse",
    description:
      "Explore our carefully selected collection and discover your next favourite piece.",
  },
  {
    number: "02",
    title: "Order",
    description:
      "Choose your preferred style, size and colour, then complete checkout securely.",
  },
  {
    number: "03",
    title: "Delivered",
    description:
      "We prepare your order with care and deliver it to your chosen location across Nigeria.",
  },
];

export default function About() {
  return (
    <main className="overflow-hidden bg-white">
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-midnight-950 text-white">
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />

        <div className="absolute inset-0 opacity-[0.035]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
        </div>

        <div className="absolute left-1/2 top-1/2 hidden h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold-500/10 lg:block" />
        <div className="absolute left-1/2 top-1/2 hidden h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold-500/10 lg:block" />

        <div className="container-bm relative flex min-h-[610px] items-center justify-center py-24">
          <div className="max-w-4xl text-center">
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-gold-500/30 bg-white/[0.04] px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-gold-400 backdrop-blur-sm">
              <span className="h-px w-5 bg-gold-500" />
              Our Story
              <span className="h-px w-5 bg-gold-500" />
            </div>

            <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl lg:text-8xl">
              BETA
              <span className="text-gold-500">_</span>
              MODEHUS
            </h1>

            <div className="mx-auto mt-7 h-px w-20 bg-gold-500" />

            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-midnight-100 sm:text-lg">
              For Better Elegance and Luxury.
              <br />
              <span className="text-midnight-300">
                Nigerian fashion thoughtfully made for moments that matter.
              </span>
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-full bg-gold-500 px-7 py-3.5 text-sm font-bold text-midnight-950 transition duration-300 hover:-translate-y-0.5 hover:bg-gold-400"
              >
                Explore Collection
              </Link>

              <a
                href="#our-story"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition duration-300 hover:border-gold-500/50 hover:bg-white/5"
              >
                Our Story
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-gold-500/70 to-transparent" />
      </section>

      {/* STORY */}
      <section id="our-story" className="relative py-20 sm:py-28">
        <div className="container-bm">
          <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
            {/* Brand Card */}
            <div className="relative">
              <div className="absolute -left-5 -top-5 h-24 w-24 border-l border-t border-gold-500/50" />
              <div className="absolute -bottom-5 -right-5 h-24 w-24 border-b border-r border-gold-500/50" />

              <div className="relative overflow-hidden rounded-2xl bg-midnight-950 px-8 py-16 text-center shadow-2xl sm:px-12">
                <div className="absolute inset-0 opacity-[0.04]">
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                </div>

                <div className="relative">
                  <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border border-gold-500/30 bg-white p-5 shadow-[0_0_60px_rgba(212,175,55,0.08)]">
                    <img
                      src="/logo.png"
                      alt="BETA_MODEHUS"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.35em] text-gold-400">
                    BETA_MODEHUS
                  </p>

                  <p className="mt-4 font-display text-2xl font-semibold text-white">
                    For Better Elegance
                    <br />
                    <span className="text-gold-500">and Luxury</span>
                  </p>

                  <div className="mx-auto mt-7 h-px w-12 bg-gold-500/70" />
                </div>
              </div>
            </div>

            {/* Story Content */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
                Who we are
              </p>

              <h2 className="font-display mt-3 text-3xl font-bold leading-tight text-midnight-950 sm:text-4xl lg:text-5xl">
                Where Nigerian style
                <span className="block text-gold-600">
                  meets modern elegance.
                </span>
              </h2>

              <div className="mt-7 h-px w-16 bg-gold-500" />

              <div className="mt-7 space-y-5 text-sm leading-8 text-midnight-700 sm:text-base">
                <p>
                  BETA_MODEHUS is a Nigerian fashion brand built around one
                  simple idea: clothing should make you feel confident,
                  distinguished and effortlessly well dressed.
                </p>

                <p>
                  From statement agbada to refined senator wear and carefully
                  selected native styles, our collection brings together
                  traditional Nigerian fashion and a contemporary sense of
                  elegance.
                </p>

                <p>
                  We are creating a better way to discover, order and receive
                  quality fashion online — with clear product information,
                  secure payments, reliable delivery and support when you need
                  it.
                </p>
              </div>

              <div className="mt-9 flex flex-wrap gap-8 border-t border-midnight-100 pt-7">
                <div>
                  <p className="font-display text-2xl font-bold text-midnight-950">
                    01
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-midnight-500">
                    Fashion First
                  </p>
                </div>

                <div>
                  <p className="font-display text-2xl font-bold text-midnight-950">
                    36
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-midnight-500">
                    States Served
                  </p>
                </div>

                <div>
                  <p className="font-display text-2xl font-bold text-midnight-950">
                    24/7
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-midnight-500">
                    Online Shopping
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="relative bg-midnight-950 py-20 text-white sm:py-24">
        <div className="absolute inset-0 opacity-[0.025]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        <div className="container-bm relative">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
              The BETA_MODEHUS standard
            </p>

            <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
              Why shop with us
            </h2>

            <p className="mt-4 text-sm leading-7 text-midnight-300 sm:text-base">
              Everything we do is centered around giving you a better fashion
              shopping experience.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-midnight-800 bg-midnight-800 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <article
                key={value.title}
                className="group bg-midnight-950 p-7 transition duration-300 hover:bg-midnight-900 sm:p-8"
              >
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-gold-500/20 bg-midnight-900 p-3 transition duration-300 group-hover:border-gold-500/50">
                  <img
                    src={value.image}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-contain opacity-80 grayscale transition duration-300 group-hover:grayscale-0"
                  />
                </div>

                <h3 className="mt-6 font-display text-lg font-bold text-gold-400">
                  {value.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-midnight-300">
                  {value.description}
                </p>

                <div className="mt-6 h-px w-8 bg-gold-500/50 transition-all duration-300 group-hover:w-14 group-hover:bg-gold-500" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-20 sm:py-28">
        <div className="container-bm">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
              Simple by design
            </p>

            <h2 className="font-display mt-3 text-3xl font-bold text-midnight-950 sm:text-4xl">
              How it works
            </h2>

            <p className="mt-4 text-sm leading-7 text-midnight-600 sm:text-base">
              From discovering your style to receiving it at your doorstep,
              shopping with BETA_MODEHUS is simple.
            </p>
          </div>

          <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-0">
            <div className="absolute left-[16.66%] right-[16.66%] top-7 hidden h-px bg-gold-500/20 md:block" />

            {STEPS.map((step) => (
              <div
                key={step.number}
                className="relative px-5 text-center md:px-10"
              >
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-500 bg-white font-display text-sm font-bold text-midnight-950 shadow-sm">
                  {step.number}
                </div>

                <h3 className="mt-6 font-display text-xl font-bold text-midnight-950">
                  {step.title}
                </h3>

                <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-midnight-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-midnight-950 px-8 py-4 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-midnight-800"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="relative overflow-hidden bg-gold-50 py-16 sm:py-20">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-gold-500/20" />
        <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full border border-gold-500/20" />

        <div className="container-bm relative text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-700">
            Need assistance?
          </p>

          <h2 className="font-display mt-3 text-2xl font-bold text-midnight-950 sm:text-3xl">
            Questions or bespoke orders?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-midnight-700 sm:text-base">
            Speak with our team if you need help finding the right style,
            choosing a size or placing an order.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="tel:08077063971"
              className="inline-flex items-center justify-center rounded-full border border-midnight-200 bg-white px-6 py-3 text-sm font-semibold text-midnight-950 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-gold-500"
            >
              08077063971
            </a>

            <a
              href="https://wa.me/2347012124050"
              className="inline-flex items-center justify-center rounded-full bg-midnight-950 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-midnight-800"
            >
              WhatsApp: 07012124050
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}