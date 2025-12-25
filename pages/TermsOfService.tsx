
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import BouslaLogo from '../components/BouslaLogo';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
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
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FileText size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">شروط الاستخدام</h1>
            <p className="text-slate-500 font-medium">آخر تحديث: 24 فبراير 2025</p>
        </div>

        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-sm border border-slate-100 space-y-12">
            
            <section className="space-y-4">
                <div className="flex items-center gap-3 text-indigo-600 mb-2">
                    <CheckCircle2 size={24} />
                    <h2 className="text-2xl font-black">اتفاقية الاستخدام</h2>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                    باستخدامك لتطبيق "بوصلة"، فإنك توافق على الالتزام بالشروط والأحكام المذكورة هنا. صُمم هذا التطبيق لمساعدة التجار في تنظيم أعمالهم، ويُحظر استخدامه في أي نشاط غير قانوني وفقاً للقوانين المعمول بها في الجمهورية الإسلامية الموريتانية.
                </p>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-600 mb-2">
                    <AlertCircle size={24} />
                    <h2 className="text-2xl font-black">المسؤوليات والضمانات</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {[
                        { t: "مسؤولية البيانات", d: "أنت المسؤول الأول عن دقة البيانات التي تدخلها في النظام، ونحن غير مسؤولين عن أي أخطاء محاسبية ناتجة عن إدخال بيانات خاطئة." },
                        { t: "أمن الحساب", d: "يجب عليك الحفاظ على سرية كلمة مرورك وعدم مشاركتها مع أي شخص. أي نشاط يتم عبر حسابك هو مسؤوليتك الشخصية." },
                        { t: "الاشتراك والمدفوعات", d: "يتم تفعيل الاشتراك بعد تأكيد عملية الدفع عبر تطبيقات التحويل المعتمدة لدينا. لا يوجد نظام استرجاع للأموال بعد استخدام كود التفعيل." }
                    ].map((item, i) => (
                        <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <h4 className="font-black text-slate-800 mb-2">{item.t}</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">{item.d}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3 text-indigo-600 mb-2">
                    <HelpCircle size={24} />
                    <h2 className="text-2xl font-black">الدعم الفني</h2>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                    نقدم الدعم الفني لمشتركينا عبر الواتساب والبريد الإلكتروني خلال ساعات العمل الرسمية. نلتزم بحل المشاكل التقنية في أسرع وقت ممكن لضمان سير أعمالكم دون انقطاع.
                </p>
            </section>

            <div className="pt-10 border-t border-slate-50 text-center">
                <p className="text-slate-400 text-sm font-bold mb-6">هل لديك سؤال حول الشروط؟</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="https://wa.me/22247071347" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100">
                        تحدث معنا عبر واتساب
                    </a>
                    <Link to="/register" className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-8 py-3 rounded-2xl font-bold hover:bg-slate-200 transition">
                        إنشاء حساب جديد
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
