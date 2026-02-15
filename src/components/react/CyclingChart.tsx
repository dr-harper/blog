import { useState } from 'react';

const data = [
  { day: 1, distance: 181.3, elevation: 2854, label: "Land's End to Okehampton" },
  { day: 2, distance: 214.7, elevation: 2219, label: 'Okehampton to Bristol' },
  { day: 3, distance: 276.2, elevation: 1550, label: 'Bristol to Shrewsbury' },
  { day: 4, distance: 195.7, elevation: 1316, label: 'Shrewsbury to Lancaster' },
  { day: 5, distance: 207.1, elevation: 1167, label: 'Lancaster to Carlisle' },
  { day: 6, distance: 192.1, elevation: 1604, label: 'Carlisle to Glasgow' },
  { day: 7, distance: 162.9, elevation: 1248, label: 'Glasgow to Fort William' },
  { day: 8, distance: 72.9, elevation: 592, label: "Fort William to John O'Groats" },
];

type Metric = 'distance' | 'elevation';

export default function CyclingChart() {
  const [metric, setMetric] = useState<Metric>('distance');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d[metric]));
  const unit = metric === 'distance' ? 'km' : 'm';
  const total = data.reduce((sum, d) => sum + d[metric], 0);

  return (
    <div className="my-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
          Trip Summary
        </h3>
        <div className="flex gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-0.5">
          <button
            onClick={() => setMetric('distance')}
            className={`rounded px-3 py-1 font-mono text-xs transition-colors ${
              metric === 'distance'
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            Distance
          </button>
          <button
            onClick={() => setMetric('elevation')}
            className={`rounded px-3 py-1 font-mono text-xs transition-colors ${
              metric === 'elevation'
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            Elevation
          </button>
        </div>
      </div>

      <div className="mb-3 text-right font-mono text-xs text-[var(--color-text-muted)]">
        Total: {total.toLocaleString()} {unit}
      </div>

      <div className="space-y-2">
        {data.map((d, i) => {
          const pct = (d[metric] / maxValue) * 100;
          const isHovered = hoveredBar === i;

          return (
            <div
              key={d.day}
              className="group flex items-center gap-3"
              onMouseEnter={() => setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <span className="w-12 shrink-0 text-right font-mono text-xs text-[var(--color-text-muted)]">
                Day {d.day}
              </span>
              <div className="relative flex-1">
                <div
                  className="h-7 rounded-sm transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isHovered
                      ? 'var(--color-accent)'
                      : 'color-mix(in srgb, var(--color-accent) 70%, transparent)',
                  }}
                />
                {isHovered && (
                  <div className="absolute left-0 top-8 z-10 rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated,var(--color-bg-primary))] px-3 py-2 font-mono text-xs shadow-lg">
                    <div className="font-bold text-[var(--color-text-primary)]">{d.label}</div>
                    <div className="text-[var(--color-text-muted)]">
                      {d[metric].toLocaleString()} {unit}
                    </div>
                  </div>
                )}
              </div>
              <span className="w-16 shrink-0 text-right font-mono text-xs text-[var(--color-text-secondary)]">
                {d[metric].toLocaleString()} {unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
