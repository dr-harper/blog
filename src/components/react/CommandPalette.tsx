import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FileText, FolderGit2, Tag, Home, Search, CornerDownLeft } from 'lucide-react';

interface PageItem {
  title: string;
  href: string;
  category: 'page' | 'post' | 'project' | 'tag';
  description?: string;
  date?: string;
}

interface CommandPaletteProps {
  pages: PageItem[];
}

function fuzzyMatch(query: string, text: string): { match: boolean; score: number } {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();

  // Exact substring match gets highest score
  if (lower.includes(q)) {
    return { match: true, score: lower.indexOf(q) === 0 ? 100 : 80 };
  }

  // Fuzzy character matching
  let qi = 0;
  let score = 0;
  let lastIndex = -1;

  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) {
      score += lastIndex === -1 || i === lastIndex + 1 ? 10 : 5;
      lastIndex = i;
      qi++;
    }
  }

  return { match: qi === q.length, score };
}

const categoryLabels: Record<string, string> = {
  page: 'Pages',
  post: 'Blog Posts',
  project: 'Projects',
  tag: 'Tags',
};

const categoryOrder = ['page', 'project', 'post', 'tag'];

export default function CommandPalette({ pages }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) {
      return pages.slice(0, 12);
    }

    return pages
      .map((page) => {
        const titleMatch = fuzzyMatch(query, page.title);
        const descMatch = page.description ? fuzzyMatch(query, page.description) : { match: false, score: 0 };
        const bestScore = Math.max(titleMatch.score, descMatch.score * 0.7);
        return { ...page, score: bestScore, isMatch: titleMatch.match || descMatch.match };
      })
      .filter((p) => p.isMatch)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
  }, [query, pages]);

  // Group results by category
  const grouped = useMemo(() => {
    const groups: Record<string, PageItem[]> = {};
    for (const item of results) {
      const cat = item.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return categoryOrder
      .filter((cat) => groups[cat])
      .map((cat) => ({ category: cat, items: groups[cat] }));
  }, [results]);

  // Flat list for keyboard navigation
  const flatItems = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setSelectedIndex(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  const navigate = useCallback(
    (href: string) => {
      close();
      window.location.href = href;
    },
    [close]
  );

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          close();
        } else {
          open();
        }
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && flatItems[selectedIndex]) {
        navigate(flatItems[selectedIndex].href);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, open, close, flatItems, selectedIndex, navigate]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector('[data-selected="true"]');
    selected?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  let itemIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={close}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }} />

      {/* Palette */}
      <div
        className="relative w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
          <Search size={16} className="shrink-0" style={{ color: 'var(--color-accent)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, posts, projects..."
            className="flex-1 bg-transparent text-sm font-mono outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          />
          <kbd
            className="hidden sm:inline-block text-xs font-mono rounded border px-1.5 py-0.5"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {grouped.length === 0 ? (
            <p className="text-sm font-mono text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
              No results found
            </p>
          ) : (
            grouped.map((group) => (
              <div key={group.category} className="mb-2">
                <p
                  className="text-xs font-mono uppercase tracking-wider px-2 py-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {categoryLabels[group.category]}
                </p>
                {group.items.map((item) => {
                  const currentIndex = itemIndex++;
                  const isSelected = currentIndex === selectedIndex;

                  return (
                    <button
                      key={item.href}
                      data-selected={isSelected}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors"
                      style={{
                        backgroundColor: isSelected ? 'var(--color-bg-elevated)' : 'transparent',
                        color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      }}
                      onClick={() => navigate(item.href)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                    >
                      <span className="shrink-0" style={{ color: 'var(--color-accent)' }}>
                        {item.category === 'post'
                          ? <FileText size={14} />
                          : item.category === 'project'
                            ? <FolderGit2 size={14} />
                            : item.category === 'tag'
                              ? <Tag size={14} />
                              : <Home size={14} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono truncate">{item.title}</p>
                        {item.date && (
                          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                            {item.date}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <CornerDownLeft size={12} style={{ color: 'var(--color-text-muted)' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div
          className="flex items-center justify-between border-t px-4 py-2 text-xs font-mono"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          <span>
            <kbd className="rounded border px-1" style={{ borderColor: 'var(--color-border)' }}>&uarr;</kbd>
            <kbd className="rounded border px-1 ml-1" style={{ borderColor: 'var(--color-border)' }}>&darr;</kbd>
            {' '}navigate
          </span>
          <span>
            <kbd className="rounded border px-1" style={{ borderColor: 'var(--color-border)' }}>&crarr;</kbd>
            {' '}open
          </span>
        </div>
      </div>
    </div>
  );
}
