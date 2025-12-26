
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
  Menu,
  Download,
  Calendar,
  DollarSign,
  Activity,
  Star,
  Facebook,
  Twitter,
  Instagram,
  X,
  TrendingUp,
  Sparkles,
  ArrowUpRight
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
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden" dir="rtl">
      
      {/* Navbar */}
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
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-24 space-y-6">
            <span className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-black mb-2 border border-emerald-100 animate-bounce-slow">
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
                  className="bg-slate-900 text-white px-12 py-4 rounded-2xl text-lg font-black hover:bg-slate-800 transition shadow-2xl flex items-center justify-center gap-2"
                >
                  اشترك الآن
                  <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/login"
                  className="bg-white text-slate-700 border-2 border-slate-100 px-12 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition"
                >
                  تجربة العرض المباشر
                </Link>
            </div>
          </div>

          {/* Optimized Hero Image Container with Mockupipad.png */}
          <div className={`relative max-w-5xl mx-auto transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'}`}>
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-100/30 blur-[120px] rounded-full -z-10"></div>
                
                <div className="relative group perspective-1000">
                    {/* The Main Mockup Image */}
                    <img 
                        src="/assets/images/Mockupipad.png" 
                        alt="Bousla System Showcase" 
                        className="w-full h-auto drop-shadow-[0_45px_65px_rgba(0,0,0,0.2)] transition-transform duration-700 group-hover:scale-[1.01]"
                        onError={(e) => {
                            // Fallback in case the image is not yet in the folder
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.querySelector('.fallback-placeholder')?.classList.remove('hidden');
                        }}
                    />

                    {/* Placeholder shown only if image fails */}
                    <div className="fallback-placeholder hidden w-full aspect-[1.4/1] bg-slate-900 rounded-[3rem] p-12 flex flex-col items-center justify-center border border-white/10 shadow-2xl">
                         <LayoutDashboard size={80} className="text-emerald-500 mb-6" />
                         <h3 className="text-white text-2xl font-black">واجهة بوصلة الذكية</h3>
                         <p className="text-slate-400 mt-2 font-medium">يرجى رفع ملف Mockupipad.png في مجلد /assets/images/</p>
                    </div>

                    {/* Floating Element 1: Smart Growth Card */}
                    <div className="absolute -top-10 -right-4 md:-right-16 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-emerald-100 dark:border-emerald-900 flex items-center gap-4 animate-float">
                        <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                            <TrendingUp size={28} />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">نسبة النمو</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">+24.8% <span className="text-[10px] text-emerald-500 mr-1">هذا الشهر</span></p>
                        </div>
                    </div>

                    {/* Floating Element 2: AI Advisor Prompt */}
                    <div className="absolute top-1/2 -left-4 md:-left-20 -translate-y-1/2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 hidden lg:flex items-center gap-3 animate-float-slow">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
                            <Sparkles size={20} />
                        </div>
                        <div className="text-right max-w-[140px]">
                            <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-tight">"بناءً على مخزونك، أقترح زيادة طلبات الدراعة الفاخرة."</p>
                        </div>
                    </div>

                    {/* Floating Element 3: Active Users Count */}
                    <div className="absolute -bottom-8 -left-2 md:-left-12 bg-slate-900 dark:bg-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce-slow">
                         <div className="flex -space-x-3 rtl:space-x-reverse">
                            {[1,2,3].map(i => (
                                <div key={i} className="w-9 h-9 rounded-full border-2 border-slate-900 dark:border-white bg-slate-700 flex items-center justify-center overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="Merchant" />
                                </div>
                            ))}
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">ثقة التجار</p>
                            <p className="text-xs font-black text-white dark:text-slate-900">مئات المتاجر انضمت لبوصلة</p>
                         </div>
                    </div>
                </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20 space-y-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">بساطة في التصميم، قوة في الأداء</h2>
                <p className="text-slate-500 text-lg font-bold">كل ما يحتاجه صاحب عمل للتحكم الكامل في تجارته بضغطة زر واحدة.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group text-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform">
                        <LayoutDashboard size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-4">لوحة تحكم فورية</h3>
                    <p className="text-slate-500 leading-relaxed font-bold">شاشة واحدة تعرض لك المبيعات، المصاريف، وصافي الأرباح بدقة؛ مع تقارير حول المنتجات الأكثر طلباً.</p>
                </div>

                {/* Feature 2 */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform">
                        <Package size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-4">إدارة المخزون الذكية</h3>
                    <p className="text-slate-500 leading-relaxed font-bold">ادارة ذكية لتتبع وتقييد جميع عمليات المخزون مع تنبيهات فورية عند انخفاض كمية أي صنف.</p>
                </div>

                {/* Feature 3 */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group text-center">
                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform">
                        <Zap size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-4">ذكاء اصطناعي مدمج</h3>
                    <p className="text-slate-500 leading-relaxed font-bold">مساعد "بوصلة" الذكي يحلل بياناتك ويقترح عليك خطوات اللازمة.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
                <h2 className="text-4xl font-black text-slate-900 mb-4">ماذا يقولون عنا؟</h2>
                <p className="text-slate-500 text-lg font-bold">نفتخر بدعم مئات المتاجر في رحلة نجاحهم الرقمي.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t, i) => (
                    <div key={i} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative hover:-translate-y-2 transition-transform">
                        <div className="flex text-amber-400 mb-6">
                            {[...Array(5)].map((_, j) => <Star key={j} size={18} fill="currentColor" />)}
                        </div>
                        <p className="text-slate-700 font-bold leading-relaxed mb-10 text-lg italic">{t.content}</p>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-100">
                                {t.initial}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900">{t.name}</h4>
                                <p className="text-slate-400 text-sm font-bold">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-emerald-600 rounded-[4rem] p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">جاهز لرقمنة متجرك؟</h2>
                <p className="text-emerald-50 mb-12 max-w-2xl mx-auto text-xl font-bold opacity-90">
                    ابدأ الآن تجربتك المجانية لمدة 30 يوماً واكتشف الفرق الذي سيحدثه "بوصلة" في إدارة عملك.
                </p>
                <Link to="/register" className="inline-flex items-center gap-3 bg-white hover:bg-emerald-50 text-emerald-600 px-14 py-5 rounded-[2rem] font-black text-2xl transition-all shadow-xl shadow-emerald-900/20">
                    ابدأ الآن مجاناً
                    <ArrowRight size={28} />
                </Link>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#fcfdfe] pt-24 pb-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 items-start">
                <div className="md:col-span-2 space-y-8">
                    <BouslaLogo className="h-14 w-auto" />
                    <p className="text-slate-500 max-w-sm text-md leading-relaxed font-bold">
                        تطبيق بوصلة هو الشريك التقني الأفضل لمتاجر الملابس. صُمم لخدمة التاجر الموريتاني بأحدث التقنيات العالمية.
                    </p>
                    <div className="flex gap-4">
                         <a href="#" className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm"><Facebook size={22} /></a>
                         <a href="#" className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm"><Twitter size={22} /></a>
                         <a href="#" className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm"><Instagram size={22} /></a>
                         <a href="https://wa.me/22247071347" className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm"><MessageCircle size={22} /></a>
                    </div>
                </div>
                <div>
                    <h4 className="font-black text-slate-900 mb-8 text-sm uppercase tracking-widest bg-slate-100 w-fit px-3 py-1 rounded-lg">روابط سريعة</h4>
                    <ul className="space-y-5 text-md text-slate-500 font-bold">
                        <li><Link to="/pricing" className="hover:text-emerald-600 transition">التسعير</Link></li>
                        <li><Link to="/features" className="hover:text-emerald-600 transition">المميزات</Link></li>
                        <li><Link to="/login" className="hover:text-emerald-600 transition">تسجيل الدخول</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-slate-900 mb-8 text-sm uppercase tracking-widest bg-slate-100 w-fit px-3 py-1 rounded-lg">قانوني</h4>
                    <ul className="space-y-5 text-md text-slate-500 font-bold">
                        <li><Link to="/privacy" className="hover:text-emerald-600 transition">سياسة الخصوصية</Link></li>
                        <li><Link to="/terms" className="hover:text-emerald-600 transition">شروط الاستخدام</Link></li>
                    </ul>
                </div>
            </div>
            
            <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                <p className="text-slate-400 text-sm font-bold">© 2025 بوصلة. جميع الحقوق محفوظة.</p>
                <div className="flex gap-8">
                    <span className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest">
                        <Shield size={18} className="text-emerald-500" /> حماية بيانات كاملة
                    </span>
                    <span className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest">
                        <CheckCircle size={18} className="text-emerald-500" /> فواتير معتمدة
                    </span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
