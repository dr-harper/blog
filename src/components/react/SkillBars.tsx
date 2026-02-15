import { useState, useEffect, useRef } from 'react';

interface Skill {
  name: string;
  level: number; // 0-100
  category?: string;
}

interface Props {
  skills: Skill[];
}

function SkillBar({ name, level }: { name: string; level: number }) {
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) {
          setVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setWidth(level), 100);
      return () => clearTimeout(timer);
    }
  }, [visible, level]);

  return (
    <div ref={ref} style={{ marginBottom: '12px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '4px',
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '13px',
          color: '#c9d1d9',
        }}>
          {name}
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          color: '#8b949e',
        }}>
          {visible ? `${level}%` : '0%'}
        </span>
      </div>
      <div style={{
        height: '6px',
        background: '#1f2430',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${width}%`,
          background: `linear-gradient(90deg, #18BC9C, #58a6ff)`,
          borderRadius: '3px',
          transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  );
}

export default function SkillBars({ skills }: Props) {
  const categories = [...new Set(skills.map((s) => s.category || 'General'))];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '32px',
    }}>
      {categories.map((category) => (
        <div key={category}>
          <h4 style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            color: '#8b949e',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '16px',
          }}>
            {category}
          </h4>
          {skills
            .filter((s) => (s.category || 'General') === category)
            .map((skill) => (
              <SkillBar key={skill.name} name={skill.name} level={skill.level} />
            ))}
        </div>
      ))}
    </div>
  );
}
