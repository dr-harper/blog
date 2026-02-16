import { useState, useEffect, useRef } from 'react';

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

interface Props {
  stats: Stat[];
}

function Counter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      // Ease-out curve
      const progress = 1 - Math.pow(1 - step / steps, 3);
      current = Math.round(value * progress);
      setCount(current);

      if (step >= steps) {
        setCount(value);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [started, value]);

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  );
}

export default function AnimatedStats({ stats }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
      gap: '24px',
    }}>
      {stats.map((stat, i) => (
        <div
          key={i}
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '36px',
            fontWeight: 700,
            color: 'var(--color-accent)',
            marginBottom: '8px',
          }}>
            <Counter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
