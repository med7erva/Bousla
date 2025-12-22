
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/db';
import { Smartphone, Lock, Loader2, AlertCircle } from 'lucide-react';
import BouslaLogo from '../../components/BouslaLogo';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    const sanitizedPhone = phone.trim().replace(/\D/g, '');
    
    if (sanitizedPhone.length < 8) {
        setError('الرجاء إدخال رقم هاتف موريتاني صحيح');
        return;
    }

    setLoading(true);

    try {
      // محاولة تسجيل الدخول
      await loginUser(sanitizedPhone, password);
      
      // ننتظر قليلاً ليعالج AuthContext التغيير، إذا لم يتغير شيء خلال 10 ثوانٍ نعطي خطأ
      setTimeout(() => {
          if (!isAuthenticated && loading) {
              setError('تم الدخول بنجاح ولكن هناك تأخير في جلب البيانات. يرجى تحديث الصفحة.');
              setLoading(false);
          }
      }, 10000);

    } catch (err: any) {
      console.error("Login Error:", err);
      let msg = 'بيانات الدخول غير صحيحة أو الحساب غير موجود';
      if (err.message?.includes('Network')) msg = 'خطأ في الاتصال، تأكد من جودة الإنترنت';
      if (err.message?.includes('Database')) msg = 'مشكلة في الوصول لقاعدة البيانات، جرب لاحقاً';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 text-center">
        <div className="flex justify-center mb-6">
            <BouslaLogo className="h-16 w-auto" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
          تسجيل الدخول
        </h2>
        <p className="mt-2 text-slate-500 text-sm font-medium">مرحباً بك مجدداً في بوصلة</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow-xl rounded-3xl border border-slate-100 dark:border-slate-700">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm border border-red-100 dark:border-red-900/50 flex items-center gap-3">
                    <AlertCircle size={20} className="shrink-0" />
                    <span className="font-bold">{error}</span>
                </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 pr-1">رقم الهاتف</label>
              <div className="relative rounded-2xl shadow-sm" dir="ltr">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none border-r border-slate-100 dark:border-slate-700 pr-3">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">+222</span>
                </div>
                <input
                  type="tel"
                  required
                  disabled={loading}
                  className="block w-full pl-20 text-right border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 p-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-all"
                  placeholder="47071347"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                 <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Smartphone className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 pr-1">كلمة المرور</label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  disabled={loading}
                  className="block w-full pr-12 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 p-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-lg text-lg font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-all transform active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? (
                    <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin" />
                        <span>جاري التحقق...</span>
                    </div>
                ) : 'دخول'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 font-medium">ليس لديك حساب؟</span>
              </div>
            </div>
            <div className="mt-6">
              <Link
                to="/register"
                className="w-full inline-flex justify-center py-4 border-2 border-slate-100 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
