"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data, status } = useSession();

  if (status === "loading") return null;

  if (!data?.user) {
    return (
      <>
        <Link href="/login">Sign in</Link>
        <Link
          href="/register"
          className="rounded bg-sky-500 px-3 py-1.5 font-medium text-slate-950 hover:bg-sky-400"
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
        className="text-sm text-slate-400 hover:text-slate-100"
      >
        {data.user.name}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded border border-slate-700 px-3 py-1.5 text-sm hover:border-slate-500"
      >
        Sign out
      </button>
    </>
  );
}
