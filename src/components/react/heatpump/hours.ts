import { DATA_START, RUNNING_WATTS, fetchSeries, type Series } from './feeds';

const HOUR = 3_600_000;

// One hour of space heating: what the outside was doing and how the heat pump
// answered. Only hours the compressor ran for, without hot water, count; a
// hot water run lifts the flow temperature and drags the COP, and says
// nothing about the weather compensation curve.
export type Hour = { t: number; outside: number; flow: number; cop: number; heat: number };

// Below this share of the hour running, the hour's COP is mostly start-up and
// standby, and its mean flow temperature is mostly a cooling pipe.
const MIN_RUNNING_SHARE = 0.5;

/*
 * Buckets the meters' readings into hours, keeping only the readings taken
 * while the compressor ran and the hot water signal was off. The outside
 * temperature is the Met Office feed, which is hourly; each hour takes the
 * reading nearest to it.
 */
export function toHours(series: Series): Hour[] {
  const outsideAt = new Map<number, number>();
  (series.outsideT ?? []).forEach(([t, v]) => {
    if (v !== null) outsideAt.set(Math.round(t / HOUR), v);
  });

  type Bucket = { n: number; running: number; flow: number; heat: number; elec: number };
  const buckets = new Map<number, Bucket>();
  const elec = series.elec ?? [];
  elec.forEach(([t, e], i) => {
    const hour = Math.floor(t / HOUR);
    const b = buckets.get(hour) ?? { n: 0, running: 0, flow: 0, heat: 0, elec: 0 };
    const heat = series.heat?.[i]?.[1];
    const flow = series.flowT?.[i]?.[1];
    const dhw = series.dhwOn?.[i]?.[1];
    const counts = e !== null && e >= RUNNING_WATTS && heat != null && flow != null && dhw != null && dhw < 0.5;
    buckets.set(
      hour,
      counts
        ? { n: b.n + 1, running: b.running + 1, flow: b.flow + flow, heat: b.heat + heat, elec: b.elec + e }
        : { ...b, n: b.n + 1 },
    );
  });

  return [...buckets.entries()]
    .filter(([, b]) => b.n > 0 && b.running / b.n >= MIN_RUNNING_SHARE && b.elec > 0)
    .flatMap(([hour, b]) => {
      const outside = outsideAt.get(hour) ?? outsideAt.get(hour + 1);
      if (outside === undefined) return [];
      return [{ t: hour * HOUR, outside, flow: b.flow / b.running, cop: b.heat / b.elec, heat: b.heat / b.running / 1000 }];
    })
    .sort((a, b) => a.t - b.t);
}

// A straight line through the points by least squares, or null with too few
// points, or too narrow a spread of outside temperatures, to mean anything:
// a week of mild weather would otherwise fit a confident line to noise.
const MIN_SPREAD = 8;

export function fitLine(points: { x: number; y: number }[]): { slope: number; intercept: number } | null {
  if (points.length < 24) return null;
  const xs = points.map((p) => p.x);
  if (Math.max(...xs) - Math.min(...xs) < MIN_SPREAD) return null;
  const n = points.length;
  const mx = points.reduce((s, p) => s + p.x, 0) / n;
  const my = points.reduce((s, p) => s + p.y, 0) / n;
  const sxx = points.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  const slope = points.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / sxx;
  return { slope, intercept: my - slope * mx };
}

// emoncms.org returns at most about 8,900 points a request, so the step
// grows with the span: 10 minutes for the first two months, then coarser.
export function stepFor(spanMs: number): number {
  const steps = [600, 900, 1200, 1800, 3600];
  return steps.find((s) => spanMs / (s * 1000) < 8_000) ?? 3600;
}

export async function fetchHours(): Promise<Hour[]> {
  const end = Date.now();
  const step = stepFor(end - DATA_START);
  // The meters at one step so their readings line up by index; the Met
  // Office feed is hourly whatever is asked for, and runs two days ahead,
  // so it is cut off at now.
  const [meters, weather] = await Promise.all([
    fetchSeries(['elec', 'heat', 'flowT', 'dhwOn'], DATA_START, end, step),
    fetchSeries(['outsideT'], DATA_START - HOUR, end, 3600),
  ]);
  return toHours({ ...meters, outsideT: weather.outsideT });
}
