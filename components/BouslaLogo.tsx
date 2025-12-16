
import React from 'react';

interface BouslaLogoProps {
  className?: string;
  isWhite?: boolean; // For dark backgrounds
}

const BouslaLogo: React.FC<BouslaLogoProps> = ({ className = "", isWhite = false }) => {
  // Theme Colors based on Tailwind Emerald Palette
  // Stroke Color: Dark Emerald for Light Mode, White for Dark Mode/White Mode
  const strokeColor = isWhite ? "#ffffff" : "#064e3b"; // emerald-900
  
  // Needle Colors (Fixed to identity colors for brand recognition)
  const needleDark = "#065f46"; // emerald-800
  const needleLight = "#34d399"; // emerald-400

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Logo Icon SVG */}
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-10 w-10 md:h-12 md:w-12 shrink-0 drop-shadow-sm"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* --- 1. Top Loop (Compass Ring) --- */}
        <circle cx="50" cy="12" r="6" stroke={strokeColor} strokeWidth="6" />

        {/* --- 2. Main Compass Body --- */}
        <circle cx="50" cy="54" r="40" stroke={strokeColor} strokeWidth="6" />

        {/* --- 3. Document Icon (Inside) --- */}
        <path 
          d="M30 34 H70 V74 H30 Z" 
          stroke={strokeColor} 
          strokeWidth="5" 
          strokeLinejoin="round" 
          strokeLinecap="round"
        />
        {/* Document Lines */}
        <path d="M38 46 H52" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M38 56 H48" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />

        {/* Dollar Sign ($) */}
        <text 
          x="62" 
          y="68" 
          fontSize="24" 
          fontWeight="bold" 
          fill={strokeColor} 
          textAnchor="middle" 
          fontFamily="sans-serif"
        >
          $
        </text>

        {/* --- 4. Compass Needle (3D Effect) --- */}
        <g transform="translate(50, 54) rotate(45)">
          {/* Main Shape */}
          <path d="M0 -38 L12 0 L0 38 L-12 0 Z" fill={needleDark} />
          
          {/* Highlights for 3D look */}
          <path d="M0 -38 L0 0 L-12 0 Z" fill={needleLight} />
          <path d="M0 38 L0 0 L12 0 Z" fill={needleLight} />
          
          {/* Center Pivot */}
          <circle cx="0" cy="0" r="4" fill="white" stroke={needleDark} strokeWidth="1" />
        </g>
      </svg>

      {/* Brand Text */}
      <span 
        className={`text-3xl font-black tracking-tight ${isWhite ? 'text-white' : 'text-slate-900 dark:text-white'}`}
        style={{ fontFamily: "'Cairo', sans-serif", lineHeight: 1 }}
      >
        بوصلة
      </span>
    </div>
  );
};

export default BouslaLogo;
