
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, MessageCircle, HelpCircle, ArrowRight, Zap, ShieldCheck, Sparkles, Users, Scissors } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BouslaLogo from '../components/BouslaLogo';

const Pricing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      id: 'plus',
      name: 'Essential Plus',
      monthlyPrice: 300,
      annualPrice: 3000, // 2 months free
      desc: 'مثالية للمتاجر الناشئة التي تحتاج لتنظيم مبيعاتها ومخزونها بدقة.',
      features: [
        { text: 'نقطة بيع سريعة (POS)', included: true },
        { text: 'إدارة المخزون والباركود', included: true },
        { text: 'إدارة ديون العملاء والموردين', included: true },
        { text: 'تقارير المبيعات الأساسية', included: true },
        { text: 'دعم فني عبر الواتساب', included: true },
        { text: 'المساعد المالي بالذكاء الاصطناعي', included: false },
        { text: 'إدارة الموظفين والرواتب', included: false },
        { text: 'تتبع عمليات التصنيع والخياطة', included: false },
      ],
      recommended: false,
      color: "emerald"
    },
    {
      id: 'pro',
      name: 'Business Pro',
      monthlyPrice: 550,
      annualPrice: 5500, // 2 months free
      desc: 'الباقة المتكاملة للنمو؛ تدمج الذكاء الاصطناعي مع إدارة الطاقم والتصنيع.',
      features: [
        { text: 'كل مميزات باقة Plus', included: true },
        { text: 'المساعد المالي (Gemini AI)', included: true },
        { text: 'إدارة الموظفين، السلف والرواتب', included: true },
        { text: 'تتبع عمليات التصنيع والخياطة', included: true },
        { text: 'تحليل ذكي للأرباح والاتجاهات', included: true },
        { text: 'تنبيهات تشغيلية حية', included: true },
        { text: 'تصدير تقارير محاسبية متقدمة', included: true },
        { text: 'أولوية في الدعم الفني 24/7', included: true },
      ],
      recommended: true,
      color: "indigo"
    }
  ];

  const getWhatsAppLink = (planName: string, price: number) => {
    const cycleText = billingCycle === 'monthly' ? 'شهري' : 'سنوي';
    const message = `مرحباً بوصلة، أرغب في الاشتراك في باقة (${planName}) - نظام (${cycleText}).\nالمبلغ المستحق: ${price} أوقية.`;
    return `https://wa.me/22247071347?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100" dir="rtl">
      {/* Simple Nav */}
      <nav className="bg-white border-b border-slate-100 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <Link to="/"><BouslaLogo className="h-10 w-auto" /></Link>
            <div className="flex gap-6 items-center">
                 <Link to="/features" className="text-slate-600 hover:text-emerald-600 font-bold text-sm transition">المميزات</Link>
                 {!isAuthenticated && <Link to="/login" className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-200 transition">دخول</Link>}
            </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-16 px-6">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">استثمر في تنظيم متجرك</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                اختر الباقة التي تناسب حجم أعمالك. تفعيل فوري ودعم فني موريتاني 100%.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mt-10">
                <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>شهري</span>
                <button 
                    onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                    className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-full relative p-1 transition-colors"
                >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${billingCycle === 'annual' ? '-translate-x-8' : 'translate-x-0'}`}></div>
                </button>
                <span className={`text-sm font-bold flex items-center gap-2 ${billingCycle === 'annual' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    سنوي 
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-black">وفر شهرين!</span>
                </span>
            </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24">
          {plans.map((plan) => {
            const currentPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
            return (
              <div 
                  key={plan.id}
                  className={`relative rounded-[3.5rem] p-10 shadow-2xl border-4 transition-all hover:-translate-y-2 flex flex-col ${
                      plan.recommended 
                      ? 'bg-slate-900 text-white border-indigo-500 scale-105 z-10' 
                      : 'bg-white text-slate-800 border-transparent'
                  }`}
              >
                {plan.recommended && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[11px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <Sparkles size={14} /> الخيار الاحترافي
                  </span>
                )}
                
                <div className="mb-10">
                  <h3 className={`text-2xl font-black mb-3 ${plan.recommended ? 'text-indigo-400' : 'text-emerald-600'}`}>{plan.name}</h3>
                  <p className={`text-sm font-medium leading-relaxed ${plan.recommended ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
                  <div className="flex items-baseline mt-8 gap-2">
                      <span className="text-6xl font-black tracking-tighter">{currentPrice}</span>
                      <span className={`text-lg font-bold ${plan.recommended ? 'text-slate-400' : 'text-slate-400'}`}>أوقية / {billingCycle === 'monthly' ? 'شهر' : 'سنة'}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-12 flex-1">
                  <p className={`text-xs font-black uppercase tracking-widest ${plan.recommended ? 'text-slate-500' : 'text-slate-300'}`}>تتضمن الباقة:</p>
                  {plan.features.map((feature, i) => (
                    <div key={i} className={`flex items-start gap-3 text-sm font-bold ${!feature.included && 'opacity-30 grayscale'}`}>
                      <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${plan.recommended ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-50 text-emerald-600'}`}>
                          {feature.included ? <Check size={14} /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>}
                      </div>
                      <span className={plan.recommended ? 'text-slate-300' : 'text-slate-600'}>{feature.text}</span>
                    </div>
                  ))}
                </div>

                <a 
                  href={getWhatsAppLink(plan.name, currentPrice)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-5 rounded-[2rem] font-black text-center transition flex items-center justify-center gap-3 text-xl ${
                      plan.recommended 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-900/40' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-200'
                  }`}
                >
                  <MessageCircle size={24} />
                  اشترك الآن
                </a>
              </div>
            );
          })}
        </div>

        {/* FAQ Section - Unchanged as requested */}
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
                    <p className="text-slate-500 text-sm font-medium">نعم، يمكنك ترقية حسابك من Essential إلى Pro في أي وقت بدفع المبلغ المتبقي.</p>
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
