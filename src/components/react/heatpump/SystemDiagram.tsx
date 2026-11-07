import type { Snapshot } from './feeds';
import { COLOURS } from './theme';

/*
 * The water side of the system, live: heat pump, diverter valve, radiators
 * and cylinder, with the branch the valve is feeding lit and the other
 * greyed. Pipes move while the circulation pump does, faster with more flow;
 * the fan turns while the compressor runs. The refrigerant side, which
 * Heat Geek Home draws from CAN data, isn't something the emonHP can see.
 */

const fmt = (v: number | null | undefined, dp = 1) => (v === null || v === undefined ? '–' : v.toFixed(dp));

// Pipe paths, each drawn in the direction the water moves so the dashes do too.
const PATHS = {
  flowMain: 'M220 170 H350',
  toRads: 'M350 170 V40 H712',
  radsBack: 'M518 130 H900 V400 H600',
  toCylinder: 'M350 170 H590 V240 H632',
  coil: 'M632 240 H720 V265 H640 V290 H720 V315 H640 V340 H632',
  cylinderBack: 'M632 340 H600 V400',
  returnMain: 'M600 400 H260 V290 H220',
};

const RADS = [420, 560, 700];

function Pipe({ d, colour, on, moving }: { d: string; colour: string; on: boolean; moving: boolean }) {
  return (
    <g>
      <path d={d} fill="none" stroke={on ? colour : COLOURS.grid} strokeOpacity={on ? 1 : 0.35} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      {on && moving && <path d={d} className="hp-dash" fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />}
    </g>
  );
}

function Pill({ x, y, w, text, caption, colour, below = false }: { x: number; y: number; w: number; text: string; caption: string; colour: string; below?: boolean }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <title>{`${caption}: ${text}`}</title>
      <rect x={-w / 2} y={-15} width={w} height={30} rx={15} className="hp-pill" stroke={colour} strokeOpacity={0.6} />
      <text textAnchor="middle" dominantBaseline="central" className="hp-value" fill={colour}>
        {text}
      </text>
      <text y={below ? 31 : -23} textAnchor="middle" className="hp-caption">
        {caption}
      </text>
    </g>
  );
}

