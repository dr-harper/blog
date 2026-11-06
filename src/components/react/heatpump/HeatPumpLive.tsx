import { RUNNING_WATTS, type Snapshot } from './feeds';
import { onSpans, toRows } from './series';
import { COLOURS } from './theme';
import { useLastDay, useSnapshot, useTotals } from './useHeatPump';
import DailyChart from './DailyChart';
import PowerChart from './PowerChart';
import StatTile from './StatTile';
import TempChart, { TEMP_LEGEND } from './TempChart';

const fmt = (v: number | null | undefined, dp = 1) => (v === null || v === undefined ? '–' : v.toFixed(dp));

type Mode = { label: string; colour: string; pulse: boolean };

function modeOf(s: Snapshot): Mode {
  if ((s.elec ?? 0) < RUNNING_WATTS) return { label: 'Idle', colour: COLOURS.muted, pulse: false };
  if ((s.dhwOn ?? 0) >= 0.5) return { label: 'Heating hot water', colour: COLOURS.cylinder, pulse: true };
  return { label: 'Heating the house', colour: COLOURS.heat, pulse: true };
}

function Panel({ title, note, children }: { title: string; note?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-bg-secondary p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-mono font-bold text-text-primary">{title}</h3>
        {note && <div className="text-xs font-mono text-text-muted">{note}</div>}
      </div>
      {children}
    </section>
  );
}

function Key({ items }: { items: readonly { name: string; colour: string }[] }) {
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      {items.map((i) => (
        <span key={i.name} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: i.colour }} />
          {i.name}
        </span>
      ))}
    </span>
  );
}

const DHW_KEY = { name: 'Hot water run', colour: 'rgba(248,81,73,0.35)' };

export default function HeatPumpLive() {
  const snap = useSnapshot();
  const day = useLastDay();
  const totals = useTotals();

  const s = snap.data;
  const running = s ? (s.elec ?? 0) >= RUNNING_WATTS : false;
  const cop = s && running && s.elec ? (s.heat ?? 0) / s.elec : null;
  const mode = s ? modeOf(s) : null;

  const rows = day.data ? toRows(day.data, { heat: 0.001, elec: 0.001 }) : [];
  const dhw = day.data ? onSpans(day.data.dhwOn, 300_000) : [];
  const t = totals.data;
  const scop = t && t.elec > 0.5 ? t.heat / t.elec : null;

  return (
    // not-prose: the component is also embedded in a blog post, whose
    // typography styles would otherwise reach the tiles and panel titles.
    <div className="not-prose space-y-6">
      {/* Status line */}
      <div className="flex flex-wrap items-center gap-3 font-mono text-sm">
        {mode ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-secondary px-3 py-1">
            <span className="relative flex h-2.5 w-2.5">
              {mode.pulse && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: mode.colour }} />
              )}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: mode.colour }} />
            </span>
            <span className="text-text-primary">{mode.label}</span>
          </span>
        ) : (
          <span className="text-text-muted">{snap.error ? `Couldn't reach the monitor (${snap.error})` : 'Connecting…'}</span>
        )}
        {snap.at && (
          <span className="text-text-muted">
            updated {new Date(snap.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · every 30 s
          </span>
        )}
      </div>

      {/* Live tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Heat out" value={fmt(s && (s.heat ?? 0) / 1000, 2)} unit="kW" colour={COLOURS.heat} />
        <StatTile label="Electricity in" value={fmt(s && (s.elec ?? 0) / 1000, 2)} unit="kW" colour={COLOURS.elec} />
        <StatTile label="COP now" value={running ? fmt(cop, 1) : '–'} colour="var(--color-text-primary)" hint={running ? 'heat ÷ electricity' : 'compressor off'} />
        <StatTile label="Flow / return" value={s ? `${fmt(s.flowT)}/${fmt(s.returnT)}` : '–'} unit="°C" colour={COLOURS.flow} />
        <StatTile label="Room" value={fmt(s?.roomT)} unit="°C" colour={COLOURS.room} />
        <StatTile label="Outside" value={fmt(s?.outsideT)} unit="°C" colour={COLOURS.outside} hint="Met Office, hourly" />
        <StatTile label="Hot water" value={fmt(s?.dhwT)} unit="°C" colour={COLOURS.cylinder} hint="cylinder probe" />
        <StatTile
          label="Efficiency so far"
          value={fmt(scop, 2)}
          colour={COLOURS.heat}
          hint={t ? `${t.heat.toFixed(0)} kWh heat from ${t.elec.toFixed(0)} kWh` : 'since 6 Nov 2026'}
        />
      </div>

      <Panel
        title="Last 24 hours · power"
        note={<Key items={[{ name: 'Heat out', colour: COLOURS.heat }, { name: 'Electricity in', colour: COLOURS.elec }, DHW_KEY]} />}
      >
        {rows.length ? <PowerChart rows={rows} dhw={dhw} /> : <Placeholder error={day.error} />}
      </Panel>

      <Panel title="Last 24 hours · temperatures" note={<Key items={[...TEMP_LEGEND, DHW_KEY]} />}>
        {rows.length ? <TempChart rows={rows} dhw={dhw} /> : <Placeholder error={day.error} />}
      </Panel>

      <Panel
        title="Day by day"
        note={<Key items={[{ name: 'Heat out', colour: COLOURS.heat }, { name: 'Electricity in', colour: COLOURS.elec }]} />}
      >
        {t && t.days.length ? (
          <DailyChart days={t.days} />
        ) : (
          <p className="py-10 text-center font-mono text-sm text-text-muted">
            {totals.error ? `Couldn't load the daily totals (${totals.error})` : 'The first full day of data lands on 7 November.'}
          </p>
        )}
      </Panel>
    </div>
  );
}

function Placeholder({ error }: { error: string | null }) {
  return (
    <div className="flex h-[260px] items-center justify-center font-mono text-sm text-text-muted">
      {error ? `Couldn't load the chart (${error})` : 'Loading…'}
    </div>
  );
}
