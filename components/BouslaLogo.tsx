
import React from 'react';

interface BouslaLogoProps {
  className?: string;
  isWhite?: boolean; // For dark backgrounds like Login header
}

const BouslaLogo: React.FC<BouslaLogoProps> = ({ className = "h-10 w-auto", isWhite = false }) => {
  return (
    <svg viewBox="0 0 180 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid meet">
      {/* 
        Logo Composition:
        1. Icon: Green Rounded Square with White Chart/Arrow (Right side).
        2. Text: "بوصلة" in Cairo Font (Left side).
      */}

      {/* --- 1. The Icon (Matches the attached image style) --- */}
      <g transform="translate(135, 5)">
        {/* Background: Emerald Green Rounded Square */}
        <rect width="40" height="40" rx="10" fill="#10b981" />
        
        {/* Bars: White */}
        {/* Small */}
        <rect x="8" y="22" width="6" height="10" rx="1" fill="white" />
        {/* Medium */}
        <rect x="17" y="16" width="6" height="16" rx="1" fill="white" />
        {/* Large */}
        <rect x="26" y="8" width="6" height="24" rx="1" fill="white" />

        {/* Arrow: White, Going Up */}
        <path 
          d="M6 28 L14 22 L22 24 L34 6" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Arrow Head */}
        <path 
          d="M28 6 H34 V12" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </g>

      {/* --- 2. The Text: "بوصلة" --- */}
      <text 
        x="125" 
        y="37" 
        textAnchor="end" 
        fontFamily="'Cairo', sans-serif" 
        fontWeight="800" 
        fontSize="32" 
        className={isWhite ? "fill-white" : "fill-slate-900 dark:fill-white"}
        style={{ letterSpacing: '-0.02em' }}
      >
        بوصلة
      </text>
    </svg>
  );
};

export default BouslaLogo;
