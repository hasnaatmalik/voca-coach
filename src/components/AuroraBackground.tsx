'use client';

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export default function AuroraBackground({ children, className = '' }: AuroraBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Aurora gradient layers */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary aurora layer */}
        <div
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-aurora-1"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
          }}
        />
        {/* Secondary aurora layer */}
        <div
          className="absolute -top-1/2 -right-1/2 w-[200%] h-[200%] animate-aurora-2"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(52, 211, 153, 0.25) 0%, transparent 50%)',
          }}
        />
        {/* Tertiary aurora layer */}
        <div
          className="absolute -bottom-1/2 left-1/4 w-[150%] h-[150%] animate-aurora-3"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(110, 231, 183, 0.2) 0%, transparent 50%)',
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">{children}</div>

      <style jsx>{`
        @keyframes aurora-1 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(10%, 10%) rotate(120deg);
          }
          66% {
            transform: translate(-5%, 5%) rotate(240deg);
          }
        }
        @keyframes aurora-2 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(-10%, -5%) rotate(-120deg);
          }
          66% {
            transform: translate(10%, -10%) rotate(-240deg);
          }
        }
        @keyframes aurora-3 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(5%, -5%) scale(1.1);
          }
        }
        .animate-aurora-1 {
          animation: aurora-1 20s ease-in-out infinite;
        }
        .animate-aurora-2 {
          animation: aurora-2 25s ease-in-out infinite;
        }
        .animate-aurora-3 {
          animation: aurora-3 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
