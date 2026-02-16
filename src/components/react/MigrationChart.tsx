import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const bundleData = [
  { name: 'jQuery', old: 87, new: 0 },
  { name: 'Bootstrap', old: 152, new: 0 },
  { name: 'Angular.js', old: 172, new: 0 },
  { name: 'Highlight.js', old: 48, new: 0 },
  { name: 'React', old: 0, new: 0 },
  { name: 'Tailwind', old: 0, new: 0 },
];

const radarData = [
  { metric: 'Build Speed', old: 60, new: 95 },
  { metric: 'DX', old: 40, new: 90 },
  { metric: 'Interactivity', old: 30, new: 85 },
  { metric: 'Bundle Size', old: 35, new: 95 },
  { metric: 'Extensibility', old: 45, new: 90 },
  { metric: 'Maintainability', old: 25, new: 85 },
];

const timelineData = [
  { year: '2017', stack: 'Jekyll', posts: 2 },
  { year: '2018', stack: 'Hugo/Blogdown', posts: 7 },
  { year: '2019', stack: 'Hugo/Blogdown', posts: 3 },
  { year: '2020', stack: 'Hugo/Blogdown', posts: 7 },
  { year: '2021', stack: 'Hugo/Blogdown', posts: 3 },
  { year: '2022', stack: 'Hugo/Blogdown', posts: 0 },
  { year: '2023', stack: 'Hugo/Blogdown', posts: 0 },
  { year: '2024', stack: 'Hugo/Blogdown', posts: 0 },
  { year: '2025', stack: 'Hugo/Blogdown', posts: 0 },
  { year: '2026', stack: 'Astro', posts: 1 },
];

type Tab = 'bundle' | 'radar' | 'timeline';

/*
 * Recharts needs resolved colour values for SVG attributes (not CSS variables).
 * These neutral greys work well in both dark and light themes.
 */
const GRID = '#6e7681';
const MUTED = '#8b949e';
const ACCENT = '#18BC9C';

const axisProps = {
  tick: { fill: MUTED, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 },
  axisLine: { stroke: GRID },
  tickLine: { stroke: GRID },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      padding: '10px 14px',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '12px',
    }}>
      <p style={{ color: 'var(--color-text-primary)', marginBottom: 4 }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: 0 }}>
          {entry.name}: {entry.value}{entry.name.includes('KB') || label === 'Bundle Size' ? ' KB' : ''}
        </p>
      ))}
    </div>
  );
};

export default function MigrationChart() {
  const [activeTab, setActiveTab] = useState<Tab>('radar');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'radar', label: 'Stack Comparison' },
    { key: 'bundle', label: 'JS Bundle (KB)' },
    { key: 'timeline', label: 'Post Timeline' },
  ];

  return (
    <div style={{
      background: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '24px',
      marginBottom: '24px',
    }}>
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: activeTab === tab.key ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
              color: activeTab === tab.key ? 'var(--color-bg-primary)' : 'var(--color-text-muted)',
              border: `1px solid ${activeTab === tab.key ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '13px',
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={350}>
        {activeTab === 'bundle' ? (
          <BarChart data={bundleData}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} label={{ value: 'KB', position: 'insideLeft', fill: MUTED, fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} />
            <Bar dataKey="old" name="Hugo (2020)" fill="#f85149" radius={[4, 4, 0, 0]} />
            <Bar dataKey="new" name="Astro (2026)" fill={ACCENT} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : activeTab === 'radar' ? (
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke={GRID} />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: MUTED, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: MUTED, fontSize: 10 }}
              axisLine={{ stroke: GRID }}
            />
            <Radar name="Hugo (2020)" dataKey="old" stroke="#f85149" fill="#f85149" fillOpacity={0.2} />
            <Radar name="Astro (2026)" dataKey="new" stroke={ACCENT} fill={ACCENT} fillOpacity={0.3} />
            <Legend wrapperStyle={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        ) : (
          <BarChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
            <XAxis dataKey="year" {...axisProps} />
            <YAxis {...axisProps} label={{ value: 'Posts', position: 'insideLeft', fill: MUTED, fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="posts" name="Posts published" radius={[4, 4, 0, 0]} fill={ACCENT} />
          </BarChart>
        )}
      </ResponsiveContainer>

      <p style={{
        color: 'var(--color-text-muted)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '11px',
        textAlign: 'center',
        marginTop: '12px',
      }}>
        Interactive chart built with React + Recharts, rendered as an Astro island
      </p>
    </div>
  );
}
