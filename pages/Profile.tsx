import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Store, Phone, Calendar, ShieldCheck, Ticket, ExternalLink, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { activateSubscription } from '../services/db';
import { CURRENCY } from '../constants';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const [activationCode, setActivationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    if (!user) return null;

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activationCode.trim()) return;
        
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            // Fix: Destructured endDate from the result object as activateSubscription returns { endDate, plan }
            const { endDate } = await activateSubscription(user.id, activationCode);
            setMessage({ text: `تم تفعيل الاشتراك بنجاح حتى ${new Date(endDate).toLocaleDateString('ar-MA')}`, type: 'success' });
            setActivationCode('');
            // Optional: You could reload the window to refresh auth context or handle state locally
        } catch (error: any) {
            setMessage({ text: error.message || "كود التفعيل غير صالح", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const isExpired = user.subscriptionStatus === 'expired';
    const trialDaysLeft = user.trialEndDate 
        ? Math.ceil((new Date(user.trialEndDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
        : 0;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">الملف الشخصي</h1>
                <p className="text-slate-500 dark:text-slate-400">إدارة بيانات حسابك وتفاصيل الاشتراك</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Account Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl font-black border-4 border-white dark:border-slate-700 shadow-sm">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{user.name}</h2>
                                <p className="text-slate-500 dark:text-slate-400">مالك المتجر</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">اسم المتجر</label>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                                    <Store size={18} className="text-emerald-500" />
                                    {user.storeName}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">رقم الهاتف</label>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold" dir="ltr">
                                    <Phone size={18} className="text-emerald-500" />
                                    +222 {user.phone}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">تاريخ الانضمام</label>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                                    <Calendar size={18} className="text-emerald-500" />
                                    {new Date(user.createdAt).toLocaleDateString('ar-MA')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Status Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <ShieldCheck className="text-emerald-600" /> حالة الاشتراك
                        </h3>

                        <div className={`p-6 rounded-2xl border mb-6 ${
                            user.subscriptionStatus === 'active' 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                            : isExpired 
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-800 dark:text-red-300'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                        }`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold opacity-80 mb-1">الخطة الحالية</p>
                                    <h4 className="text-2xl font-black">
                                        {user.subscriptionStatus === 'trial' ? 'فترة تجريبية مجانية' : user.subscriptionStatus === 'active' ? 'اشتراك مفعل' : 'اشتراك منتهي'}
                                    </h4>
                                </div>
                                <div className="text-right">
                                    {user.subscriptionStatus === 'trial' && !isExpired && (
                                        <div className="text-sm font-bold">
                                            متبقي <span className="text-3xl">{trialDaysLeft}</span> يوم
                                        </div>
                                    )}
                                    {user.subscriptionStatus === 'active' && user.subscriptionEndDate && (
                                        <div className="text-sm font-bold">
                                            ينتهي في <br/> {new Date(user.subscriptionEndDate).toLocaleDateString('ar-MA')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Activation Box */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Ticket size={18} className="text-indigo-600" /> هل لديك كود تفعيل؟
                            </h4>
                            <form onSubmit={handleActivate} className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="أدخل الكود هنا (مثلاً: BSL-365)"
                                    className="flex-1 p-3 rounded-xl border dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono tracking-widest"
                                    value={activationCode}
                                    onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                                />
                                <button 
                                    type="submit"
                                    disabled={loading || !activationCode.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
                                >
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'تفعيل'}
                                </button>
                            </form>
                            {message.text && (
                                <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                    {message.text}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Subscription Plans Link */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden h-full flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        
                        <div className="relative z-10 flex-1">
                            <h3 className="text-2xl font-black mb-4 leading-tight">جدد اشتراكك عبر واتساب</h3>
                            <p className="text-indigo-200 text-sm mb-8 leading-relaxed">
                                اختر الخطة المناسبة لمتجرك وقم بتحويل المبلغ عبر تطبيق (Bankily) أو (Masrvi) ثم أرسل لنا لقطة الشاشة للحصول على كود التفعيل فوراً.
                            </p>
                            
                            <ul className="space-y-4 mb-10">
                                <li className="flex items-center gap-3 text-sm font-medium">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                                    دعم فني سريع عبر الواتساب
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                                    تفعيل فوري خلال دقائق
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                                    خصومات حصرية للدفع السنوي
                                </li>
                            </ul>
                        </div>

                        <a 
                            href={`https://wa.me/22247071347?text=${encodeURIComponent(`أرغب في تجديد اشتراكي في تطبيق بوصلة.\nاسم المتجر: ${user.storeName}\nرقم الحساب: ${user.phone}`)}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="relative z-10 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-center transition shadow-lg flex items-center justify-center gap-3"
                        >
                            <ExternalLink size={20} />
                            تواصل معنا للاشتراك
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;