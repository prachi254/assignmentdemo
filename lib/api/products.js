const API_URL = "https://dummyjson.com";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Product request failed.");
    error.status = response.status;
    throw error;
  }
  return data;
}

export function fetchProductById(id, signal) { return request(`/products/${id}`, { signal }); }
export function fetchCategories() { return request("/products/categories"); }
export function createProduct(product) { return request("/products/add", { method: "POST", body: JSON.stringify(product) }); }
export function updateProduct(id, product) { return request(`/products/${id}`, { method: "PUT", body: JSON.stringify(product) }); }
export function deleteProduct(id) { return request(`/products/${id}`, { method: "DELETE" }); }
