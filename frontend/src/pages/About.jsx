import { Link } from "react-router-dom";

const VALUES = [
  ["✂️", "Hand-finished tailoring", "Every piece is cut and finished with care, from ankara to grand agbada."],
  ["🧵", "Premium fabrics", "We select quality fabrics that drape well and last, so you look sharp every time."],
  ["🚚", "Nationwide delivery", "From Ibadan to every corner of Nigeria — 36 states, doorstep delivery."],
  ["🤝", "Human support", "Real people on the phone and WhatsApp to help before, during and after your order."],
];

const STEPS = [
  ["Browse", "Pick your favourite pieces from the shop in a few taps."],
  ["Order", "Checkout online and pay securely — card or OPay."],
  ["Delivered", "We package and deliver to your door anywhere in Nigeria."],
];

export default function About() {
  return (
    <div>
      <section className="relative overflow-hidden bg-midnight-950 py-16 text-center text-white sm:py-20">
        <img
          src="/logo.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 w-[min(70vw,440px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.10]"
        />
        <div className="container-bm relative">
          <p className="text-xs uppercase tracking-[0.35em] text-gold-500">Our story</p>
          <h1 className="font-display mt-3 text-3xl font-bold sm:text-5xl">
            BETA<span className="text-gold-500">MODEHUS</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-midnight-100">
            Better Elegance and Luxury — premium Nigerian fashion for life's big
            moments and the everyday.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container-bm max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-midnight-900">Who we are</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-midnight-700 sm:text-base">
            <p>
              BETA_MODEHUS is a Lagos- and Ibadan-based fashion house built on one
              idea: that Nigerian men and women deserve clothing that feels as good
              as it looks. From statement agbada for your best days to crisp senator
              wear for everyday confidence, we combine traditional tailoring with
              modern cuts and premium fabric.
            </p>
            <p>
              We started because buying native fashion online was hard — blurry
              photos, uncertain sizes, and deliveries that never arrived. So we built
              it properly: clear photos, real stock, secure payment, and honest
              delivery across all 36 states of Nigeria.
            </p>
            <p>
              Today we ship nationwide with human support on the phone and WhatsApp,
              so you always know exactly what you're getting and when it's coming.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-midnight-900 py-14 text-white">
        <div className="container-bm">
          <h2 className="text-center font-display text-2xl font-bold">Why shop with us</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(([icon, title, desc]) => (
              <div key={title} className="rounded-lg border border-midnight-700 bg-midnight-800 p-6">
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-3 font-semibold text-gold-400">{title}</h3>
                <p className="mt-2 text-sm text-midnight-100">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-bm max-w-3xl">
          <h2 className="text-center font-display text-2xl font-bold text-midnight-900">How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {STEPS.map(([step, desc], i) => (
              <div key={step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 font-display text-lg font-bold text-midnight-950">
                  {i + 1}
                </div>
                <h3 className="mt-3 font-semibold text-midnight-900">{step}</h3>
                <p className="mt-1 text-sm text-midnight-700">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/products" className="btn-gold">
              Start shopping
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gold-50 py-10">
        <div className="container-bm text-center">
          <h2 className="font-display text-xl font-bold text-midnight-900">Questions or bespoke orders?</h2>
          <p className="mt-2 text-sm text-midnight-700">
            Call or WhatsApp us — we'd love to help you find the perfect fit.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm font-semibold">
            <a href="tel:08077063971" className="text-gold-600 hover:underline">08077063971</a>
            <a href="https://wa.me/2347012124050" className="text-gold-600 hover:underline">WhatsApp: 07012124050</a>
          </div>
        </div>
      </section>
    </div>
  );
}