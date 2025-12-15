
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface BouslaLogoProps {
  className?: string;
  isWhite?: boolean; 
}

const BouslaLogo: React.FC<BouslaLogoProps> = ({ className = "", isWhite = false }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Container */}
      <div 
        className={`
          flex items-center justify-center w-10 h-10 rounded-xl shadow-sm transition-transform hover:scale-105 shrink-0
          ${isWhite ? 'bg-white/10 text-white border border-white/20' : 'bg-emerald-600 text-white'}
        `}
      >
        {/* The Arrow Icon */}
        <TrendingUp size={24} strokeWidth={3} />
      </div>

      {/* Text Brand */}
      <span 
        className={`text-3xl font-black tracking-tight whitespace-nowrap ${isWhite ? 'text-white' : 'text-slate-900 dark:text-white'}`}
        style={{ fontFamily: "'Cairo', sans-serif", lineHeight: 1 }}
      >
        بوصلة
      </span>
    </div>
  );
};

export default BouslaLogo;
