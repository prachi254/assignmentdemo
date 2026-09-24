"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ConfirmModal from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";
import { deleteProduct } from "@/lib/api/products";
import { applyProductChanges } from "@/lib/productStore";
import { removeStoredProduct } from "@/lib/productStore";

const PAGE_SIZES = [10, 20, 50];

function isValidImageUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export default function ProductsPage() {
  const { status } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === "guest") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return undefined;
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const query = new URLSearchParams({
          limit: String(pageSize),
          skip: String((page - 1) * pageSize),
        });
        let endpoint = "/products";
        if (search.trim()) {
          endpoint = "/products/search";
          query.set("q", search.trim());
        } else if (category !== "all") {
          endpoint = `/products/category/${encodeURIComponent(category)}`;
        }
        if (sort) {
          query.set("sortBy", sort.startsWith("title") ? "title" : sort.split("-")[0]);
          query.set("order", sort.endsWith("desc") ? "desc" : "asc");
        }

        const response = await fetch(`https://dummyjson.com${endpoint}?${query}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load products.");
        const data = await response.json();
        const changedProducts = applyProductChanges(data.products || []);
        const localAdded = page === 1 && !search.trim() && category === "all"
          ? changedProducts.filter((product) => product.__local)
          : [];
        setProducts([...localAdded, ...changedProducts.filter((product) => !product.__local)]);
        setTotal((data.total || 0) + localAdded.length);
        setLoadState("ready");
      } catch (requestError) {
        if (requestError.name === "AbortError") return;
        setError(requestError.message || "Could not load products.");
        setLoadState("error");
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [status, page, pageSize, search, category, sort]);

  useEffect(() => {
    if (status !== "authenticated") return undefined;
    const controller = new AbortController();
    fetch("https://dummyjson.com/products/categories", { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => setCategories(data.map((item) => (typeof item === "string" ? item : item.slug))))
      .catch((requestError) => { if (requestError.name !== "AbortError") setCategories([]); });
    return () => controller.abort();
  }, [status]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const firstPage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, index) => firstPage + index);

  async function handleDelete() {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      if (!productToDelete.__local) await deleteProduct(productToDelete.id);
      removeStoredProduct(productToDelete.id);
      setProducts((current) => current.filter((product) => product.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (requestError) {
      setError(requestError.message || "Could not delete product.");
    } finally {
      setDeleting(false);
    }
  }

  if (status !== "authenticated") return null;

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-3"><h1 className="text-xl font-semibold text-ink">Products</h1><Link href="/products/new" className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white">Add product</Link></div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Search products..."
            aria-label="Search products"
            className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm sm:max-w-sm"
          />
          <select
            value={category}
            onChange={(event) => { setCategory(event.target.value); setPage(1); }}
            aria-label="Filter by category"
            className="rounded-md border border-line bg-white px-3 py-2 text-sm"
          >
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select
            value={sort}
            onChange={(event) => { setSort(event.target.value); setPage(1); }}
            aria-label="Sort products"
            className="rounded-md border border-line bg-white px-3 py-2 text-sm"
          >
            <option value="">Default order</option>
            <option value="title-asc">Title A-Z</option>
            <option value="price-asc">Price low to high</option>
            <option value="price-desc">Price high to low</option>
            <option value="rating-desc">Rating highest first</option>
          </select>
        </div>

        {loadState === "loading" && (
          <p className="py-16 text-center text-sm text-ink/60">Loading products...</p>
        )}

        {loadState === "error" && (
          <p className="mt-5 rounded-md border border-warn/30 bg-warn/5 p-4 text-sm text-warn">
            {error}
          </p>
        )}

        {loadState === "ready" && products.length === 0 && (
          <p className="mt-5 rounded-md border border-line bg-white p-8 text-center text-sm text-ink/60">
            No products found.
          </p>
        )}

        {loadState === "ready" && products.length > 0 && (
          <div className="mt-5 overflow-x-auto rounded-lg border border-line bg-white">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-paper/60 text-ink/60">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">
                      <Link href={`/products/${product.id}`} className="flex items-center gap-3 hover:underline">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-paper">
                        {isValidImageUrl(product.thumbnail) ? (
                          <Image src={product.thumbnail} alt={product.title} fill sizes="48px" className="object-cover" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-[10px] text-ink/40">No image</span>
                        )}
                      </div>
                      {product.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 capitalize text-ink/70">{product.category}</td>
                    <td className="px-4 py-3">${product.price}</td>
                    <td className="px-4 py-3">{Number(product.rating).toFixed(1)}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><Link href={`/products/${product.id}/edit`} className="rounded-md border border-line px-2.5 py-1 text-xs font-medium hover:bg-paper">Edit</Link><button onClick={() => setProductToDelete(product)} className="rounded-md border border-warn/40 px-2.5 py-1 text-xs font-medium text-warn hover:bg-warn/10">Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {loadState === "ready" && total > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-line pt-4 text-sm text-ink/60 sm:flex-row">
            <span>Showing {from}-{to} of {total}</span>
            <div className="flex items-center gap-1">
              <label className="mr-2 flex items-center gap-2">Rows<select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-md border border-line bg-white px-2 py-1">{PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
              <button onClick={() => setPage((current) => current - 1)} disabled={page === 1} className="rounded-md border border-line px-2 py-1 disabled:opacity-40">Previous</button>
              {pageNumbers.map((number) => <button key={number} onClick={() => setPage(number)} aria-current={number === page ? "page" : undefined} className={`h-8 w-8 rounded-md ${number === page ? "bg-accent text-white" : "border border-line bg-white"}`}>{number}</button>)}
              <button onClick={() => setPage((current) => current + 1)} disabled={page >= totalPages} className="rounded-md border border-line px-2 py-1 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </main>
      <ConfirmModal open={!!productToDelete} title="Delete this product?" message={productToDelete ? `"${productToDelete.title}" will be removed.` : ""} busy={deleting} onConfirm={handleDelete} onCancel={() => setProductToDelete(null)} />
    </>
  );
}
