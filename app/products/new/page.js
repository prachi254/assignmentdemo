"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProductForm from "@/components/ProductForm";
import { useAuth } from "@/context/AuthContext";
import { createProduct, fetchCategories } from "@/lib/api/products";
import { storeAddedProduct } from "@/lib/productStore";

export default function NewProductPage() {
  const { status } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  useEffect(() => { if (status === "guest") router.replace("/login"); }, [status, router]);
  useEffect(() => { if (status === "authenticated") fetchCategories().then(setCategories).catch(() => setCategories([])); }, [status]);
  if (status !== "authenticated") return null;

  async function handleSubmit(product) {
    const created = await createProduct(product);
    storeAddedProduct({ ...product, ...created, thumbnail: product.thumbnail || created.thumbnail });
    router.push("/products");
  }

  return <><Navbar /><main className="mx-auto max-w-6xl px-4 py-6 sm:px-6"><Link href="/products" className="text-sm text-ink/60 hover:underline">Back to products</Link><h1 className="mt-4 text-2xl font-semibold text-ink">Add product</h1><div className="mt-5"><ProductForm categories={categories} submitLabel="Add product" onSubmit={handleSubmit} /></div></main></>;
}
