import { useState } from "react";
import { api } from "../api/client.js";

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "" };

const DETAILS = [
  ["WhatsApp", "07012124050", "https://wa.me/2347012124050"],
  ["Call", "08077063971", "tel:08077063971"],
  ["Email", "betamodehus@gmail.com", "mailto:betamodehus@gmail.com"],
  ["Location", "Ibadan South-East, Oyo State, Nigeria", ""],
];

export default function ContactSection() {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const set =
    (key) =>
    (e) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/contact/", form);
      setSent(true);
      setForm(EMPTY);
    } catch {
      setError("Could not send your message. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="contact" className="bg-white py-20">
      <div className="container-bm grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* INFO */}
        <div>
          <p className="eyebrow">Get in touch</p>
          <h2 className="font-display mt-2 text-3xl font-bold text-midnight-950 sm:text-4xl">
            Let's talk about your next piece
          </h2>
          <p className="mt-4 leading-relaxed text-midnight-700">
            Questions about sizing, a piece you've seen, or a bespoke order?
            Reach us any way you like — we reply within 24 hours, Monday to
            Saturday, 9am — 7pm.
          </p>

          <dl className="mt-8 space-y-4">
            {DETAILS.map(([k, v, href]) => (
              <div key={k} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-2.5 w-2.5 shrink-0 rounded-full bg-gold-500" />
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-midnight-500">
                    {k}
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-midnight-900">
                    {href ? (
                      <a
                        href={href}
                        className="text-gold-700 hover:text-gold-600 hover:underline"
                      >
                        {v}
                      </a>
                    ) : (
                      v
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* FORM */}
        <div id="contact-form" className="card-bm scroll-mt-24 p-6 sm:p-8">
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-2xl font-bold text-gold-600">
                ✓
              </span>
              <h3 className="font-display mt-5 text-2xl font-bold text-midnight-950">
                Message sent
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-midnight-600">
                Thank you for reaching out. We've received your message and
                will reply to your email shortly.
              </p>
              <button
                onClick={() => setSent(false)}
                className="btn-outline mt-6"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label-bm">Full name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={set("name")}
                    className="input-bm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="label-bm">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={set("email")}
                    className="input-bm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label-bm">Phone</label>
                  <input
                    value={form.phone}
                    onChange={set("phone")}
                    className="input-bm"
                    placeholder="08012345678"
                  />
                </div>
                <div>
                  <label className="label-bm">Subject *</label>
                  <input
                    required
                    value={form.subject}
                    onChange={set("subject")}
                    className="input-bm"
                    placeholder="Order, sizing, bespoke..."
                  />
                </div>
              </div>

              <div>
                <label className="label-bm">Message *</label>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={set("message")}
                  className="input-bm"
                  placeholder="Tell us how we can help..."
                />
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button type="submit" disabled={busy} className="btn-gold w-full !py-3">
                {busy ? "Sending..." : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}