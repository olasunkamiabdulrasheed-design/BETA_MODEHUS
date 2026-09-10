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
      <section className="bg-midnight-950 py-16 text-center text-white sm:py-20">
        <div className="container-bm">
          <p className="eyebrow !text-gold-500">Contact us</p>
          <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">
            We're here to help
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-midnight-200 sm:text-base">
            Sizing, orders, bespoke tailoring or bulk purchases — send a
            message and we'll get back to you within 24 hours.
          </p>
        </div>
      </section>

      <ContactSection />

      <section className="py-20">
        <div className="container-bm">
          <div className="text-center">
            <p className="eyebrow">Quick answers</p>
            <h2 className="font-display mt-2 text-3xl font-bold text-midnight-950 sm:text-4xl">
              Frequently asked
            </h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
            {FAQ.map(([q, a]) => (
              <div key={q} className="card-bm p-6">
                <h3 className="font-display text-lg font-bold text-midnight-950">
                  {q}
                </h3>
                <p className="mt-2 text-sm leading-6 text-midnight-700">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}