import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);
const GUEST_KEY = "bm_cart";

function readGuest() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeGuest(items) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}

function guestItem(product, variant, quantity) {
  const unit_price = Number(variant.effective_price ?? variant.price ?? product.price ?? 0);
  return {
    id: variant.id,
    variant: variant.id,
    quantity,
    product_id: product.id,
    product_name: product.name,
    product_slug: product.slug,
    product_image: product.primary_image || null,
    size: variant.size || "",
    color: variant.color || "",
    sku: variant.sku || "",
    unit_price,
    line_total: unit_price * quantity,
    in_stock: (variant.stock ?? 0) > 0,
    max_stock: variant.stock ?? 0,
  };
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const loggedIn = Boolean(user);
  const [items, setItems] = useState(() => (loggedIn ? [] : readGuest()));
  const [loading, setLoading] = useState(false);
  const prevLoggedIn = useRef(loggedIn);

  // load backend cart on login (merging any guest cart first)
  useEffect(() => {
    if (!user) {
      setItems(readGuest());
      return;
    }
    let active = true;
    const load = async () => {
      setLoading(true);
      const guest = readGuest();
      try {
        if (guest.length) {
          await api.post("/cart/merge/", {
            items: guest.map((g) => ({ variant_id: g.variant, quantity: g.quantity })),
          });
          writeGuest([]);
        }
        const res = await api.get("/cart/");
        if (active) setItems(res.data.items || []);
      } catch {
        /* keep whatever we have */
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (prevLoggedIn.current && !loggedIn) setItems(readGuest());
    prevLoggedIn.current = loggedIn;
  }, [loggedIn]);

  const refetch = useCallback(async () => {
    if (!loggedIn) {
      setItems(readGuest());
      return;
    }
    const res = await api.get("/cart/");
    setItems(res.data.items || []);
  }, [loggedIn]);

  const addItem = useCallback(
    async (product, variant, quantity = 1) => {
      if (!loggedIn) {
        const stock = variant.stock ?? 0;
        const current = readGuest();
        const idx = current.findIndex((g) => g.variant === variant.id);
        const next = current.slice();
        if (idx >= 0) {
          const qty = Math.min(stock, next[idx].quantity + quantity);
          next[idx] = { ...next[idx], quantity: qty, line_total: next[idx].unit_price * qty };
        } else {
          if (quantity > stock) throw new Error(`Only ${stock} units available.`);
          next.push(guestItem(product, variant, quantity));
        }
        writeGuest(next);
        setItems([...next]);
        return;
      }
      await api.post("/cart/", { variant_id: variant.id, quantity });
      await refetch();
    },
    [loggedIn, refetch]
  );

  const updateQty = useCallback(
    async (id, quantity) => {
      if (quantity < 1) return;
      if (!loggedIn) {
        const current = readGuest();
        const next = current.map((g) => {
          if (g.variant !== id) return g;
          const qty = Math.min(g.max_stock || quantity, quantity);
          return { ...g, quantity: qty, line_total: g.unit_price * qty };
        });
        writeGuest(next);
        setItems([...next]);
        return;
      }
      try {
        await api.patch(`/cart/items/${id}/`, { quantity });
      } catch {
        /* server caps automatically */
      }
      await refetch();
    },
    [loggedIn, refetch]
  );

  const remove = useCallback(
    async (id) => {
      if (!loggedIn) {
        const next = readGuest().filter((g) => g.variant !== id);
        writeGuest(next);
        setItems([...next]);
        return;
      }
      await api.delete(`/cart/items/${id}/remove/`);
      await refetch();
    },
    [loggedIn, refetch]
  );

  const clear = useCallback(async () => {
    if (!loggedIn) {
      writeGuest([]);
      setItems([]);
      return;
    }
    await api.post("/cart/clear/");
    setItems([]);
  }, [loggedIn]);

  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);
  const subtotal = items.reduce((sum, it) => sum + Number(it.line_total || 0), 0);

  return (
    <CartContext.Provider
      value={{ items, loading, itemCount, subtotal, addItem, updateQty, remove, clear, loggedIn }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}