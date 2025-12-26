
import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

interface AIInsightAlertProps {
  title: string;
  insight: string | string[];
  icon: React.ElementType;
  baseColor: 'blue' | 'indigo' | 'amber' | 'rose' | 'emerald';
}

const AIInsightAlert: React.FC<AIInsightAlertProps> = ({ title, insight, icon: Icon, baseColor }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!insight || (Array.isArray(insight) && insight.length === 0)) return null;

  const colorMap = {
    blue: { bg: 'bg-blue-50/50 dark:bg-blue-900/10', border: 'border-blue-100 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-300', iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconText: 'text-blue-600 dark:text-blue-400' },
    indigo: { bg: 'bg-indigo-50/50 dark:bg-indigo-900/10', border: 'border-indigo-100 dark:border-indigo-800', text: 'text-indigo-800 dark:text-indigo-300', iconBg: 'bg-indigo-100 dark:bg-indigo-900/30', iconText: 'text-indigo-600 dark:text-indigo-400' },
    amber: { bg: 'bg-amber-50/50 dark:bg-amber-900/10', border: 'border-amber-100 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-300', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconText: 'text-amber-600 dark:text-amber-400' },
    rose: { bg: 'bg-rose-50/50 dark:bg-rose-900/10', border: 'border-rose-100 dark:border-rose-800', text: 'text-rose-800 dark:text-rose-300', iconBg: 'bg-rose-100 dark:bg-rose-900/30', iconText: 'text-rose-600 dark:text-rose-400' },
    emerald: { bg: 'bg-emerald-50/50 dark:bg-emerald-900/10', border: 'border-emerald-100 dark:border-emerald-800', text: 'text-emerald-800 dark:text-emerald-300', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconText: 'text-emerald-600 dark:text-emerald-400' },
  };

  const theme = colorMap[baseColor];

  // دالة لتنظيف أي Markdown متبقي قد يأتي من الـ API
  const cleanText = (t: string) => t.replace(/\*\*/g, '').replace(/•/g, '').trim();

  return (
    <div className={`border-2 rounded-2xl transition-all duration-300 overflow-hidden ${isOpen ? theme.bg + ' ' + theme.border : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 shadow-sm'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 focus:outline-none group"
      >
        <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${theme.iconBg} ${theme.iconText} relative transition-transform group-hover:scale-105 shadow-sm`}>
                <Icon size={22} />
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                )}
            </div>
            
            <div className="text-right">
                <h4 className={`font-black text-sm ${isOpen ? theme.text : 'text-slate-800 dark:text-white'}`}>
                    {title}
                </h4>
                {!isOpen && (
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">توصيات ذكية بناءً على بياناتك الحقيقية</p>
                )}
            </div>
        </div>
        
        <div className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown size={20} />
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
            <div className={`text-sm leading-relaxed ${theme.text} pr-4 border-r-2 ${theme.border}`}>
                {Array.isArray(insight) ? (
                    <ul className="space-y-3">
                        {insight.map((tip, i) => (
                            <li key={i} className="flex gap-2 font-bold">
                                <span className={`mt-2 w-1.5 h-1.5 rounded-full ${theme.iconText} shrink-0 opacity-50`}></span>
                                {cleanText(tip)}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="font-bold">{cleanText(insight)}</p>
                )}
                
                <div className="mt-5 flex items-center gap-2 opacity-60">
                    <Sparkles size={12} className="text-purple-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">تحليل Gemini AI المتقدم</span>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightAlert;
