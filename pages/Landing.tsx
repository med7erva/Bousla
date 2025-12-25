
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
  MoreHorizontal,
  Cloud,
  Smartphone,
  ShieldCheck,
  Check
} from 'lucide-react';
import BouslaLogo from '../components/BouslaLogo';

const Landing: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      title: "إدارة المخزون الذكية",
      desc: "تتبع دقيق لكل قطعة في متجرك مع تنبيهات فورية عند انخفاض الكمية.",
      icon: Package,
      color: "bg-blue-500"
    },
    {
      title: "تحليل بالذكاء الاصطناعي",
      desc: "مساعد ذكي يحلل مبيعاتك ويقترح عليك أفضل الأوقات لعمل العروض.",
      icon: Zap,
      color: "bg-purple-500"
    },
    {
      title: "تزامن سحابي فوري",
      desc: "بياناتك محفوظة وآمنة، يمكنك الوصول إليها من هاتفك أو جهازك اللوحي في أي وقت.",
      icon: Cloud,
      color: "bg-emerald-500"
    },
    {
      title: "تقارير مالية بنقرة",
      desc: "استخرج تقارير الأرباح، المصاريف، والقوائم المالية خلال ثوانٍ معدودة.",
      icon: TrendingUp,
      color: "bg-indigo-500"
    },
    {
      title: "سهولة الاستخدام",
      desc: "واجهة عربية بسيطة مصممة خصيصاً للتجار، لا تحتاج لخبرة محاسبية.",
      icon: Smartphone,
      color: "bg-orange-500"
    },
    {
      title: "أمان وحماية بياناتك",
      desc: "تشفير عالي المستوى لبياناتك وعملياتك المالية لضمان أقصى درجات الخصوصية.",
      icon: ShieldCheck,
      color: "bg-rose-500"
    }
  ];

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
                <a href="#features" className="text-slate-600 hover:text-emerald-600 font-bold text-sm transition">المميزات</a>
                <a href="#pricing" className="text-slate-600 hover:text-emerald-600 font-bold text-sm transition">الأسعار</a>
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
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-6">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black mb-2 border border-emerald-100 animate-fade-in">
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

          {/* IPAD MOCKUP */}
          <div className={`relative max-w-5xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[85%] h-20 bg-black/10 blur-[80px] rounded-full"></div>
                <div className="relative mx-auto w-full max-w-[760px] aspect-[1/1.4] bg-[#080808] rounded-[3.5rem] p-[10px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border-[1px] border-white/5 ring-1 ring-black overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#080808] rounded-b-2xl z-40 flex items-center justify-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]"></div>
                        <div className="w-8 h-1 rounded-full bg-[#1a1a1a]"></div>
                    </div>
                    <div className="w-full h-full bg-[#f8fafb] rounded-[2.8rem] overflow-hidden relative flex flex-col font-sans">
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
                        <div className="px-6 py-4 flex justify-between items-center bg-white shadow-sm z-10">
                             <div className="flex items-center gap-2 bg-[#f1f3f5] p-1.5 rounded-xl border border-slate-100">
                                <Calendar size={14} className="text-slate-400 mr-1" />
                                <span className="text-[10px] font-bold text-slate-500">2025/11/23</span>
                                <span className="text-slate-300 text-[10px] mx-0.5">{'>'}</span>
                                <span className="text-[10px] font-bold text-slate-500">2025/11/30</span>
                                <div className="w-px h-3 bg-slate-200 mx-1"></div>
                                <X size={12} className="text-slate-400" />
                             </div>
                             <div className="flex items-center gap-3">
                                <button className="bg-[#111] text-white px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2">
                                    تصدير <Download size={12} />
                                </button>
                             </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#f8fafb]">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4"><Activity size={18} /></div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">إجمالي المبيعات</p>
                                    <h3 className="text-xl font-black text-slate-900">78,530 <span className="text-[10px] text-slate-400">أوقية</span></h3>
                                </div>
                                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-4 right-4"><span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black">%20 هامش</span></div>
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4"><DollarSign size={18} /></div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">صافي الربح</p>
                                    <h3 className="text-xl font-black text-emerald-600">15,677 <span className="text-[10px] text-emerald-400">أوقية</span></h3>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-2"><TrendingUp size={14} className="text-emerald-500" /> اتجاه المبيعات (يومي)</h3>
                                    <div className="w-16 h-1.5 bg-slate-50 rounded-full"></div>
                                </div>
                                <div className="h-40 w-full relative">
                                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                        <path d="M0,85 L10,82 L20,40 L30,78 L40,80 L50,55 L60,85 L70,25 L80,70 L90,35 L100,85" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M0,85 L10,82 L20,40 L30,78 L40,80 L50,55 L60,85 L70,25 L80,70 L90,35 L100,85 L100,100 L0,100 Z" fill="url(#mainChartGrad)" opacity="0.1" />
                                        <defs>
                                            <linearGradient id="mainChartGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#fff" /></linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section id="features" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">كل ما تحتاجه للتحكم في تجارتك</h2>
                <p className="text-slate-500 text-lg">صممنا بوصلة ليكون شريكك التقني الذي يفهم لغة التجار واحتياجات السوق الموريتاني.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((f, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className={`w-14 h-14 ${f.color} text-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-${f.color.split('-')[1]}-200`}>
                            <f.icon size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">{f.title}</h3>
                        <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">خطط اشتراك بسيطة وشفافة</h2>
                <p className="text-slate-500 text-lg">اختر الخطة التي تناسب حجم متجرك، وابدأ رحلة التحول الرقمي اليوم.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Monthly */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col hover:border-emerald-200 transition-colors">
                    <h3 className="text-xl font-black text-slate-800 mb-2">الخطة الشهرية</h3>
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-4xl font-black text-slate-900">200</span>
                        <span className="text-slate-500 font-bold text-sm">أوقية / شهر</span>
                    </div>
                    <ul className="space-y-4 mb-10 flex-1">
                        {['إدارة المبيعات والمخزون', 'دعم فني واتساب', 'تقارير أساسية'].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                <Check size={18} className="text-emerald-500" /> {item}
                            </li>
                        ))}
                    </ul>
                    <Link to="/register" className="w-full bg-slate-50 text-slate-900 py-4 rounded-2xl font-black text-center hover:bg-slate-100 transition">ابدأ الآن</Link>
                </div>

                {/* Pro (Recommended) */}
                <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl flex flex-col relative scale-105 z-10 border border-slate-800">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">الأكثر طلباً</div>
                    <h3 className="text-xl font-black text-white mb-2">خطة الأعمال (Pro)</h3>
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-4xl font-black text-white">1,000</span>
                        <span className="text-slate-400 font-bold text-sm">أوقية / 6 أشهر</span>
                    </div>
                    <ul className="space-y-4 mb-10 flex-1">
                        {['كل مميزات الخطة الشهرية', 'تحليل الذكاء الاصطناعي', 'إدارة الموظفين والرواتب', 'توفير 17%'].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                                <Check size={18} className="text-emerald-400" /> {item}
                            </li>
                        ))}
                    </ul>
                    <Link to="/register" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-center hover:bg-emerald-500 transition shadow-xl shadow-emerald-900/40">اشترك الآن</Link>
                </div>

                {/* Yearly */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col hover:border-emerald-200 transition-colors">
                    <h3 className="text-xl font-black text-slate-800 mb-2">الخطة السنوية</h3>
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-4xl font-black text-slate-900">1,800</span>
                        <span className="text-slate-500 font-bold text-sm">أوقية / سنة</span>
                    </div>
                    <ul className="space-y-4 mb-10 flex-1">
                        {['كل مميزات خطة الأعمال', 'أولوية في الدعم الفني', 'تحديثات مجانية مستمرة', 'توفير 25%'].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                <Check size={18} className="text-emerald-500" /> {item}
                            </li>
                        ))}
                    </ul>
                    <Link to="/register" className="w-full bg-slate-50 text-slate-900 py-4 rounded-2xl font-black text-center hover:bg-slate-100 transition">ابدأ الآن</Link>
                </div>
            </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto bg-emerald-600 rounded-[3.5rem] p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">جاهز لرقمنة متجرك؟</h2>
                <p className="text-emerald-50 mb-12 max-w-xl mx-auto text-lg font-medium">انضم لأكثر من 500 تاجر في موريتانيا اختاروا بوصلة لإدارة تجارتهم بذكاء.</p>
                <Link to="/register" className="inline-flex items-center gap-3 bg-white hover:bg-emerald-50 text-emerald-600 px-14 py-5 rounded-[2rem] font-black text-xl transition-all shadow-xl shadow-emerald-900/20">
                    ابدأ تجربتك المجانية
                    <ArrowRight size={24} />
                </Link>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 items-start">
                <div className="md:col-span-2 space-y-6">
                    <BouslaLogo className="h-12 w-auto" isWhite={true} />
                    <p className="text-slate-400 max-w-sm text-sm leading-relaxed font-bold">
                        تطبيق بوصلة هو الشريك التقني الأفضل لمتاجر الملابس في موريتانيا، صُمم بأيدي موريتانية لخدمة تجارنا.
                    </p>
                    <div className="flex gap-4">
                         <a href="#" className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 hover:bg-emerald-600 transition-colors border border-white/5"><Facebook size={20} /></a>
                         <a href="#" className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 hover:bg-emerald-600 transition-colors border border-white/5"><Twitter size={20} /></a>
                         <a href="#" className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 hover:bg-emerald-600 transition-colors border border-white/5"><Instagram size={20} /></a>
                         <a href="https://wa.me/22247071347" className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 hover:bg-emerald-600 transition-colors border border-white/5"><MessageCircle size={20} /></a>
                    </div>
                </div>
                <div>
                    <h4 className="font-black text-emerald-500 mb-6 text-xs uppercase tracking-widest">روابط سريعة</h4>
                    <ul className="space-y-4 text-sm text-slate-400 font-bold">
                        <li><Link to="/pricing" className="hover:text-white transition">التسعير</Link></li>
                        <li><a href="#features" className="hover:text-white transition">المميزات</a></li>
                        <li><Link to="/login" className="hover:text-white transition">تسجيل الدخول</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-emerald-500 mb-6 text-xs uppercase tracking-widest">قانوني</h4>
                    <ul className="space-y-4 text-sm text-slate-400 font-bold">
                        <li><Link to="/privacy" className="hover:text-white transition">سياسة الخصوصية</Link></li>
                        <li><Link to="/terms" className="hover:text-white transition">شروط الاستخدام</Link></li>
                        <li className="text-xs text-slate-500 pt-4 font-mono" dir="ltr">+222 47071347</li>
                    </ul>
                </div>
            </div>
            
            <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-slate-500 text-xs font-bold">© 2025 بوصلة للأنظمة المحاسبية. جميع الحقوق محفوظة.</p>
                <div className="flex gap-8">
                    <span className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <Shield size={16} className="text-emerald-500" /> حماية بيانات كاملة
                    </span>
                    <span className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
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
