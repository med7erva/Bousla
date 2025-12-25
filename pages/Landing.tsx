
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Shield, 
  LayoutDashboard,
  Package,
  DollarSign,
  TrendingUp,
  Zap,
  Star,
  Quote
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
      business: "محل ألبسة رجالية",
      quote: "قبل بوصلة كنت أعرف البيع، لكن لا أعرف الربح الحقيقي. الآن أرى المبيعات والمصاريف بشكل واضح وسريع.",
      initial: "ع"
    },
    {
      name: "الحسن",
      business: "تاجر تجزئة",
      quote: "أكثر شيء عجبني هو تنبيهات المخزون. التطبيق ينبهني قبل ما يخلص الصنف.",
      initial: "ح"
    },
    {
      name: "عمر",
      business: "صاحب محل خياطة",
      quote: "ميزة بند الخياطة ممتازة، أخيرًا حل يناسب عملنا ليس مجرد محاسبة عامة.",
      initial: "ع"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden" dir="rtl">
      
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0">
                <BouslaLogo className="h-10 w-auto text-2xl" />
            </div>
            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-slate-600 hover:text-emerald-600 font-bold text-sm transition">المميزات</a>
              <a href="#testimonials" className="text-slate-600 hover:text-emerald-600 font-bold text-sm transition">ماذا يقولون عنا</a>
              <Link to="/login" className="text-slate-600 hover:text-emerald-600 font-bold text-sm transition">تسجيل الدخول</Link>
            </div>
            <Link 
              to="/register" 
              className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 active:scale-95"
            >
              ابدأ تجربتك المجانية
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <span className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-100 shadow-sm">
                <Zap size={14} className="fill-emerald-500" />
                الجيل القادم من أنظمة المحاسبة في موريتانيا
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tighter">
                بساطة في التصميم <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-500">قوة في الإدارة المباشرة</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
                حول متجرك من التقليدي إلى الرقمي في دقائق. بوصلة هو الحل المتكامل لإدارة المخزون والمبيعات والتحليلات الذكية.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/register" className="bg-slate-900 text-white px-12 py-5 rounded-2xl text-xl font-black hover:bg-slate-800 transition shadow-2xl flex items-center justify-center gap-3 group">
                    اشترك الآن
                    <ArrowRight size={24} className="group-hover:translate-x-[-4px] transition-transform" />
                </Link>
                <Link to="/login" className="bg-white text-slate-700 border-2 border-slate-200 px-12 py-5 rounded-2xl text-xl font-black hover:bg-slate-50 transition shadow-sm">
                    مشاهدة العرض
                </Link>
            </div>
          </div>

          {/* Interactive iPad Mockup */}
          <div className={`relative max-w-5xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="absolute inset-0 bg-emerald-500/20 blur-[120px] rounded-full scale-75 animate-pulse"></div>
            
            {/* iPad Frame */}
            <div className="relative mx-auto w-full aspect-[4/3] bg-slate-900 rounded-[3rem] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[10px] border-slate-800 ring-1 ring-slate-700 overflow-hidden transform hover:scale-[1.01] transition-transform">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
                
                {/* Screen Content */}
                <div className="w-full h-full bg-slate-50 rounded-[2rem] overflow-hidden relative p-4 md:p-8 flex flex-col gap-6">
                    {/* Mock Header */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100"></div>
                            <div className="space-y-2">
                                <div className="w-32 h-4 bg-slate-200 rounded-full"></div>
                                <div className="w-20 h-3 bg-slate-100 rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100"></div>
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100"></div>
                        </div>
                    </div>

                    {/* Mock Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { color: 'bg-emerald-500', label: 'المبيعات', val: '45,200' },
                            { color: 'bg-blue-500', label: 'السيولة', val: '12,800' },
                            { color: 'bg-orange-500', label: 'المخزون', val: '1,420' }
                        ].map((card, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                                <div className={`w-8 h-8 rounded-lg ${card.color} opacity-20`}></div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{card.label}</p>
                                <p className="text-xl font-black text-slate-800">{card.val}</p>
                            </div>
                        ))}
                    </div>

                    {/* Mock Chart & Table */}
                    <div className="flex-1 flex gap-6 min-h-0">
                        <div className="flex-[2] bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col">
                            <div className="w-40 h-4 bg-slate-100 rounded-full mb-8"></div>
                            <div className="flex-1 flex items-end justify-between gap-4 px-4">
                                {[60, 40, 90, 70, 50, 80, 100, 65].map((h, i) => (
                                    <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-xl transition-all duration-1000 delay-300" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hidden md:flex flex-col gap-4">
                            <div className="w-full h-4 bg-slate-100 rounded-full"></div>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50"></div>
                                    <div className="w-20 h-3 bg-slate-50 rounded-full"></div>
                                    <div className="w-12 h-3 bg-emerald-50 rounded-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute -top-6 -right-6 md:-top-12 md:-right-12 bg-white p-5 rounded-3xl shadow-2xl border border-emerald-100 flex items-center gap-4 animate-bounce duration-[3000ms]">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-bold">نسبة النمو</p>
                    <p className="text-lg font-black text-slate-800">+24% هذا الشهر</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div className="space-y-4">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <LayoutDashboard size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">سهولة مطلقة</h3>
                    <p className="text-slate-500 font-medium">واجهة عربية بالكامل صُممت لتناسب سرعة العمل داخل المتاجر والمحلات.</p>
                </div>
                <div className="space-y-4">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Shield size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">أمان كامل</h3>
                    <p className="text-slate-500 font-medium">بياناتك مشفرة ومحفوظة سحابياً، مع إمكانية الوصول إليها من أي مكان وفي أي وقت.</p>
                </div>
                <div className="space-y-4">
                    <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Package size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">إدارة ذكية</h3>
                    <p className="text-slate-500 font-medium">تتبع مخزونك بدقة، وتلقَ تنبيهات فورية قبل نفاد أي منتج لتجنب ضياع الفرص.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">ماذا يقولون عنا؟</h2>
            <p className="text-slate-500 text-lg font-medium">نحن فخورون بشراكتنا مع مئات التجار في موريتانيا</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white shadow-xl hover:-translate-y-2 transition-all group">
                <Quote className="text-emerald-500 opacity-20 mb-6 group-hover:scale-110 transition-transform" size={48} />
                <p className="text-slate-700 text-lg font-bold leading-relaxed mb-10 min-h-[100px]">
                    "{t.quote}"
                </p>
                <div className="flex items-center gap-4 border-t border-slate-50 pt-8">
                    <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-emerald-200">
                        {t.initial}
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900">{t.name}</h4>
                        <p className="text-sm text-slate-400 font-bold">{t.business}</p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            {/* Brand Column */}
            <div className="col-span-1 lg:col-span-1 space-y-6">
                <BouslaLogo className="h-10 w-auto" isWhite={true} />
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    المنصة المحاسبية الأولى في موريتانيا، صُممت خصيصاً لخدمة المحلات والمؤسسات التجارية الصغيرة والمتوسطة بأحدث التقنيات.
                </p>
                <div className="flex gap-3">
                    <a href="https://wa.me/22247071347" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                        <MessageCircle size={20} />
                    </a>
                    <a href="mailto:support@bousla.com" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors">
                        <Mail size={20} />
                    </a>
                </div>
            </div>

            {/* Quick Links */}
            <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-8">روابط سريعة</h4>
                <ul className="space-y-4 text-slate-400 font-bold text-sm">
                    <li><Link to="/pricing" className="hover:text-white transition">خطط التسعير</Link></li>
                    <li><a href="#" className="hover:text-white transition">المميزات</a></li>
                    <li><a href="#" className="hover:text-white transition">قصص النجاح</a></li>
                    <li><a href="#" className="hover:text-white transition">الأسئلة الشائعة</a></li>
                </ul>
            </div>

            {/* Legal */}
            <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-8">قانوني</h4>
                <ul className="space-y-4 text-slate-400 font-bold text-sm">
                    <li><a href="#" className="hover:text-white transition">سياسة الخصوصية</a></li>
                    <li><a href="#" className="hover:text-white transition">شروط الاستخدام</a></li>
                    <li><a href="#" className="hover:text-white transition">اتفاقية الاشتراك</a></li>
                </ul>
            </div>

            {/* Contact */}
            <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-8">تواصل معنا</h4>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-400 font-bold text-sm">
                        <Phone size={18} className="text-emerald-600" />
                        <span dir="ltr">+222 47071347</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 font-bold text-sm">
                        <Mail size={18} className="text-emerald-600" />
                        <span>support@bousla.com</span>
                    </div>
                    <div className="pt-4">
                        <a 
                            href="https://wa.me/22247071347" 
                            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-black text-xs hover:bg-emerald-700 transition"
                        >
                            <MessageCircle size={16} />
                            واتساب المبيعات
                        </a>
                    </div>
                </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-xs font-bold">
                © {new Date().getFullYear()} بوصلة المحاسبي. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-8">
                <span className="flex items-center gap-2 text-slate-500 text-xs font-bold italic">
                    <Shield size={14} className="text-emerald-500" />
                    بياناتك محمية ومشفرة بالكامل
                </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/22247071347" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[200] group flex items-center gap-3 bg-emerald-600 text-white p-2 pr-6 rounded-full shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all"
      >
          <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-25"></div>
              <div className="relative w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                <MessageCircle size={28} />
              </div>
          </div>
          <span className="font-black text-sm whitespace-nowrap">تواصل عبر واتساب</span>
      </a>

    </div>
  );
};

export default Landing;
