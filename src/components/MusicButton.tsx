import { useState } from 'react';
import { X, Music, Volume2, VolumeX } from 'lucide-react';
import { createPortal } from 'react-dom';

interface MusicPopupProps {
  onClose: () => void;
}

function MusicPopup({ onClose }: MusicPopupProps) {
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => setPlaying((p) => !p);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative glass-dark rounded-3xl p-8 max-w-sm w-full z-10 border border-saffron-500/30 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Ashoka Chakra art */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#000080" strokeWidth="3" />
              <circle cx="50" cy="50" r="6" fill="#FF9933" />
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 360) / 24;
                const rad = (angle * Math.PI) / 180;
                const x1 = 50 + 8 * Math.cos(rad);
                const y1 = 50 + 8 * Math.sin(rad);
                const x2 = 50 + 42 * Math.cos(rad);
                const y2 = 50 + 42 * Math.sin(rad);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000080" strokeWidth="1.5" />;
              })}
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-serif font-bold text-center text-primary mb-1">
          Vande Mataram
        </h2>

        {/* Waveform visualization */}
        <div className="flex items-center justify-center gap-1 h-12 mb-6">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: '3px',
                height: playing ? `${Math.random() * 40 + 10}px` : '4px',
                background: `linear-gradient(to top, #FF9933, #138808)`,
                animation: playing ? `float ${0.4 + (i % 5) * 0.1}s ease-in-out infinite alternate` : 'none',
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>

        <button
          onClick={togglePlay}
          className="btn-shine w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300"
          style={{
            background: playing
              ? 'linear-gradient(135deg, #138808, #0a6606)'
              : 'linear-gradient(135deg, #FF9933, #e67e00)',
          }}
        >
          {playing ? <VolumeX size={18} /> : <Volume2 size={18} />}
          {playing ? 'Pause Music' : 'Play Vande Mataram'}
        </button>

        <p className="text-muted text-xs text-center mt-4">
          Where every heartbeat says: Vande Mataram.
        </p>

        {playing && (
          <audio autoPlay loop>
            <source src="/audio/vande_mataram.mp3" type="audio/mpeg" />
          </audio>
        )}
      </div>
    </div>
  );
}

export function MusicButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-shine magnetic flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 border"
        style={{
          background: 'rgba(255,153,51,0.1)',
          borderColor: 'rgba(255,153,51,0.3)',
          color: '#FF9933',
        }}
        title="Play Vande Mataram"
      >
        <Music size={16} />
        <span className="hidden sm:inline">Vande Mataram</span>
      </button>
      {open && createPortal(<MusicPopup onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}
