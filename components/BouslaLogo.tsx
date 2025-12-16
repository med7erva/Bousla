
import React from 'react';

interface BouslaLogoProps {
  className?: string;
  isWhite?: boolean; // For forced dark backgrounds (Sidebar/Footer)
}

const BouslaLogo: React.FC<BouslaLogoProps> = ({ className = "", isWhite = false }) => {
  // Dynamic Color Logic using Tailwind Classes
  
  // 1. Stroke Color (The outline of compass and document)
  // Default: Emerald-900 (Dark Green), Dark Mode: White. 
  // If isWhite prop is true, force White.
  const strokeClass = isWhite 
    ? "stroke-white" 
    : "stroke-emerald-900 dark:stroke-white";

  // 2. Fill Color (For the Dollar Sign)
  const fillClass = isWhite
    ? "fill-white"
    : "fill-emerald-900 dark:fill-white";

  // 3. Text Color (Brand Name)
  const textClass = isWhite
    ? "text-white"
    : "text-slate-900 dark:text-white";

  // Needle Colors (Kept strictly brand colors for identity recognition)
  const needleDark = "#065f46"; // emerald-800
  const needleLight = "#34d399"; // emerald-400

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Logo Icon SVG */}
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-full w-auto aspect-square shrink-0 drop-shadow-sm"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* --- 1. Top Loop (Compass Ring) --- */}
        <circle cx="50" cy="12" r="6" className={strokeClass} strokeWidth="6" />

        {/* --- 2. Main Compass Body --- */}
        <circle cx="50" cy="54" r="40" className={strokeClass} strokeWidth="6" />

        {/* --- 3. Document Icon (Inside) --- */}
        <path 
          d="M30 34 H70 V74 H30 Z" 
          className={strokeClass}
          strokeWidth="5" 
          strokeLinejoin="round" 
          strokeLinecap="round"
        />
        {/* Document Lines */}
        <path d="M38 46 H52" className={strokeClass} strokeWidth="4" strokeLinecap="round" />
        <path d="M38 56 H48" className={strokeClass} strokeWidth="4" strokeLinecap="round" />

        {/* Dollar Sign ($) */}
        <text 
          x="62" 
          y="68" 
          fontSize="24" 
          fontWeight="bold" 
          className={fillClass}
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
        className={`font-black tracking-tight ${textClass}`}
        style={{ fontFamily: "'Cairo', sans-serif", lineHeight: 1, fontSize: 'inherit' }}
      >
        بوصلة
      </span>
    </div>
  );
};

export default BouslaLogo;
