"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProductForm from "@/components/ProductForm";
import { useAuth } from "@/context/AuthContext";
import { fetchCategories, fetchProductById, updateProduct } from "@/lib/api/products";
import { getStoredProduct, storeProductEdit } from "@/lib/productStore";

export default function EditProductPage() {
  const { status } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => { if (status === "guest") router.replace("/login"); }, [status, router]);
  useEffect(() => {
    if (status !== "authenticated") return undefined;
    const stored = getStoredProduct(params.id);
    if (stored?.deleted) { setState("not-found"); return undefined; }
    Promise.all([stored?.product ? Promise.resolve(stored.product) : fetchProductById(params.id), fetchCategories()]).then(([item, categoryList]) => { setProduct({ ...item, ...(stored?.edits || {}) }); setCategories(categoryList); setState("ready"); }).catch((requestError) => { setError(requestError.message); setState(requestError.status === 404 ? "not-found" : "error"); });
  }, [status, params.id]);

  if (status !== "authenticated") return null;
  async function handleSubmit(values) { await updateProduct(params.id, values); storeProductEdit(params.id, values); router.push(`/products/${params.id}`); }

  return <><Navbar /><main className="mx-auto max-w-6xl px-4 py-6 sm:px-6"><Link href="/products" className="text-sm text-ink/60 hover:underline">Back to products</Link>{state === "loading" && <p className="py-16 text-center text-sm text-ink/60">Loading product...</p>}{state === "not-found" && <div className="py-16 text-center"><h1 className="text-xl font-semibold text-ink">Product not found</h1><Link href="/products" className="mt-4 inline-block text-sm text-accent underline">Back to products</Link></div>}{state === "error" && <p className="mt-5 rounded-md bg-warn/10 p-4 text-sm text-warn">{error}</p>}{state === "ready" && product && <><h1 className="mt-4 text-2xl font-semibold text-ink">Edit product</h1><div className="mt-5"><ProductForm initialValues={product} categories={categories} submitLabel="Save changes" onSubmit={handleSubmit} /></div></>}</main></>;
}
