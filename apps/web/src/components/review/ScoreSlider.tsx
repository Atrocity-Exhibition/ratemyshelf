"use client";

export function ScoreSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="flex justify-between">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold text-amber-400">★ {value}/10</span>
      </span>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-sky-400 cursor-pointer"
      />
    </label>
  );
}
