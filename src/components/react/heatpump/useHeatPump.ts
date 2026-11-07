import { useEffect, useState } from 'react';
import {
  CHART_STEP_SECONDS,
  DATA_START,
  fetchDaily,
  fetchSeries,
  fetchSnapshot,
  fetchStartTotals,
  type Series,
  type Snapshot,
} from './feeds';
import type { Day } from './DailyChart';
import { fetchHours, type Hour } from './hours';

const DAY = 86_400_000;

export type Polled<T> = { data: T | null; error: string | null; at: number | null };

/*
 * Calls load now and then every `every` ms. It keeps the last good result
 * when a later call fails (with the failure in `error`), never starts a call
 * while one is still out, so a slow reply can't land on top of a newer one,
 * and pauses while the tab is hidden, catching up when it is shown again.
 */
function usePoll<T>(load: () => Promise<T>, every: number): Polled<T> {
  const [state, setState] = useState<Polled<T>>({ data: null, error: null, at: null });
  useEffect(() => {
    let live = true;
    let busy = false;
    let last = 0;
    const run = () => {
      if (busy || document.hidden) return;
      busy = true;
      last = Date.now();
      load()
        .then((data) => live && setState({ data, error: null, at: Date.now() }))
        .catch((e: Error) => live && setState((s) => ({ ...s, error: e.message })))
        .finally(() => {
          busy = false;
        });
    };
    const onVisible = () => {
      if (!document.hidden && Date.now() - last >= every) run();
    };
    run();
    const timer = setInterval(run, every);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      live = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return state;
}

export const useSnapshot = () => usePoll<Snapshot>(fetchSnapshot, 30_000);

export const useLastDay = () =>
  usePoll<Series>(() => {
    const end = Date.now();
    return fetchSeries(
      ['heat', 'elec', 'flowT', 'returnT', 'dhwT', 'roomT', 'outsideT', 'dhwOn'],
      end - DAY,
      end,
      CHART_STEP_SECONDS,
    );
  }, 300_000);

export type History = { days: Day[]; start: { heat: number | null; elec: number | null } };

async function loadHistory(): Promise<History> {
  const end = Date.now();
  const [heatDaily, elecDaily, start] = await Promise.all([
    fetchDaily('heatKwh', DATA_START - DAY, end),
    fetchDaily('elecKwh', DATA_START - DAY, end),
    fetchStartTotals(),
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
  return { days, start };
}

export const useHistory = () => usePoll<History>(loadHistory, 600_000);

// Every hour of space heating since DATA_START. A new hour lands once an hour,
// so this refreshes slowly.
export const useHours = () => usePoll<Hour[]>(fetchHours, 1_800_000);

// Heat and electricity since DATA_START: today's meter readings, from the
// live snapshot, less the readings at the start. Null when either end is
// missing, never a reading less 0.
export function totalsSince(snapshot: Snapshot | null, history: History | null) {
  const now = snapshot?.values;
  const start = history?.start;
  if (!now || !start) return null;
  const parts = [now.heatKwh, now.elecKwh, start.heat, start.elec];
  if (parts.some((p) => p === null)) return null;
  const heat = (now.heatKwh as number) - (start.heat as number);
  const elec = (now.elecKwh as number) - (start.elec as number);
  return heat >= 0 && elec >= 0 ? { heat, elec } : null;
}
