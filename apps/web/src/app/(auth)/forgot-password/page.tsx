"use client";

import Link from "next/link";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { AuthFormWrapper } from "@/components/auth/AuthFormWrapper";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReset = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setSent(true);
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  return (
    <AuthFormWrapper
      title="Reset your password"
      subtitle="Enter your email to receive a password recovery link."
    >
      {sent ? (
        <div className="space-y-4 text-sm">
          <p className="rounded border border-emerald-800/40 bg-emerald-950/20 p-4 text-emerald-300">
            If an account with that email exists, a password reset link has been
            sent. The link expires in 1 hour.
          </p>
          <div className="flex justify-between text-xs text-slate-400">
            <Link href="/login" className="hover:text-slate-200">
              Back to sign in
            </Link>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-sky-400 hover:underline"
            >
              Send another link
            </button>
          </div>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!email.trim()) return;
            requestReset.mutate({ email: email.trim() });
          }}
        >
          <label className="block text-sm">
            <span className="mb-1 block text-slate-400">Email address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={requestReset.isPending}
            className="w-full rounded bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-50"
          >
            {requestReset.isPending ? "Sending link…" : "Send reset link"}
          </button>

          <p className="text-center text-xs text-slate-400">
            Remembered your password?{" "}
            <Link href="/login" className="text-sky-400 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthFormWrapper>
  );
}
