import { useState } from 'react';

interface Commit {
  hash: string;
  date: string;
  message: string;
  branch?: string;
  diff?: string[];
}

interface Props {
  commits: Commit[];
}

export default function GitTimeline({ commits }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div style={{
      background: '#0a0e14',
      border: '1px solid #30363d',
      borderRadius: '12px',
      overflow: 'hidden',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '13px',
    }}>
      {/* Title bar */}
      <div style={{
        background: '#151920',
        borderBottom: '1px solid #30363d',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f85149' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#d29922' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3fb950' }} />
        <span style={{ color: '#8b949e', fontSize: '12px', marginLeft: '8px' }}>
          git log --oneline --graph career.md
        </span>
      </div>

      <div style={{ padding: '16px', maxHeight: '500px', overflowY: 'auto' }}>
        {commits.map((commit, i) => {
          const isExpanded = expanded === commit.hash;
          const isLast = i === commits.length - 1;

          return (
            <div key={commit.hash} style={{ position: 'relative', paddingLeft: '32px', paddingBottom: isLast ? 0 : '4px' }}>
              {/* Branch line */}
              {!isLast && (
                <div style={{
                  position: 'absolute',
                  left: '7px',
                  top: '8px',
                  bottom: 0,
                  width: '2px',
                  background: '#30363d',
                }} />
              )}

              {/* Commit dot */}
              <div style={{
                position: 'absolute',
                left: '2px',
                top: '4px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: commit.branch === 'HEAD' ? '#18BC9C' : '#30363d',
                border: `2px solid ${commit.branch === 'HEAD' ? '#18BC9C' : '#484f58'}`,
              }} />

              {/* Commit line */}
              <button
                onClick={() => setExpanded(isExpanded ? null : commit.hash)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  padding: '2px 0',
                  cursor: commit.diff ? 'pointer' : 'default',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '13px',
                  lineHeight: '1.6',
                }}
              >
                <span style={{ color: '#d29922' }}>{commit.hash}</span>
                {commit.branch && (
                  <span style={{
                    color: commit.branch === 'HEAD' ? '#18BC9C' : '#58a6ff',
                    marginLeft: '8px',
                    fontSize: '11px',
                    border: `1px solid ${commit.branch === 'HEAD' ? '#18BC9C' : '#58a6ff'}`,
                    borderRadius: '4px',
                    padding: '1px 6px',
                  }}>
                    {commit.branch}
                  </span>
                )}
                <span style={{ color: '#c9d1d9', marginLeft: '8px' }}>{commit.message}</span>
                <span style={{ color: '#8b949e', marginLeft: '8px', fontSize: '11px' }}>{commit.date}</span>
                {commit.diff && (
                  <span style={{ color: '#8b949e', marginLeft: '4px', fontSize: '11px' }}>
                    {isExpanded ? '▾' : '▸'}
                  </span>
                )}
              </button>

              {/* Expanded diff */}
              {isExpanded && commit.diff && (
                <div style={{
                  background: '#151920',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '12px',
                  margin: '6px 0 10px',
                  fontSize: '12px',
                  lineHeight: '1.8',
                }}>
                  {commit.diff.map((line, j) => {
                    let colour = '#c9d1d9';
                    if (line.startsWith('+')) colour = '#3fb950';
                    else if (line.startsWith('-')) colour = '#f85149';
                    else if (line.startsWith('@')) colour = '#58a6ff';

                    return (
                      <div key={j} style={{ color: colour, whiteSpace: 'pre-wrap' }}>
                        {line}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
