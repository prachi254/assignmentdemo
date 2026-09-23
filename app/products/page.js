"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

export default function ProductsPage() {
  const { status } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "guest") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return undefined;
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("https://dummyjson.com/products?limit=30", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Could not load products.");

        const data = await response.json();
        setProducts(data.products || []);
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

  if (status !== "authenticated") return null;

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <h1 className="text-xl font-semibold text-ink">Products</h1>

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
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">{product.title}</td>
                    <td className="px-4 py-3 capitalize text-ink/70">{product.category}</td>
                    <td className="px-4 py-3">${product.price}</td>
                    <td className="px-4 py-3">{Number(product.rating).toFixed(1)}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
