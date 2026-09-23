"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ConfirmModal from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";
import { deleteProduct } from "@/lib/api/products";
import { applyProductChanges } from "@/lib/productStore";
import { removeStoredProduct } from "@/lib/productStore";

export default function ProductsPage() {
  const { status } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch("https://dummyjson.com/products?limit=0", { signal: controller.signal }),
          fetch("https://dummyjson.com/products/categories", { signal: controller.signal }),
        ]);
        if (!productsResponse.ok || !categoriesResponse.ok) {
          throw new Error("Could not load products or categories.");
        }

        const productsData = await productsResponse.json();
        const categoriesData = await categoriesResponse.json();
        setProducts(applyProductChanges(productsData.products || []));
        setCategories(
          categoriesData.map((item) => (typeof item === "string" ? item : item.slug))
        );
        setLoadState("ready");
      } catch (requestError) {
        if (requestError.name === "AbortError") return;
        setError(requestError.message || "Could not load products.");
        setLoadState("error");
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [status]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesSearch = !query || product.title.toLowerCase().includes(query);
      const matchesCategory = category === "all" || product.category === category;
      return matchesSearch && matchesCategory;
    });

    return [...result].sort((first, second) => {
      if (sort === "price-asc") return first.price - second.price;
      if (sort === "price-desc") return second.price - first.price;
      if (sort === "rating-desc") return second.rating - first.rating;
      if (sort === "title-asc") return first.title.localeCompare(second.title);
      return 0;
    });
  }, [products, search, category, sort]);

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
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm sm:max-w-sm"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
            className="rounded-md border border-line bg-white px-3 py-2 text-sm"
          >
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
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

        {loadState === "ready" && visibleProducts.length === 0 && (
          <p className="mt-5 rounded-md border border-line bg-white p-8 text-center text-sm text-ink/60">
            No products found.
          </p>
        )}

        {loadState === "ready" && visibleProducts.length > 0 && (
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
                {visibleProducts.map((product) => (
                  <tr key={product.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">
                      <Link href={`/products/${product.id}`} className="flex items-center gap-3 hover:underline">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-paper">
                        <Image src={product.thumbnail} alt={product.title} fill sizes="48px" className="object-cover" />
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
      </main>
      <ConfirmModal open={!!productToDelete} title="Delete this product?" message={productToDelete ? `"${productToDelete.title}" will be removed.` : ""} busy={deleting} onConfirm={handleDelete} onCancel={() => setProductToDelete(null)} />
    </>
  );
}
