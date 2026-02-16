import { useEffect, useRef, useState } from 'react';

/**
 * Animated Shinkansen bullet train with wind turbine landscape.
 * 3-car set glides past spinning wind turbines — energy meets transport.
 * Triggers once when scrolled into view. Respects prefers-reduced-motion.
 */

function WindTurbine({ x, baseY, height, bladeLength }: { x: number; baseY: number; height: number; bladeLength: number }) {
  const hubY = baseY - height;
  return (
    <g>
      <line x1={x} y1={hubY} x2={x} y2={baseY} stroke="var(--color-border-hover)" strokeWidth="3" strokeLinecap="round" />
      <line x1={x - 6} y1={baseY} x2={x + 6} y2={baseY} stroke="var(--color-border-hover)" strokeWidth="2" strokeLinecap="round" />
      <rect x={x - 4} y={hubY - 3} width="10" height="6" rx="2" fill="var(--color-border-hover)" />
      <g className="turbine-blades" style={{ transformOrigin: `${x + 1}px ${hubY}px` }}>
        {[0, 120, 240].map((angle) => (
          <line
            key={angle}
            x1={x + 1}
            y1={hubY}
            x2={x + 1 + bladeLength * Math.sin((angle * Math.PI) / 180)}
            y2={hubY - bladeLength * Math.cos((angle * Math.PI) / 180)}
            stroke="var(--color-text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
        ))}
      </g>
      <circle cx={x + 1} cy={hubY} r="2.5" fill="var(--color-text-muted)" />
    </g>
  );
}

/** Solar panel cluster on a hillside */
function SolarPanels({ x, y, count, angle }: { x: number; y: number; count: number; angle: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {Array.from({ length: count }).map((_, i) => (
        <g key={i} transform={`translate(${i * 7}, 0) rotate(${angle})`}>
          <rect x="0" y="0" width="5" height="3" rx="0.5" fill="var(--color-accent)" opacity="0.3" />
          {/* Panel grid lines */}
          <line x1="2.5" y1="0" x2="2.5" y2="3" stroke="var(--color-accent)" strokeWidth="0.3" opacity="0.4" />
          <line x1="0" y1="1.5" x2="5" y2="1.5" stroke="var(--color-accent)" strokeWidth="0.3" opacity="0.4" />
          {/* Support post */}
          <line x1="2.5" y1="3" x2="2.5" y2="5" stroke="var(--color-border-hover)" strokeWidth="0.8" />
        </g>
      ))}
    </g>
  );
}

/** Small house with a heat pump unit outside */
function HouseWithHeatPump({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* House body */}
      <rect x="0" y="4" width="14" height="10" rx="1" fill="var(--color-bg-elevated)" stroke="var(--color-border-hover)" strokeWidth="0.8" />
      {/* Roof */}
      <path d="M-1 4 L7 -2 L15 4 Z" fill="var(--color-border-hover)" stroke="var(--color-border-hover)" strokeWidth="0.5" />
      {/* Window */}
      <rect x="3" y="7" width="3.5" height="3" rx="0.5" fill="var(--color-accent)" opacity="0.3" />
      {/* Door */}
      <rect x="9" y="8" width="3" height="6" rx="0.5" fill="var(--color-border-hover)" opacity="0.6" />
      {/* Heat pump unit */}
      <rect x="17" y="8" width="6" height="6" rx="1" fill="var(--color-border-hover)" stroke="var(--color-text-muted)" strokeWidth="0.5" />
      {/* Fan grille */}
      <circle cx="20" cy="11" r="2" fill="none" stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.6" />
      <line x1="20" y1="9.5" x2="20" y2="12.5" stroke="var(--color-accent)" strokeWidth="0.3" opacity="0.5" />
      <line x1="18.5" y1="11" x2="21.5" y2="11" stroke="var(--color-accent)" strokeWidth="0.3" opacity="0.5" />
      {/* Pipe connecting to house */}
      <line x1="14" y1="11" x2="17" y2="11" stroke="var(--color-border-hover)" strokeWidth="0.8" />
    </g>
  );
}

