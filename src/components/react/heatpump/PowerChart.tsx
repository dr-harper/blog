import { Area, AreaChart, CartesianGrid, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { hourTicks, type Row } from './series';
import { COLOURS, axisProps, timeTick } from './theme';

export default function PowerChart({ rows, dhw }: { rows: Row[]; dhw: [number, number][] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="hp-heat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOURS.heat} stopOpacity={0.45} />
            <stop offset="100%" stopColor={COLOURS.heat} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="hp-elec" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOURS.elec} stopOpacity={0.5} />
            <stop offset="100%" stopColor={COLOURS.elec} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={COLOURS.grid} strokeOpacity={0.25} vertical={false} />
        {dhw.map(([x1, x2]) => (
          <ReferenceArea key={x1} x1={x1} x2={x2} fill={COLOURS.dhwBand} fillOpacity={0.08} strokeOpacity={0} />
        ))}
        <XAxis dataKey="t" type="number" scale="time" domain={['dataMin', 'dataMax']} ticks={hourTicks(rows, 3)} tickFormatter={timeTick} {...axisProps} />
        <YAxis unit=" kW" width={64} {...axisProps} />
        <Tooltip content={<ChartTooltip labelFormat={timeTick} />} />
        <Area type="monotone" dataKey="heat" name="Heat out" unit="kW" stroke={COLOURS.heat} strokeWidth={2} fill="url(#hp-heat)" connectNulls isAnimationActive={false} />
        <Area type="monotone" dataKey="elec" name="Electricity in" unit="kW" stroke={COLOURS.elec} strokeWidth={2} fill="url(#hp-elec)" connectNulls isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
