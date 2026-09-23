"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      const from = searchParams.get("from");
      router.replace(from && from.startsWith("/products") ? from : "/products");
    } catch (err) {
      setError(err?.message || "Login failed. Check your username and password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-ink">Product Admin</h1>
        <p className="mt-1 text-sm text-ink/60">Sign in to manage products.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          {error && (
            <p className="rounded-md bg-warn/10 px-3 py-2 text-sm text-warn">{error}</p>
          )}

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink/80">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              className="rounded-md border border-line px-3 py-2 text-sm focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink/80">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="rounded-md border border-line px-3 py-2 text-sm focus:border-accent"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accentDark disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-xs text-ink/50">
          Demo credentials: <span className="font-mono">emilys</span> /{" "}
          <span className="font-mono">emilyspass</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
