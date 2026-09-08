'use client';

import { useEffect, useState } from 'react';

export type SurpriseKind = 'stars' | 'lanterns' | 'flash-message' | 'color-wash' | 'chime';

const FLASH_MESSAGES = [
  'لسه فاكر أول مرة...',
  'كل يوم بينا بيبقى أحلى من اللي قبله.',
  'مستنيك دايمًا هنا.',
];

// Five short, self-contained visual variants — picked in rotation from
// LightMomentScene every few visits so the scene doesn't repeat itself.
export function SurpriseEffect({ kind }: { kind: SurpriseKind }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), 4500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (kind !== 'chime') return;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.6);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1.6);
    return () => audioContext.close();
  }, [kind]);

  if (!visible) return null;

  if (kind === 'stars') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 24 }).map((_, index) => (
          <span
            key={index}
            className="absolute h-1 w-1 rounded-full bg-goldSoft"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `falling-star 1.8s ease-in ${Math.random() * 1.5}s`,
            }}
          />
        ))}
        <style>{`
          @keyframes falling-star {
            0% { opacity: 0; transform: translateY(-30px); }
            30% { opacity: 1; }
            100% { opacity: 0; transform: translateY(60px); }
          }
        `}</style>
      </div>
    );
  }

  if (kind === 'lanterns') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 8 }).map((_, index) => (
          <span
            key={index}
            className="absolute h-3 w-3 rounded-full bg-sunset1 opacity-80 shadow-[0_0_12px_4px_rgba(242,184,146,0.6)]"
            style={{
              left: `${10 + index * 11}%`,
              bottom: '-20px',
              animation: `float-up 4.2s ease-out ${index * 0.25}s`,
            }}
          />
        ))}
        <style>{`
          @keyframes float-up {
            0% { opacity: 0; transform: translateY(0) translateX(0); }
            15% { opacity: 0.9; }
            100% { opacity: 0; transform: translateY(-260px) translateX(20px); }
          }
        `}</style>
      </div>
    );
  }

  if (kind === 'flash-message') {
    const message = FLASH_MESSAGES[Math.floor(Math.random() * FLASH_MESSAGES.length)];
    return (
      <p className="pointer-events-none absolute inset-x-0 top-10 text-center font-arDisplay text-lg text-goldSoft opacity-0 [animation:flash-in-out_4.5s_ease-in-out]">
        {message}
        <style>{`
          @keyframes flash-in-out {
            0% { opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; }
          }
        `}</style>
      </p>
    );
  }

  if (kind === 'color-wash') {
    return (
      <div
        className="pointer-events-none absolute inset-0 opacity-0 [animation:wash_4.5s_ease-in-out]"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(217,184,138,0.35), transparent 65%)' }}
      >
        <style>{`
          @keyframes wash {
            0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  return null;
}
