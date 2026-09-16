import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-24 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/40 bg-midnight-950/90 text-gold-400 shadow-lg backdrop-blur transition hover:bg-gold-500 hover:text-midnight-950"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}