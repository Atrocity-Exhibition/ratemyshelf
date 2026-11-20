"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { AuthFormWrapper } from "@/components/auth/AuthFormWrapper";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const register = trpc.auth.register.useMutation({
    onSuccess: async (created) => {
      if (created.requiresEmailVerification) {
        setNeedsVerification(true);
        return;
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Account created, but automatic sign-in failed. Try signing in.");
        return;
      }

      window.location.href = result?.url ?? "/dashboard";
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  if (needsVerification) {
    return (
      <AuthFormWrapper
        title="Check your email"
        subtitle="We sent a verification link to activate your account."
      >
        <p className="text-sm text-slate-300">
          Open the link in the email to verify {form.email}, then sign in. Links
          expire after 24 hours.
        </p>
        <Link href="/verify-email" className="inline-block text-sm">
          Resend or verify another address →
        </Link>
      </AuthFormWrapper>
    );
  }

  return (
    <AuthFormWrapper
      title="Create an account"
      subtitle="Reviews unlock after seven days; browsing is open immediately."
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          register.mutate(form);
        }}
      >
        <label className="block text-sm">
          <span className="mb-1 block text-slate-400">Username</span>
          <input
            required
            minLength={3}
            maxLength={32}
            pattern="[a-zA-Z0-9_]+"
            value={form.username}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, username: event.target.value }))
            }
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-400">Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-400">Password</span>
          <input
            type="password"
            required
            minLength={8}
            maxLength={72}
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={register.isPending}
          className="w-full rounded-md bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          {register.isPending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-slate-400">
        Already registered? <Link href="/login">Sign in</Link>
      </p>
    </AuthFormWrapper>
  );
}
