
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Package, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Smartphone, 
  Cloud, 
  Database,
  BarChart3,
  Users,
  LayoutDashboard
} from 'lucide-react';
import BouslaLogo from '../components/BouslaLogo';

const Features: React.FC = () => {
  const featureList = [
    {
      title: "إدارة المخزون المتقدمة",
      desc: "تتبع كل قطعة بدقة، من لحظة دخولها كمادة خام أو مشتريات وحتى وصولها ليد العميل. نظام تنبيهات ذكي للنواقص.",
      icon: Package,
      color: "bg-blue-500",
      details: ["باركود لكل منتج", "تتبع المواد الخام", "تنبيهات تلقائية"]
    },
    {
      title: "المساعد المالي الذكي (AI)",
      desc: "مدعوم بتقنيات Gemini لتحليل مبيعاتك وتقديم نصائح يومية لزيادة الأرباح وتقليل المصاريف التشغيلية.",
      icon: Zap,
      color: "bg-purple-500",
      details: ["تحليل الاتجاهات", "توقعات المبيعات", "نصائح مخصصة"]
    },
    {
      title: "نظام مبيعات سريع",
      desc: "واجهة POS (نقطة بيع) سهلة الاستخدام تدعم اللمس، الباركود، والمبيعات الآجلة مع ربط فوري بحساب العميل.",
      icon: ShoppingCart,
      color: "bg-emerald-500",
      details: ["فواتير احترافية", "دعم الديون", "طرق دفع متعددة"]
    },
    {
      title: "تقارير مالية تفصيلية",
      desc: "لوحات معلومات حية تعرض لك الربح الصافي، قيمة المخزون، وتدفقات السيولة في خزائنك (Bankily, Masrvi, Cash).",
      icon: BarChart3,
      color: "bg-indigo-500",
      details: ["قائمة الدخل P&L", "كشوفات حساب العملاء", "توزيع المصاريف"]
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans" dir="rtl">
      {/* Simple Nav */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/"><BouslaLogo className="h-10 w-auto" /></Link>
            <div className="hidden md:flex items-center gap-8">
                <Link to="/features" className="text-emerald-600 font-black text-sm">المميزات</Link>
                <Link to="/pricing" className="text-slate-600 hover:text-emerald-600 font-bold text-sm transition">الأسعار</Link>
                <Link to="/login" className="text-slate-600 hover:text-emerald-600 font-bold text-sm transition">دخول</Link>
            </div>
            <Link to="/register" className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200">ابدأ الآن</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                أدوات ذكية مصممة <br/> <span className="text-emerald-600">لنمو تجارتك</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                اكتشف كيف يساعدك نظام بوصلة في التحول من الإدارة التقليدية إلى الاحترافية الرقمية الكاملة.
            </p>
        </div>
      </section>

      {/* Detailed Features Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {featureList.map((f, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-6 p-8 rounded-[3rem] border border-slate-100 bg-white hover:shadow-xl transition-all group">
                        <div className={`w-16 h-16 shrink-0 ${f.color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <f.icon size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">{f.title}</h3>
                            <p className="text-slate-500 leading-relaxed mb-6 font-medium">{f.desc}</p>
                            <ul className="grid grid-cols-2 gap-2">
                                {f.details.map((d, j) => (
                                    <li key={j} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        {d}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black mb-8">بياناتك هي أثمن ما تملك، ونحن نحميها.</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0"><ShieldCheck className="text-emerald-400" /></div>
                            <div>
                                <h4 className="font-bold text-lg">تشفير كامل</h4>
                                <p className="text-slate-400 text-sm">بياناتك مشفرة ومحفوظة على خوادم سحابية آمنة (Supabase).</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0"><Cloud className="text-blue-400" /></div>
                            <div>
                                <h4 className="font-bold text-lg">مزامنة فورية</h4>
                                <p className="text-slate-400 text-sm">ادخل على حسابك من أي مكان، بياناتك دائماً محدثة ولحظية.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full"></div>
                    <div className="relative bg-slate-800 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <Database className="text-emerald-400" />
                            <span className="font-black uppercase tracking-widest text-xs">حالة الخوادم: نشطة</span>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[98%] animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-8">هل أنت مستعد لتجربة هذه المميزات؟</h2>
          <Link to="/register" className="inline-flex items-center gap-3 bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-emerald-700 transition shadow-xl shadow-emerald-200">
              ابدأ تجربتك المجانية
              <ArrowRight size={24} />
          </Link>
      </section>

      {/* Footer Reuse */}
      <footer className="bg-slate-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center border-t border-white/5 pt-12">
             <BouslaLogo className="h-10 w-auto mx-auto mb-6" isWhite={true} />
             <p className="text-slate-500 text-xs font-bold">© 2025 بوصلة للأنظمة المحاسبية. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
};

// Internal icon shim
const ShoppingCart = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);

export default Features;
