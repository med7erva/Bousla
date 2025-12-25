
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
  X,
  Star,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';
import BouslaLogo from '../components/BouslaLogo';

const Landing: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const testimonials = [
    {
      name: "عبد الرحمن",
      role: "محل ألبسة رجالية",
      initial: "ع",
      content: "“قبل بوصلة كنت أعرف المبيعات، لكن لا أعرف الربح الحقيقي. الآن أرى المبيعات والمصاريف بشكل واضح وسريع.”"
    },
    {
      name: "الحسن",
      role: "تاجر تجزئة",
      initial: "ا",
      content: "“أكثر شيء عجبني هو تنبيهات المخزون. التطبيق ينبهني قبل ما يخلص الصنف، وهذا وفر علي الكثير من الوقت.”"
    },
    {
      name: "عمر",
      role: "صاحب محل خياطة",
      initial: "ع",
      content: "“ميزة بند الخياطة والتصنيع ممتازة، أخيرًا وجدت حلاً يناسب طبيعة عملنا وليس مجرد محاسبة عامة.”"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfe] font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden" dir="rtl">
      
      {/* 1. Navigation */}
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

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 space-y-6">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black mb-2 border border-emerald-100">
                مع بوصله .. بوتيكك ف ايدك 👋
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight">
                أدر عملك <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-500">بذكاء واحترافية</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-3xl mx-auto font-medium">
                انسَ الدفاتر والتعقيد. بوصلة يوفر لك أدوات متكاملة لإدارة المبيعات، المخزون، جميع العمليات الإدارية لقطاع الملابس مع تقارير مدعومة بالذكاء الاصطناعي.
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

          {/* 3. THE REALISTIC IPAD MOCKUP */}
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
                                <Calendar size={14} className="text-slate-400 mr-1" /><span className="text-[10px] font-bold text-slate-500 tracking-tighter">2025/11/23</span>
                                <span className="text-slate-300 text-[10px] mx-0.5">{'>'}</span><span className="text-[10px] font-bold text-slate-500 tracking-tighter">2025/11/30</span>
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
                                    <div className="absolute top-4 right-4"><span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black">%20 هامش</span></div>
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
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">بساطة في التصميم، قوة في الأداء</h2>
                <p className="text-slate-500 max-w-2xl mx-auto font-bold">كل ما يحتاجه صاحب عمل للتحكم الكامل في تجارته بضغطة زر واحدة.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group text-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform">
                        <LayoutDashboard size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-4">لوحة تحكم فورية</h3>
                    <p className="text-slate-500 leading-relaxed font-bold">شاشة واحدة تعرض لك المبيعات، المصاريف، وصافي الأرباح بدقة؛ مع تقارير حول المنتجات الأكثر طلباً.</p>
                </div>
                <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group text-center">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform">
                        <Package size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-4">إدارة المخزون الذكية</h3>
                    <p className="text-slate-500 leading-relaxed font-bold">ادارة ذكية لتتبع وتقييد جميع عمليات المخزون مع تنبيهات فورية عند انخفاض كمية أي صنف.</p>
                </div>
                <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group text-center">
                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform">
                        <Zap size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-4">ذكاء اصطناعي مدمج</h3>
                    <p className="text-slate-500 leading-relaxed font-bold">مساعد "بوصلة" الذكي يحلل بياناتك ويقترح عليك خطوات اللازمة.</p>
                </div>
            </div>
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">ماذا يقولون عنا؟</h2>
                <p className="text-slate-500 font-bold">نفتخر بدعم مئات المتاجر في رحلة نجاحهم الرقمي.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t, idx) => (
                    <div key={idx} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative">
                        <div className="flex text-amber-400 mb-4">
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                        </div>
                        <p className="text-slate-700 font-bold leading-relaxed mb-8">{t.content}</p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black">
                                {t.initial}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 text-sm">{t.name}</h4>
                                <p className="text-slate-400 text-xs font-bold">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* 6. Call to Action */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3.5rem] p-16 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">جاهز لرقمنة متجرك؟</h2>
                <p className="text-slate-400 mb-12 max-w-xl mx-auto text-lg font-bold">ابدأ الآن تجربتك المجانية لمدة 30 يوماً واكتشف الفرق الذي سيحدثه "بوصلة" في إدارة عملك.</p>
                <Link to="/register" className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-14 py-5 rounded-[2rem] font-black text-xl transition-all shadow-xl shadow-emerald-900/40">
                    ابدأ الآن مجاناً
                    <ArrowRight size={24} />
                </Link>
            </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-[#fcfdfe] pt-20 pb-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 items-start">
                <div className="md:col-span-2 space-y-6">
                    <BouslaLogo className="h-12 w-auto" />
                    <p className="text-slate-500 max-w-sm text-sm leading-relaxed font-bold">
                        تطبيق بوصلة هو الشريك التقني الأفضل لمتاجر الملابس.
                    </p>
                    <div className="flex gap-4">
                         <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-emerald-600 hover:text-white transition-all"><Facebook size={18} /></a>
                         <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-emerald-600 hover:text-white transition-all"><Twitter size={18} /></a>
                         <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-emerald-600 hover:text-white transition-all"><Instagram size={18} /></a>
                         <a href="https://wa.me/22247071347" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-emerald-600 hover:text-white transition-all"><MessageCircle size={18} /></a>
                    </div>
                </div>
                <div>
                    <h4 className="font-black text-slate-900 mb-6 text-sm uppercase tracking-widest">روابط سريعة</h4>
                    <ul className="space-y-4 text-sm text-slate-500 font-bold">
                        <li><Link to="/pricing" className="hover:text-emerald-600 transition">التسعير</Link></li>
                        <li><Link to="/features" className="hover:text-emerald-600 transition">المميزات</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-slate-900 mb-6 text-sm uppercase tracking-widest">قانوني</h4>
                    <ul className="space-y-4 text-sm text-slate-500 font-bold">
                        <li><Link to="/privacy" className="hover:text-emerald-600 transition">سياسة الخصوصية</Link></li>
                        <li><Link to="/terms" className="hover:text-emerald-600 transition">شروط الاستخدام</Link></li>
                    </ul>
                </div>
            </div>
            
            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-slate-400 text-xs font-bold">© 2025 بوصلة. جميع الحقوق محفوظة.</p>
                <div className="flex gap-8">
                    <span className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <Shield size={14} className="text-emerald-500" /> حماية بيانات كاملة
                    </span>
                    <span className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
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
