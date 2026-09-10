import ContactSection from "../components/ContactSection.jsx";

const FAQ = [
  [
    "How do I know my size?",
    "Each product listing includes honest fit notes. Not sure? Message us on WhatsApp with your measurements and we'll recommend the right size.",
  ],
  [
    "How long does delivery take?",
    "Orders are dispatched within 1–2 working days and delivered nationwide in 2–5 days, depending on your location. You get a tracking number once shipped.",
  ],
  [
    "Can you make a bespoke piece?",
    "Yes — we handle custom and bulk orders. Start a WhatsApp conversation or send a message through this form and we'll take it from there.",
  ],
];

export default function Contact() {
  return (
    <div>
      {/* HERO */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-midnight-950 py-20 text-center text-white sm:py-28">
        {/* Ambient gradient orbs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl" />

        {/* Gold top accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

        <div className="container-bm relative">
          <div className="flex justify-center">
            <span className="eyebrow inline-flex items-center gap-2 !text-gold-500">
              <span className="h-1 w-1 rounded-full bg-gold-500" />
              Contact us
              <span className="h-1 w-1 rounded-full bg-gold-500" />
            </span>
          </div>

          <h1 className="font-display mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            We're here to{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-gold-500">help</span>
              <span className="absolute inset-x-0 bottom-1 z-0 h-2 rounded-full bg-gold-500/20 sm:bottom-2 sm:h-3" />
            </span>
          </h1>

          <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-gold-500/70 to-transparent" />

          <p className="mx-auto mt-6 max-w-xl px-2 text-sm leading-relaxed text-midnight-200 sm:text-base">
            Sizing, orders, bespoke tailoring or bulk purchases — send a
            message and we'll get back to you within{" "}
            <span className="font-semibold text-white">24 hours</span>.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {[
              "Fast replies",
              "Bespoke tailoring",
              "Bulk orders",
              "Nationwide delivery",
            ].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium tracking-wide text-midnight-200 backdrop-blur-sm transition hover:border-gold-500/40 hover:text-gold-400 sm:px-4 sm:text-xs"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />

      {/* FAQ */}
      <section className="py-20 sm:py-24">
        <div className="container-bm">
          {/* Section header */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Quick answers</p>
            <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-midnight-950 sm:text-4xl">
              Frequently asked
            </h2>
            <div className="mx-auto mt-5 h-px w-14 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-midnight-600 sm:text-base">
              The questions we hear most often — answered honestly.
              Still stuck? Reach out and a real human will reply.
            </p>
          </div>

          {/* FAQ grid */}
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
            {FAQ.map(([q, a], index) => (
              <div
                key={q}
                className="card-bm group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-7"
              >
                {/* Gold top accent on hover */}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Number badge */}
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-midnight-950 font-display text-xs font-bold text-gold-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-midnight-100" />
                </div>

                <h3 className="font-display mt-5 text-lg font-bold leading-snug text-midnight-950">
                  {q}
                </h3>

                <p className="mt-3 text-sm leading-6 text-midnight-700">
                  {a}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom CTA strip */}
          <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-2xl border border-midnight-100 bg-gradient-to-br from-midnight-950 to-midnight-800 p-6 sm:p-8">
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-500">
                  Still have questions?
                </p>
                <h3 className="font-display mt-1 text-xl font-bold text-white sm:text-2xl">
                  Let's talk it through
                </h3>
                <p className="mt-1 text-sm text-midnight-300">
                  Real answers from real people — no bots, no waiting.
                </p>
              </div>
              <a
                href="#contact-form"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-bold text-midnight-950 transition hover:bg-gold-400"
              >
                Send a message
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}