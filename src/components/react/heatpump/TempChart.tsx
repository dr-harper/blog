import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { hourTicks, type Row } from './series';
import { COLOURS, axisProps, timeTick } from './theme';

const LINES = [
  { key: 'flowT', name: 'Flow', colour: COLOURS.flow, width: 2, type: 'monotone' },
  { key: 'returnT', name: 'Return', colour: COLOURS.ret, width: 1.5, type: 'monotone' },
  { key: 'dhwT', name: 'Cylinder', colour: COLOURS.cylinder, width: 2, type: 'monotone' },
  { key: 'roomT', name: 'Room', colour: COLOURS.room, width: 2, type: 'monotone' },
  // Carried forward from an hourly reading (rows.ts fillForward), so a step
  // reads truer than a curve smoothed through repeated values.
  { key: 'outsideT', name: 'Outside', colour: COLOURS.outside, width: 1.5, type: 'stepAfter' },
] as const;

export default function TempChart({ rows, dhw }: { rows: Row[]; dhw: [number, number][] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={COLOURS.grid} strokeOpacity={0.25} vertical={false} />
        {dhw.map(([x1, x2]) => (
          <ReferenceArea key={x1} x1={x1} x2={x2} fill={COLOURS.dhwBand} fillOpacity={0.08} strokeOpacity={0} />
        ))}
        <XAxis dataKey="t" type="number" scale="time" domain={['dataMin', 'dataMax']} ticks={hourTicks(rows, 3)} tickFormatter={timeTick} {...axisProps} />
        <YAxis unit="°C" width={56} domain={['auto', 'auto']} {...axisProps} />
        <Tooltip content={<ChartTooltip labelFormat={timeTick} />} />
        {LINES.map((l) => (
          <Line key={l.key} type={l.type} dataKey={l.key} name={l.name} unit="°C" stroke={l.colour} strokeWidth={l.width} dot={false} connectNulls isAnimationActive={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export const TEMP_LEGEND = LINES;
