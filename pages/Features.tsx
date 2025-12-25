
import React from 'react';
import { Link } from 'react-router-dom';
// Fix: Added missing icons DollarSign and Activity to the imports from lucide-react
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
  LayoutDashboard,
  ShoppingCart,
  Layers,
  Sparkles,
  DollarSign,
  Activity
} from 'lucide-react';
import BouslaLogo from '../components/BouslaLogo';

const FeatureCard = ({ title, desc, icon: Icon, color, imagePath }: any) => (
  <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all group flex flex-col">
    <div className="p-10 flex-1">
      <div className={`w-16 h-16 ${color} text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon size={32} />
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-bold text-lg">{desc}</p>
    </div>
    {/* Image Placeholder Frame - Looks for /assets/images/[imagePath] */}
    <div className="px-10 pb-10">
        <div className="aspect-video bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden relative group-hover:border-emerald-100 transition-colors">
            <img 
                src={`/assets/images/${imagePath}`} 
                alt={title}
                className="w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0"
                onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-200">
                <Sparkles size={48} className="opacity-20" />
            </div>
        </div>
    </div>
  </div>
);

const Features: React.FC = () => {
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

      <section className="py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-100/30 blur-[120px] rounded-full -z-10"></div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
                قوة المحاسبة <br/> <span className="text-emerald-600">في جيبك</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-3xl mx-auto font-bold leading-relaxed">
                كل ميزة في بوصلة مصممة بعناية فائقة لتجعل إدارة بوتيكك أو مشغل الخياطة الخاص بك أسهل مما تتخيل.
            </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <FeatureCard 
                    title="إدارة المخزون المتقدمة"
                    desc="تتبع كل قطعة من أقمشة وخياطة وملابس جاهزة. نظام باركود ذكي مع تنبيهات فورية للنواقص."
                    icon={Package}
                    color="bg-blue-500"
                    imagePath="inventory-feature.png"
                />
                <FeatureCard 
                    title="المساعد المالي (Gemini AI)"
                    desc="أول تطبيق موريتاني يحلل مبيعاتك ويقدم لك نصائح يومية دقيقة لزيادة الأرباح بناءً على أرقامك الحقيقية."
                    icon={Sparkles}
                    color="bg-purple-600"
                    imagePath="ai-feature.png"
                />
                <FeatureCard 
                    title="نقطة بيع (POS) سريعة"
                    desc="أتمم عمليات البيع في ثوانٍ. دعم كامل للمبيعات النقدية، بنكيلي، مصرفي، والديون الآجلة للعملاء."
                    icon={ShoppingCart}
                    color="bg-emerald-500"
                    imagePath="pos-feature.png"
                />
                <FeatureCard 
                    title="تقارير مالية حية"
                    desc="اعرف أرباحك الصافية يومياً. تقارير مفصلة للمبيعات، المشتريات، والمصاريف التشغيلية بلمسة زر."
                    icon={BarChart3}
                    color="bg-indigo-600"
                    imagePath="reports-feature.png"
                />
            </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-24 bg-slate-900 text-white rounded-[4rem] mx-4 mb-24 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full"></div>
         <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <div className="text-center mb-20">
                <h2 className="text-4xl font-black mb-6">وأكثر من ذلك بكثير...</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                    { t: "مزامنة سحابية", d: "بياناتك محفوظة دائماً وتعمل على كافة أجهزتك فوراً.", i: Cloud },
                    { t: "إدارة الموظفين", d: "تتبع رواتب وسلف الموظفين وكفاءة مبيعاتهم.", i: Users },
                    { t: "أمان عالي", d: "تشفير كامل لكافة بياناتك المالية والعملاء.", i: ShieldCheck },
                    { t: "دعم مالي متكامل", d: "إدارة الديون وتحصيل المبالغ من العملاء بذكاء.", i: DollarSign },
                    { t: "تصميم عصري", d: "واجهة عربية سهلة وجميلة تريح عينك أثناء العمل.", i: Smartphone },
                    { t: "تحديثات دورية", d: "نحن في تطور مستمر لإضافة ميزات تهمك كتـاجر.", i: Activity }
                ].map((item, idx) => (
                    <div key={idx} className="flex gap-5">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-emerald-400 border border-white/5">
                            <item.i size={24} />
                        </div>
                        <div>
                            <h4 className="text-xl font-black mb-2">{item.t}</h4>
                            <p className="text-slate-400 leading-relaxed font-bold">{item.d}</p>
                        </div>
                    </div>
                ))}
            </div>
         </div>
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

export default Features;
