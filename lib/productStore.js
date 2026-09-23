const STORAGE_KEY = "assignment_product_changes";
const emptyState = { added: [], edited: {}, deleted: [] };

function read() {
  if (typeof window === "undefined") return emptyState;
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return value ? { ...emptyState, ...value } : emptyState;
  } catch {
    return emptyState;
  }
}

function write(value) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function applyProductChanges(products) {
  const state = read();
  const updated = products.filter((product) => !state.deleted.includes(product.id)).map((product) => ({ ...product, ...(state.edited[product.id] || {}) }));
  return [...state.added, ...updated];
}

export function getStoredProduct(id) {
  const state = read();
  if (state.deleted.includes(Number(id))) return { deleted: true };
  const added = state.added.find((product) => product.id === Number(id));
  if (added) return { product: added };
  const edits = state.edited[id];
  return edits ? { edits } : null;
}

export function storeAddedProduct(product) {
  const state = read();
  write({ ...state, added: [{ ...product, __local: true }, ...state.added] });
}

export function storeProductEdit(id, fields) {
  const state = read();
  const added = state.added.some((product) => product.id === Number(id));
  if (added) write({ ...state, added: state.added.map((product) => product.id === Number(id) ? { ...product, ...fields } : product) });
  else write({ ...state, edited: { ...state.edited, [id]: { ...(state.edited[id] || {}), ...fields } } });
}

export function removeStoredProduct(id) {
  const state = read();
  write({ ...state, added: state.added.filter((product) => product.id !== Number(id)), deleted: [...new Set([...state.deleted, Number(id)])] });
}
