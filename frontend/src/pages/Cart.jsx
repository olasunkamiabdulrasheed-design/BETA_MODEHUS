import { Link } from "react-router-dom";
import { currency } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const { items, itemCount, subtotal, updateQty, remove, loading } = useCart();
  const { user } = useAuth();

  if (loading) return <div className="container-bm py-16 text-center">Loading cart…</div>;

  return (
    <div className="container-bm py-12 sm:py-16">
      <h1 className="font-display text-4xl font-bold text-midnight-950 sm:text-5xl">
        Your cart
        {itemCount > 0 && (
          <span className="ml-2 text-lg font-normal text-midnight-700">
            ({itemCount} item{itemCount > 1 ? "s" : ""})
          </span>
        )}
      </h1>

      {items.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-midnight-700">Your cart is empty.</p>
          <Link to="/products" className="btn-gold mt-4">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-lg border border-midnight-100 bg-white p-4"
              >
                <Link to={`/products/${item.product_slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-midnight-50">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl text-midnight-300">✦</div>
                  )}
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/products/${item.product_slug}`} className="font-medium text-midnight-900 hover:text-gold-600">
                        {item.product_name}
                      </Link>
                      <div className="mt-0.5 text-xs text-midnight-700">
                        {[item.color, item.size].filter(Boolean).join(" · ") || "Default"} · {item.sku}
                      </div>
                    </div>
                    <button
                      onClick={() => remove(item.id)}
                      className="text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} className="btn-outline !px-2.5 !py-1">
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQty(item.id, Number(e.target.value) || 1)}
                        className="input-bm w-16 text-center"
                      />
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} className="btn-outline !px-2.5 !py-1">
                        +
                      </button>
                    </div>
                    <span className="font-semibold text-midnight-900">{currency(item.line_total)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-lg border border-midnight-100 bg-white p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-lg font-bold text-midnight-900">Order summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-midnight-700">
                <span>Subtotal</span>
                <span className="font-medium text-midnight-900">{currency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-midnight-700">
                <span>Delivery</span>
                <span className="text-midnight-700">Calculated at checkout</span>
              </div>
              <div className="flex justify-between border-t border-midnight-100 pt-3 text-base font-bold text-midnight-900">
                <span>Estimated total</span>
                <span>{currency(subtotal)}</span>
              </div>
            </div>

            {user ? (
              <Link to="/checkout" className="btn-gold mt-5 w-full">
                Proceed to checkout
              </Link>
            ) : (
              <div className="mt-5">
                <Link to="/login" className="btn-gold w-full">
                  Login to checkout
                </Link>
                <p className="mt-2 text-center text-xs text-midnight-700">
                  Your items are saved. Login or{" "}
                  <Link to="/signup" className="text-gold-600">
                    sign up
                  </Link>{" "}
                  to place your order.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}