import React from 'react';
import { LogoConfig } from '../types';

interface BatikLogoProps {
  config?: LogoConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const BatikLogo: React.FC<BatikLogoProps> = ({
  config,
  size = 'md',
  className = '',
}) => {
  const tipe = config?.tipe || 'emblem-keraton';
  const monogram = config?.monogramText || 'GR';

  const sizeClass = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  }[size];

  // Custom Image Uploaded
  if (tipe === 'custom-image' && config?.customImageDataUrl) {
    return (
      <div
        className={`relative rounded-xl overflow-hidden shadow-md border border-amber-600/40 shrink-0 bg-stone-900 ${sizeClass} ${className}`}
      >
        <img
          src={config.customImageDataUrl}
          alt="Logo RT GasemRaya"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Gunungan Wayang Batik Silhouette
  if (tipe === 'gunungan') {
    return (
      <div
        className={`relative rounded-xl flex items-center justify-center shadow-md bg-gradient-to-b from-amber-700 via-stone-900 to-stone-950 border border-amber-500/50 shrink-0 text-amber-300 font-serif font-black ${sizeClass} ${className}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1 drop-shadow"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gunungan Silhouette */}
          <path
            d="M50 8 C48 18 36 28 28 42 C20 56 16 72 16 90 L84 90 C84 72 80 56 72 42 C64 28 52 18 50 8 Z"
            fill="url(#gunungan-grad)"
            stroke="#e5b85a"
            strokeWidth="2.5"
          />
          {/* Pohon Hayat / Ornamen dalam */}
          <path
            d="M50 20 L50 86 M50 36 L38 46 M50 36 L62 46 M50 52 L32 66 M50 52 L68 66 M50 68 L28 80 M50 68 L72 80"
            stroke="#fde047"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="14" fill="#2d150b" stroke="#e5b85a" strokeWidth="2" />
          <text
            x="50"
            y="54"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fef08a"
            fontSize="12"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            {monogram.slice(0, 2)}
          </text>
          <defs>
            <linearGradient id="gunungan-grad" x1="50" y1="8" x2="50" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#b45309" />
              <stop offset="0.5" stopColor="#78350f" />
              <stop offset="1" stopColor="#291206" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // Padi & Kapas Kemakmuran
  if (tipe === 'padi-kapas') {
    return (
      <div
        className={`relative rounded-xl flex items-center justify-center shadow-md bg-gradient-to-b from-stone-900 to-amber-950 border border-amber-500/40 shrink-0 ${sizeClass} ${className}`}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="none">
          <circle cx="50" cy="50" r="42" fill="#3a1c0d" stroke="#d4af37" strokeWidth="3" />
          <circle cx="50" cy="50" r="34" fill="#221108" stroke="#854d0e" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Padi Kapas ring */}
          <path
            d="M26 68 C20 54 22 36 34 26 C42 20 48 20 50 20 C52 20 58 20 66 26 C78 36 80 54 74 68"
            stroke="#eab308"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <text
            x="50"
            y="54"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fef08a"
            fontSize="18"
            fontWeight="900"
            fontFamily="serif"
          >
            {monogram.slice(0, 3)}
          </text>
          {/* Bintang */}
          <polygon
            points="50,22 52,27 57,27 53,30 55,35 50,32 45,35 47,30 43,27 48,27"
            fill="#fbbf24"
          />
        </svg>
      </div>
    );
  }

  // Monogram Modern Huruf
  if (tipe === 'monogram') {
    return (
      <div
        className={`rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br from-amber-600 via-stone-900 to-stone-950 border-2 border-amber-400 text-amber-200 font-extrabold tracking-wider shrink-0 ${sizeClass} ${className}`}
      >
        <span>{monogram.slice(0, 3)}</span>
      </div>
    );
  }

  // Default: Emblem Keraton Batik Royal (Cokelat Soga & Emas Jawa)
  return (
    <div
      className={`relative rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-b from-[#4d2816] via-[#2d170c] to-[#1a0c06] border border-[#d4af37]/70 shrink-0 text-amber-200 font-serif font-black ${sizeClass} ${className}`}
    >
      {/* Decorative Ornamen SVG Keraton */}
      <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="none">
        {/* Sudut Batik Kawung Motif Ring */}
        <circle cx="50" cy="50" r="44" stroke="#d4af37" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="38" stroke="#a16207" strokeWidth="1" strokeDasharray="4 2" />
        <circle cx="50" cy="50" r="30" fill="#241209" stroke="#eab308" strokeWidth="1.5" />
        {/* Ornamen silang mahkota keraton */}
        <path d="M50 12 L50 20 M50 80 L50 88 M12 50 L20 50 M80 50 L88 50" stroke="#fde047" strokeWidth="2.5" />
        <circle cx="50" cy="14" r="3" fill="#fde047" />
        <circle cx="50" cy="86" r="3" fill="#fde047" />
        <circle cx="14" cy="50" r="3" fill="#fde047" />
        <circle cx="86" cy="50" r="3" fill="#fde047" />
        {/* Text Center */}
        <text
          x="50"
          y="54"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fef08a"
          fontSize="18"
          fontWeight="900"
          fontFamily="serif"
          letterSpacing="1"
        >
          {monogram.slice(0, 3)}
        </text>
      </svg>
    </div>
  );
};