export default function SystemDiagram({ snapshot, live, running }: { snapshot: Snapshot | null; live: boolean; running: boolean }) {
  const v = snapshot?.values;
  const flowRate = v?.flowRate ?? 0;
  const pumping = live && flowRate > 1;
  const toCylinder = (v?.dhwOn ?? 0) >= 0.5;
  const cop = running && v?.elec ? (v.heat ?? 0) / v.elec : null;
  // 23 l/min, the usual rate here, takes a dash about 1.3 s to cross; the
  // rate is clamped so a trickle still visibly moves and a surge stays legible.
  const dashSeconds = Math.min(4, Math.max(0.6, 30 / Math.max(flowRate, 1)));
  // The cylinder's fill: from no tint at 20 °C to full at 55 °C.
  const warmth = Math.min(1, Math.max(0, ((v?.dhwT ?? 20) - 20) / 35));
  const hot = COLOURS.flow;
  const cold = COLOURS.elec;

  const label = v
    ? `Heat pump ${running ? 'running' : 'idle'}, feeding the ${toCylinder ? 'hot water cylinder' : 'radiators'}. Flow ${fmt(v.flowT)} °C, return ${fmt(v.returnT)} °C, ${fmt(flowRate)} litres a minute.`
    : 'Heat pump system diagram, waiting for data.';

  return (
    <figure className={snapshot && !live ? 'opacity-60' : ''}>
      <style>{`
        .hp-dash { stroke: var(--color-bg-secondary); stroke-dasharray: 3 16; animation: hp-dash ${dashSeconds}s linear infinite; }
        @keyframes hp-dash { to { stroke-dashoffset: -38; } }
        .hp-fan { transform-origin: 130px 175px; transform-box: view-box; }
        .hp-spin { animation: hp-spin 1.4s linear infinite; }
        @keyframes hp-spin { to { transform: rotate(360deg); } }
        .hp-pill { fill: var(--color-bg-primary); stroke-width: 1.5; }
        .hp-value { font: 600 15px 'JetBrains Mono', monospace; }
        .hp-caption { fill: var(--color-text-muted); font: 11px 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.04em; }
        .hp-part { fill: var(--color-bg-primary); stroke: var(--color-text-muted); stroke-width: 2; }
        .hp-read { fill: var(--color-text-secondary); font: 13px 'JetBrains Mono', monospace; }
        @media (prefers-reduced-motion: reduce) { .hp-dash, .hp-spin { animation: none; } }
      `}</style>
      <div className="overflow-x-auto overscroll-x-contain">
        <svg viewBox="0 0 960 440" role="img" aria-label={label} className="block h-auto w-full min-w-[640px]">
          <Pipe d={PATHS.flowMain} colour={hot} on moving={pumping} />
          <Pipe d={PATHS.toRads} colour={hot} on={!toCylinder} moving={pumping} />
          <Pipe d={PATHS.toCylinder} colour={hot} on={toCylinder} moving={pumping} />
          <Pipe d={PATHS.radsBack} colour={cold} on={!toCylinder} moving={pumping} />
          <Pipe d={PATHS.cylinderBack} colour={cold} on={toCylinder} moving={pumping} />
          <Pipe d={PATHS.returnMain} colour={cold} on moving={pumping} />

          {/* radiators, each dropping from the flow line and back to the return */}
          {RADS.map((x) => (
            <g key={x} opacity={toCylinder ? 0.45 : 1}>
              <path d={`M${x + 12} 40 V62`} stroke={toCylinder ? COLOURS.grid : hot} strokeWidth={4} fill="none" />
              <path d={`M${x + 98} 108 V130`} stroke={toCylinder ? COLOURS.grid : cold} strokeWidth={4} fill="none" />
              <rect x={x} y={62} width={110} height={46} rx={4} className="hp-part" />
              {Array.from({ length: 9 }, (_, i) => (
                <line key={i} x1={x + 11 + i * 11} x2={x + 11 + i * 11} y1={67} y2={103} stroke="var(--color-text-muted)" strokeOpacity={0.5} strokeWidth={2} />
              ))}
            </g>
          ))}
          <text x={615} y={154} textAnchor="middle" className="hp-caption">radiators</text>

          {/* the cylinder, tinted by its temperature, with the coil drawn over */}
          <rect x={620} y={200} width={124} height={180} rx={20} className="hp-part" />
          <rect x={621} y={201} width={122} height={178} rx={19} fill={COLOURS.cylinder} fillOpacity={0.08 + warmth * 0.32} />
          <Pipe d={PATHS.coil} colour={hot} on={toCylinder} moving={pumping} />
          <text x={682} y={192} textAnchor="middle" className="hp-caption">300 L cylinder</text>

          {/* diverter valve */}
          <circle cx={350} cy={170} r={15} className="hp-part" />
          <path d={toCylinder ? 'M342 170 H360 M354 164 L360 170 L354 176' : 'M350 178 V161 M344 167 L350 161 L356 167'} stroke="var(--color-text-primary)" strokeWidth={2} fill="none" />
          <text x={350} y={205} textAnchor="middle" className="hp-caption">valve</text>

          {/* the heat pump, its fan turning while the compressor runs */}
          <rect x={40} y={110} width={180} height={210} rx={10} className="hp-part" />
          <circle cx={130} cy={175} r={44} fill="none" stroke="var(--color-text-muted)" strokeWidth={2} />
          <g className={`hp-fan ${running ? 'hp-spin' : ''}`}>
            {[0, 120, 240].map((a) => (
              <path key={a} d="M130 175 C 120 150, 135 138, 144 140 C 146 155, 140 166, 130 175 Z" transform={`rotate(${a} 130 175)`} fill="var(--color-text-muted)" fillOpacity={0.7} />
            ))}
          </g>
          <text x={58} y={250} className="hp-read">heat <tspan fill={COLOURS.heat}>{fmt(v && (v.heat ?? 0) / 1000, 2)} kW</tspan></text>
          <text x={58} y={274} className="hp-read">elec <tspan fill={COLOURS.elec}>{fmt(v && (v.elec ?? 0) / 1000, 2)} kW</tspan></text>
          <text x={58} y={298} className="hp-read">COP  <tspan fill="var(--color-text-primary)">{running ? fmt(cop) : '–'}</tspan></text>

          <Pill x={130} y={70} w={96} text={`${fmt(v?.outsideT)}°C`} caption="outside" colour={COLOURS.outside} />
          <Pill x={285} y={170} w={88} text={`${fmt(v?.flowT)}°C`} caption="flow" colour={hot} />
          <Pill x={260} y={345} w={88} text={`${fmt(v?.returnT)}°C`} caption="return" colour={cold} below />
          <Pill x={440} y={400} w={120} text={`${fmt(flowRate)} l/min`} caption="flow rate" colour="var(--color-text-secondary)" below />
          <Pill x={870} y={85} w={88} text={`${fmt(v?.roomT)}°C`} caption="room" colour={COLOURS.room} />
          <Pill x={830} y={290} w={88} text={`${fmt(v?.dhwT)}°C`} caption="cylinder" colour={COLOURS.cylinder} />
        </svg>
      </div>
      <figcaption className="mt-2 font-mono text-xs text-text-muted">
        {snapshot && !live ? 'The last values heard. ' : ''}
        The valve sends heat to the radiators or the cylinder, never both. Pipes move with the pump, faster with more flow; the fan turns while the compressor runs.
      </figcaption>
    </figure>
  );
}
