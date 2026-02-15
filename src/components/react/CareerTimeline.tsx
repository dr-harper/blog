import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Role {
  company: string;
  title: string;
  period: string;
  location: string;
  highlights?: string[];
}

interface Props {
  roles: Role[];
}

export default function CareerTimeline({ roles }: Props) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="space-y-0">
      {roles.map((role, i) => {
        const isExpanded = expanded === i;
        const isLast = i === roles.length - 1;

        return (
          <div key={i} className="relative pl-8">
            {/* Vertical line */}
            {!isLast && (
              <div
                className="absolute left-[7px] top-3 bottom-0 w-0.5"
                style={{ backgroundColor: 'var(--color-border)' }}
              />
            )}

            {/* Dot */}
            <div
              className="absolute left-0 top-2 w-4 h-4 rounded-full border-2"
              style={{
                backgroundColor: i === 0 ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                borderColor: i === 0 ? 'var(--color-accent)' : 'var(--color-border)',
              }}
            />

            {/* Content */}
            <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
              <button
                onClick={() => setExpanded(isExpanded ? null : i)}
                className="w-full text-left group"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3
                    className="font-mono font-bold text-sm"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {role.title}
                  </h3>
                  <span
                    className="font-mono text-sm"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {role.company}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span
                    className="text-xs font-mono"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {role.period}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {role.location}
                  </span>
                  {role.highlights && (
                    <ChevronDown
                      size={14}
                      className="transition-transform"
                      style={{
                        color: 'var(--color-text-muted)',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  )}
                </div>
              </button>

              {isExpanded && role.highlights && (
                <ul className="mt-3 space-y-1.5">
                  {role.highlights.map((h, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <span
                        className="mt-1.5 shrink-0 w-1 h-1 rounded-full"
                        style={{ backgroundColor: 'var(--color-accent)' }}
                      />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
