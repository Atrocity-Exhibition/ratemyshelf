"use client";

import { useState } from "react";
import Image from "next/image";
import { trpc } from "@/trpc/client";
import { ImageUpload } from "@/components/common/ImageUpload";

export function ProfileSettings({
  initialUser,
}: {
  initialUser: {
    id: string;
    username: string;
    email: string;
    avatarUrl: string | null;
    bio: string | null;
    role: string;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatarUrl ?? "");
  const [bio, setBio] = useState(initialUser.bio ?? "");
  const [notice, setNotice] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const update = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      setNotice("Profile updated successfully.");
      setIsOpen(false);
      void utils.auth.me.invalidate();
    },
    onError: (err) => setNotice(err.message),
  });

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-[#16171c]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={initialUser.username}
                fill
                sizes="48px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-neutral-500 dark:text-neutral-400">
                {initialUser.username.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {initialUser.username}
              </span>
              <span className="rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400">
                {initialUser.role}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{initialUser.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsOpen((v) => !v);
            setNotice(null);
          }}
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-500"
        >
          {isOpen ? "Close settings" : "Edit profile"}
        </button>
      </div>

      {initialUser.bio && !isOpen && (
        <p className="mt-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
          {initialUser.bio}
        </p>
      )}

      {notice && (
        <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {notice}
        </p>
      )}

      {isOpen && (
        <form
          className="mt-4 space-y-4 border-t border-neutral-100 pt-4 dark:border-neutral-800"
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate({
              avatarUrl,
              bio,
            });
          }}
        >
          <ImageUpload
            label="Avatar image"
            folder="avatars"
            value={avatarUrl}
            onChange={setAvatarUrl}
          />

          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            <span className="mb-1 block">Bio (max 500 chars)</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Tell others what webnovels and genres you enjoy reading…"
              className="w-full rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={update.isPending}
              className="rounded-md bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              {update.isPending ? "Saving…" : "Save profile"}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
