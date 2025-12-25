
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  Smartphone, 
  CheckCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Shield, 
  LayoutDashboard,
  Package,
  DollarSign
} from 'lucide-react';
import BouslaLogo from '../components/BouslaLogo';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden" dir="rtl">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0">
                <BouslaLogo className="h-10 w-auto text-2xl" />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-emerald-600 font-bold text-sm transition">المميزات</a>
              <a href="#testimonials" className="text-slate-600 hover:text-emerald-600 font-bold text-sm transition">قالوا عن بوصلة</a>
              <Link to="/login" className="text-slate-600 hover:text-emerald-600 font-bold text-sm transition">تسجيل الدخول</Link>
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
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10 text-center lg:text-right">
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black mb-6 border border-emerald-100 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                تطبيق المحاسبة رقم 1 في موريتانيا 🇲🇷
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tighter">
                أدر بوتيكك <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-500">بذكاء واحترافية</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                انسَ الدفاتر والتعقيد. بوصلة يوفر لك نظاماً متكاملاً لإدارة المبيعات، المخزون، والتقارير المالية مدعوماً بالذكاء الاصطناعي.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/register" 
                  className="flex items-center justify-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-2xl text-lg font-black hover:bg-slate-800 transition shadow-2xl hover:scale-[1.02] active:scale-95"
                >
                  <span>اشترك الآن</span>
                  <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/login"
                  className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-10 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition shadow-sm"
                >
                  <span>تجربة العرض المباشر</span>
                </Link>
              </div>
            </div>

            {/* iPad Mockup - Coded with CSS */}
            <div className="relative animate-in fade-in slide-in-from-left-10 duration-1000">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-emerald-400/20 blur-[120px] rounded-full"></div>
                
                {/* iPad Frame */}
                <div className="relative mx-auto w-[320px] h-[450px] md:w-[480px] md:h-[640px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl border-[8px] border-slate-800 ring-1 ring-slate-700 overflow-hidden transform lg:rotate-[-5deg] hover:rotate-0 transition-transform duration-700">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
                    
                    {/* Screen Content (Mock Dashboard) */}
                    <div className="w-full h-full bg-slate-50 rounded-[2rem] overflow-hidden relative p-4 md:p-6 flex flex-col gap-4">
                        {/* Header Mock */}
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-100"></div>
                                <div className="w-24 h-4 bg-slate-200 rounded mt-2"></div>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
                        </div>

                        {/* Cards Mock */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-pulse">
                                <div className="w-6 h-6 rounded-lg bg-emerald-100 mb-2"></div>
                                <div className="w-full h-3 bg-slate-100 rounded"></div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-pulse delay-75">
                                <div className="w-6 h-6 rounded-lg bg-blue-100 mb-2"></div>
                                <div className="w-full h-3 bg-slate-100 rounded"></div>
                            </div>
                        </div>

                        {/* Chart Mock */}
                        <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-end gap-2">
                             <div className="flex justify-between items-end h-32 gap-1 px-2">
                                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                    <div key={i} className="flex-1 bg-emerald-500 rounded-t-lg transition-all duration-1000" style={{ height: `${h}%` }}></div>
                                ))}
                             </div>
                             <div className="w-full h-2 bg-slate-50 rounded"></div>
                        </div>

                        {/* List Mock */}
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between bg-white p-3 rounded-xl border border-slate-50">
                                    <div className="flex gap-2">
                                        <div className="w-6 h-6 rounded bg-slate-100"></div>
                                        <div className="w-16 h-3 bg-slate-100 rounded mt-1.5"></div>
                                    </div>
                                    <div className="w-10 h-3 bg-emerald-50 rounded mt-1.5"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Floating Elements around iPad */}
                <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold">ربح اليوم</p>
                        <p className="text-sm font-black text-slate-800">+4,500 MRU</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">بساطة في التصميم، قوة في الأداء</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">كل ما يحتاجه صاحب المتجر الموريتاني للتحكم الكامل في تجارته بضغطة زر واحدة.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition duration-500 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform"></div>
                    <div className="w-16 h-16 bg-white shadow-sm text-emerald-600 rounded-2xl flex items-center justify-center mb-8 relative z-10">
                        <LayoutDashboard size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 relative z-10">لوحة تحكم فورية</h3>
                    <p className="text-slate-500 leading-relaxed relative z-10">شاشة واحدة تعرض لك المبيعات، المصاريف، وصافي الأرباح بدقة اللحظة الحالية.</p>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition duration-500 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform"></div>
                    <div className="w-16 h-16 bg-white shadow-sm text-indigo-600 rounded-2xl flex items-center justify-center mb-8 relative z-10">
                        <Package size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 relative z-10">إدارة المخزون الذكية</h3>
                    <p className="text-slate-500 leading-relaxed relative z-10">تنبيهات فورية عند انخفاض كمية أي صنف، مع تقارير حول المنتجات الأكثر طلباً.</p>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition duration-500 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform"></div>
                    <div className="w-16 h-16 bg-white shadow-sm text-purple-600 rounded-2xl flex items-center justify-center mb-8 relative z-10">
                        <Zap size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 relative z-10">ذكاء اصطناعي مدمج</h3>
                    <p className="text-slate-500 leading-relaxed relative z-10">مساعد "بوصلة" الذكي يحلل بياناتك ويقترح عليك خطوات لزيادة مبيعاتك.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">ماذا يقولون عنا؟</h2>
                <p className="text-slate-500">نفتخر بدعم مئات المتاجر في رحلة نجاحهم الرقمي.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {
                        name: "عبد الرحمن",
                        store: "محل ألبسة رجالية",
                        quote: "“قبل بوصلة كنت أعرف المبيعات، لكن لا أعرف الربح الحقيقي. الآن أرى المبيعات والمصاريف بشكل واضح وسريع.”",
                        color: "emerald"
                    },
                    {
                        name: "الحسن",
                        store: "تاجر تجزئة",
                        quote: "“أكثر شيء عجبني هو تنبيهات المخزون. التطبيق ينبهني قبل ما يخلص الصنف، وهذا وفر علي الكثير من الوقت.”",
                        color: "blue"
                    },
                    {
                        name: "عمر",
                        store: "صاحب محل خياطة",
                        quote: "“ميزة بند الخياطة والتصنيع ممتازة، أخيرًا وجدت حلاً يناسب طبيعة عملنا وليس مجرد محاسبة عامة.”",
                        color: "indigo"
                    }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                        <div className="flex gap-1 mb-6">
                            {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-yellow-400">★</span>)}
                        </div>
                        <p className="text-slate-700 font-medium leading-relaxed mb-8 italic">
                            {item.quote}
                        </p>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full bg-${item.color}-100 flex items-center justify-center font-black text-${item.color}-600`}>
                                {item.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">{item.name}</h4>
                                <p className="text-xs text-slate-500 font-bold">{item.store}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black mb-6">جاهز لرقمنة متجرك؟</h2>
                <p className="text-slate-400 mb-10 max-w-xl mx-auto font-medium">ابدأ الآن تجربتك المجانية لمدة 30 يوماً واكتشف الفرق الذي سيحدثه "بوصلة" في إدارة عملك.</p>
                <Link to="/register" className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-xl shadow-emerald-900/20">
                    ابدأ الآن مجاناً
                    <ArrowRight size={24} />
                </Link>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <BouslaLogo className="h-12 w-auto" />
                    <p className="text-slate-500 max-w-sm leading-relaxed font-medium">
                        تطبيق بوصلة هو الشريك التقني الأول لمتاجر الملابس والخياطة في موريتانيا، صُمم بأيادٍ وطنية لخدمة الاقتصاد المحلي.
                    </p>
                    <div className="flex gap-4">
                         <a href="https://wa.me/22247071347" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-emerald-600 hover:text-white transition">
                            <MessageCircle size={20} />
                         </a>
                         <a href="mailto:support@bousla.com" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white transition">
                            <Mail size={20} />
                         </a>
                    </div>
                </div>
                <div>
                    <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">روابط سريعة</h4>
                    <ul className="space-y-4 text-sm font-bold">
                        <li><Link to="/pricing" className="text-slate-500 hover:text-emerald-600 transition">التسعير</Link></li>
                        <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition">المميزات</a></li>
                        <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition">الأسئلة الشائعة</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">قانوني</h4>
                    <ul className="space-y-4 text-sm font-bold">
                        <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition">سياسة الخصوصية</a></li>
                        <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition">شروط الاستخدام</a></li>
                        <li className="pt-2">
                            <p className="text-xs text-slate-400 font-medium">الهاتف: 22247071347+</p>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-slate-50 pt-8 text-center md:flex justify-between items-center">
                <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} بوصلة المحاسبي. جميع الحقوق محفوظة.</p>
                <div className="flex gap-6 mt-4 md:mt-0 justify-center">
                    <span className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <Shield size={14} /> حماية بيانات كاملة
                    </span>
                    <span className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <CheckCircle size={14} /> فواتير معتمدة
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
        className="fixed bottom-6 right-6 z-[100] group flex items-center gap-3 bg-white p-2 pr-6 rounded-full shadow-2xl border border-emerald-100 hover:scale-105 transition-all active:scale-95"
      >
          <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-25"></div>
              <div className="relative w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <MessageCircle size={28} />
              </div>
          </div>
          <span className="font-black text-emerald-700 text-sm whitespace-nowrap">تواصل عبر واتساب</span>
      </a>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default Landing;
