"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data, status } = useSession();

  if (status === "loading") return null;

  if (!data?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="text-xs font-semibold text-neutral-700 transition hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/users/${data.user.name ?? ""}`}
        className="text-xs font-semibold text-neutral-800 transition hover:underline dark:text-neutral-200"
      >
        {data.user.name}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-500"
      >
        Sign out
      </button>
    </div>
  );
}
