import { useEffect, useState } from 'react';
import { DATA_START, fetchDaily, fetchSeries, fetchSnapshot, fetchValueAt, type Series, type Snapshot } from './feeds';
import type { Day } from './DailyChart';

const DAY = 86_400_000;

// Calls load now and then every `every` ms, keeping the last good result
// when a later call fails.
function usePoll<T>(load: () => Promise<T>, every: number) {
  const [state, setState] = useState<{ data: T | null; error: string | null; at: number | null }>({
    data: null,
    error: null,
    at: null,
  });
  useEffect(() => {
    let live = true;
    const run = () =>
      load()
        .then((data) => live && setState({ data, error: null, at: Date.now() }))
        .catch((e: Error) => live && setState((s) => ({ ...s, error: e.message })));
    run();
    const timer = setInterval(run, every);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, []);
  return state;
}

export const useSnapshot = () => usePoll<Snapshot>(fetchSnapshot, 30_000);

export const useLastDay = () =>
  usePoll<Series>(() => {
    const end = Date.now();
    return fetchSeries(['heat', 'elec', 'flowT', 'returnT', 'dhwT', 'roomT', 'outsideT', 'dhwOn'], end - DAY, end, 300);
  }, 300_000);

export type Totals = { heat: number; elec: number; days: Day[] };

async function loadTotals(): Promise<Totals> {
  const end = Date.now();
  const [heatDaily, elecDaily, heatStart, elecStart, now] = await Promise.all([
    fetchDaily('heatKwh', DATA_START - DAY, end),
    fetchDaily('elecKwh', DATA_START - DAY, end),
    fetchValueAt('heatKwh', DATA_START),
    fetchValueAt('elecKwh', DATA_START),
    fetchSnapshot(),
  ]);
  const elecByDay = new Map(elecDaily.map(([t, v]) => [t, v ?? 0]));
  // A day counts only if it began after the electricity meter did; the
  // first day has heat from before the meter was fitted.
  const days = heatDaily
    .filter(([t]) => t >= DATA_START)
    .map(([t, h]) => {
      const heat = h ?? 0;
      const elec = elecByDay.get(t) ?? 0;
      return { t, heat, elec, cop: elec > 0.1 ? heat / elec : null };
    });
  return {
    heat: (now.heatKwh ?? 0) - (heatStart ?? 0),
    elec: (now.elecKwh ?? 0) - (elecStart ?? 0),
    days,
  };
}

export const useTotals = () => usePoll<Totals>(loadTotals, 600_000);
