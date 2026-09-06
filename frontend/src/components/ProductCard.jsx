import { Link } from "react-router-dom";
import { currency } from "../api/client.js";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group overflow-hidden rounded-2xl border border-midnight-100 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:border-gold-500/60 hover:shadow-lift"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-midnight-50">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            <span className="text-midnight-300">✦</span>
          </div>
        )}
        <span
          className={`absolute right-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm ${
            product.is_available
              ? "bg-white/90 text-emerald-700"
              : "bg-midnight-900/80 text-white"
          }`}
        >
          {product.is_available ? "In stock" : "Sold out"}
        </span>
        {product.is_featured && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-gradient-to-b from-gold-400 to-gold-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-midnight-950 shadow-sm">
            Featured
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold-600">
          {product.category}
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-midnight-900">
          {product.name}
        </h3>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-midnight-900">
            {currency(product.min_price || product.price)}
          </span>
          <span className="text-xs text-midnight-300 transition group-hover:translate-x-0.5 group-hover:text-gold-600">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}