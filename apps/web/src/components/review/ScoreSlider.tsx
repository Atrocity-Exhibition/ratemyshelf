"use client";

export function ScoreSlider({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block space-y-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
          {value}/{max}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-emerald-500 cursor-pointer"
      />
    </label>
  );
}
