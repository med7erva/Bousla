
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/db';
import { Smartphone, Lock, Loader2 } from 'lucide-react';
import BouslaLogo from '../../components/BouslaLogo';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!phone || phone.length < 8) {
        setError('الرجاء إدخال رقم هاتف صحيح');
        return;
    }

    setLoading(true);

    try {
      await loginUser(phone, password);
      navigate('/'); 
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-300" dir="rtl">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-8 group hover:opacity-80 transition-opacity">
            {/* Increased logo size here */}
            <BouslaLogo className="h-24 w-auto text-4xl" />
        </Link>
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
          تسجيل الدخول
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-slate-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-100 dark:border-red-900/50">
                    {error}
                </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">رقم الهاتف</label>
              <div className="mt-1 relative rounded-md shadow-sm" dir="ltr">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none border-r border-gray-200 dark:border-slate-600 pr-2">
                  <span className="text-gray-500 dark:text-slate-400 font-bold">+222</span>
                </div>
                <input
                  type="tel"
                  required
                  className="block w-full pl-16 text-right border-gray-300 dark:border-slate-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm p-2.5 border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder="22334455"
                  value={phone}
                  onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPhone(val);
                  }}
                />
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Smartphone className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">كلمة المرور</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pr-10 border-gray-300 dark:border-slate-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm p-2.5 border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'دخول'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400">ليس لديك حساب؟</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm bg-white dark:bg-slate-700 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition"
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
