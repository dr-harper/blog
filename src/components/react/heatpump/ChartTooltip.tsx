type Entry = { name: string; value: number | null; color: string; unit?: string };

export default function ChartTooltip({
  active,
  payload,
  label,
  labelFormat,
}: {
  active?: boolean;
  payload?: Entry[];
  label?: number;
  labelFormat: (ms: number) => string;
}) {
  if (!active || !payload?.length || label === undefined) return null;
  return (
    <div
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: '10px 14px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
      }}
    >
      <p style={{ color: 'var(--color-text-primary)', marginBottom: 4 }}>{labelFormat(label)}</p>
      {payload
        .filter((e) => e.value !== null && e.value !== undefined)
        .map((e) => (
          <p key={e.name} style={{ color: e.color, margin: 0 }}>
            {e.name}: {Number(e.value).toFixed(e.unit === 'kW' ? 2 : 1)} {e.unit ?? ''}
          </p>
        ))}
    </div>
  );
}
