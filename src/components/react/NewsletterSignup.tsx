import { useState, useCallback } from 'react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<FormState>('idle');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;

      setState('submitting');

      try {
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            'form-name': 'newsletter',
            email,
          }).toString(),
        });

        if (response.ok) {
          setState('success');
          setEmail('');
        } else {
          setState('error');
        }
      } catch {
        setState('error');
      }
    },
    [email]
  );

  if (state === 'success') {
    return (
      <div
        className="rounded-lg border p-5 font-mono text-sm"
        style={{
          borderColor: 'var(--color-accent)',
          backgroundColor: 'var(--color-bg-secondary)',
          color: 'var(--color-accent)',
        }}
      >
        <p>$ subscribe --email {email || '...'}</p>
        <p className="mt-1" style={{ color: 'var(--color-accent)' }}>
          [OK] Subscription confirmed. You'll hear from me soon.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border p-5"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-bg-secondary)',
      }}
    >
      <p className="font-mono text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
        <span style={{ color: 'var(--color-accent)' }}>$</span> subscribe --email
      </p>
      <form
        name="newsletter"
        method="POST"
        data-netlify="true"
        onSubmit={handleSubmit}
        className="flex gap-2"
      >
        <input type="hidden" name="form-name" value="newsletter" />
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="flex-1 rounded-lg border px-3 py-2 text-sm font-mono outline-none transition-colors"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        />
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="rounded-lg border px-4 py-2 text-sm font-mono transition-colors"
          style={{
            borderColor: 'var(--color-accent)',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-bg-primary)',
            opacity: state === 'submitting' ? 0.7 : 1,
          }}
        >
          {state === 'submitting' ? '...' : 'Subscribe'}
        </button>
      </form>
      {state === 'error' && (
        <p className="text-xs font-mono mt-2" style={{ color: 'var(--color-danger)' }}>
          [ERR] Something went wrong. Please try again.
        </p>
      )}
      <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
        Occasional posts about data, energy, and building things. No spam.
      </p>
    </div>
  );
}
