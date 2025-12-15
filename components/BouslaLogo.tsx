
import React from 'react';

interface BouslaLogoProps {
  className?: string;
  isWhite?: boolean; // For dark backgrounds like Login header
}

const BouslaLogo: React.FC<BouslaLogoProps> = ({ className = "h-10 w-auto", isWhite = false }) => {
  return (
    <svg viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid meet">
      {/* 
        Geometric Kufic "Bousla" 
        Grid based design for perfect alignment
      */}
      
      {/* Text Group: "وصلة" (Waw, Sad, Lam, Ta Marbuta) */}
      <g className={isWhite ? "text-white" : "text-slate-900 dark:text-white"}>
        {/* Ta Marbuta & Lam */}
        <path 
          fill="currentColor" 
          d="M25 45C19.477 45 15 40.523 15 35C15 29.477 19.477 25 25 25C30.523 25 35 29.477 35 35V15H45V35C45 40.523 40.523 45 35 45H25ZM25 29C21.686 29 19 31.686 19 35C19 38.314 21.686 41 25 41C28.314 41 31 38.314 31 35C31 31.686 28.314 29 25 29Z"
        />
        {/* Lam - Sad Connection */}
        <path fill="currentColor" d="M45 45H75V35H45V45Z" />
        
        {/* Sad (Loop) */}
        <path 
          fill="currentColor" 
          d="M75 45V35H95C95 29.477 90.523 25 85 25H65V15H85C96.046 15 105 23.954 105 35V45H75Z"
        />
        {/* Sad Tooth */}
        <path fill="currentColor" d="M100 25V35H110V25H100Z" />
        
        {/* Waw */}
        <path 
          fill="currentColor" 
          d="M125 45C119.477 45 115 40.523 115 35C115 29.477 119.477 25 125 25C130.523 25 135 29.477 135 35V45H125Z" 
        />
        <circle cx="125" cy="35" r="4" fill="white" className="dark:fill-slate-900" />
      </g>

      {/* Letter "Ba" (ب) Integrated with Chart Arrow */}
      {/* The dot is the start, the stem is the bar, the arrow shoots up */}
      <path 
        d="M145 45H160V41H145V45Z" 
        fill="#10b981" 
        className="animate-pulse" // Subtle animation on the dot
      />
      
      {/* The Arrow (Ba Body) */}
      <path 
        d="M135 45H142V35L150 25L160 10M160 10H152M160 10V18" 
        stroke="#10b981" 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};

export default BouslaLogo;
