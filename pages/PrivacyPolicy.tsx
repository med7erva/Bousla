
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Lock, Eye, Database } from 'lucide-react';
import BouslaLogo from '../components/BouslaLogo';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Navbar Simple */}
      <nav className="bg-white border-b border-slate-100 py-6">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">
            <Link to="/"><BouslaLogo className="h-10 w-auto" /></Link>
            <Link to="/" className="text-slate-500 hover:text-emerald-600 font-bold text-sm flex items-center gap-2">
                العودة للرئيسية <ArrowRight size={18} className="rotate-180" />
            </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16 space-y-4">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ShieldCheck size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">سياسة الخصوصية</h1>
            <p className="text-slate-500 font-medium">آخر تحديث: 24 فبراير 2025</p>
        </div>

        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-sm border border-slate-100 space-y-12">
            
            <section className="space-y-4">
                <div className="flex items-center gap-3 text-emerald-600 mb-2">
                    <Eye size={24} />
                    <h2 className="text-2xl font-black">مقدمة</h2>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                    نحن في "بوصلة" نلتزم بحماية خصوصيتك وبيانات متجرك. توضح هذه السياسة كيف نقوم بجمع، استخدام، وحماية المعلومات التي تقدمها عند استخدام تطبيقنا. ثقتك هي رأس مالنا الحقيقي.
                </p>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3 text-emerald-600 mb-2">
                    <Database size={24} />
                    <h2 className="text-2xl font-black">البيانات التي نجمعها</h2>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        "معلومات الحساب (الاسم، رقم الهاتف، اسم المتجر).",
                        "بيانات العمليات المالية والمخزون التي تدخلها.",
                        "المعلومات التقنية مثل نوع الجهاز والمتصفح.",
                        "سجلات استخدام التطبيق لتحسين التجربة."
                    ].map((item, i) => (
                        <li key={i} className="bg-slate-50 p-4 rounded-2xl text-slate-700 text-sm font-bold flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                            {item}
                        </li>
                    ))}
                </ul>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3 text-emerald-600 mb-2">
                    <Lock size={24} />
                    <h2 className="text-2xl font-black">كيف نحمي بياناتك؟</h2>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                    نستخدم تقنيات تشفير (SSL/TLS) متقدمة لحماية البيانات أثناء النقل والتخزين. لا يتم بيع بياناتك لأي طرف ثالث تحت أي ظرف من الظروف. بيانات مبيعاتك وأرباحك مشفرة ولا يمكن لأي موظف في الشركة الوصول إليها إلا بطلب فني منك.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-black text-slate-800">التعديلات على السياسة</h2>
                <p className="text-slate-600 leading-relaxed font-medium">
                    قد نقوم بتحديث سياسة الخصوصية من وقت لآخر لمواكبة التطورات التقنية أو القانونية. سنقوم بإبلاغك بأي تغييرات جوهرية عبر رسالة داخل التطبيق أو إشعار مباشر.
                </p>
            </section>

            <div className="pt-10 border-t border-slate-50 text-center">
                <p className="text-slate-400 text-sm font-bold mb-4">هل لديك أي استفسار حول خصوصيتك؟</p>
                <a href="mailto:privacy@bousla.app" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition">
                    تواصل مع فريق الخصوصية
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
