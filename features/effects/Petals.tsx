'use client';

// Slow-falling petals used behind the roses/words scenes — purely
// decorative, no state or network involved.
export function Petals({ count = 14 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className="absolute h-2 w-2 rounded-full bg-rose/70"
          style={{
            left: `${(index * 97) % 100}%`,
            top: '-5%',
            animation: `petal-fall ${8 + (index % 5)}s linear ${index * 0.6}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes petal-fall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          100% { transform: translateY(110vh) translateX(30px) rotate(180deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
