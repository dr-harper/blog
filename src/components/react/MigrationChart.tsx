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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#151920',
      border: '1px solid #30363d',
      borderRadius: '8px',
      padding: '10px 14px',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '12px',
    }}>
      <p style={{ color: '#e6edf3', marginBottom: 4 }}>{label}</p>
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
      background: '#151920',
      border: '1px solid #30363d',
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
              background: activeTab === tab.key ? '#18BC9C' : '#1f2430',
              color: activeTab === tab.key ? '#0a0e14' : '#8b949e',
              border: `1px solid ${activeTab === tab.key ? '#18BC9C' : '#30363d'}`,
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
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#8b949e', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
              axisLine={{ stroke: '#30363d' }}
              tickLine={{ stroke: '#30363d' }}
            />
            <YAxis
              tick={{ fill: '#8b949e', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
              axisLine={{ stroke: '#30363d' }}
              tickLine={{ stroke: '#30363d' }}
              label={{ value: 'KB', position: 'insideLeft', fill: '#8b949e', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
            />
            <Bar dataKey="old" name="Hugo (2020)" fill="#f85149" radius={[4, 4, 0, 0]} />
            <Bar dataKey="new" name="Astro (2026)" fill="#18BC9C" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : activeTab === 'radar' ? (
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#30363d" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: '#8b949e', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#8b949e', fontSize: 10 }}
              axisLine={{ stroke: '#30363d' }}
            />
            <Radar name="Hugo (2020)" dataKey="old" stroke="#f85149" fill="#f85149" fillOpacity={0.2} />
            <Radar name="Astro (2026)" dataKey="new" stroke="#18BC9C" fill="#18BC9C" fillOpacity={0.3} />
            <Legend
              wrapperStyle={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        ) : (
          <BarChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis
              dataKey="year"
              tick={{ fill: '#8b949e', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
              axisLine={{ stroke: '#30363d' }}
              tickLine={{ stroke: '#30363d' }}
            />
            <YAxis
              tick={{ fill: '#8b949e', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
              axisLine={{ stroke: '#30363d' }}
              tickLine={{ stroke: '#30363d' }}
              label={{ value: 'Posts', position: 'insideLeft', fill: '#8b949e', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="posts"
              name="Posts published"
              radius={[4, 4, 0, 0]}
              fill="#18BC9C"
            />
          </BarChart>
        )}
      </ResponsiveContainer>

      <p style={{
        color: '#8b949e',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '11px',
        textAlign: 'center',
        marginTop: '12px',
      }}>
        Interactive chart built with React + Recharts — rendered as an Astro island
      </p>
    </div>
  );
}
