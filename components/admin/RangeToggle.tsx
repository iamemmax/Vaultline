import { cn } from "@/lib/utils/cn";

export type RangeDays = 7 | 14 | 30 | 90;

interface RangeToggleProps<T extends number = RangeDays> {
  value: T;
  onChange: (value: T) => void;
  options?: { value: T; label: string }[];
}

const DEFAULT_OPTIONS: { value: RangeDays; label: string }[] = [
  { value: 7, label: "7D" },
  { value: 30, label: "30D" },
  { value: 90, label: "90D" },
];

export function RangeToggle<T extends number = RangeDays>({
  value,
  onChange,
  options,
}: RangeToggleProps<T>) {
  const opts = (options ?? DEFAULT_OPTIONS) as { value: T; label: string }[];
  return (
    <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5">
      {opts.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded px-2.5 py-1 text-xs font-medium transition-colors",
            value === opt.value
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
