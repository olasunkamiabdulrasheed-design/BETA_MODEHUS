import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, currency } from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/products/${slug}/`).catch(() => null),
      api.get(`/reviews/?product=${slug}`).catch(() => ({ data: { results: [] } })),
    ])
      .then(([p, r]) => {
        if (!p) {
          setError("Product not found.");
          return;
        }
        setProduct(p.data);
        setSelected(p.data.variants?.[0] || null);
        setReviews(r?.data?.results || []);
      })
      .catch(() => setError("Could not load product."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container-bm py-16 text-center">Loading…</div>;
  if (error || !product)
    return <div className="container-bm py-16 text-center">{error || "Not found"}.</div>;

  const variants = product.variants || [];
  const sizes = [...new Set(variants.map((v) => v.size))];
  const colors = [...new Set(variants.map((v) => v.color))];
  const images = product.images || [];
  const activeImage =
    images.find((img) => img.variant === selected?.id && img.is_primary) ||
    images.find((img) => img.variant === selected?.id) ||
    images.find((img) => img.is_primary) ||
    images[0] ||
    null;

  const getVariant = (size, color) =>
    variants.find((v) => v.size === size && v.color === color);

  const handleColor = (color) => {
    const next = getVariant(selected?.size, color) || selected;
    setSelected(next);
  };

  const handleSize = (size) => {
    const next = getVariant(size, selected?.color) || selected;
    setSelected(next);
  };

  const addToCart = async () => {
    if (!selected) return;
    try {
      await addItem(product, selected, quantity);
      setNotice(`${product.name} (${selected.color || ""} ${selected.size || ""}) added to cart.`);
    } catch (err) {
      setNotice(err.response?.data?.detail || err.message || "Could not add to cart.");
    }
  };

  return (
    <div className="container-bm py-12 sm:py-16">
      <nav className="text-sm text-midnight-700">
        <Link to="/" className="hover:text-gold-600">Home</Link>
        {" / "}
        <Link to="/products" className="hover:text-gold-600">Shop</Link>
        {" / "}
        <span className="text-midnight-900">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-[1.5rem] border border-black/5 bg-[#eeece6] shadow-soft">
          {activeImage && activeImage.image ? (
            <img src={activeImage.image} alt={product.name} className="w-full object-cover" />
          ) : (
            <div className="flex aspect-square items-center justify-center text-6xl text-midnight-300">✦</div>
          )}
          {selected?.color && (
            <div className="flex justify-center gap-3 py-3">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColor(color)}
                  title={color}
                  className={`h-6 w-6 rounded-full border-2 ${
                    selected.color === color ? "border-gold-500" : "border-midnight-300"
                  }`}
                  style={{
                    backgroundColor: selected === getVariant(selected.size, color) ? (selected.color_hex || color) : color,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
            {product.category}
          </p>
          <h1 className="font-display mt-1 text-4xl font-bold tracking-tight text-midnight-950 sm:text-5xl">
            {product.name}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-2xl font-bold text-midnight-900">
              {currency(selected?.effective_price || product.min_price)}
            </span>
            {product.rating?.rating ? (
              <span className="text-sm text-midnight-700">
                ★ {product.rating.rating} ({product.rating.count})
              </span>
            ) : null}
          </div>

          {product.short_description && (
            <p className="mt-4 text-midnight-700">{product.short_description}</p>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <span className="label-bm">Size</span>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSize(size)}
                    className={`rounded-md border px-4 py-2 text-sm ${
                      selected?.size === size
                        ? "border-gold-500 bg-gold-50 font-semibold text-gold-700"
                        : "border-midnight-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="label-bm">Color</span>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColor(color)}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      selected?.color === color
                        ? "border-gold-500 bg-gold-50 font-semibold text-gold-700"
                        : "border-midnight-300"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="label-bm">Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((n) => Math.max(1, n - 1))}
                  className="btn-outline !px-3"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="input-bm w-20 text-center"
                />
                <button
                  onClick={() => setQuantity((n) => Math.min(selected?.stock || n, n + 1))}
                  className="btn-outline !px-3"
                >
                  +
                </button>
              </div>
            </div>

            {selected && !selected.is_in_stock && (
              <p className="text-sm font-medium text-red-500">
                This option is currently out of stock.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={addToCart}
                disabled={selected && !selected.is_in_stock}
                className="btn-gold flex-1"
              >
                Add to cart
              </button>
              <a
                href={`https://wa.me/2347012124050?text=${encodeURIComponent(
                  `Hello BETA_MODEHUS, I am interested in ${product.name}${
                    selected ? ` (${selected.size || ""} ${selected.color || ""})` : ""
                  }.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
              >
                WhatsApp order
              </a>
            </div>

            {notice && (
              <p className="text-sm font-medium text-emerald-600">{notice}</p>
            )}
          </div>

          <div className="mt-6 border-t border-midnight-100 pt-4 text-sm text-midnight-700">
            <p>
              <span className="font-semibold">SKU:</span> {product.sku}
            </p>
            <p>
              <span className="font-semibold">Delivery:</span> Nationwide — flat fee, tracked
            </p>
          </div>
        </div>
      </div>

      {product.description && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-bold text-midnight-900">Description</h2>
          <p className="mt-3 whitespace-pre-line text-midnight-700">{product.description}</p>
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-display text-xl font-bold text-midnight-900">Reviews</h2>
        <ReviewForm productId={product.id} onPosted={(r) => setReviews((prev) => [r, ...prev])} />
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-midnight-700">
            No reviews yet. Share your experience after your first purchase.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-midnight-100 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-midnight-900">
                    {review.user_name}
                    {review.verified_purchase && (
                      <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                        ✓ Verified purchase
                      </span>
                    )}
                  </span>
                  <span className="text-gold-600">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                </div>
                <p className="mt-2 text-sm text-midnight-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ReviewForm({ productId, onPosted }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  if (!user) {
    return (
      <p className="mt-3 text-sm text-midnight-700">
        <Link to="/login" className="text-gold-600 underline">Login</Link> to review this product after purchase.
      </p>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const res = await api.post("/reviews/", { product: productId, rating, comment });
      setComment("");
      onPosted(res.data);
      setNotice("Thanks! Your review is live.");
    } catch (err) {
      setNotice(err.response?.data?.detail || err.response?.data?.[0] || "Could not post review.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 rounded-lg border border-midnight-100 bg-white p-4">
      {notice && <p className="mb-2 text-sm text-gold-700">{notice}</p>}
      <div className="flex items-center gap-1 text-2xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={n <= rating ? "text-gold-500" : "text-midnight-200"}
            aria-label={`${n} stars`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-midnight-700">{rating} / 5</span>
      </div>
      <textarea
        rows="3"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this piece…"
        className="input-bm mt-3 w-full"
      />
      <button type="submit" disabled={busy} className="btn-gold mt-3">
        {busy ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}