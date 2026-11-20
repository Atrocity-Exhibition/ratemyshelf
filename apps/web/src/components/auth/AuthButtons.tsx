"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data, status } = useSession();

  if (status === "loading") return null;

  if (!data?.user) {
    return (
      <>
        <Link
          href="/login"
          className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-sky-500 px-3.5 py-1.5 text-sm font-semibold text-slate-950 shadow-sm shadow-sky-500/20 transition-all hover:bg-sky-400 hover:shadow-sky-500/30 active:scale-[0.98]"
        >
          Register
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href={`/users/${data.user.name ?? ""}`}
        className="text-sm font-medium text-slate-300 transition-colors hover:text-sky-300"
      >
        {data.user.name}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800 hover:text-white"
      >
        Sign out
      </button>
    </>
  );
}
