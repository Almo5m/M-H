export function ScatteredHearts() {
  const hearts = [
    { top: '14%', left: '8%', size: 10, delay: '0s', duration: '9s' },
    { top: '22%', left: '88%', size: 8, delay: '2s', duration: '11s' },
    { top: '62%', left: '5%', size: 9, delay: '4s', duration: '10s' },
    { top: '78%', left: '92%', size: 7, delay: '1s', duration: '12s' },
    { top: '40%', left: '95%', size: 8, delay: '6s', duration: '9.5s' },
    { top: '90%', left: '20%', size: 9, delay: '3s', duration: '10.5s' },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {hearts.map((heart, index) => (
        <svg
          key={index}
          viewBox="0 0 24 24"
          className="absolute text-[#B99AA1] opacity-0"
          style={{
            top: heart.top,
            left: heart.left,
            width: heart.size,
            height: heart.size,
            animation: `heart-drift ${heart.duration} ease-in-out ${heart.delay} infinite`,
          }}
        >
          <path
            fill="currentColor"
            d="M12 21s-7.5-4.6-10.1-9C.3 8.9 1.6 5.5 4.7 4.6c2-.6 3.9.2 5.3 2 1.4-1.8 3.3-2.6 5.3-2 3.1.9 4.4 4.3 2.8 7.4C19.5 16.4 12 21 12 21z"
          />
        </svg>
      ))}
      <style>{`
        @keyframes heart-drift {
          0% { opacity: 0; transform: translateY(0); }
          20% { opacity: 0.28; }
          80% { opacity: 0.18; }
          100% { opacity: 0; transform: translateY(-24px); }
        }
        @media (prefers-reduced-motion: reduce) {
          svg { animation: none !important; opacity: 0.15 !important; }
        }
      `}</style>
    </div>
  );
}
