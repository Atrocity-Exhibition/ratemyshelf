"use client";

import { useState } from "react";

type FilterChipItem = { name: string; slug: string };

export function FilterChips({
  title,
  items,
  selected,
  onChange,
}: {
  title: string;
  items: FilterChipItem[];
  selected: string[];
  onChange: (slugs: string[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 8);

  if (!items.length) return null;

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
        {title}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((item) => {
          const active = selected.includes(item.slug);
          return (
            <button
              key={item.slug}
              type="button"
              aria-pressed={active}
              onClick={() =>
                onChange(
                  active
                    ? selected.filter((slug) => slug !== item.slug)
                    : [...selected, item.slug],
                )
              }
              className={`rounded-full border px-2 py-1 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                active
                  ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500"
                  : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-500"
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </div>
      {items.length > 8 && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-[11px] font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
        >
          {expanded ? "Show less" : `Show ${items.length - 8} more`}
        </button>
      )}
    </div>
  );
}
