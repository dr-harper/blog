import { useEffect, useRef, useState, useCallback } from 'react';

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

const CHARS = [
  // Binary
  '0', '1',
  // Python keywords
  'def', 'for', 'if', 'in', 'import', 'class', 'return', 'yield', 'async', 'await',
  // Energy terms
  'kWh', 'COP', 'ASHP', 'GSHP', 'EPC', 'MWh', 'GJ', 'heat', 'flow', 'temp',
  // Data science
  'df', 'np', 'pd', 'sql', 'api', 'csv', 'json',
  // Symbols
  '>', '<', '/', '{', '}', '(', ')', '=', '+', '*', '&', '#', '@',
];

interface Drop {
  x: number;
  y: number;
  speed: number;
  char: string;
  opacity: number;
}

export default function MatrixRain() {
  const [active, setActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<Drop[]>([]);
  const animRef = useRef<number>(0);
  const codeRef = useRef<number>(0);

  const getRandomChar = useCallback(() => {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }, []);

  // Listen for Konami code
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (active) {
        if (e.key === 'Escape') {
          setActive(false);
          return;
        }
        return;
      }

      if (e.code === KONAMI_CODE[codeRef.current]) {
        codeRef.current++;
        if (codeRef.current === KONAMI_CODE.length) {
          setActive(true);
          codeRef.current = 0;
        }
      } else {
        codeRef.current = 0;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  // Canvas animation
  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    // Initialise drops
    const columnWidth = 20;
    const columns = Math.floor(canvas.width / columnWidth);
    dropsRef.current = Array.from({ length: columns }, (_, i) => ({
      x: i * columnWidth,
      y: Math.random() * -canvas.height,
      speed: 2 + Math.random() * 4,
      char: getRandomChar(),
      opacity: 0.3 + Math.random() * 0.7,
    }));

    let lastTime = 0;
    const charChangeInterval = 150;

    function animate(time: number) {
      if (!ctx || !canvas) return;

      // Semi-transparent black for trail effect
      ctx.fillStyle = 'rgba(10, 14, 20, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = '14px "JetBrains Mono", monospace';

      for (const drop of dropsRef.current) {
        drop.y += drop.speed;

        // Update character periodically
        if (time - lastTime > charChangeInterval) {
          drop.char = getRandomChar();
        }

        const alpha = drop.opacity * (1 - drop.y / canvas.height);
        ctx.fillStyle = `rgba(24, 188, 156, ${Math.max(alpha, 0.1)})`;
        ctx.fillText(drop.char, drop.x, drop.y);

        // Reset at bottom
        if (drop.y > canvas.height) {
          drop.y = Math.random() * -100;
          drop.speed = 2 + Math.random() * 4;
          drop.opacity = 0.3 + Math.random() * 0.7;
        }
      }

      if (time - lastTime > charChangeInterval) {
        lastTime = time;
      }

      animRef.current = requestAnimationFrame(animate);
    }

    // Pause when tab is hidden
    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(animRef.current);
      } else {
        animRef.current = requestAnimationFrame(animate);
      }
    }

    document.addEventListener('visibilitychange', handleVisibility);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [active, getRandomChar]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div
        className="absolute bottom-4 left-4 font-mono text-xs px-3 py-1.5 rounded-lg border pointer-events-auto"
        style={{
          borderColor: 'var(--color-accent)',
          backgroundColor: 'var(--color-bg-primary)',
          color: 'var(--color-accent)',
        }}
      >
        [easter-egg] matrix mode enabled &mdash; press Esc to exit
      </div>
    </div>
  );
}