/** Power line pylon */
function Pylon({ x, baseY, height }: { x: number; baseY: number; height: number }) {
  const topY = baseY - height;
  return (
    <g>
      {/* Main pole */}
      <line x1={x} y1={topY} x2={x} y2={baseY} stroke="var(--color-border-hover)" strokeWidth="1.5" opacity="0.5" />
      {/* Cross arm */}
      <line x1={x - 6} y1={topY + 3} x2={x + 6} y2={topY + 3} stroke="var(--color-border-hover)" strokeWidth="1" opacity="0.5" />
      {/* Insulators */}
      <circle cx={x - 5} cy={topY + 3} r="0.8" fill="var(--color-text-muted)" opacity="0.5" />
      <circle cx={x + 5} cy={topY + 3} r="0.8" fill="var(--color-text-muted)" opacity="0.5" />
    </g>
  );
}

/** Drifting cloud — nested groups so CSS transform doesn't override SVG position */
function Cloud({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity="0.2">
      <g className="cloud-drift">
        <ellipse cx="0" cy="0" rx="12" ry="5" fill="var(--color-text-muted)" />
        <ellipse cx="-8" cy="2" rx="8" ry="4" fill="var(--color-text-muted)" />
        <ellipse cx="9" cy="1" rx="9" ry="4.5" fill="var(--color-text-muted)" />
      </g>
    </g>
  );
}

/** Sun (light mode) or moon + stars (dark mode) */
function CelestialBody() {
  return (
    <g>
      {/* Sun — visible in light mode */}
      <g className="celestial-sun">
        <circle cx="820" cy="15" r="8" fill="var(--color-warning)" opacity="0.3" />
        <circle cx="820" cy="15" r="5" fill="var(--color-warning)" opacity="0.5" />
        {/* Rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1={820 + 10 * Math.cos((angle * Math.PI) / 180)}
            y1={15 + 10 * Math.sin((angle * Math.PI) / 180)}
            x2={820 + 13 * Math.cos((angle * Math.PI) / 180)}
            y2={15 + 13 * Math.sin((angle * Math.PI) / 180)}
            stroke="var(--color-warning)"
            strokeWidth="0.8"
            opacity="0.3"
            strokeLinecap="round"
          />
        ))}
      </g>
      {/* Moon — visible in dark mode */}
      <g className="celestial-moon">
        <circle cx="820" cy="15" r="6" fill="var(--color-text-muted)" opacity="0.5" />
        <circle cx="823" cy="13" r="5" fill="var(--color-bg-primary)" />
        {/* Stars */}
        <circle cx="790" cy="8" r="0.8" fill="var(--color-text-muted)" opacity="0.7" />
        <circle cx="850" cy="12" r="0.6" fill="var(--color-text-muted)" opacity="0.6" />
        <circle cx="770" cy="18" r="0.5" fill="var(--color-text-muted)" opacity="0.5" />
        <circle cx="860" cy="6" r="0.7" fill="var(--color-text-muted)" opacity="0.65" />
        <circle cx="840" cy="22" r="0.4" fill="var(--color-text-muted)" opacity="0.45" />
      </g>
    </g>
  );
}

