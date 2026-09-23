"use client";

import { useEffect } from "react";

export default function ConfirmModal({ open, title, message, busy, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return undefined;
    function handleKey(event) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
        <h2 className="font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-ink/70">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} disabled={busy} className="rounded-md border border-line px-3 py-2 text-sm disabled:opacity-50">Cancel</button>
          <button onClick={onConfirm} disabled={busy} className="rounded-md bg-warn px-3 py-2 text-sm font-medium text-white disabled:opacity-50">{busy ? "Deleting..." : "Delete"}</button>
        </div>
      </div>
    </div>
  );
}
