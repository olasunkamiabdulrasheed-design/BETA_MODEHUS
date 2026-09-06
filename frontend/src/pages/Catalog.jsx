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
  const [count, setCount] = useState(0);

  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const sort = params.get("sort") || "newest";
  const page = Number(params.get("page")) || 1;
  const PAGE_SIZE = 24;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  useEffect(() => {
    api.get("/categories/").then((res) => setCategories(res.data.results || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const search = new URLSearchParams();
    if (q) search.set("search", q);
    if (category) search.set("category", category);
    if (sort) search.set("sort", sort);
    search.set("page_size", String(PAGE_SIZE));
    search.set("page", String(page));
    api
      .get(`/products/?${search.toString()}`)
      .then((res) => {
        setProducts(res.data.results || []);
        setCount(res.data.count || 0);
        setError("");
      })
      .catch(() => setError("Could not load products."))
      .finally(() => setLoading(false));
  }, [q, category, sort, page]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setParams(next);
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(params);
    next.set("page", String(p));
    setParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNumbers = () => {
    const pages = [];
    const windowSize = 2;
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - page) <= windowSize) {
        pages.push(p);
      } else if (pages[pages.length - 1] !== "…") {
        pages.push("…");
      }
    }
    return pages;
  };

  return (
    <div className="container-bm py-12 sm:py-16">
      <h1 className="font-display text-4xl font-bold tracking-tight text-midnight-950 sm:text-5xl">Shop</h1>
      <p className="mt-1 text-sm text-midnight-700">
        {category
          ? categories.find((c) => c.slug === category)?.name || "Category"
          : q
            ? `Results for "${q}"`
            : "All products"}
      </p>

      <div className="mt-8 flex flex-wrap gap-3 rounded-2xl border border-black/5 bg-white p-3 shadow-soft">
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

      {!loading && !error && count > 0 && (
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="btn-outline !px-3 !py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Prev
          </button>
          {totalPages > 1 &&
            pageNumbers().map((p, i) =>
              p === "…" ? (
                <span key={`gap-${i}`} className="px-1 text-midnight-500">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    p === page
                      ? "bg-midnight-900 text-gold-400"
                      : "bg-white text-midnight-700 hover:bg-midnight-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="btn-outline !px-3 !py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
          <span className="w-full pt-1 text-center text-xs text-midnight-500">
            Page {page} of {totalPages} · {count} product{count === 1 ? "" : "s"}
          </span>
        </nav>
      )}
    </div>
  );
}