/** Sky/landscape — hills, turbines, solar, house, power lines, clouds, sun/moon */
function Landscape() {
  const turbines = [
    { x: 130, baseY: 65, height: 30, bladeLength: 14 },
    { x: 340, baseY: 55, height: 35, bladeLength: 16 },
    { x: 560, baseY: 68, height: 28, bladeLength: 12 },
    { x: 720, baseY: 58, height: 32, bladeLength: 15 },
  ];

  const pylons = [
    { x: 230, baseY: 78, height: 30 },
    { x: 460, baseY: 80, height: 28 },
    { x: 640, baseY: 76, height: 32 },
  ];

  return (
    <svg
      viewBox="0 0 900 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMax slice"
    >
      {/* Sun/Moon */}
      <CelestialBody />

      {/* Clouds — drift slowly */}
      <Cloud x={80} y={12} scale={1} />
      <Cloud x={380} y={8} scale={0.7} />
      <Cloud x={600} y={16} scale={0.85} />

      {/* Distant background hills */}
      <path
        d="M0 100 L0 88 Q50 82 120 85 Q200 78 300 82 Q400 74 500 80 Q600 72 700 78 Q800 74 860 80 Q890 85 900 88 L900 100 Z"
        fill="var(--color-border)"
        opacity="0.05"
      />

      {/* Foreground hills */}
      <path
        d="M0 100 L0 82 Q40 78 80 80 Q110 72 130 65 Q150 58 185 70 Q220 80 270 82 Q300 72 320 62 Q340 55 360 58 Q400 72 440 80 Q480 84 520 78 Q540 72 560 68 Q580 62 620 76 Q660 84 690 76 Q710 64 720 58 Q740 54 770 68 Q810 80 860 84 Q885 88 900 85 L900 100 Z"
        fill="var(--color-border)"
        opacity="0.1"
      />

      {/* Power lines between pylons */}
      {pylons.map((p, i) => (
        <Pylon key={i} x={p.x} baseY={p.baseY} height={p.height} />
      ))}
      {/* Cables connecting pylons */}
      <path
        d={`M${pylons[0].x - 5} ${pylons[0].baseY - pylons[0].height + 3} Q${(pylons[0].x + pylons[1].x) / 2} ${Math.max(pylons[0].baseY, pylons[1].baseY) - 15} ${pylons[1].x - 5} ${pylons[1].baseY - pylons[1].height + 3}`}
        stroke="var(--color-border-hover)" strokeWidth="0.5" fill="none" opacity="0.3"
      />
      <path
        d={`M${pylons[0].x + 5} ${pylons[0].baseY - pylons[0].height + 3} Q${(pylons[0].x + pylons[1].x) / 2} ${Math.max(pylons[0].baseY, pylons[1].baseY) - 12} ${pylons[1].x + 5} ${pylons[1].baseY - pylons[1].height + 3}`}
        stroke="var(--color-border-hover)" strokeWidth="0.5" fill="none" opacity="0.3"
      />
      <path
        d={`M${pylons[1].x - 5} ${pylons[1].baseY - pylons[1].height + 3} Q${(pylons[1].x + pylons[2].x) / 2} ${Math.max(pylons[1].baseY, pylons[2].baseY) - 15} ${pylons[2].x - 5} ${pylons[2].baseY - pylons[2].height + 3}`}
        stroke="var(--color-border-hover)" strokeWidth="0.5" fill="none" opacity="0.3"
      />
      <path
        d={`M${pylons[1].x + 5} ${pylons[1].baseY - pylons[1].height + 3} Q${(pylons[1].x + pylons[2].x) / 2} ${Math.max(pylons[1].baseY, pylons[2].baseY) - 12} ${pylons[2].x + 5} ${pylons[2].baseY - pylons[2].height + 3}`}
        stroke="var(--color-border-hover)" strokeWidth="0.5" fill="none" opacity="0.3"
      />

      {/* Wind turbines on hill peaks */}
      {turbines.map((t, i) => (
        <WindTurbine key={i} x={t.x} baseY={t.baseY} height={t.height} bladeLength={t.bladeLength} />
      ))}

      {/* Solar panels on hillsides */}
      <SolarPanels x={160} y={68} count={4} angle={-15} />
      <SolarPanels x={575} y={70} count={3} angle={-10} />

      {/* House with heat pump — on central hill slope, visible on mobile */}
      <HouseWithHeatPump x={395} y={58} />

      {/* Rail track — inside SVG so it scales with landscape */}
      <line x1="0" y1="92" x2="900" y2="92" stroke="var(--color-border)" strokeWidth="1.5" />
      {Array.from({ length: 60 }).map((_, i) => (
        <rect
          key={i}
          x={i * 15 + 2}
          y="93"
          width="3"
          height="4"
          rx="0.5"
          fill="var(--color-border)"
          opacity="0.4"
        />
      ))}
    </svg>
  );
}

