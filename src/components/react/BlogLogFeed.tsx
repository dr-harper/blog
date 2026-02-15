import { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, Pause } from 'lucide-react';

interface LogPost {
  title: string;
  slug: string;
  date: string;
  tags: string[];
  description?: string;
}

interface BlogLogFeedProps {
  posts: LogPost[];
}

function getTagColour(tags: string[]): string {
  const tag = tags[0]?.toLowerCase() ?? '';
  if (['r', 'python', 'typescript', 'programming', 'gis'].some((t) => tag.includes(t))) {
    return 'var(--color-accent)';
  }
  if (['data', 'covid', 'analysis', 'visualisation'].some((t) => tag.includes(t))) {
    return 'var(--color-info)';
  }
  if (['cycling', 'walking', 'personal'].some((t) => tag.includes(t))) {
    return 'var(--color-warning)';
  }
  return 'var(--color-text-muted)';
}

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

export default function BlogLogFeed({ posts }: BlogLogFeedProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAnimation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= posts.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, 200);
  }, [posts.length]);

  useEffect(() => {
    // Use IntersectionObserver to trigger when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAnimation]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isPaused) return;
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [visibleCount, isPaused]);

  const visiblePosts = posts.slice(0, visibleCount);

  return (
    <div
      ref={containerRef}
      className="rounded-lg border overflow-hidden font-mono text-sm"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-bg-secondary)',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Terminal header bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}
      >
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-danger)' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-warning)' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <Terminal size={12} />
          tail -f blog.log
        </span>
        {isPaused && (
          <span className="inline-flex items-center gap-1 text-xs ml-auto" style={{ color: 'var(--color-warning)' }}>
            <Pause size={10} />
            PAUSED
          </span>
        )}
      </div>

      {/* Log entries */}
      <div className="max-h-96 overflow-y-auto overflow-x-hidden p-3 space-y-1">
        {visiblePosts.map((post) => {
          const colour = getTagColour(post.tags);
          return (
            <a
              key={post.slug}
              href={`/blog/${post.slug}/`}
              className="block truncate hover:opacity-80 transition-opacity"
            >
              <span style={{ color: 'var(--color-text-muted)' }}>
                [{formatTimestamp(post.date)}]
              </span>{' '}
              <span style={{ color: colour }}>
                [{post.tags[0] ?? 'post'}]
              </span>{' '}
              <span style={{ color: 'var(--color-text-primary)' }}>
                {post.title}
              </span>
            </a>
          );
        })}
        {visibleCount < posts.length && (
          <span className="animate-pulse" style={{ color: 'var(--color-accent)' }}>
            _
          </span>
        )}
        {visibleCount >= posts.length && (
          <p style={{ color: 'var(--color-text-muted)' }}>
            --- end of log ({posts.length} entries) ---
          </p>
        )}
      </div>
    </div>
  );
}
