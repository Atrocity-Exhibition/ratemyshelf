"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { trpc } from "@/trpc/client";
import { AuthFormWrapper } from "@/components/auth/AuthFormWrapper";

type State =
  | { kind: "pending" }
  | { kind: "verifying" }
  | { kind: "done"; email: string }
  | { kind: "error"; message: string };

export default function VerifyEmailPage() {
  const [state, setState] = useState<State>({ kind: "pending" });
  const [email, setEmail] = useState("");
  const [resent, setResent] = useState(false);
  const verify = trpc.auth.verifyEmail.useMutation();
  const resend = trpc.auth.resendVerification.useMutation();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setState({ kind: "pending" });
      return;
    }

    setState({ kind: "verifying" });
    verify.mutate(
      { token },
      {
        onSuccess: (result) => setState({ kind: "done", email: result.email }),
        onError: (error) => setState({ kind: "error", message: error.message }),
      },
    );
    // Run once on mount for the token in the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthFormWrapper
      title="Verify your email"
      subtitle="Confirm your address to activate the account."
    >
      {state.kind === "verifying" && (
        <p className="text-sm text-slate-400">Verifying…</p>
      )}

      {state.kind === "done" && (
        <div className="space-y-3 text-sm">
          <p className="text-emerald-400">
            {state.email} is verified. You can now sign in.
          </p>
          <Link href="/login" className="inline-block">
            Go to sign in →
          </Link>
        </div>
      )}

      {state.kind === "error" && (
        <p className="text-sm text-red-400">{state.message}</p>
      )}

      {(state.kind === "pending" || state.kind === "error") && (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!email.trim()) return;
            resend.mutate(
              { email: email.trim() },
              { onSuccess: () => setResent(true) },
            );
          }}
        >
          <label className="block text-sm">
            <span className="mb-1 block text-slate-400">
              Need a new verification link?
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={resend.isPending}
            className="rounded-md bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            {resend.isPending ? "Sending…" : "Resend link"}
          </button>
          {resent && (
            <p className="text-sm text-slate-400">
              If that address has an unverified account, a new link is on its way.
            </p>
          )}
        </form>
      )}
    </AuthFormWrapper>
  );
}