function LeadCar() {
  return (
    <svg viewBox="0 0 378 58" fill="none" xmlns="http://www.w3.org/2000/svg" className="train-car train-lead">
      <path
        d="M4 8 L310 8 Q315 8 322 12 L368 30 Q376 34 376 38 L376 44 Q376 48 372 48 L4 48 Q0 48 0 44 L0 12 Q0 8 4 8 Z"
        fill="var(--color-bg-elevated)" stroke="var(--color-border-hover)" strokeWidth="1.2"
      />
      <path
        d="M310 8 Q315 8 322 12 L368 30 Q376 34 376 38 L376 44 Q376 48 372 48 L310 48 Z"
        fill="var(--color-bg-elevated)" stroke="var(--color-border-hover)" strokeWidth="1.2"
      />
      <rect x="4" y="30" width="368" height="3" rx="1.5" fill="var(--color-accent)" opacity="0.9" />
      {[16,38,60,82,104,130,152,174,196,218,244,266,288].map((wx) => (
        <rect key={wx} x={wx} y="15" width="16" height="10" rx="2" fill="var(--color-accent)" opacity="0.4" />
      ))}
      <path d="M310 12 L316 12 Q320 12 324 14 L340 22 L340 28 L310 28 Z" fill="var(--color-accent)" opacity="0.3" />
      <circle cx="364" cy="38" r="2.5" fill="var(--color-accent)" opacity="0.8" />
      <rect x="0" y="12" width="5" height="36" rx="2" fill="var(--color-border-hover)" opacity="0.5" />
      <line x1="8" y1="8" x2="310" y2="8" stroke="var(--color-border-hover)" strokeWidth="0.8" opacity="0.5" />
      <g>
        <rect x="260" y="48" width="44" height="5" rx="2" fill="var(--color-border-hover)" />
        <circle cx="270" cy="54" r="3.5" fill="var(--color-border)" stroke="var(--color-text-muted)" strokeWidth="0.8" />
        <circle cx="270" cy="54" r="1.2" fill="var(--color-text-muted)" />
        <circle cx="290" cy="54" r="3.5" fill="var(--color-border)" stroke="var(--color-text-muted)" strokeWidth="0.8" />
        <circle cx="290" cy="54" r="1.2" fill="var(--color-text-muted)" />
      </g>
      <g>
        <rect x="40" y="48" width="44" height="5" rx="2" fill="var(--color-border-hover)" />
        <circle cx="50" cy="54" r="3.5" fill="var(--color-border)" stroke="var(--color-text-muted)" strokeWidth="0.8" />
        <circle cx="50" cy="54" r="1.2" fill="var(--color-text-muted)" />
        <circle cx="70" cy="54" r="3.5" fill="var(--color-border)" stroke="var(--color-text-muted)" strokeWidth="0.8" />
        <circle cx="70" cy="54" r="1.2" fill="var(--color-text-muted)" />
      </g>
    </svg>
  );
}

function Carriage() {
  return (
    <svg viewBox="0 0 320 58" fill="none" xmlns="http://www.w3.org/2000/svg" className="train-car train-carriage">
      <rect x="0" y="8" width="320" height="40" rx="4" fill="var(--color-bg-elevated)" stroke="var(--color-border-hover)" strokeWidth="1.2" />
      <rect x="0" y="30" width="320" height="3" rx="1.5" fill="var(--color-accent)" opacity="0.9" />
      {[16,38,60,82,108,130,152,174,200,222,244,266,292].map((wx) => (
        <rect key={wx} x={wx} y="15" width="16" height="10" rx="2" fill="var(--color-accent)" opacity="0.4" />
      ))}
      <line x1="4" y1="8" x2="316" y2="8" stroke="var(--color-border-hover)" strokeWidth="0.8" opacity="0.5" />
      <rect x="0" y="12" width="4" height="36" rx="1.5" fill="var(--color-border-hover)" opacity="0.5" />
      <rect x="316" y="12" width="4" height="36" rx="1.5" fill="var(--color-border-hover)" opacity="0.5" />
      <g>
        <rect x="220" y="48" width="44" height="5" rx="2" fill="var(--color-border-hover)" />
        <circle cx="230" cy="54" r="3.5" fill="var(--color-border)" stroke="var(--color-text-muted)" strokeWidth="0.8" />
        <circle cx="230" cy="54" r="1.2" fill="var(--color-text-muted)" />
        <circle cx="250" cy="54" r="3.5" fill="var(--color-border)" stroke="var(--color-text-muted)" strokeWidth="0.8" />
        <circle cx="250" cy="54" r="1.2" fill="var(--color-text-muted)" />
      </g>
      <g>
        <rect x="56" y="48" width="44" height="5" rx="2" fill="var(--color-border-hover)" />
        <circle cx="66" cy="54" r="3.5" fill="var(--color-border)" stroke="var(--color-text-muted)" strokeWidth="0.8" />
        <circle cx="66" cy="54" r="1.2" fill="var(--color-text-muted)" />
        <circle cx="86" cy="54" r="3.5" fill="var(--color-border)" stroke="var(--color-text-muted)" strokeWidth="0.8" />
        <circle cx="86" cy="54" r="1.2" fill="var(--color-text-muted)" />
      </g>
    </svg>
  );
}

