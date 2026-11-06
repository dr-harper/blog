/*
 * The public emoncms.org feeds behind the heat pump page, and how to read them.
 *
 * Every request goes to /api/emoncms/, which Netlify relays to emoncms.org
 * (netlify.toml) and Vite relays in development (astro.config.mjs). emoncms.org
 * sends no CORS headers, so the browser can't read it directly. Both relay
 * only the calls listed in relayed.mjs; a new call goes there and in
 * netlify.toml.
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

// The emoncms.org account whose public feeds these are.
const USER_ID = 54866;

// The electricity meter first reported at 09:43 on 6 November 2026. Energy
// totals before then have heat without electricity (most of it from the old
// heat pump), so they start here.
export const DATA_START = 1793958230 * 1000;

// Below this the compressor is off and the meter is reading standby.
export const RUNNING_WATTS = 150;

// The meters report every 10 s; a reading older than this means the emonHP
// has stopped uploading.
export const STALE_AFTER = 5 * 60_000;

// The resolution of the 24-hour charts, shared by the fetch and the hot water
// shading so the two can't drift apart.
export const CHART_STEP_SECONDS = 300;

const BASE = '/api/emoncms';

const keys = Object.keys(FEEDS) as FeedKey[];

export type Snapshot = {
  values: Record<FeedKey, number | null>;
  // When the meters last reported, in ms: the older of the heat and
  // electricity feeds, since the page is only live if both are.
  meteredAt: number | null;
};

const num = (v: unknown) => (v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v));

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`emoncms ${res.status}`);
  return res.json();
}

/*
 * Current values come from fetch.json, which gives each feed's value now.
 * list.json also has values, but for the Met Office feed that is the last
 * point of its forecast, two days ahead; it is read here only for the time
 * each meter last reported, which fetch.json doesn't give.
 */
export async function fetchSnapshot(): Promise<Snapshot> {
  const ids = keys.map((k) => FEEDS[k]).join(',');
  const [values, list] = await Promise.all([
    getJson<unknown[]>(`feed/fetch.json?ids=${ids}`),
    getJson<{ id: string; time: string | number | null }[]>(`feed/list.json?userid=${USER_ID}`),
  ]);
  const timeOf = (id: number) => num(list.find((f) => Number(f.id) === id)?.time);
  const times = [timeOf(FEEDS.heat), timeOf(FEEDS.elec)];
  return {
    values: Object.fromEntries(keys.map((k, i) => [k, num(values[i])])) as Snapshot['values'],
    meteredAt: times.every((t) => t !== null) ? Math.min(...(times as number[])) * 1000 : null,
  };
}

export type Series = Partial<Record<FeedKey, [number, number | null][]>>;

export async function fetchSeries(wanted: FeedKey[], start: number, end: number, intervalSeconds: number): Promise<Series> {
  const ids = wanted.map((k) => FEEDS[k]).join(',');
  const body = await getJson<{ feedid: string; data: [number, number | null][] }[]>(
    `feed/data.json?ids=${ids}&start=${start}&end=${end}&interval=${intervalSeconds}&average=1&skipmissing=0&limitinterval=1`,
  );
  const byId = new Map(body.map((f) => [Number(f.feedid), f.data]));
  return Object.fromEntries(wanted.map((k) => [k, byId.get(FEEDS[k]) ?? []]));
}

export const fetchDaily = (key: FeedKey, start: number, end: number) =>
  getJson<[number, number | null][]>(`feed/data.json?id=${FEEDS[key]}&start=${start}&end=${end}&mode=daily&delta=1`);

// The value of a cumulative feed at one moment, read as the first point in
// the hour after it. Null if there is none: callers must not treat that as 0.
export async function fetchValueAt(key: FeedKey, at: number): Promise<number | null> {
  const data = await getJson<[number, number | null][]>(
    `feed/data.json?id=${FEEDS[key]}&start=${at}&end=${at + 3_600_000}&interval=60&average=0&skipmissing=1`,
  );
  const first = data.find(([, v]) => v !== null);
  return first ? Number(first[1]) : null;
}

// The meters' readings at DATA_START never change, so they are read once per
// page load. A failed read is forgotten so the next attempt tries again.
let startTotals: Promise<{ heat: number | null; elec: number | null }> | null = null;

export function fetchStartTotals() {
  if (!startTotals) {
    startTotals = Promise.all([fetchValueAt('heatKwh', DATA_START), fetchValueAt('elecKwh', DATA_START)])
      .then(([heat, elec]) => ({ heat, elec }))
      .catch((e) => {
        startTotals = null;
        throw e;
      });
  }
  return startTotals;
}
