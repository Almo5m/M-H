'use client';

import { useState } from 'react';

interface Burst {
  id: number;
  x: number;
  y: number;
}

let burstIdCounter = 0;

// A small delight: tap/click anywhere on the home background and a
// couple of tiny hearts rise softly from that spot and fade.
export function useClickHeartBurst() {
  const [bursts, setBursts] = useState<Burst[]>([]);

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    const id = burstIdCounter++;
    const { clientX, clientY } = event;
    setBursts((current) => [...current, { id, x: clientX, y: clientY }]);
    setTimeout(() => {
      setBursts((current) => current.filter((burst) => burst.id !== id));
    }, 1400);
  }

  const overlay = (
    <div className="pointer-events-none fixed inset-0 z-30">
      {bursts.map((burst) => (
        <span
          key={burst.id}
          className="absolute text-sm text-[#C7A96B]"
          style={{ left: burst.x, top: burst.y, animation: 'heart-burst 1.3s ease-out forwards' }}
        >
          ♥
        </span>
      ))}
      <style>{`
        @keyframes heart-burst {
          0% { opacity: 0.8; transform: translate(-50%, -50%) scale(0.6); }
          100% { opacity: 0; transform: translate(-50%, -140%) scale(1.1); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes heart-burst { 0%, 100% { opacity: 0; } }
        }
      `}</style>
    </div>
  );

  return { handleClick, overlay };
}