/** Rear power car — lead car mirrored so nose points LEFT (trailing end) */
function RearCar() {
  return (
    <svg
      viewBox="0 0 378 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="train-car train-lead"
      style={{ transform: 'scaleX(-1)' }}
    >
      <path
        d="M4 8 L310 8 Q315 8 322 12 L368 30 Q376 34 376 38 L376 44 Q376 48 372 48 L4 48 Q0 48 0 44 L0 12 Q0 8 4 8 Z"
        fill="var(--color-bg-elevated)" stroke="var(--color-border-hover)" strokeWidth="1.2"
      />
      <path
        d="M310 8 Q315 8 322 12 L368 30 Q376 34 376 38 L376 44 Q376 48 372 48 L310 48 Z"
        fill="var(--color-bg-elevated)" stroke="var(--color-border-hover)" strokeWidth="1.2"
      />
      <rect x="4" y="30" width="368" height="3" rx="1.5" fill="var(--color-accent)" opacity="0.9" />
      {[16,38,60,82,104,130,152,174,196,218,244,266,288].map((wx) => (
        <rect key={wx} x={wx} y="15" width="16" height="10" rx="2" fill="var(--color-accent)" opacity="0.4" />
      ))}
      <path d="M310 12 L316 12 Q320 12 324 14 L340 22 L340 28 L310 28 Z" fill="var(--color-accent)" opacity="0.3" />
      <circle cx="364" cy="38" r="2.5" fill="var(--color-danger)" opacity="0.8" />
      <rect x="0" y="12" width="5" height="36" rx="2" fill="var(--color-border-hover)" opacity="0.5" />
      <line x1="8" y1="8" x2="310" y2="8" stroke="var(--color-border-hover)" strokeWidth="0.8" opacity="0.5" />
      <g>
        <rect x="260" y="48" width="44" height="5" rx="2" fill="var(--color-border-hover)" />
        <circle cx="270" cy="54" r="3.5" fill="var(--color-border)" stroke="var(--color-text-muted)" strokeWidth="0.8" />
        <circle cx="270" cy="54" r="1.2" fill="var(--color-text-muted)" />
        <circle cx="290" cy="54" r="3.5" fill="var(--color-border)" stroke="var(--color-text-muted)" strokeWidth="0.8" />
        <circle cx="290" cy="54" r="1.2" fill="var(--color-text-muted)" />
      </g>
      <g>
        <rect x="40" y="48" width="44" height="5" rx="2" fill="var(--color-border-hover)" />
        <circle cx="50" cy="54" r="3.5" fill="var(--color-border)" stroke="var(--color-text-muted)" strokeWidth="0.8" />
        <circle cx="50" cy="54" r="1.2" fill="var(--color-text-muted)" />
        <circle cx="70" cy="54" r="3.5" fill="var(--color-border)" stroke="var(--color-text-muted)" strokeWidth="0.8" />
        <circle cx="70" cy="54" r="1.2" fill="var(--color-text-muted)" />
      </g>
    </svg>
  );
}


/*
 * TRACK_SVG_Y: y-coordinate of the rail in SVG viewBox units.
 * The train position is calculated dynamically via ResizeObserver
 * so it always aligns with the SVG track regardless of viewport width.
 */
const TRACK_SVG_Y = 92;
const TRAIN_DURATION = 6; // total animation time (~2s visible in container)

type Direction = 'ltr' | 'rtl';

