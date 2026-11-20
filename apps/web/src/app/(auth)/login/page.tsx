"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { AuthFormWrapper } from "@/components/auth/AuthFormWrapper";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <AuthFormWrapper title="Sign in" subtitle="Access your shelves and reviews.">
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError(null);

          const callbackUrl =
            new URLSearchParams(window.location.search).get("callbackUrl") ??
            "/dashboard";

          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl,
          });

          setPending(false);

          if (result?.error) {
            setError("Invalid email or password.");
            return;
          }

          window.location.href = result?.url ?? callbackUrl;
        }}
      >
        <label className="block text-sm">
          <span className="mb-1 block text-slate-400">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-slate-400">Password</span>
            <Link
              href="/forgot-password"
              className="text-xs text-sky-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        {error && (
          <div className="space-y-1 text-sm">
            <p className="text-red-400">{error}</p>
            <p className="text-slate-400">
              If your email is not verified, <Link href="/verify-email">verify it here</Link>.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-sky-500 px-4 py-2 font-medium text-slate-950 disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-slate-400">
        No account? <Link href="/register">Register</Link>
      </p>
    </AuthFormWrapper>
  );
}
