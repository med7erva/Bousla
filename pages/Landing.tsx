
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  MessageCircle, 
  Shield, 
  LayoutDashboard,
  Package,
  Zap,
  Star,
  Facebook,
  Twitter,
  Instagram,
  TrendingUp,
  Sparkles,
  Users,
  Award
} from 'lucide-react';
import BouslaLogo from '../components/BouslaLogo';

const Landing: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [imgError, setImgError] = useState(false);

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
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden" dir="rtl">
      
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0">
                <BouslaLogo className="h-10 w-auto text-2xl" />
            </div>
            <div className="hidden md:flex items-center gap-8">
                <Link to="/features" className="text-slate-600 hover:text-emerald-600 font-bold text-sm transition">المميزات</Link>
                <Link to="/pricing" className="text-slate-600 hover:text-emerald-600 font-bold text-sm transition">الأسعار</Link>
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

      {/* Hero Section - Optimized Spacing */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden bg-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 lg:mb-16 space-y-6">
            <span className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-black mb-2 border border-emerald-100 animate-bounce-slow">
                مع بوصله .. بوتيكك في ايدك 👋
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-tight tracking-tight">
                أدر عملك <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-500">بذكاء واحترافية</span>
            </h1>
            <p className="text-base md:text-xl text-slate-500 mb-8 leading-relaxed max-w-2xl mx-auto font-medium">
                انسَ الدفاتر والتعقيد. بوصلة يوفر لك أدوات متكاملة لإدارة المبيعات، المخزون، والتقارير المدعومة بالذكاء الاصطناعي.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/register" 
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-lg font-black hover:bg-slate-800 transition shadow-xl flex items-center justify-center gap-2"
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

          {/* iPad Showcase - Resized to max-w-4xl and Added Floating Elements */}
          <div className={`relative max-w-4xl mx-auto transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}`}>
                
                {/* Background Dynamic Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-400/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
                
                <div className="relative group perspective-1000 px-4">
                    {/* Floating Card 1: Sales Growth */}
                    <div className="absolute -top-6 -right-2 md:-right-10 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-emerald-50 flex items-center gap-3 animate-float z-20">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                            <TrendingUp size={20} />
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">نمو المبيعات</p>
                            <p className="text-base font-black text-slate-900">+24.8% هذا الشهر</p>
                        </div>
                    </div>

                    {/* Floating Card 2: Merchant Trust */}
                    <div className="absolute bottom-10 -left-2 md:-left-12 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-blue-50 flex items-center gap-3 animate-float-slow z-20">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                            <Award size={20} />
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">ثقة التجار</p>
                            <p className="text-base font-black text-slate-900">مئات المتاجر انضمت لبوصلة</p>
                        </div>
                    </div>

                    {!imgError ? (
                        <img 
                            src="/assets/images/Mockupipad.png" 
                            alt="معاينة واجهة نظام بوصلة" 
                            className="w-full h-auto drop-shadow-[0_40px_60px_rgba(0,0,0,0.15)] transition-all duration-700 group-hover:scale-[1.02] group-hover:-rotate-1"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        /* Fallback Structural UI */
                        <div className="w-full aspect-[1.4/1] bg-slate-900 rounded-[2.5rem] p-12 flex flex-col items-center justify-center border border-white/10 shadow-2xl">
                             <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6 border border-emerald-500/20">
                                <LayoutDashboard size={40} className="text-emerald-500" />
                             </div>
                             <h3 className="text-white text-xl font-black mb-3">في انتظار رفع ملف الـ Mockup</h3>
                             <p className="text-slate-400 text-center max-w-sm text-sm font-medium leading-relaxed">
                                يرجى وضع صورتك الاحترافية <code className="text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">Mockupipad.png</code> داخل مجلد <code className="text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">/assets/images/</code>.
                             </p>
                        </div>
                    )}
                </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">بساطة في التصميم، قوة في الأداء</h2>
                <p className="text-slate-500 text-lg font-bold">كل ما يحتاجه صاحب عمل للتحكم الكامل في تجارته بضغطة زر واحدة.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group text-center">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                        <LayoutDashboard size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">لوحة تحكم فورية</h3>
                    <p className="text-slate-500 leading-relaxed font-bold text-sm">شاشة واحدة تعرض لك المبيعات، المصاريف، وصافي الأرباح بدقة؛ مع تقارير حول المنتجات الأكثر طلباً.</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group text-center">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                        <Package size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">إدارة المخزون الذكية</h3>
                    <p className="text-slate-500 leading-relaxed font-bold text-sm">ادارة ذكية لتتبع وتقييد جميع عمليات المخزون مع تنبيهات فورية عند انخفاض كمية أي صنف.</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group text-center">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                        <Zap size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">ذكاء اصطناعي مدمج</h3>
                    <p className="text-slate-500 leading-relaxed font-bold text-sm">مساعد "بوصلة" الذكي يحلل بياناتك ويقترح عليك الخطوات اللازمة لنمو تجارتك.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">ماذا يقولون عنا؟</h2>
                <p className="text-slate-500 text-lg font-bold">نفتخر بدعم مئات المتاجر في رحلة نجاحهم الرقمي.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t, i) => (
                    <div key={i} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative hover:-translate-y-2 transition-transform">
                        <div className="flex text-amber-400 mb-6">
                            {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                        </div>
                        <p className="text-slate-700 font-bold leading-relaxed mb-10 text-lg italic">{t.content}</p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-100">
                                {t.initial}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900">{t.name}</h4>
                                <p className="text-slate-400 text-xs font-bold">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#fcfdfe] pt-20 pb-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-right">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 items-start">
                <div className="md:col-span-2 space-y-6 flex flex-col items-center md:items-start">
                    <BouslaLogo className="h-12 w-auto" />
                    <p className="text-slate-500 max-w-sm text-md leading-relaxed font-bold">
                        تطبيق بوصلة هو الشريك التقني الأفضل لمتاجر الملابس. صُمم لخدمة التاجر الموريتاني بأحدث التقنيات العالمية.
                    </p>
                    <div className="flex gap-4">
                         <a href="#" className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm"><Facebook size={20} /></a>
                         <a href="#" className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm"><MessageCircle size={20} /></a>
                         <a href="#" className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm"><Instagram size={20} /></a>
                    </div>
                </div>
                <div>
                    <h4 className="font-black text-slate-900 mb-6 text-sm uppercase tracking-widest bg-slate-100 w-fit px-3 py-1 rounded-lg">روابط سريعة</h4>
                    <ul className="space-y-4 text-sm text-slate-500 font-bold">
                        <li><Link to="/pricing" className="hover:text-emerald-600 transition">التسعير</Link></li>
                        <li><Link to="/features" className="hover:text-emerald-600 transition">المميزات</Link></li>
                        <li><Link to="/login" className="hover:text-emerald-600 transition">تسجيل الدخول</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-slate-900 mb-6 text-sm uppercase tracking-widest bg-slate-100 w-fit px-3 py-1 rounded-lg">قانوني</h4>
                    <ul className="space-y-4 text-sm text-slate-500 font-bold">
                        <li><Link to="/privacy" className="hover:text-emerald-600 transition">سياسة الخصوصية</Link></li>
                        <li><Link to="/terms" className="hover:text-emerald-600 transition">شروط الاستخدام</Link></li>
                    </ul>
                </div>
            </div>
            
            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-slate-400 text-xs font-bold">© 2025 بوصلة. جميع الحقوق محفوظة.</p>
                <div className="flex gap-6">
                    <span className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <Shield size={16} className="text-emerald-500" /> حماية بيانات كاملة
                    </span>
                    <span className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle size={16} className="text-emerald-500" /> فواتير معتمدة
                    </span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
