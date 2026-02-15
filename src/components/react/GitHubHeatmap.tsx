import { useState, useMemo } from 'react';

interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface GitHubHeatmapProps {
  weeks: ContributionWeek[];
  totalContributions: number;
}

const CELL_SIZE = 12;
const GAP = 2;
const MONTH_LABEL_HEIGHT = 16;

function getColour(count: number): string {
  if (count === 0) return 'var(--color-bg-elevated)';
  if (count <= 3) return 'rgba(24, 188, 156, 0.25)';
  if (count <= 6) return 'rgba(24, 188, 156, 0.45)';
  if (count <= 9) return 'rgba(24, 188, 156, 0.65)';
  return 'rgba(24, 188, 156, 0.9)';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function GitHubHeatmap({ weeks, totalContributions }: GitHubHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const monthLabels = useMemo(() => {
    const labels: { month: string; x: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDay = week.contributionDays[0];
      if (!firstDay) return;
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth) {
        labels.push({ month: MONTHS[month], x: weekIndex * (CELL_SIZE + GAP) });
        lastMonth = month;
      }
    });

    return labels;
  }, [weeks]);

  const svgWidth = weeks.length * (CELL_SIZE + GAP);
  const svgHeight = 7 * (CELL_SIZE + GAP) + MONTH_LABEL_HEIGHT;

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="block"
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Month labels */}
          {monthLabels.map((label, i) => (
            <text
              key={`${label.month}-${i}`}
              x={label.x}
              y={12}
              fontSize={10}
              fontFamily="var(--font-mono)"
              fill="var(--color-text-muted)"
            >
              {label.month}
            </text>
          ))}

          {/* Cells */}
          {weeks.map((week, weekIndex) =>
            week.contributionDays.map((day) => {
              const dayOfWeek = new Date(day.date).getDay();
              const x = weekIndex * (CELL_SIZE + GAP);
              const y = dayOfWeek * (CELL_SIZE + GAP) + MONTH_LABEL_HEIGHT;

              return (
                <rect
                  key={day.date}
                  x={x}
                  y={y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={2}
                  fill={getColour(day.contributionCount)}
                  className="transition-opacity"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const parent = e.currentTarget.closest('div')?.getBoundingClientRect();
                    setTooltip({
                      text: `${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''} on ${new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
                      x: rect.left - (parent?.left ?? 0) + CELL_SIZE / 2,
                      y: rect.top - (parent?.top ?? 0) - 8,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })
          )}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute text-xs font-mono rounded-lg border px-2 py-1 pointer-events-none -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-sm font-mono" style={{ color: 'var(--color-text-muted)' }}>
          {totalContributions.toLocaleString()} contributions in the last year
        </p>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <span>Less</span>
          {[0, 3, 6, 9, 12].map((count) => (
            <div
              key={count}
              className="rounded-sm"
              style={{
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                backgroundColor: getColour(count),
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