function Train({ direction, bottom, onComplete }: { direction: Direction; bottom: number; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, TRAIN_DURATION * 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const isRTL = direction === 'rtl';

  return (
    <div
      className={isRTL ? 'train-assembly-rtl' : 'train-assembly-ltr'}
      style={{
        position: 'absolute',
        bottom: `${bottom}px`,
        left: 0,
        display: 'flex',
        alignItems: 'flex-end',
        transform: isRTL ? 'scaleX(-1)' : undefined,
        transformOrigin: '50vw center',
      }}
    >
      <RearCar />
      <Carriage />
      <Carriage />
      <LeadCar />
    </div>
  );
}

export default function TrainAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [trainKey, setTrainKey] = useState(0);
  const [direction, setDirection] = useState<Direction>('ltr');
  const [showTrain, setShowTrain] = useState(false);
  const [trainBottom, setTrainBottom] = useState(11);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Dynamically calculate train position to match SVG track
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updatePosition = () => {
      const containerH = el.clientHeight;
      const containerW = el.clientWidth;
      const widthScale = containerW / 900;
      const heightScale = containerH / 100;
      const scale = Math.max(widthScale, heightScale);
      // Track at TRACK_SVG_Y in SVG. With YMax anchor, y=100 maps to element bottom.
      // Track pixel offset from container bottom = (100 - TRACK_SVG_Y) * scale
      const trackFromBottom = (100 - TRACK_SVG_Y) * scale;
      // Offset -3px for wheel alignment
      setTrainBottom(trackFromBottom - 3);
    };

    const ro = new ResizeObserver(updatePosition);
    ro.observe(el);
    updatePosition();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          // First train arrives after 3-5 seconds
          const initialDelay = 3000 + Math.random() * 2000;
          timerRef.current = setTimeout(() => setShowTrain(true), initialDelay);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleTrainComplete = () => {
    setShowTrain(false);
    // Wait 5-10 seconds then send another train
    const delay = 5000 + Math.random() * 5000;
    timerRef.current = setTimeout(() => {
      setDirection((prev) => (prev === 'ltr' ? 'rtl' : 'ltr'));
      setTrainKey((prev) => prev + 1);
      setShowTrain(true);
    }, delay);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden my-8 select-none"
      style={{ height: '110px' }}
      aria-hidden="true"
    >
      <Landscape />

      {visible && showTrain && (
        <Train key={trainKey} direction={direction} bottom={trainBottom} onComplete={handleTrainComplete} />
      )}

      <style>{`
        .train-car {
          display: block;
          flex-shrink: 0;
          height: 24px;
        }
        .train-lead {
          width: 160px;
          margin-left: -1px;
          margin-right: -1px;
        }
        .train-carriage {
          width: 134px;
          margin-right: -1px;
        }

        .train-assembly-ltr {
          transform: translateX(-110%);
          will-change: transform;
          animation: glide-ltr ${TRAIN_DURATION}s linear forwards;
        }

        .train-assembly-rtl {
          transform: scaleX(-1) translateX(-110%);
          will-change: transform;
          animation: glide-rtl ${TRAIN_DURATION}s linear forwards;
        }

        @keyframes glide-ltr {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(calc(100vw + 10%)); }
        }

        @keyframes glide-rtl {
          0% { transform: scaleX(-1) translateX(-110%); }
          100% { transform: scaleX(-1) translateX(calc(100vw + 10%)); }
        }

        .speed-line {
          animation: speed-line-fade ${TRAIN_DURATION}s linear forwards;
          opacity: 0;
        }

        @keyframes speed-line-fade {
          0%, 8% { opacity: 0; }
          15% { opacity: 0.4; }
          80% { opacity: 0.4; }
          100% { opacity: 0; }
        }

        .turbine-blades {
          animation: spin-blades 4s linear infinite;
        }

        @keyframes spin-blades {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .cloud-drift {
          animation: drift-cloud 60s linear infinite;
        }

        @keyframes drift-cloud {
          0% { transform: translateX(0); }
          50% { transform: translateX(30px); }
          100% { transform: translateX(0); }
        }

        /* Sun visible in light mode, hidden in dark */
        .celestial-sun { opacity: 0; transition: opacity 0.5s ease; }
        .celestial-moon { opacity: 1; transition: opacity 0.5s ease; }

        [data-theme="light"] .celestial-sun { opacity: 1; }
        [data-theme="light"] .celestial-moon { opacity: 0; }

        @media (prefers-reduced-motion: reduce) {
          .train-assembly-ltr,
          .train-assembly-rtl {
            animation: none;
            display: none;
          }
          .turbine-blades {
            animation: none;
          }
          .cloud-drift {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
