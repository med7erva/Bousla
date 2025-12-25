
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowLeft, MessageCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BouslaLogo from '../components/BouslaLogo';

const Pricing: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const plans = [
    {
      name: 'الخطة الشهرية',
      price: '200',
      period: 'شهر',
      features: ['إدارة المبيعات والمخزون', 'دعم فني واتساب', 'تقارير أساسية', 'مستخدم واحد'],
      recommended: false,
      color: "bg-slate-50"
    },
    {
      name: 'خطة الأعمال (Pro)',
      price: '1,000',
      period: '6 أشهر',
      features: ['كل مميزات الخطة الشهرية', 'تحليل الذكاء الاصطناعي', 'إدارة الموظفين والرواتب', 'توفير 17%', 'أولوية الدعم'],
      recommended: true,
      color: "bg-emerald-600"
    },
    {
      name: 'الخطة السنوية',
      price: '1,800',
      period: 'سنة',
      features: ['كل مميزات خطة الأعمال', 'تحديثات مجانية مستمرة', 'توفير 25%', 'تدريب مجاني للطاقم'],
      recommended: false,
      color: "bg-slate-50"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Simple Nav */}
      <nav className="bg-white border-b border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <Link to="/"><BouslaLogo className="h-10 w-auto" /></Link>
            <div className="flex gap-6 items-center">
                 <Link to="/features" className="text-slate-600 hover:text-emerald-600 font-bold text-sm">المميزات</Link>
                 {!isAuthenticated && <Link to="/login" className="text-slate-600 hover:text-emerald-600 font-bold text-sm">دخول</Link>}
            </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-20 px-6">
        <div className="text-center mb-20 space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">استثمر في تنظيم متجرك</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                خطط اشتراك شفافة، بدون رسوم خفية. تفعيل فوري ودعم فني موريتاني 100%.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {plans.map((plan) => (
            <div 
                key={plan.name}
                className={`relative rounded-[3rem] p-10 shadow-xl border-2 transition-all hover:-translate-y-2 flex flex-col ${
                    plan.recommended ? 'bg-slate-900 text-white border-emerald-500 scale-105 z-10' : 'bg-white text-slate-800 border-transparent'
                }`}
            >
              {plan.recommended && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-lg">
                  الأكثر طلباً
                </span>
              )}
              
              <div className="mb-10 text-center">
                <h3 className={`text-xl font-black mb-6 ${plan.recommended ? 'text-emerald-400' : 'text-slate-800'}`}>{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                    <span className={`text-sm font-bold ${plan.recommended ? 'text-slate-400' : 'text-slate-500'}`}>أوقية / {plan.period}</span>
                </div>
              </div>

              <ul className="space-y-5 mb-12 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm font-bold">
                    <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${plan.recommended ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                        <Check size={14} />
                    </div>
                    <span className={plan.recommended ? 'text-slate-300' : 'text-slate-600'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <a 
                href={`https://wa.me/22247071347?text=${encodeURIComponent(`أرغب في الاشتراك في ${plan.name}.\nالمبلغ: ${plan.price} أوقية.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-5 rounded-[2rem] font-black text-center transition flex items-center justify-center gap-3 text-lg ${
                    plan.recommended 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-900/40' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <MessageCircle size={22} />
                اشترك الآن
              </a>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
            <h2 className="text-3xl font-black text-center mb-12 flex items-center justify-center gap-4">
                <HelpCircle className="text-indigo-500" /> أسئلة شائعة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
                <div>
                    <h4 className="font-black text-slate-900 mb-2">كيف يتم التفعيل؟</h4>
                    <p className="text-slate-500 text-sm font-medium">بعد التحويل، نرسل لك كود تفعيل تدخله في حسابك ويتم تفعيل الباقة فوراً.</p>
                </div>
                <div>
                    <h4 className="font-black text-slate-900 mb-2">هل يمكنني تغيير الباقة؟</h4>
                    <p className="text-slate-500 text-sm font-medium">نعم، يمكنك ترقية حسابك من Essential إلى Pro في أي وقت بفع المبلغ المتبقي.</p>
                </div>
                <div>
                    <h4 className="font-black text-slate-900 mb-2">ماذا يحدث عند انتهاء الاشتراك؟</h4>
                    <p className="text-slate-500 text-sm font-medium">تبقى بياناتك محفوظة، ولكن لا يمكنك تسجيل عمليات جديدة حتى تجدد الاشتراك.</p>
                </div>
                <div>
                    <h4 className="font-black text-slate-900 mb-2">هل أحتاج لإنترنت لاستخدام التطبيق؟</h4>
                    <p className="text-slate-500 text-sm font-medium">نعم، التطبيق سحابي لضمان مزامنة البيانات بين الهاتف والكمبيوتر وحماية بياناتك.</p>
                </div>
            </div>
        </div>

        <div className="mt-16 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 font-black hover:gap-4 transition-all">
                <ArrowRight className="rotate-180" /> العودة للرئيسية
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
