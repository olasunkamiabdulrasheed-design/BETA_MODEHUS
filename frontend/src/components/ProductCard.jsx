import { Link } from "react-router-dom";
import { currency } from "../api/client.js";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group overflow-hidden rounded-lg border border-midnight-100 bg-white shadow-sm transition hover:shadow-lg"
    >
      <div className="aspect-square w-full overflow-hidden bg-midnight-50">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            <span className="text-midnight-300">✦</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gold-600">
          {product.category}
        </div>
        <h3 className="mt-1 line-clamp-1 font-medium text-midnight-900">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold text-midnight-900">
            {currency(product.min_price || product.price)}
          </span>
          {product.is_available ? (
            <span className="text-xs font-medium text-emerald-600">In stock</span>
          ) : (
            <span className="text-xs font-medium text-red-500">Sold out</span>
          )}
        </div>
      </div>
    </Link>
  );
}