export default function StatTile({
  label,
  value,
  unit,
  colour,
  hint,
}: {
  label: string;
  value: string;
  unit?: string;
  colour: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg-secondary p-4 transition-colors hover:border-border-hover">
      <p className="text-xs font-mono uppercase tracking-wider text-text-muted">{label}</p>
      <p className="mt-2 whitespace-nowrap font-mono text-xl font-bold tabular-nums sm:text-2xl" style={{ color: colour }}>
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-text-muted">{unit}</span>}
      </p>
      {hint && <p className="mt-1 text-xs font-mono text-text-muted">{hint}</p>}
    </div>
  );
}
