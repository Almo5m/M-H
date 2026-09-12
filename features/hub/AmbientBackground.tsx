export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#F7F1E8]">
      <div className="ambient-blob ambient-blob-a" />
      <div className="ambient-blob ambient-blob-b" />
      <div className="ambient-dot" style={{ top: '18%', left: '12%', animationDelay: '0s' }} />
      <div className="ambient-dot" style={{ top: '70%', left: '85%', animationDelay: '3s' }} />
      <div className="ambient-dot" style={{ top: '40%', left: '92%', animationDelay: '6s' }} />
      <svg className="absolute -left-10 top-0 h-full w-40 opacity-[0.06]" viewBox="0 0 100 800" preserveAspectRatio="none">
        <path d="M20 0 C60 200, -10 400, 30 800" stroke="#8E6873" strokeWidth="1" fill="none" />
      </svg>
      <svg className="absolute -right-10 top-0 h-full w-40 opacity-[0.06]" viewBox="0 0 100 800" preserveAspectRatio="none">
        <path d="M80 0 C40 200, 110 400, 70 800" stroke="#8E6873" strokeWidth="1" fill="none" />
      </svg>

      <style>{`
        .ambient-blob {
          position: absolute;
          width: 50vw;
          height: 50vw;
          border-radius: 999px;
          filter: blur(90px);
          opacity: 0.18;
          animation: ambient-drift 40s ease-in-out infinite alternate;
        }
        .ambient-blob-a {
          top: -10%;
          left: -10%;
          background: #B99AA1;
        }
        .ambient-blob-b {
          bottom: -15%;
          right: -10%;
          background: #C7A96B;
          animation-duration: 55s;
        }
        .ambient-dot {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: #C7A96B;
          animation: ambient-twinkle 8s ease-in-out infinite;
        }
        @keyframes ambient-drift {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(4%, 3%) scale(1.08); }
        }
        @keyframes ambient-twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.9; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ambient-blob, .ambient-dot { animation: none; }
        }
      `}</style>
    </div>
  );
}
