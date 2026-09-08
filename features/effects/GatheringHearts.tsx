'use client';

// Small hearts drifting inward and pulsing together — shown instead of
// plain text when both partners are on the site at the same moment.
export function GatheringHearts() {
  return (
    <div className="relative flex h-24 w-full items-center justify-center">
      {Array.from({ length: 6 }).map((_, index) => (
        <span
          key={index}
          className="absolute text-2xl"
          style={{
            animation: `heart-gather 2.4s ease-in-out ${index * 0.15}s infinite alternate`,
            left: `calc(50% + ${(index - 2.5) * 22}px)`,
          }}
        >
          🤍
        </span>
      ))}
      <style>{`
        @keyframes heart-gather {
          0% { transform: translateY(6px) scale(0.85); opacity: 0.5; }
          100% { transform: translateY(-6px) scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
