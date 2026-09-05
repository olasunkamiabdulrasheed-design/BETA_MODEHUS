import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

const SORT_OPTIONS = [
  ["newest", "Newest"],
  ["price_low", "Price: low to high"],
  ["price_high", "Price: high to low"],
  ["top_rated", "Top rated"],
];

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const sort = params.get("sort") || "newest";

  useEffect(() => {
    api.get("/categories/").then((res) => setCategories(res.data.results || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const search = new URLSearchParams();
    if (q) search.set("search", q);
    if (category) search.set("category", category);
    if (sort) search.set("sort", sort);
    search.set("page_size", "24");
    api
      .get(`/products/?${search.toString()}`)
      .then((res) => {
        setProducts(res.data.results || []);
        setError("");
      })
      .catch(() => setError("Could not load products."))
      .finally(() => setLoading(false));
  }, [q, category, sort]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setParams(next);
  };

  return (
    <div className="container-bm py-10">
      <h1 className="font-display text-3xl font-bold text-midnight-900">Shop</h1>
      <p className="mt-1 text-sm text-midnight-700">
        {category
          ? categories.find((c) => c.slug === category)?.name || "Category"
          : q
            ? `Results for "${q}"`
            : "All products"}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setParam("q", e.target.value)}
          placeholder="Search products…"
          className="input-bm max-w-xs"
        />
        <select
          value={category}
          onChange={(e) => setParam("category", e.target.value)}
          className="input-bm w-auto"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="input-bm w-auto"
        >
          {SORT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-6 text-sm text-red-500">{error}</p>}
      {loading && <p className="mt-8 text-midnight-700">Loading…</p>}

      {!loading && !error && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="mt-8 text-midnight-700">No products match your search.</p>
      )}
    </div>
  );
}