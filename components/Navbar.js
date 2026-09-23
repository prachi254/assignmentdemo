"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/products" className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight text-ink">Product Admin</span>
          <span className="hidden text-xs text-ink/50 sm:inline">dummyjson demo</span>
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden text-sm text-ink/70 sm:inline">
              {user.firstName} {user.lastName}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink transition hover:border-warn hover:text-warn"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
