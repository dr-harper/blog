import { useState, useCallback } from 'react';
import { Copy, Check, Linkedin, Share2 } from 'lucide-react';

interface ShareBarProps {
  url: string;
  title: string;
}

export default function ShareBar({ url, title }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      label: 'Twitter/X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: <Linkedin size={16} />,
    },
    {
      label: 'Bluesky',
      href: `https://bsky.app/intent/compose?text=${encodedTitle}%20${encodedUrl}`,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.643 3.593 3.515 6.206 3.268-.375.053-.686.102-.93.148-2.7.497-5.304 2.329-2.08 6.386 3.465 4.358 5.88 1.385 7.18-1.453.486-.995.786-1.663.886-1.8-.174-.002-.174-.002 0 0 .1.137.4.805.886 1.8 1.3 2.838 3.715 5.811 7.18 1.453 3.223-4.057.62-5.889-2.08-6.386a12.678 12.678 0 00-.93-.148c2.613.247 5.421-.625 6.206-3.268.246-.83.624-5.789.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.3-1.664-.621-4.3 1.24C16.046 4.747 13.087 8.686 12 10.8z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <span className="inline-flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
        <Share2 size={12} />
        share:
      </span>
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-mono transition-colors"
        style={{
          borderColor: copied ? 'var(--color-accent)' : 'var(--color-border)',
          color: copied ? 'var(--color-accent)' : 'var(--color-text-muted)',
          backgroundColor: 'var(--color-bg-secondary)',
        }}
        title="Copy link"
      >
        {copied ? (
          <>
            <Check size={14} />
            Copied!
          </>
        ) : (
          <>
            <Copy size={14} />
            Copy link
          </>
        )}
      </button>

      {shareLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg border p-1.5 transition-colors"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-bg-secondary)',
          }}
          title={`Share on ${link.label}`}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
            e.currentTarget.style.color = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}
