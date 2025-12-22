
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Zap, ArrowRight, Smartphone } from 'lucide-react';
import BouslaLogo from '../components/BouslaLogo';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center">
                <BouslaLogo className="h-10 w-auto text-3xl" />
            </div>

            {/* Buttons Section */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link 
                to="/login" 
                className="text-slate-600 hover:text-emerald-600 font-bold text-sm sm:text-base transition px-2"
              >
                تسجيل الدخول
              </Link>
              <Link 
                to="/register" 
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 hover:shadow-xl transform hover:-translate-y-0.5"
              >
                ابدأ مجاناً
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold mb-6 border border-emerald-100 shadow-sm animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            مع بوصلة بوتيكك .. ف ايدك👋
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
            أدر محلك بذكاء مع <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">تطبيق بوصلة</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-xl text-slate-500 mb-10 leading-relaxed">
            تابع أرباحك يومًا بيوم، واحصل على تقارير مالية واضحة تساعدك على فهم أداء متجرك واتخاذ قرارات أدق؛ مع نظام ذكي تم تطويره خصيصا لمتاجر الملابس.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Link 
                to="/register" 
                className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-800 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <span>أنشئ حسابك الآن</span>
                <ArrowRight size={20} />
              </Link>
              <Link 
                to="/login"
                className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-gray-50 transition shadow-sm hover:shadow-md"
              >
                <span>لدي حساب بالفعل</span>
              </Link>
          </div>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-10 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-lg transition group hover:bg-white hover:border-emerald-100">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <TrendingUp size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">تقارير وأرباح فورية</h3>
                    <p className="text-slate-500 leading-relaxed">
                        تابع مبيعاتك لحظة بلحظة. احصل على تقارير دقيقة حول الأرباح، المنتجات الأكثر مبيعاً، وحالة المخزون بضغطة زر.
                    </p>
                </div>
                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-lg transition group hover:bg-white hover:border-emerald-100">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Zap size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">ذكاء اصطناعي مدمج</h3>
                    <p className="text-slate-500 leading-relaxed">
                        احصل على مساعد شخصي يحلل بياناتك ويقترح عليك استراتيجيات لزيادة المبيعات عبر Google Gemini API.
                    </p>
                </div>
                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-lg transition group hover:bg-white hover:border-emerald-100">
                    <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Smartphone size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">يعمل على أي جهاز</h3>
                    <p className="text-slate-500 leading-relaxed">
                        سواء كنت تستخدم الهاتف، الجهاز اللوحي، أو الكمبيوتر. نظام بوصلة متجاوب ويعمل حتى بدون اتصال بالإنترنت.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-center text-slate-400">
        <div className="flex items-center justify-center gap-2 mb-6 text-white">
            <BouslaLogo isWhite={true} className="h-20 w-auto text-4xl" />
        </div>
        <p>© {new Date().getFullYear()} جميع الحقوق محفوظة. صُنع بفخر للمتاجر الموريتانية.</p>
      </footer>
    </div>
  );
};

export default Landing;
