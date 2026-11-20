"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { trpc } from "@/trpc/client";
import { AuthFormWrapper } from "@/components/auth/AuthFormWrapper";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  if (!token) {
    return (
      <div className="space-y-4 text-sm">
        <p className="rounded border border-red-900/40 bg-red-950/20 p-4 text-red-300">
          No reset token was found in the link. Please request a new password
          reset.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block text-sky-400 hover:underline"
        >
          Request new reset link →
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4 text-sm">
        <p className="rounded border border-emerald-900/40 bg-emerald-950/20 p-4 text-emerald-300">
          Your password has been reset successfully. You can now sign in with
          your new password.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-950 shadow-sm shadow-sky-500/20 transition hover:bg-sky-400"
        >
          Sign in →
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        if (password.length < 8) {
          setError("Password must be at least 8 characters long.");
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        resetMutation.mutate({
          token,
          newPassword: password,
        });
      }}
    >
      <label className="block text-sm">
        <span className="mb-1 block text-slate-400">New password</span>
        <input
          type="password"
          required
          minLength={8}
          maxLength={72}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-slate-400">Confirm new password</span>
        <input
          type="password"
          required
          minLength={8}
          maxLength={72}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        />
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={resetMutation.isPending}
        className="w-full rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm shadow-sky-500/20 transition hover:bg-sky-400 hover:shadow-sky-500/30 active:scale-[0.98] disabled:opacity-50"
      >
        {resetMutation.isPending ? "Updating password…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthFormWrapper
      title="Create new password"
      subtitle="Enter and confirm your new account password."
    >
      <Suspense fallback={<p className="text-sm text-slate-400">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthFormWrapper>
  );
}
