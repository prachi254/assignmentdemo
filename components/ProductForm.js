"use client";

import { useState } from "react";

const emptyProduct = { title: "", category: "", price: "", stock: "", rating: "", description: "", thumbnail: "" };

export default function ProductForm({ initialValues = emptyProduct, categories = [], submitLabel, onSubmit }) {
  const [values, setValues] = useState({ ...emptyProduct, ...initialValues });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) { setValues((current) => ({ ...current, [field]: value })); }

  function validate() {
    const next = {};
    if (values.title.trim().length < 3) next.title = "Title must be at least 3 characters.";
    if (!values.category.trim()) next.category = "Category is required.";
    if (values.price === "" || Number(values.price) <= 0) next.price = "Price must be greater than zero.";
    if (values.stock === "" || !Number.isInteger(Number(values.stock)) || Number(values.stock) < 0) next.stock = "Stock must be a whole number of zero or more.";
    if (values.rating !== "" && (Number(values.rating) < 0 || Number(values.rating) > 5 || !/^\d+(\.\d)?$/.test(values.rating))) next.rating = "Rating must be between 0 and 5 with one decimal place.";
    if (values.thumbnail && !/^https?:\/\//i.test(values.thumbnail)) next.thumbnail = "Thumbnail must be a valid URL.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate() || saving) return;
    setSaving(true);
    setFormError("");
    try {
      await onSubmit({ ...values, title: values.title.trim(), category: values.category.trim(), price: Number(values.price), stock: Number(values.stock), rating: values.rating === "" ? 0 : Number(values.rating), description: values.description.trim(), thumbnail: values.thumbnail.trim() });
    } catch (error) {
      setFormError(error.message || "Could not save product.");
      setSaving(false);
    }
  }

  const field = (name, label, type = "text") => (
    <label className="flex flex-col gap-1 text-sm"><span className="font-medium text-ink/80">{label}</span><input type={type} value={values[name]} onChange={(event) => update(name, event.target.value)} className="rounded-md border border-line px-3 py-2" />{errors[name] && <span className="text-xs text-warn">{errors[name]}</span>}</label>
  );

  return <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4 rounded-lg border border-line bg-white p-5">
    {formError && <p className="rounded-md bg-warn/10 p-3 text-sm text-warn">{formError}</p>}
    {field("title", "Title")}
    <label className="flex flex-col gap-1 text-sm"><span className="font-medium text-ink/80">Category</span><input list="product-categories" value={values.category} onChange={(event) => update("category", event.target.value)} className="rounded-md border border-line px-3 py-2" />{errors.category && <span className="text-xs text-warn">{errors.category}</span>}<datalist id="product-categories">{categories.map((item) => <option key={item.slug || item} value={item.slug || item}>{item.name || item}</option>)}</datalist></label>
    <div className="grid gap-4 sm:grid-cols-3">{field("price", "Price", "number")}{field("stock", "Stock", "number")}{field("rating", "Rating", "number")}</div>
    {field("thumbnail", "Thumbnail URL")}
    <label className="flex flex-col gap-1 text-sm"><span className="font-medium text-ink/80">Description</span><textarea value={values.description} onChange={(event) => update("description", event.target.value)} rows={4} className="rounded-md border border-line px-3 py-2" /></label>
    <button disabled={saving} className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">{saving ? "Saving..." : submitLabel}</button>
  </form>;
}
