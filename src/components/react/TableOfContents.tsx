import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, List } from 'lucide-react';

interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    observerRef.current?.disconnect();

    const headingElements = headings
      .map((h) => document.getElementById(h.slug))
      .filter(Boolean) as HTMLElement[];

    if (headingElements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [headings]);

  useEffect(() => {
    const cleanup = setupObserver();
    return cleanup;
  }, [setupObserver]);

  const filteredHeadings = headings.filter((h) => h.depth >= 2 && h.depth <= 3);

  if (filteredHeadings.length < 3) return null;

  return (
    <>
      {/* Desktop: sidebar */}
      <nav
        className="hidden xl:block max-h-[calc(100vh-8rem)] overflow-y-auto"
        aria-label="Table of contents"
      >
        <p
          className="flex items-center gap-1.5 text-xs font-mono font-bold mb-3 uppercase tracking-wider"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <List size={12} style={{ color: 'var(--color-accent)' }} />
          <span style={{ color: 'var(--color-accent)' }}>tree</span> --toc
        </p>
        <ul className="space-y-1 text-sm border-l" style={{ borderColor: 'var(--color-border)' }}>
          {filteredHeadings.map((heading) => (
            <li key={heading.slug}>
              <a
                href={`#${heading.slug}`}
                className="block py-1 transition-colors border-l-2 -ml-px"
                style={{
                  paddingLeft: heading.depth === 3 ? '1.5rem' : '0.75rem',
                  color:
                    activeId === heading.slug
                      ? 'var(--color-accent)'
                      : 'var(--color-text-muted)',
                  borderColor:
                    activeId === heading.slug
                      ? 'var(--color-accent)'
                      : 'transparent',
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile: expandable panel */}
      <div className="xl:hidden mb-8">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-mono transition-colors"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
          }}
        >
          <span>
            <span style={{ color: 'var(--color-accent)' }}>tree</span> --toc ({filteredHeadings.length} headings)
          </span>
          <ChevronDown
            size={16}
            className="transition-transform"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>
        {isOpen && (
          <ul
            className="mt-2 space-y-1 text-sm rounded-lg border p-4"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bg-secondary)',
            }}
          >
            {filteredHeadings.map((heading) => (
              <li key={heading.slug}>
                <a
                  href={`#${heading.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="block py-1 transition-colors"
                  style={{
                    paddingLeft: heading.depth === 3 ? '1.5rem' : '0.5rem',
                    color:
                      activeId === heading.slug
                        ? 'var(--color-accent)'
                        : 'var(--color-text-muted)',
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
