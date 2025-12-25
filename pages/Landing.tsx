
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
  Quote,
  ChevronLeft,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';
import BouslaLogo from '../components/BouslaLogo';

const Landing: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden" dir="rtl">
      
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0">
                <BouslaLogo className="h-10 w-auto text-2xl" />
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
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black mb-2 border border-emerald-100">
                تطبيق المحاسبة رقم 1 في موريتانيا 🇲🇷
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight">
                أدر بوتيكك <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-500">بذكاء واحترافية</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-3xl mx-auto font-medium">
                انسَ الدفاتر والتعقيد. بوصلة يوفر لك نظاماً متكاملاً لإدارة المبيعات، المخزون، والتقارير المالية مدعوماً بالذكاء الاصطناعي.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/register" 
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-lg font-black hover:bg-slate-800 transition shadow-2xl flex items-center justify-center gap-2"
                >
                  اشترك الآن
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

          {/* iPad Mockup - Coded with CSS */}
          <div className={`relative max-w-5xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                <div className="absolute inset-0 bg-emerald-500/10 blur-[120px] rounded-full scale-75"></div>
                
                {/* iPad Frame */}
                <div className="relative mx-auto w-full aspect-[4/3] bg-slate-950 rounded-[3rem] p-3 shadow-2xl border-[10px] border-slate-900 ring-1 ring-slate-800 overflow-hidden transform hover:scale-[1.01] transition-transform">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20"></div>
                    
                    {/* Screen Content (Mock Dashboard) */}
                    <div className="w-full h-full bg-slate-50 rounded-[2rem] overflow-hidden relative p-4 md:p-8 flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                                    <TrendingUp size={20} />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="w-24 h-3 bg-slate-200 rounded-full"></div>
                                    <div className="w-16 h-2 bg-slate-100 rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100"></div>
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'المبيعات', val: '4,500', color: 'bg-emerald-500' },
                                { label: 'المصاريف', val: '1,200', color: 'bg-rose-500' },
                                { label: 'الربح', val: '3,300', color: 'bg-blue-500' }
                            ].map((card, i) => (
                                <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                    <div className={`w-6 h-6 rounded-lg ${card.color} opacity-20 mb-3`}></div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{card.label}</p>
                                    <p className="text-lg font-black text-slate-800">{card.val} <span className="text-[10px]">MRU</span></p>
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-end gap-4 overflow-hidden">
                             <div className="w-32 h-3 bg-slate-50 rounded-full mb-4"></div>
                             <div className="flex items-end justify-between gap-4 h-full px-2">
                                {[40, 70, 45, 90, 65, 80, 50, 95, 60, 85].map((h, i) => (
                                    <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-1000" style={{ height: `${h}%` }}></div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">بساطة في التصميم، قوة في الأداء</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">كل ما يحتاجه صاحب عمل للتحكم الكامل في تجارته بضغطة زر واحدة.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <LayoutDashboard size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">لوحة تحكم فورية</h3>
                    <p className="text-slate-500 leading-relaxed">شاشة واحدة تعرض لك المبيعات، المصاريف، وصافي الأرباح بدقة اللحظة الحالية.</p>
                </div>
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <Package size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">إدارة المخزون الذكية</h3>
                    <p className="text-slate-500 leading-relaxed">تنبيهات فورية عند انخفاض كمية أي صنف، مع تقارير حول المنتجات الأكثر طلباً.</p>
                </div>
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <Zap size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">ذكاء اصطناعي مدمج</h3>
                    <p className="text-slate-500 leading-relaxed">مساعد "بوصلة" الذكي يحلل بياناتك ويقترح عليك خطوات لزيادة مبيعاتك.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900">ماذا يقولون عنا؟</h2>
                <p className="text-slate-500 font-medium">نفتخر بدعم مئات المتاجر في رحلة نجاحهم الرقمي.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Testimonial 1 */}
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                    <div className="flex gap-1 mb-6">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed mb-8 italic">
                        “قبل بوصلة كنت أعرف المبيعات، لكن لا أعرف الربح الحقيقي. الآن أرى المبيعات والمصاريف بشكل واضح وسريع.”
                    </p>
                    <div className="flex items-center gap-4 border-t border-slate-200 pt-6">
                        <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center font-black text-white shadow-md">
                            ع
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">عبد الرحمن</h4>
                            <p className="text-xs text-slate-500 font-bold uppercase">محل ألبسة رجالية</p>
                        </div>
                    </div>
                </div>

                {/* Testimonial 2 */}
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                    <div className="flex gap-1 mb-6">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed mb-8 italic">
                        “أكثر شيء عجبني هو تنبيهات المخزون. التطبيق ينبهني قبل ما يخلص الصنف، وهذا وفر علي الكثير من الوقت.”
                    </p>
                    <div className="flex items-center gap-4 border-t border-slate-200 pt-6">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-black text-white shadow-md">
                            ا
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">الحسن</h4>
                            <p className="text-xs text-slate-500 font-bold uppercase">تاجر تجزئة</p>
                        </div>
                    </div>
                </div>

                {/* Testimonial 3 */}
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                    <div className="flex gap-1 mb-6">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed mb-8 italic">
                        “ميزة بند الخياطة والتصنيع ممتازة، أخيرًا وجدت حلاً يناسب طبيعة عملنا وليس مجرد محاسبة عامة.”
                    </p>
                    <div className="flex items-center gap-4 border-t border-slate-200 pt-6">
                        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-black text-white shadow-md">
                            ع
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">عمر</h4>
                            <p className="text-xs text-slate-500 font-bold uppercase">صاحب محل خياطة</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
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

      {/* Footer - Updated Design */}
      <footer className="bg-slate-950 text-white pt-20 pb-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1 md:col-span-2 space-y-8">
                    <BouslaLogo className="h-14 w-auto" isWhite={true} />
                    <p className="text-slate-400 max-w-sm leading-relaxed font-bold text-lg">
                        تطبيق بوصلة هو الشريك التقني الأفضل لمتاجر الملابس.
                    </p>
                    {/* Social Icons */}
                    <div className="flex gap-4">
                         <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-300 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
                            <Facebook size={24} />
                         </a>
                         <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white transition-all transform hover:-translate-y-1">
                            <Twitter size={24} />
                         </a>
                         <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-300 hover:bg-pink-600 hover:text-white transition-all transform hover:-translate-y-1">
                            <Instagram size={24} />
                         </a>
                         <a href="https://wa.me/22247071347" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-300 hover:bg-emerald-600 hover:text-white transition-all transform hover:-translate-y-1">
                            <MessageCircle size={24} />
                         </a>
                    </div>
                </div>
                <div>
                    <h4 className="font-black text-emerald-500 mb-8 uppercase tracking-widest text-xs">روابط سريعة</h4>
                    <ul className="space-y-4 text-sm font-bold text-slate-400">
                        <li><Link to="/pricing" className="hover:text-white transition-colors">التسعير</Link></li>
                        <li><a href="#features" className="hover:text-white transition-colors">المميزات</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">الأسئلة الشائعة</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-emerald-500 mb-8 uppercase tracking-widest text-xs">قانوني</h4>
                    <ul className="space-y-4 text-sm font-bold text-slate-400">
                        <li><a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">شروط الاستخدام</a></li>
                        <li className="pt-4">
                            <p className="text-xs text-slate-500 font-bold">الهاتف: <span dir="ltr">+222 47071347</span></p>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div className="border-t border-white/5 pt-10 text-center md:flex justify-between items-center">
                <p className="text-slate-500 text-sm font-bold">© 2025 بوصلة. جميع الحقوق محفوظة.</p>
                <div className="flex gap-8 mt-6 md:mt-0 justify-center">
                    <span className="flex items-center gap-2 text-slate-400 text-xs font-black">
                        <Shield size={16} className="text-emerald-500" /> حماية بيانات كاملة
                    </span>
                    <span className="flex items-center gap-2 text-slate-400 text-xs font-black">
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
