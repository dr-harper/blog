import { useState, useRef, useEffect } from 'react';

const COMMANDS: Record<string, string | string[]> = {
  help: [
    'Available commands:',
    '  help          Show this message',
    '  ls            List pages',
    '  whoami        About the site owner',
    '  cd home       Go to homepage',
    '  cd blog       Go to blog',
    '  cd projects   Go to projects',
    '  history       Show recent posts',
    '  ping          Check if site is alive',
    '  sudo rm -rf   Nice try',
    '  clear         Clear terminal',
    '  exit          Leave terminal',
  ],
  ls: [
    'drwxr-xr-x  home/',
    'drwxr-xr-x  blog/',
    'drwxr-xr-x  projects/',
    'drwxr-xr-x  about/',
    'drwxr-xr-x  search/',
    '-rw-r--r--  404.html        <-- you are here',
  ],
  whoami: [
    'Mikey Harper',
    'Full-stack data scientist | Energy industry',
    'Runs on: coffee, Python, and questionable deployment decisions',
  ],
  pwd: '/dev/null/404',
  ping: [
    'PING mikeyharper.uk (127.0.0.1): 56 data bytes',
    '64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.042 ms',
    '64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.038 ms',
    '--- mikeyharper.uk ping statistics ---',
    '2 packets transmitted, 2 received, 0% packet loss',
    'Site is alive. This page just doesn\'t exist.',
  ],
  'sudo rm -rf': '🚫 Permission denied. Nice try though.',
  'sudo rm -rf /': '🚫 Absolutely not.',
  'rm -rf': '🚫 I\'m not falling for that.',
  date: new Date().toUTCString(),
  uptime: 'Site has been running since 2016. With a 5 year nap in the middle.',
  cat: 'cat: page_you_wanted: No such file or directory',
  echo: 'echo echo echo...',
  vim: 'I see you like to live dangerously. Try :q! to escape.',
  emacs: 'This terminal is too small for Emacs.',
  python: '>>> print("Go to /blog/ for Python content")',
  node: 'This site ships zero JS by default. Ironic, isn\'t it?',
  git: 'fatal: not a git repository (or any of the parent directories): .git',
  npm: 'npm WARN 404 Not Found - GET https://registry.npmjs.org/the-page-you-wanted',
  coffee: '☕ Brewing... Done. Now go find the right page.',
  exit: '__EXIT__',
};

interface HistoryEntry {
  command: string;
  output: string[];
}

export default function Terminal404() {
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      command: '',
      output: [
        '404 — Page not found',
        'The page you\'re looking for doesn\'t exist.',
        'Type "help" for available commands, or "cd home" to go back.',
        '',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();

    if (trimmed === '') return;

    if (trimmed === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    if (trimmed === 'cd home' || trimmed === 'cd /') {
      window.location.href = '/';
      return;
    }
    if (trimmed === 'cd blog') {
      window.location.href = '/blog/';
      return;
    }
    if (trimmed === 'cd projects') {
      window.location.href = '/projects/';
      return;
    }
    if (trimmed === 'cd about') {
      window.location.href = '/about/';
      return;
    }
    if (trimmed === 'cd search') {
      window.location.href = '/search/';
      return;
    }

    if (trimmed === 'exit') {
      window.location.href = '/';
      return;
    }

    if (trimmed === 'history') {
      const output = [
        'Recent posts:',
        '  1  Migrating from Blogdown to Astro',
        '  2  4 Lessons from the smart home',
        '  3  COVID-19: East-West Relationship',
        '  4  COVID-19 Correlation',
        '',
        'Run "cd blog" to see all posts.',
      ];
      setHistory((prev) => [...prev, { command: cmd, output }]);
      setInput('');
      return;
    }

    const response = COMMANDS[trimmed];
    let output: string[];

    if (response) {
      output = Array.isArray(response) ? response : [response];
    } else if (trimmed.startsWith('cd ')) {
      output = [`cd: ${trimmed.slice(3)}: No such directory. Try "ls" to see available pages.`];
    } else if (trimmed.startsWith('cat ')) {
      output = [`cat: ${trimmed.slice(4)}: No such file or directory`];
    } else if (trimmed.startsWith('echo ')) {
      output = [cmd.slice(5)];
    } else {
      output = [`command not found: ${trimmed}. Type "help" for available commands.`];
    }

    setHistory((prev) => [...prev, { command: cmd, output }]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    }
  };

  return (
    <div
      style={{
        background: '#0a0e14',
        border: '1px solid #30363d',
        borderRadius: '12px',
        overflow: 'hidden',
        maxWidth: '700px',
        margin: '0 auto',
        fontFamily: "'JetBrains Mono', monospace",
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div
        style={{
          background: '#151920',
          borderBottom: '1px solid #30363d',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f85149' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#d29922' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3fb950' }} />
        <span style={{ color: '#8b949e', fontSize: '12px', marginLeft: '8px' }}>
          404 — mikeyharper.uk
        </span>
      </div>

      {/* Terminal body */}
      <div
        ref={terminalRef}
        style={{
          padding: '16px',
          maxHeight: '400px',
          overflowY: 'auto',
          fontSize: '13px',
          lineHeight: '1.6',
        }}
      >
        {history.map((entry, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>
            {entry.command && (
              <div>
                <span style={{ color: '#18BC9C' }}>visitor@mikeyharper.uk</span>
                <span style={{ color: '#8b949e' }}>:</span>
                <span style={{ color: '#58a6ff' }}>~</span>
                <span style={{ color: '#8b949e' }}>$ </span>
                <span style={{ color: '#c9d1d9' }}>{entry.command}</span>
              </div>
            )}
            {entry.output.map((line, j) => (
              <div key={j} style={{ color: '#c9d1d9', whiteSpace: 'pre' }}>
                {line}
              </div>
            ))}
          </div>
        ))}

        {/* Input line */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#18BC9C' }}>visitor@mikeyharper.uk</span>
          <span style={{ color: '#8b949e' }}>:</span>
          <span style={{ color: '#58a6ff' }}>~</span>
          <span style={{ color: '#8b949e' }}>$ </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#c9d1d9',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
              flex: 1,
              caretColor: '#18BC9C',
            }}
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
