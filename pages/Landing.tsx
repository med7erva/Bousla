
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
  // Added missing X icon import
  X
} from 'lucide-react';
import BouslaLogo from '../components/BouslaLogo';

const Landing: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden" dir="rtl">
      
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
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-40 overflow-hidden bg-white">
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
                انسَ الدفاتر والتعقيد. بوصلة يوفر لك نظاماً متكاملاً لإدارة المبيعات، المخزون، والتقارير المالية مدعوماً بالذكاء الاصطناعي.
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

          {/* Realistic iPad Mockup (Enhanced to match image) */}
          <div className={`relative max-w-5xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                {/* Glow behind device */}
                <div className="absolute inset-0 bg-emerald-500/10 blur-[120px] rounded-full scale-75 animate-pulse"></div>
                
                {/* Device Frame */}
                <div className="relative mx-auto w-full max-w-[850px] aspect-[3/4] bg-slate-900 rounded-[3rem] p-2.5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border-[10px] border-slate-800 ring-1 ring-slate-700 overflow-hidden transform hover:scale-[1.01] transition-transform">
                    {/* Top Notch/Sensors */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-2xl z-20 flex items-center justify-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                        <div className="w-8 h-1 rounded-full bg-slate-700"></div>
                    </div>
                    
                    {/* Content Area - THE DASHBOARD UI FROM IMAGE */}
                    <div className="w-full h-full bg-[#f8fafb] rounded-[2.2rem] overflow-hidden relative flex flex-col font-sans">
                        
                        {/* 1. Header Bar */}
                        <div className="h-16 px-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <Menu size={22} className="text-slate-500" />
                                <span className="font-bold text-slate-800">التقارير</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    موارد
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                    <span className="text-emerald-600 font-bold">P</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Sub-header (Export & Date) */}
                        <div className="px-6 py-4 flex justify-between items-center bg-white">
                             <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                                <Calendar size={14} className="text-slate-400 mr-2" />
                                <span className="text-[10px] font-bold text-slate-500">2025/11/23</span>
                                <ArrowRight size={10} className="text-slate-300" />
                                <span className="text-[10px] font-bold text-slate-500">2025/11/30</span>
                                <div className="w-px h-3 bg-slate-200 mx-1"></div>
                                <X size={12} className="text-slate-400" />
                             </div>
                             <div className="flex items-center gap-4">
                                <h2 className="text-lg font-black text-slate-800">التقارير المالية</h2>
                                <button className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                                    تصدير <Download size={12} />
                                </button>
                             </div>
                        </div>

                        {/* 3. Main Dashboard Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                            
                            {/* KPI Cards Row */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Sales */}
                                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative group overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                            <TrendingUp size={20} />
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">إجمالي المبيعات</p>
                                        <h3 className="text-2xl font-black text-slate-800">78,530 <span className="text-[10px]">أوقية</span></h3>
                                        <p className="text-[9px] text-slate-400 mt-1">الإيرادات قبل خصم التكاليف</p>
                                    </div>
                                </div>

                                {/* Profit */}
                                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                            <DollarSign size={20} />
                                        </div>
                                        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">%20 هامش</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">صافي الربح</p>
                                        <h3 className="text-2xl font-black text-emerald-600">15,677 <span className="text-[10px]">أوقية</span></h3>
                                    </div>
                                </div>

                                {/* Stock */}
                                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
                                            <Package size={20} />
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">قيمة المخزون</p>
                                        <h3 className="text-2xl font-black text-slate-800">200,979 <span className="text-[10px]">أوقية</span></h3>
                                        <p className="text-[9px] text-slate-400 mt-1">محسوبة بسعر التكلفة</p>
                                    </div>
                                </div>

                                {/* Expenses */}
                                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                            <TrendingDown size={20} />
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">المصاريف</p>
                                        <h3 className="text-2xl font-black text-slate-800">5,600 <span className="text-[10px]">أوقية</span></h3>
                                        <p className="text-[9px] text-slate-400 mt-1">مصاريف تشغيلية ورواتب</p>
                                    </div>
                                </div>
                            </div>

                            {/* Chart Area */}
                            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                        <Activity size={16} className="text-emerald-500" /> اتجاه المبيعات (يومي)
                                    </h3>
                                    <div className="w-32 h-2 bg-slate-50 rounded-full"></div>
                                </div>
                                <div className="h-44 w-full flex items-end justify-between px-4 gap-3 relative">
                                    {/* Mock SVG Path for Line Chart */}
                                    <svg className="absolute inset-0 w-full h-full px-4" preserveAspectRatio="none" viewBox="0 0 100 100">
                                        <path d="M0,80 Q10,75 20,40 T40,60 T60,20 T80,70 T100,65" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                                        <path d="M0,80 Q10,75 20,40 T40,60 T60,20 T80,70 T100,65 L100,100 L0,100 Z" fill="url(#grad)" opacity="0.1" />
                                        <defs>
                                            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#10b981" />
                                                <stop offset="100%" stopColor="#fff" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    {/* X Axis Labels */}
                                    <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[8px] text-slate-300 font-bold">
                                        <span>23/11</span><span>25/11</span><span>27/11</span><span>29/11</span><span>31/11</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Widgets Row */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Low Stock Widget */}
                                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                                    <h4 className="text-[10px] font-black text-slate-800 mb-4 flex items-center gap-1.5">
                                        <AlertTriangle size={12} className="text-rose-500" /> على وشك النفاد
                                    </h4>
                                    <div className="space-y-3">
                                        {[
                                            { name: 'فستان صيفي', val: '4 باقي' },
                                            { name: 'دراعة فاخرة', val: '2 باقي' },
                                            { name: 'حذاء جلدي', val: '3 باقي' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <span className="text-[9px] font-bold text-slate-600">{item.name}</span>
                                                <span className="text-[8px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">{item.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Expense Donut Widget */}
                                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center">
                                    <h4 className="text-[10px] font-black text-slate-800 mb-4 self-start">توزيع المصاريف</h4>
                                    <div className="relative w-20 h-20">
                                        {/* Donut Simulation */}
                                        <div className="absolute inset-0 rounded-full border-[10px] border-emerald-500"></div>
                                        <div className="absolute inset-0 rounded-full border-[10px] border-rose-500 border-l-transparent border-t-transparent border-r-transparent rotate-45"></div>
                                        <div className="absolute inset-0 rounded-full border-[10px] border-amber-400 border-l-transparent border-b-transparent border-r-transparent -rotate-12"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <p className="text-[8px] font-black text-slate-800">5,600</p>
                                                <p className="text-[6px] text-slate-400">الإجمالي</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1 w-full">
                                        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div><span className="text-[7px] text-slate-500">رواتب</span></div>
                                        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div><span className="text-[7px] text-slate-500">غذاء</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Growth Badge */}
                <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 bg-white p-5 rounded-3xl shadow-2xl border border-emerald-100 flex items-center gap-4 animate-bounce duration-[4000ms] hidden md:flex">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                        <ArrowUpRight size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">نسبة النمو</p>
                        <p className="text-lg font-black text-slate-800">+24% هذا الشهر</p>
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900">ماذا يقولون عنا؟</h2>
                <p className="text-slate-500 font-medium">نفتخر بدعم مئات المتاجر في رحلة نجاحهم الرقمي.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Testimonial 1 */}
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                    <div className="flex gap-1 mb-6">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed mb-8 italic">
                        “قبل بوصلة كنت أعرف المبيعات، لكن لا أعرف الربح الحقيقي. الآن أرى المبيعات والمصاريف بشكل واضح وسريع.”
                    </p>
                    <div className="flex items-center gap-4 border-t border-slate-200 pt-6">
                        <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center font-black text-white shadow-md">
                            ع
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">عبد الرحمن</h4>
                            <p className="text-xs text-slate-500 font-bold uppercase">محل ألبسة رجالية</p>
                        </div>
                    </div>
                </div>

                {/* Testimonial 2 */}
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                    <div className="flex gap-1 mb-6">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed mb-8 italic">
                        “أكثر شيء عجبني هو تنبيهات المخزون. التطبيق ينبهني قبل ما يخلص الصنف، وهذا وفر علي الكثير من الوقت.”
                    </p>
                    <div className="flex items-center gap-4 border-t border-slate-200 pt-6">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-black text-white shadow-md">
                            ا
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">الحسن</h4>
                            <p className="text-xs text-slate-500 font-bold uppercase">تاجر تجزئة</p>
                        </div>
                    </div>
                </div>

                {/* Testimonial 3 */}
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                    <div className="flex gap-1 mb-6">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed mb-8 italic">
                        “ميزة بند الخياطة والتصنيع ممتازة، أخيرًا وجدت حلاً يناسب طبيعة عملنا وليس مجرد محاسبة عامة.”
                    </p>
                    <div className="flex items-center gap-4 border-t border-slate-200 pt-6">
                        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-black text-white shadow-md">
                            ع
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">عمر</h4>
                            <p className="text-xs text-slate-500 font-bold uppercase">صاحب محل خياطة</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black mb-6">جاهز لرقمنة متجرك؟</h2>
                <p className="text-slate-400 mb-10 max-w-xl mx-auto font-medium">ابدأ الآن تجربتك المجانية لمدة 30 يوماً واكتشف الفرق الذي سيحدثه "بوصلة" في إدارة عملك.</p>
                <Link to="/register" className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-50 text-white px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-xl shadow-emerald-900/20">
                    ابدأ الآن مجاناً
                    <ArrowRight size={24} />
                </Link>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
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
                        <li><a href="#" className="hover:text-white">الأسئلة الشائعة</a></li>
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
