import { useEffect, useRef, useState } from 'react';

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const trailPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let raf: number;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
    };

    const animate = () => {
      trailPos.current.x += (pos.current.x - trailPos.current.x) * 0.12;
      trailPos.current.y += (pos.current.y - trailPos.current.y) * 0.12;
      if (trailRef.current) {
        trailRef.current.style.left = `${trailPos.current.x}px`;
        trailRef.current.style.top = `${trailPos.current.y}px`;
      }
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div ref={glowRef} className="cursor-glow" style={{ left: 0, top: 0 }} />
      <div ref={trailRef} className="cursor-trail" style={{ left: 0, top: 0 }} />
    </>
  );
}
