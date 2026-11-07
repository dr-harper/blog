import type { FeedKey, Series } from './feeds';

export type Row = { t: number } & Partial<Record<FeedKey, number | null>>;

// One row per timestamp, so Recharts can draw several feeds against one axis.
// Feeds come back at their own intervals (the Met Office feed is hourly, the
// meters every few minutes), so rows are merged on time, not position; the
// charts join the gaps with connectNulls.
export function toRows(series: Series, scale: Partial<Record<FeedKey, number>> = {}): Row[] {
  const byTime = new Map<number, Row>();
  (Object.keys(series) as FeedKey[]).forEach((k) => {
    (series[k] ?? []).forEach(([t, v]) => {
      const row = byTime.get(t) ?? { t };
      byTime.set(t, { ...row, [k]: v === null ? null : v * (scale[k] ?? 1) });
    });
  });
  return [...byTime.values()].sort((a, b) => a.t - b.t);
}

// Carries the last reading of a slow-moving feed (the Met Office's outside
// temperature, hourly) forward onto every row, so hovering anywhere on a
// faster chart finds a value to show rather than only the hour mark itself.
export function fillForward(rows: Row[], keys: FeedKey[]): Row[] {
  const last: Partial<Record<FeedKey, number | null>> = {};
  return rows.map((row) => {
    const filled = { ...row };
    keys.forEach((k) => {
      if (filled[k] !== undefined) last[k] = filled[k];
      else if (k in last) filled[k] = last[k];
    });
    return filled;
  });
}

// Tick marks on round hours, every `hours`, across the rows' span.
export function hourTicks(rows: Row[], hours: number): number[] {
  if (!rows.length) return [];
  const step = hours * 3_600_000;
  const first = Math.ceil(rows[0].t / step) * step;
  const last = rows[rows.length - 1].t;
  return Array.from({ length: Math.max(0, Math.floor((last - first) / step) + 1) }, (_, i) => first + i * step);
}

// The spans when the hot water signal was on, for shading behind a chart.
export function onSpans(points: [number, number | null][] = [], step: number): [number, number][] {
  return points.reduce<{ spans: [number, number][]; open: number | null }>(
    (acc, [t, v], i) => {
      const on = v !== null && v >= 0.5;
      const last = i === points.length - 1;
      const open = on && acc.open === null ? t : acc.open;
      // A run still going at the last point closes there, including one that
      // only started at the last point.
      if (open !== null && (!on || last)) {
        return { spans: [...acc.spans, [open, on ? t + step : t]], open: null };
      }
      return { ...acc, open };
    },
    { spans: [], open: null },
  ).spans;
}
