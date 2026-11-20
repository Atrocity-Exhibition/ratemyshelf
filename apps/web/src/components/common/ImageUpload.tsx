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
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "file" ? "url" : "file"));
            setError(null);
          }}
          className="text-xs text-sky-400 hover:underline"
        >
          {mode === "file" ? "Or enter URL" : "Or upload file"}
        </button>
      </div>

      {mode === "file" ? (
        <div className="flex items-start gap-4">
          <div className="relative flex aspect-[3/4] w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/60 shadow-sm">
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
              <span className="px-2 text-center text-xs text-slate-500">
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
              className="block w-full text-xs text-slate-400 file:mr-3 file:rounded file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-200 hover:file:bg-slate-700"
            />
            <p className="text-xs text-slate-500">
              JPEG, PNG, WebP or GIF up to 5MB.
            </p>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-xs text-red-400 hover:underline"
              >
                Remove image
              </button>
            )}
            {isUploading && (
              <p className="text-xs text-sky-400">Uploading image…</p>
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
            className="flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded border border-slate-700 px-3 py-2 text-xs text-red-400 hover:bg-slate-800"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
