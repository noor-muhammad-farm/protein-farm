import { useState } from 'react';

interface FarmLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  showRing?: boolean;
  variant?: 'circular' | 'rounded';
  alt?: string;
}

const SIZE_MAP = {
  xs: 'w-7 h-7',
  sm: 'w-9 h-9',
  md: 'w-11 h-11 sm:w-12 sm:h-12',
  lg: 'w-14 h-14',
  xl: 'w-16 h-16 sm:w-20 sm:h-20',
  '2xl': 'w-24 h-24 sm:w-28 sm:h-28',
  '3xl': 'w-32 h-32 sm:w-36 sm:h-36',
};

export function FarmLogo({
  size = 'md',
  className = '',
  showRing = true,
  variant = 'circular',
  alt = 'Noor Muhammad Protein Farm Logo',
}: FarmLogoProps) {
  const [hasError, setHasError] = useState(false);

  const shapeClass = variant === 'circular' ? 'rounded-full' : 'rounded-2xl';
  const ringClass = showRing
    ? 'ring-2 ring-amber-400/90 shadow-sm shadow-emerald-950/20'
    : '';

  if (hasError) {
    return (
      <div
        className={`${SIZE_MAP[size]} ${shapeClass} ${ringClass} bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-300 flex items-center justify-center font-bold overflow-hidden ${className}`}
      >
        <span className="text-xs font-black">NMPF</span>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${SIZE_MAP[size]} ${shapeClass} ${ringClass} overflow-hidden bg-white ${className}`}
    >
      <img
        src="/logo.png"
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
}
