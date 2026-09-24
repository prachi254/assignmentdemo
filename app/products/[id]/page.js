"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ConfirmModal from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";
import { deleteProduct, fetchProductById } from "@/lib/api/products";
import { getStoredProduct, removeStoredProduct } from "@/lib/productStore";

export default function ProductDetailsPage() {
  const { status } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (status === "guest") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return undefined;
    const controller = new AbortController();
    async function load() {
      try {
        const stored = getStoredProduct(params.id);
        if (stored?.deleted) { setState("not-found"); return; }
        const response = stored?.product || await fetchProductById(params.id, controller.signal);
        const merged = { ...response, ...(stored?.edits || {}) };
        setProduct(merged);
        setState("ready");
      } catch (requestError) {
        if (requestError.name === "AbortError") return;
        if (requestError.status === 404) setState("not-found");
        else { setError(requestError.message); setState("error"); }
      }
    }
    load();
    return () => controller.abort();
  }, [status, params.id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      if (!product.__local) await deleteProduct(params.id);
      removeStoredProduct(params.id);
      router.replace("/products");
    } catch (requestError) {
      setError(requestError.message || "Could not delete product.");
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (status !== "authenticated") return null;
  return <><Navbar /><main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
    {state === "loading" && <p className="py-16 text-center text-sm text-ink/60">Loading product...</p>}
    {state === "not-found" && <div className="py-16 text-center"><h1 className="text-xl font-semibold text-ink">Product not found</h1><p className="mt-2 text-sm text-ink/60">No product exists for ID {params.id}.</p><Link href="/products" className="mt-4 inline-block text-sm font-medium text-accent underline">Back to products</Link></div>}
    {state === "error" && <p className="rounded-md bg-warn/10 p-4 text-sm text-warn">{error}</p>}
    {state === "ready" && product && <>
      <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/products" className="text-sm text-ink/60 hover:underline">Back to products</Link><div className="flex gap-2"><Link href={`/products/${product.id}/edit`} className="rounded-md border border-line px-3 py-2 text-sm">Edit</Link><button onClick={() => setConfirming(true)} className="rounded-md bg-warn px-3 py-2 text-sm text-white">Delete</button></div></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.2fr]">
        <div className="grid gap-3 sm:grid-cols-2">{(product.images || [product.thumbnail]).slice(0, 6).map((image) => <div key={image} className="relative aspect-square overflow-hidden rounded-lg border border-line bg-white"><Image src={image} alt={product.title} fill sizes="(max-width: 640px) 50vw, 320px" className="object-contain" /></div>)}</div>
        <section><p className="text-sm capitalize text-ink/60">{product.category}</p><h1 className="mt-1 text-3xl font-semibold text-ink">{product.title}</h1><p className="mt-4 text-2xl font-semibold text-accent">${product.price}</p><p className="mt-2 text-sm text-ink/70">Rating {Number(product.rating).toFixed(1)} / 5 · {product.stock} in stock</p><p className="mt-6 leading-7 text-ink/75">{product.description}</p><div className="mt-8"><h2 className="text-lg font-semibold text-ink">Reviews</h2><div className="mt-3 flex flex-col gap-3">{product.reviews?.length ? product.reviews.map((review, index) => <article key={review.id || `${review.reviewerEmail}-${review.date}-${index}`} className="rounded-md border border-line bg-white p-3"><div className="flex justify-between gap-3 text-sm"><strong>{review.reviewerName}</strong><span>{review.rating} / 5</span></div><p className="mt-1 text-sm text-ink/70">{review.comment}</p></article>) : <p className="text-sm text-ink/60">No reviews yet.</p>}</div></div></section>
      </div>
    </>}
  </main><ConfirmModal open={confirming} title="Delete this product?" message={`"${product?.title || "This product"}" will be removed.`} busy={deleting} onConfirm={handleDelete} onCancel={() => setConfirming(false)} /></>;
}
