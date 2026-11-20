"use client";

import { useEffect, useRef } from "react";

export function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative">
      <input
        ref={ref}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search titles, aliases, genres…"
        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3.5 pr-16 text-neutral-900 placeholder:text-neutral-400 transition focus:border-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-400"
        aria-label="Search novels"
      />
      <kbd className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md border border-slate-700/80 bg-slate-800/80 px-2 py-0.5 text-xs font-mono text-slate-400">
        Ctrl K
      </kbd>
    </div>
  );
}
