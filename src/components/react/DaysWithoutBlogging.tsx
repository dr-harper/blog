import { useState, useEffect, useRef } from 'react';

const LAST_POST_DATE = new Date('2021-02-01T00:00:00Z');
const THIS_POST_DATE = new Date('2026-02-15T00:00:00Z');

function getElapsed(from: Date, to: Date) {
  const diff = to.getTime() - from.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365.25);
  const remainingDays = days - Math.floor(years * 365.25);
  return { years, days: remainingDays, hours: hours % 24, minutes: minutes % 60, seconds: seconds % 60, totalDays: days };
}

export default function DaysWithoutBlogging() {
  const [now, setNow] = useState(THIS_POST_DATE);
  const [isReset, setIsReset] = useState(false);
  const [resetTime, setResetTime] = useState<Date | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      setNow(new Date());
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const elapsed = isReset && resetTime
    ? getElapsed(resetTime, now)
    : getElapsed(LAST_POST_DATE, now);

  const handleReset = () => {
    setIsReset(true);
    setResetTime(new Date());
    setTimeout(() => {
      setIsReset(false);
      setResetTime(null);
    }, 5000);
  };

  const digitStyle = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '32px',
    fontWeight: 700,
    lineHeight: 1,
    color: isReset ? 'var(--color-accent)' : '#f85149',
    transition: 'color 0.3s ease',
  } as const;

  const labelStyle = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginTop: '4px',
  } as const;

  const segments = [
    { value: elapsed.years, label: 'years' },
    { value: elapsed.days, label: 'days' },
    { value: elapsed.hours, label: 'hrs' },
    { value: elapsed.minutes, label: 'min' },
    { value: elapsed.seconds, label: 'sec' },
  ];

  return (
    <div style={{
      background: 'var(--color-bg-secondary)',
      border: `2px solid ${isReset ? 'var(--color-accent)' : '#f85149'}`,
      borderRadius: '12px',
      padding: '24px',
      marginTop: '24px',
      marginBottom: '24px',
      textAlign: 'center',
      transition: 'border-color 0.3s ease',
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '11px',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: '16px',
      }}>
        {isReset ? '🎉 Counter reset! Back to writing.' : '⚠️ Days without a blog post'}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '16px',
      }}>
        {segments.map(({ value, label }) => (
          <div key={label} style={{ minWidth: '48px' }}>
            <div style={digitStyle}>{String(value).padStart(2, '0')}</div>
            <div style={labelStyle}>{label}</div>
          </div>
        ))}
      </div>

      <button
        onClick={handleReset}
        disabled={isReset}
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          background: isReset ? 'var(--color-bg-elevated)' : 'var(--color-bg-elevated)',
          color: isReset ? 'var(--color-accent)' : 'var(--color-text-primary)',
          border: `1px solid ${isReset ? 'var(--color-accent)' : 'var(--color-border)'}`,
          borderRadius: '6px',
          padding: '8px 20px',
          cursor: isReset ? 'default' : 'pointer',
          transition: 'all 0.2s',
          opacity: isReset ? 0.7 : 1,
        }}
      >
        {isReset ? '✓ Published!' : '$ git push origin master'}
      </button>

      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px',
        color: 'var(--color-text-muted)',
        marginTop: '12px',
        opacity: 0.6,
      }}>
        Last post: February 2021 · This post: February 2026
      </div>
    </div>
  );
}
