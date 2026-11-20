"use client";

import Image from "next/image";
import { useState, useRef } from "react";

export function ImageUpload({
  value,
  onChange,
  folder = "covers",
  label = "Cover image",
}: {
  value?: string;
  onChange: (url: string) => void;
  folder?: "covers" | "avatars";
  label?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"file" | "url">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
        <span>{label}</span>
        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "file" ? "url" : "file"));
            setError(null);
          }}
          className="text-xs text-neutral-600 hover:underline dark:text-neutral-400"
        >
          {mode === "file" ? "Or enter URL" : "Or upload file"}
        </button>
      </div>

      {mode === "file" ? (
        <div className="flex items-start gap-4">
          <div className="relative flex aspect-[3/4] w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            {value ? (
              <Image
                src={value}
                alt="Uploaded preview"
                fill
                sizes="96px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="px-2 text-center text-[10px] font-semibold uppercase text-neutral-400">
                No image
              </span>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              disabled={isUploading}
              className="block w-full text-xs text-neutral-600 file:mr-3 file:rounded file:border-0 file:bg-neutral-200 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-neutral-800 hover:file:bg-neutral-300 dark:text-neutral-400 dark:file:bg-neutral-800 dark:file:text-neutral-200 dark:hover:file:bg-neutral-700"
            />
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              JPEG, PNG, WebP or GIF up to 5MB.
            </p>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-xs text-rose-600 hover:underline dark:text-rose-400"
              >
                Remove image
              </button>
            )}
            {isUploading && (
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Uploading image…
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/cover.jpg"
            className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-md border border-neutral-300 px-3 py-2 text-xs text-rose-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-rose-400 dark:hover:bg-neutral-800"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
