
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BouslaLogo from '../components/BouslaLogo';

const Pricing: React.FC = () => {
  const { user } = useAuth();

  const plans = [
    {
      name: 'الخطة الشهرية',
      price: '200',
      period: 'شهر',
      code: 'BSL-30',
      features: ['إدارة المبيعات والمخزون', 'دعم فني واتساب', 'تقارير أساسية'],
      recommended: false,
    },
    {
      name: 'خطة الأعمال (الأكثر طلباً)',
      price: '1,000',
      period: '6 أشهر',
      code: 'BSL-180',
      features: ['كل مميزات الخطة الشهرية', 'تحليل الذكاء الاصطناعي', 'إدارة الموظفين والرواتب', 'توفير 17%'],
      recommended: true,
    },
    {
      name: 'الخطة السنوية',
      price: '1,800',
      period: 'سنة',
      code: 'BSL-365',
      features: ['كل مميزات خطة الأعمال', 'أولوية في الدعم الفني', 'تحديثات مجانية مستمرة', 'توفير 25%'],
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
            <Link to="/" className="inline-flex justify-center items-center gap-2 mb-8 hover:opacity-80 transition">
                <BouslaLogo className="h-12 w-auto" />
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">اختر الخطة المناسبة لنمو متجرك</h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                استمتع بكافة مميزات بوصلة المحاسبية. دفع سهل عبر تطبيقات التحويل البنكي وتفعيل فوري.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div 
                key={plan.name}
                className={`relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border-2 transition-transform hover:scale-[1.02] flex flex-col ${
                    plan.recommended ? 'border-emerald-500 shadow-emerald-100 dark:shadow-none' : 'border-transparent'
                }`}
            >
              {plan.recommended && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                  الأكثر مبيعاً
                </span>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                    <span className="text-slate-500 font-bold">أوقية / {plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Check size={14} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <a 
                href={`https://wa.me/22247071347?text=${encodeURIComponent(`أرغب في الاشتراك في ${plan.name}.\nالمبلغ: ${plan.price} أوقية.\nاسم المتجر: ${user?.storeName || 'غير مسجل'}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-4 rounded-2xl font-black text-center transition flex items-center justify-center gap-2 ${
                    plan.recommended 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                }`}
              >
                <MessageCircle size={20} />
                طلب الاشتراك
              </a>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">كيف تعمل عملية الدفع؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                <div className="space-y-3">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl mx-auto">1</div>
                    <h4 className="font-bold text-slate-800 dark:text-white">اختر الخطة</h4>
                    <p className="text-sm text-slate-500">اختر الخطة التي تناسب متجرك من الأعلى واضغط "طلب الاشتراك".</p>
                </div>
                <div className="space-y-3">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl mx-auto">2</div>
                    <h4 className="font-bold text-slate-800 dark:text-white">حوّل المبلغ</h4>
                    <p className="text-sm text-slate-500">قم بتحويل المبلغ عبر (Bankily) أو (Masrvi) للرقم الذي سيظهر لك في الواتساب.</p>
                </div>
                <div className="space-y-3">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl mx-auto">3</div>
                    <h4 className="font-bold text-slate-800 dark:text-white">فعّل حسابك</h4>
                    <p className="text-sm text-slate-500">سنرسل لك "كود تفعيل"، قم بإدخاله في صفحة "الملف الشخصي" لتفعيل الاشتراك فوراً.</p>
                </div>
            </div>
            <div className="mt-12">
                <Link to="/" className="text-emerald-600 font-bold hover:underline flex items-center justify-center gap-2">
                    <ArrowLeft size={18} />
                    العودة للوحة التحكم
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
