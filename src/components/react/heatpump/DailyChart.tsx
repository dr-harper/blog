import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { COLOURS, axisProps, dayTick } from './theme';

export type Day = { t: number; heat: number; elec: number; cop: number | null };

export default function DailyChart({ days }: { days: Day[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={days} margin={{ top: 22, right: 8, left: -12, bottom: 0 }} barGap={2}>
        <CartesianGrid stroke={COLOURS.grid} strokeOpacity={0.25} vertical={false} />
        <XAxis dataKey="t" tickFormatter={dayTick} {...axisProps} />
        <YAxis unit=" kWh" width={72} {...axisProps} />
        <Tooltip content={<ChartTooltip labelFormat={dayTick} />} cursor={{ fill: COLOURS.grid, fillOpacity: 0.1 }} />
        <Bar dataKey="heat" name="Heat out" unit="kWh" fill={COLOURS.heat} radius={[4, 4, 0, 0]} isAnimationActive={false}>
          <LabelList
            dataKey="cop"
            position="top"
            formatter={(v: unknown) => (typeof v === 'number' && v > 0 ? `COP ${v.toFixed(1)}` : '')}
            style={{ fill: COLOURS.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
          />
        </Bar>
        <Bar dataKey="elec" name="Electricity in" unit="kWh" fill={COLOURS.elec} radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
