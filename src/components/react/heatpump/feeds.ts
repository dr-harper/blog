/*
 * The public emoncms.org feeds behind the heat pump page, and how to read them.
 *
 * Every request goes to /api/emoncms/, which Netlify relays to emoncms.org
 * (netlify.toml) and Vite relays in development (astro.config.mjs). emoncms.org
 * sends no CORS headers, so the browser can't read it directly.
 */

export const FEEDS = {
  elec: 546855,
  elecKwh: 546856,
  heat: 546857,
  heatKwh: 546858,
  flowT: 546859,
  returnT: 546860,
  flowRate: 546861,
  dhwT: 546862,
  dhwOn: 546854,
  roomT: 546853,
  outsideT: 546852,
} as const;

export type FeedKey = keyof typeof FEEDS;

// The electricity meter first reported at 09:43 on 6 November 2026. Energy
// totals before then have heat without electricity, so they start here.
export const DATA_START = 1793958230 * 1000;

// Below this the compressor is off and the meter is reading standby.
export const RUNNING_WATTS = 150;

const BASE = '/api/emoncms/feed';

const keys = Object.keys(FEEDS) as FeedKey[];

export type Snapshot = Record<FeedKey, number | null>;

export async function fetchSnapshot(): Promise<Snapshot> {
  const ids = keys.map((k) => FEEDS[k]).join(',');
  const res = await fetch(`${BASE}/fetch.json?ids=${ids}`);
  if (!res.ok) throw new Error(`emoncms fetch ${res.status}`);
  const values: (number | string | null)[] = await res.json();
  return Object.fromEntries(
    keys.map((k, i) => {
      const v = values[i];
      return [k, v === null || v === '' || isNaN(Number(v)) ? null : Number(v)];
    }),
  ) as Snapshot;
}

export type Series = Partial<Record<FeedKey, [number, number | null][]>>;

export async function fetchSeries(
  wanted: FeedKey[],
  start: number,
  end: number,
  intervalSeconds: number,
): Promise<Series> {
  const ids = wanted.map((k) => FEEDS[k]).join(',');
  const url = `${BASE}/data.json?ids=${ids}&start=${start}&end=${end}&interval=${intervalSeconds}&average=1&skipmissing=0&limitinterval=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`emoncms data ${res.status}`);
  const body: { feedid: string; data: [number, number | null][] }[] = await res.json();
  const byId = new Map(body.map((f) => [Number(f.feedid), f.data]));
  return Object.fromEntries(wanted.map((k) => [k, byId.get(FEEDS[k]) ?? []]));
}

export async function fetchDaily(key: FeedKey, start: number, end: number): Promise<[number, number | null][]> {
  const url = `${BASE}/data.json?id=${FEEDS[key]}&start=${start}&end=${end}&mode=daily&delta=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`emoncms daily ${res.status}`);
  return res.json();
}

// The value of a cumulative feed at one moment, read as the first point at or
// after it.
export async function fetchValueAt(key: FeedKey, at: number): Promise<number | null> {
  const url = `${BASE}/data.json?id=${FEEDS[key]}&start=${at}&end=${at + 3600_000}&interval=60&average=0&skipmissing=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`emoncms value ${res.status}`);
  const data: [number, number | null][] = await res.json();
  const first = data.find(([, v]) => v !== null);
  return first ? Number(first[1]) : null;
}
