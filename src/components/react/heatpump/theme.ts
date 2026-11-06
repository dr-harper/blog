/*
 * Recharts needs resolved colours for SVG attributes, not CSS variables (see
 * MigrationChart). These read well on both the dark and the light theme.
 */
export const COLOURS = {
  heat: '#18BC9C',
  elec: '#58a6ff',
  flow: '#f0883e',
  ret: '#d29922',
  room: '#bc8cff',
  outside: '#8b949e',
  cylinder: '#f85149',
  dhwBand: '#f85149',
  grid: '#6e7681',
  muted: '#8b949e',
};

export const axisProps = {
  tick: { fill: COLOURS.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 },
  axisLine: { stroke: COLOURS.grid },
  tickLine: { stroke: COLOURS.grid },
};

export const timeTick = (ms: number) =>
  new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export const dayTick = (ms: number) =>
  new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
