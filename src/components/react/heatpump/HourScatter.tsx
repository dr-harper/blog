import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { fitLine, type Hour } from './hours';
import { COLOURS, axisProps } from './theme';

/*
 * One dot per hour of space heating, against the outside temperature. Used
 * twice: flow temperature (the weather compensation curve the controller is
 * actually running) and COP (what the heat pump makes of each degree).
 */

type Guide = { from: [number, number]; to: [number, number]; colour: string; dashed?: boolean };

const when = (ms: number) =>
  new Date(ms).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function HourTip({ active, payload, y }: { active?: boolean; payload?: { payload: Hour }[]; y: { key: 'flow' | 'cop'; label: string; unit: string } }) {
  const h = payload?.[0]?.payload;
  if (!active || !h) return null;
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
      <p style={{ color: 'var(--color-text-primary)', marginBottom: 4 }}>{when(h.t)}</p>
      <p style={{ color: COLOURS.outside, margin: 0 }}>Outside: {h.outside.toFixed(1)} °C</p>
      <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
        {y.label}: {h[y.key].toFixed(y.key === 'cop' ? 2 : 1)}
        {y.unit}
      </p>
      <p style={{ color: COLOURS.heat, margin: 0 }}>Heat: {h.heat.toFixed(2)} kW</p>
    </div>
  );
}

export default function HourScatter({
  hours,
  y,
  colour,
  domain,
  guides = [],
}: {
  hours: Hour[];
  y: { key: 'flow' | 'cop'; label: string; unit: string };
  colour: string;
  domain: [number, number];
  guides?: Guide[];
}) {
  // The x axis runs from a hard frost to a mild day, widening if the data does.
  const xs = hours.map((h) => h.outside);
  const xDomain: [number, number] = [Math.min(-5, Math.floor(Math.min(...xs))), Math.max(18, Math.ceil(Math.max(...xs)))];
  const fit = fitLine(hours.map((h) => ({ x: h.outside, y: h[y.key] })));
  const lines: Guide[] = [
    ...guides,
    ...(fit
      ? [{ from: [Math.min(...xs), fit.intercept + fit.slope * Math.min(...xs)], to: [Math.max(...xs), fit.intercept + fit.slope * Math.max(...xs)], colour } as Guide]
      : []),
  ];
  // Newer hours are drawn last and stronger, so this week stands out from last month.
  const n = hours.length;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 8, right: 12, left: -12, bottom: 8 }}>
        <CartesianGrid stroke={COLOURS.grid} strokeOpacity={0.25} />
        <XAxis type="number" dataKey="outside" domain={xDomain} unit="°C" allowDataOverflow {...axisProps} />
        <YAxis type="number" dataKey={y.key} domain={domain} unit={y.unit.trim()} width={56} allowDataOverflow {...axisProps} />
        <Tooltip content={<HourTip y={y} />} cursor={{ stroke: COLOURS.grid, strokeDasharray: '3 3' }} />
        {lines.map((g, i) => (
          <ReferenceLine
            key={i}
            segment={[{ x: g.from[0], y: g.from[1] }, { x: g.to[0], y: g.to[1] }]}
            stroke={g.colour}
            strokeWidth={g.dashed ? 1.5 : 2}
            strokeDasharray={g.dashed ? '6 4' : undefined}
            ifOverflow="hidden"
          />
        ))}
        <Scatter
          data={hours}
          isAnimationActive={false}
          shape={(p: { cx?: number; cy?: number; index?: number }) => (
            <circle cx={p.cx} cy={p.cy} r={4} fill={colour} fillOpacity={0.25 + 0.55 * (((p.index ?? 0) + 1) / n)} />
          )}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

