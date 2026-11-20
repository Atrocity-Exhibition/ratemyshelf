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
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
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
              <div className="flex h-full w-full items-center justify-center font-bold text-slate-400">
                {initialUser.username.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100">
                {initialUser.username}
              </span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                {initialUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500">{initialUser.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsOpen((v) => !v);
            setNotice(null);
          }}
          className="rounded border border-slate-700 px-3 py-1.5 text-xs font-medium hover:border-slate-500"
        >
          {isOpen ? "Close settings" : "Edit profile"}
        </button>
      </div>

      {initialUser.bio && !isOpen && (
        <p className="mt-3 text-sm text-slate-300">{initialUser.bio}</p>
      )}

      {notice && <p className="mt-2 text-xs text-sky-400">{notice}</p>}

      {isOpen && (
        <form
          className="mt-4 space-y-4 border-t border-slate-800 pt-4"
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

          <label className="block text-sm">
            <span className="mb-1 block text-slate-400">Bio (max 500 chars)</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Tell others what genres and novels you enjoy reading…"
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={update.isPending}
              className="rounded bg-sky-500 px-4 py-2 text-xs font-medium text-slate-950 disabled:opacity-50"
            >
              {update.isPending ? "Saving…" : "Save profile"}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded border border-slate-700 px-3 py-2 text-xs hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
