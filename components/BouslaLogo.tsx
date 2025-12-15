
import React from 'react';

interface BouslaLogoProps {
  className?: string;
  isWhite?: boolean; // For dark backgrounds like Login header
}

const BouslaLogo: React.FC<BouslaLogoProps> = ({ className = "h-10 w-auto", isWhite = false }) => {
  return (
    <svg viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid meet">
      {/* 
        LOGOTYPE DESIGN:
        1. Left side: Text "وصلة" using Cairo Font (matches app font).
        2. Right side: Letter "Ba" (ب) constructed as a Sales Chart.
      */}

      {/* 1. Text: "وصلة" */}
      <text 
        x="115" 
        y="42" 
        textAnchor="end" 
        fontFamily="'Cairo', sans-serif" 
        fontWeight="800" 
        fontSize="38" 
        fill="currentColor"
        className={isWhite ? "text-white" : "text-slate-900 dark:text-white"}
      >
        وصلة
      </text>

      {/* 2. Icon: Letter "Ba" (ب) as a Chart */}
      <g transform="translate(125, 10)">
        
        {/* The "Tray" of the Ba (The base line) */}
        {/* It looks like the axis of a chart but curved like the letter */}
        <path 
          d="M0 28 V32 H40 V15" 
          stroke="currentColor" 
          strokeWidth="4" 
          strokeLinecap="round" 
          className={isWhite ? "text-white" : "text-slate-900 dark:text-white"}
          fill="none"
        />

        {/* Chart Bars (Inside the Ba) */}
        {/* Bar 1 (Small) */}
        <rect x="5" y="18" width="6" height="12" rx="1" fill="currentColor" className={isWhite ? "text-white" : "text-slate-900 dark:text-white opacity-60"} />
        
        {/* Bar 2 (Medium) */}
        <rect x="15" y="10" width="6" height="20" rx="1" fill="currentColor" className={isWhite ? "text-white" : "text-slate-900 dark:text-white opacity-80"} />
        
        {/* Bar 3 (Tall - Growth) - Colored Emerald */}
        <rect x="25" y="2" width="6" height="28" rx="1" fill="#10b981" />

        {/* The Arrow (Shooting up) */}
        <path 
          d="M5 20 L35 0 M35 0 V8 M35 0 H27" 
          stroke="#10b981" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* The Dot of the Ba (Below) */}
        <circle cx="20" cy="42" r="3.5" fill="#10b981" />
      </g>
    </svg>
  );
};

export default BouslaLogo;
