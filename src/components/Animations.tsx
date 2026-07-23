import { useEffect, useRef } from 'react';

export function FloatingBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div
        className="absolute rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, #FF9933, transparent)',
          top: '-100px',
          left: '-100px',
          opacity: 'var(--blob-opacity)',
        }}
      />
      <div
        className="absolute rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-15 dark:opacity-8 animate-blob-delayed"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, #138808, transparent)',
          top: '30%',
          right: '-150px',
          opacity: 'var(--blob-opacity)',
        }}
      />
      <div
        className="absolute rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-10 dark:opacity-8 animate-blob-slow"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, #000080, transparent)',
          bottom: '10%',
          left: '40%',
          opacity: 'var(--blob-opacity)',
        }}
      />
      <div
        className="absolute rounded-full filter blur-3xl opacity-10 animate-float"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, #FFB347, transparent)',
          top: '60%',
          left: '10%',
          opacity: 'var(--blob-opacity)',
        }}
      />
    </div>
  );
}

export function MorphingBlob({ className = '' }: { className?: string }) {
  return (
    <div
      className={`morph-blob ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,153,51,0.3), rgba(19,136,8,0.3))',
        filter: 'blur(2px)',
      }}
    />
  );
}

export function ParallaxSection({
  children,
  speed = 0.5,
  className = '',
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const y = rect.top * speed;
      el.style.transform = `translateY(${y}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);

  return (
    <div ref={ref} className={`parallax-section ${className}`}>
      {children}
    </div>
  );
}
