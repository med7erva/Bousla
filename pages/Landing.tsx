
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  MessageCircle, 
  Shield, 
  LayoutDashboard,
  Package,
  TrendingUp,
  Zap,
  Menu,
  Download,
  Calendar,
  DollarSign,
  TrendingDown,
  Activity,
  ArrowUpRight,
  X
} from 'lucide-react';
import BouslaLogo from '../components/BouslaLogo';

const Landing: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfdfe] font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden" dir="rtl">
      
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0">
                <BouslaLogo className="h-10 w-auto text-2xl" />
            </div>
            <div className="hidden md:flex items-center gap-8">
                <Link to="/features" className="text-slate-600 hover:text-emerald-600 font-bold text-sm transition">المميزات</Link>
                <Link to="/pricing" className="text-slate-600 hover:text-emerald-600 font-bold text-sm transition">الأسعار</Link>
                <Link to="/login" className="text-slate-600 hover:text-emerald-600 font-bold text-sm transition">دخول</Link>
            </div>
            <Link 
              to="/register" 
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
            >
              ابدأ الآن مجاناً
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 space-y-6">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black mb-2 border border-emerald-100">
                تطبيق المحاسبة رقم 1 في موريتانيا 🇲🇷
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight">
                أدر بوتيكك <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-500">بذكاء واحترافية</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-3xl mx-auto font-medium">
                انسَ الدفاتر والتعقيد. بوصلة يوفر لك نظاماً متكاملاً لإدارة المبيعات، المخزون، والتقارير المالية مدعوماً بالذكاء الاصطناعي.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/register" 
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-lg font-black hover:bg-slate-800 transition shadow-2xl flex items-center justify-center gap-2"
                >
                  اشترك الآن مجاناً
                  <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/login"
                  className="bg-white text-slate-700 border-2 border-slate-100 px-10 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition"
                >
                  تجربة العرض المباشر
                </Link>
            </div>
          </div>

          {/* REALISTIC IPAD MOCKUP */}
          <div className={`relative max-w-5xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[85%] h-20 bg-black/10 blur-[80px] rounded-full"></div>
                <div className="relative mx-auto w-full max-w-[760px] aspect-[1/1.4] bg-[#080808] rounded-[3.5rem] p-[10px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border-[1px] border-white/5 ring-1 ring-black overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#080808] rounded-b-2xl z-40 flex items-center justify-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]"></div>
                        <div className="w-8 h-1 rounded-full bg-[#1a1a1a]"></div>
                    </div>
                    <div className="w-full h-full bg-[#f8fafb] rounded-[2.8rem] overflow-hidden relative flex flex-col font-sans">
                        <header className="h-16 px-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4"><Menu size={22} className="text-slate-400" /><span className="font-black text-lg text-slate-800">التقارير</span></div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl text-[10px] font-black"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>مـوارد</div>
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200"><span className="text-emerald-600 font-black text-lg">P</span></div>
                            </div>
                        </header>
                        <div className="px-6 py-4 flex justify-between items-center bg-white shadow-sm z-10 text-right">
                             <div className="flex items-center gap-2 bg-[#f1f3f5] p-1.5 rounded-xl border border-slate-100">
                                <Calendar size={14} className="text-slate-400 mr-1" /><span className="text-[10px] font-bold text-slate-500">2025/11/23</span>
                                <span className="text-slate-300 text-[10px] mx-0.5">{'>'}</span><span className="text-[10px] font-bold text-slate-500">2025/11/30</span>
                             </div>
                             <button className="bg-[#111] text-white px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2">تصدير <Download size={12} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#f8fafb]">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm text-right">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4"><Activity size={18} /></div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">إجمالي المبيعات</p>
                                    <h3 className="text-xl font-black text-slate-900">78,530 <span className="text-[10px] text-slate-400">أوقية</span></h3>
                                </div>
                                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden text-right">
                                    <div className="absolute top-4 left-4"><span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black">%20 هامش</span></div>
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4"><DollarSign size={18} /></div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">صافي الربح</p>
                                    <h3 className="text-xl font-black text-emerald-600">15,677 <span className="text-[10px] text-emerald-400">أوقية</span></h3>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm text-right">
                                <div className="flex justify-between items-center mb-8"><h3 className="text-xs font-black text-slate-800 flex items-center gap-2"><TrendingUp size={14} className="text-emerald-500" /> اتجاه المبيعات (يومي)</h3><div className="w-16 h-1.5 bg-slate-50 rounded-full"></div></div>
                                <div className="h-40 w-full relative">
                                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                        <path d="M0,85 L10,82 L20,40 L30,78 L40,80 L50,55 L60,85 L70,25 L80,70 L90,35 L100,85" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M0,85 L10,82 L20,40 L30,78 L40,80 L50,55 L60,85 L70,25 L80,70 L90,35 L100,85 L100,100 L0,100 Z" fill="url(#mainChartGrad)" opacity="0.1" />
                                        <defs><linearGradient id="mainChartGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#fff" /></linearGradient></defs>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Floating Growth Badge */}
                <div className="absolute -top-10 -right-10 bg-white p-6 rounded-[2rem] shadow-2xl border border-emerald-50 flex items-center gap-5 hidden md:flex animate-bounce duration-[5000ms]">
                    <div className="w-14 h-14 bg-emerald-500 rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-emerald-200"><ArrowUpRight size={28} /></div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">نسبة النمو</p>
                        <p className="text-xl font-black text-slate-900">+24.5% <span className="text-xs text-slate-400">هذا الشهر</span></p>
                    </div>
                </div>
          </div>
        </div>
      </section>

      {/* Brief Summary Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-16 italic">"بوصلة هو شريكك الذي يغنيك عن عشرات الدفاتر المحاسبية"</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-white rounded-[2.5rem] shadow-sm">
                    <h3 className="text-xl font-bold mb-4">بساطة مطلقة</h3>
                    <p className="text-slate-500 text-sm font-medium">واجهة عربية صممت ليفهمها الجميع دون الحاجة لخبرة تقنية.</p>
                </div>
                <div className="p-8 bg-white rounded-[2.5rem] shadow-sm">
                    <h3 className="text-xl font-bold mb-4">أمان بياناتك</h3>
                    <p className="text-slate-500 text-sm font-medium">سجل مبيعاتك وأرباحك في أيدٍ أمينة مع تشفير سحابي متطور.</p>
                </div>
                <div className="p-8 bg-white rounded-[2.5rem] shadow-sm">
                    <h3 className="text-xl font-bold mb-4">دعم فني حي</h3>
                    <p className="text-slate-500 text-sm font-medium">فريقنا معك عبر الواتساب والاتصال لمساعدتك في أي لحظة.</p>
                </div>
            </div>
            <div className="mt-12">
                <Link to="/features" className="text-emerald-600 font-black text-lg hover:underline flex items-center justify-center gap-2">
                    شاهد كافة المميزات بالتفصيل <ArrowRight size={20} />
                </Link>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 items-start">
                <div className="md:col-span-2 space-y-6">
                    <BouslaLogo className="h-12 w-auto" isWhite={true} />
                    <p className="text-slate-400 max-w-sm text-sm font-bold">تطبيق المحاسبة المتكامل لمتاجر الملابس الموريتانية.</p>
                    <div className="flex gap-4">
                        <a href="https://wa.me/22247071347" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-all"><MessageCircle size={20} /></a>
                    </div>
                </div>
                <div>
                    <h4 className="text-emerald-500 font-black mb-6 uppercase text-xs">الروابط</h4>
                    <ul className="space-y-4 text-sm font-bold text-slate-400">
                        <li><Link to="/features" className="hover:text-white">المميزات</Link></li>
                        <li><Link to="/pricing" className="hover:text-white">الأسعار</Link></li>
                        <li><Link to="/login" className="hover:text-white">دخول</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-emerald-500 font-black mb-6 uppercase text-xs">قانوني</h4>
                    <ul className="space-y-4 text-sm font-bold text-slate-400">
                        <li><Link to="/privacy" className="hover:text-white">سياسة الخصوصية</Link></li>
                        <li><Link to="/terms" className="hover:text-white">شروط الاستخدام</Link></li>
                    </ul>
                </div>
            </div>
            <div className="pt-8 border-t border-white/5 text-center">
                 <p className="text-slate-600 text-[10px] font-black uppercase">© 2025 بوصلة. صنع في موريتانيا 🇲🇷</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
