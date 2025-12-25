
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
  Star,
  Facebook,
  Twitter,
  Instagram,
  Menu,
  Download,
  Calendar,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  X,
  MoreHorizontal
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
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-6">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black mb-2 border border-emerald-100">
                تطبيق المحاسبة رقم 1 في موريتانيا 🇲🇷
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight">
                أدر بوتيكك <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-500">بذكاء واحترافية</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-3xl mx-auto font-medium">
                بوصلة يوفر لك نظاماً متكاملاً لإدارة المبيعات، المخزون، والتقارير المالية بدقة متناهية وسهولة تامة.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/register" 
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-lg font-black hover:bg-slate-800 transition shadow-2xl flex items-center justify-center gap-2"
                >
                  اشترك الآن
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

          {/* THE REALISTIC IPAD MOCKUP SECTION */}
          <div className={`relative max-w-5xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                
                {/* Device Shadow & Floor Reflection effect */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[85%] h-20 bg-black/10 blur-[80px] rounded-full"></div>
                
                {/* iPad Pro Frame (Portrait) */}
                <div className="relative mx-auto w-full max-w-[760px] aspect-[1/1.4] bg-[#080808] rounded-[3.5rem] p-[10px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border-[1px] border-white/5 ring-1 ring-black overflow-hidden">
                    
                    {/* Bezel */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#080808] rounded-b-2xl z-40 flex items-center justify-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]"></div>
                        <div className="w-8 h-1 rounded-full bg-[#1a1a1a]"></div>
                    </div>

                    {/* Screen Container */}
                    <div className="w-full h-full bg-[#f8fafb] rounded-[2.8rem] overflow-hidden relative flex flex-col font-sans">
                        
                        {/* 1. Dashboard Header */}
                        <header className="h-16 px-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <Menu size={22} className="text-slate-400" />
                                <span className="font-black text-lg text-slate-800">التقارير</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl text-[10px] font-black">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    مـوارد
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                                    <span className="text-emerald-600 font-black text-lg">P</span>
                                </div>
                            </div>
                        </header>

                        {/* 2. Control Toolbar */}
                        <div className="px-6 py-4 flex justify-between items-center bg-white shadow-sm z-10">
                             <div className="flex items-center gap-2 bg-[#f1f3f5] p-1.5 rounded-xl border border-slate-100">
                                <Calendar size={14} className="text-slate-400 mr-1" />
                                <span className="text-[10px] font-bold text-slate-500 tracking-tighter">2025/11/23</span>
                                <span className="text-slate-300 text-[10px] mx-0.5">{'>'}</span>
                                <span className="text-[10px] font-bold text-slate-500 tracking-tighter">2025/11/30</span>
                                <div className="w-px h-3 bg-slate-200 mx-1"></div>
                                <X size={12} className="text-slate-400" />
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <h2 className="text-sm font-black text-slate-900 leading-none">التقارير المالية</h2>
                                    <p className="text-[8px] text-slate-400 font-bold mt-1">نظرة شاملة على أداء المتجر</p>
                                </div>
                                <button className="bg-[#111] text-white px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 shadow-lg">
                                    تصدير <Download size={12} />
                                </button>
                             </div>
                        </div>

                        {/* 3. Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-[#f8fafb]">
                            
                            {/* KPI Grid (Top Row) */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Total Sales */}
                                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                                        <Activity size={18} />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">إجمالي المبيعات</p>
                                    <h3 className="text-xl font-black text-slate-900">78,530 <span className="text-[10px] text-slate-400 font-bold">أوقية</span></h3>
                                    <p className="text-[8px] text-slate-400 mt-2">الإيرادات قبل خصم التكاليف</p>
                                </div>

                                {/* Net Profit */}
                                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-4 right-4">
                                        <span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black">%20 هامش</span>
                                    </div>
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                                        <DollarSign size={18} />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">صافي الربح</p>
                                    <h3 className="text-xl font-black text-emerald-600">15,677 <span className="text-[10px] text-emerald-400 font-bold">أوقية</span></h3>
                                </div>

                                {/* Stock Value */}
                                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mb-4">
                                        <Package size={18} />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">قيمة المخزون</p>
                                    <h3 className="text-xl font-black text-slate-900">200,979 <span className="text-[10px] text-slate-400 font-bold">أوقية</span></h3>
                                    <p className="text-[8px] text-slate-400 mt-2">محسوبة بسعر التكلفة</p>
                                </div>

                                {/* Expenses */}
                                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                                        <TrendingDown size={18} />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">المصاريف</p>
                                    <h3 className="text-xl font-black text-slate-900">5,600 <span className="text-[10px] text-slate-400 font-bold">أوقية</span></h3>
                                    <p className="text-[8px] text-slate-400 mt-2">مصاريف تشغيلية ورواتب</p>
                                </div>
                            </div>

                            {/* Main Chart Card */}
                            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                                        <TrendingUp size={14} className="text-emerald-500" /> اتجاه المبيعات (يومي)
                                    </h3>
                                    <div className="w-16 h-1.5 bg-slate-50 rounded-full"></div>
                                </div>
                                <div className="h-40 w-full relative">
                                    {/* Jagged Green SVG Path */}
                                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                        <path d="M0,85 L10,82 L20,40 L30,78 L40,80 L50,55 L60,85 L70,25 L80,70 L90,35 L100,85" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M0,85 L10,82 L20,40 L30,78 L40,80 L50,55 L60,85 L70,25 L80,70 L90,35 L100,85 L100,100 L0,100 Z" fill="url(#mainChartGrad)" opacity="0.1" />
                                        <defs>
                                            <linearGradient id="mainChartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#10b981" />
                                                <stop offset="100%" stopColor="#fff" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-2 text-[8px] text-slate-300 font-black">
                                        <span>23/11</span><span>25/11</span><span>27/11</span><span>29/11</span><span>31/11</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Grid (Widgets) */}
                            <div className="grid grid-cols-2 gap-4 pb-4">
                                {/* Low Stock Widget */}
                                <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm">
                                    <h4 className="text-[10px] font-black text-slate-800 mb-4 flex items-center gap-1.5">
                                        <AlertTriangle size={12} className="text-rose-500" /> على وشك النفاد
                                    </h4>
                                    <div className="space-y-3">
                                        {[
                                            { name: 'فستان صيفي مطرز', val: '4 باقي' },
                                            { name: 'ملحفة قطن أصلية', val: '2 باقي' },
                                            { name: 'دراعة فاخرة (سوبر)', val: '1 باقي' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <span className="text-[8px] font-bold text-slate-600 truncate max-w-[60px]">{item.name}</span>
                                                <span className="text-[7px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">{item.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Expense Breakdown Donut */}
                                <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex flex-col items-center">
                                    <div className="w-full flex justify-between items-center mb-3">
                                        <h4 className="text-[10px] font-black text-slate-800">توزيع المصاريف</h4>
                                        <TrendingDown size={12} className="text-rose-400" />
                                    </div>
                                    <div className="relative w-20 h-20">
                                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                            <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#f1f3f5" strokeWidth="4"></circle>
                                            <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="60 100"></circle>
                                            <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#f59e0b" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-60"></circle>
                                            <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#ef4444" strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="-85"></circle>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <p className="text-[10px] font-black text-slate-800 leading-none">5,600</p>
                                            <p className="text-[6px] text-slate-400 font-bold mt-0.5 uppercase">الإجمالي</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-1 w-full">
                                        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div><span className="text-[7px] text-slate-500 font-bold">رواتب</span></div>
                                        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div><span className="text-[7px] text-slate-500 font-bold">غداء</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">بساطة في التصميم، قوة في الأداء</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">كل ما يحتاجه صاحب عمل للتحكم الكامل في تجارته بضغطة زر واحدة.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <LayoutDashboard size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">لوحة تحكم فورية</h3>
                    <p className="text-slate-500 leading-relaxed">شاشة واحدة تعرض لك المبيعات، المصاريف، وصافي الأرباح بدقة اللحظة الحالية.</p>
                </div>
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <Package size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">إدارة المخزون الذكية</h3>
                    <p className="text-slate-500 leading-relaxed">تنبيهات فورية عند انخفاض كمية أي صنف، مع تقارير حول المنتجات الأكثر طلباً.</p>
                </div>
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <Zap size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">ذكاء اصطناعي مدمج</h3>
                    <p className="text-slate-500 leading-relaxed">مساعد "بوصلة" الذكي يحلل بياناتك ويقترح عليك خطوات لزيادة مبيعاتك.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 items-start">
                <div className="md:col-span-2 space-y-4">
                    <BouslaLogo className="h-10 w-auto" isWhite={true} />
                    <p className="text-slate-400 max-w-sm text-sm leading-relaxed font-bold">
                        تطبيق بوصلة هو الشريك التقني الأفضل لمتاجر الملابس.
                    </p>
                    <div className="flex gap-3">
                         <a href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 hover:bg-emerald-600 transition-colors"><Facebook size={18} /></a>
                         <a href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 hover:bg-emerald-600 transition-colors"><Twitter size={18} /></a>
                         <a href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 hover:bg-emerald-600 transition-colors"><Instagram size={18} /></a>
                         <a href="https://wa.me/22247071347" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 hover:bg-emerald-600 transition-colors"><MessageCircle size={18} /></a>
                    </div>
                </div>
                <div>
                    <h4 className="font-black text-emerald-500 mb-4 text-xs uppercase">روابط سريعة</h4>
                    <ul className="space-y-2 text-sm text-slate-400 font-bold">
                        <li><Link to="/pricing" className="hover:text-white">التسعير</Link></li>
                        <li><a href="#features" className="hover:text-white">المميزات</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-emerald-500 mb-4 text-xs uppercase">قانوني</h4>
                    <ul className="space-y-2 text-sm text-slate-400 font-bold">
                        <li><a href="#" className="hover:text-white">سياسة الخصوصية</a></li>
                        <li><a href="#" className="hover:text-white">شروط الاستخدام</a></li>
                        <li className="text-xs text-slate-500 pt-2" dir="ltr">+222 47071347</li>
                    </ul>
                </div>
            </div>
            
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-500 text-xs font-bold">© 2025 بوصلة. جميع الحقوق محفوظة.</p>
                <div className="flex gap-6">
                    <span className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase">
                        <Shield size={14} className="text-emerald-500" /> حماية بيانات كاملة
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase">
                        <CheckCircle size={14} className="text-emerald-500" /> فواتير معتمدة
                    </span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
