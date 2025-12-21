
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Store, Phone, Calendar, ShieldCheck, Ticket, ExternalLink, Loader2, CheckCircle, AlertTriangle, Clock, Zap } from 'lucide-react';
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
            const { endDate } = await activateSubscription(user.id, activationCode);
            setMessage({ text: `تم تفعيل الاشتراك بنجاح حتى ${new Date(endDate).toLocaleDateString('ar-MA')}`, type: 'success' });
            setActivationCode('');
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
                <div className="lg:col-span-2 space-y-6">
                    {/* User Info */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl font-black border-4 border-white dark:border-slate-700 shadow-sm">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{user.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${user.subscriptionPlan === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        باقة {user.subscriptionPlan === 'pro' ? 'PRO' : 'PLUS'}
                                    </span>
                                    {user.subscriptionStatus === 'trial' && (
                                        <span className="bg-blue-100 text-blue-700 px-3 py-0.5 rounded-full text-[10px] font-black">فترة تجريبية</span>
                                    )}
                                </div>
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
                        </div>
                    </div>

                    {/* Expiry Countdown */}
                    <div className={`p-8 rounded-3xl border shadow-sm relative overflow-hidden ${
                        isExpired ? 'bg-red-50 border-red-100 dark:bg-red-900/10' : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700'
                    }`}>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isExpired ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30'}`}>
                                    <Clock size={28} className={user.subscriptionStatus === 'trial' ? 'animate-pulse' : ''} />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-slate-800 dark:text-white">حالة الاشتراك</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {user.subscriptionStatus === 'trial' ? 'أنت حالياً في الفترة التجريبية' : isExpired ? 'اشتراكك منتهي الصلاحية' : 'اشتراكك مفعل حالياً'}
                                    </p>
                                </div>
                            </div>

                            {!isExpired && (
                                <div className="text-center md:text-left">
                                    <span className="block text-xs font-bold text-slate-400 uppercase mb-1">الأيام المتبقية</span>
                                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                        <span className={`text-5xl font-black ${trialDaysLeft <= 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {trialDaysLeft}
                                        </span>
                                        <span className="text-slate-500 font-bold">يوم</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activation */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Ticket size={18} className="text-indigo-600" /> تفعيل كود جديد
                        </h4>
                        <form onSubmit={handleActivate} className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="أدخل كود التفعيل..."
                                className="flex-1 p-3 rounded-xl border dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono uppercase tracking-widest"
                                value={activationCode}
                                onChange={(e) => setActivationCode(e.target.value)}
                            />
                            <button 
                                type="submit"
                                disabled={loading || !activationCode.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : 'تفعيل'}
                            </button>
                        </form>
                        {message.text && (
                            <div className={`mt-4 p-4 rounded-xl text-sm flex items-center gap-2 font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                                {message.text}
                            </div>
                        )}
                    </div>
                </div>

                {/* WhatsApp Support */}
                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-20 bg-emerald-500 opacity-10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                    <div>
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                            <Zap size={24} className="text-yellow-400" />
                        </div>
                        <h3 className="text-2xl font-black mb-4">جدد اشتراكك</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            للحصول على كود تفعيل (شهري، نص سنوي، أو سنوي) تواصل معنا عبر الواتساب لإرسال إيصال التحويل (Bankily/Masrvi).
                        </p>
                    </div>
                    <a 
                        href={`https://wa.me/22247071347?text=${encodeURIComponent(`مرحباً، أرغب في تجديد اشتراكي.\nاسم المتجر: ${user.storeName}\nرقم الهاتف: ${user.phone}`)}`}
                        target="_blank" 
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-center transition flex items-center justify-center gap-3 shadow-lg"
                    >
                        <ExternalLink size={20} />
                        تواصل عبر الواتساب
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Profile;
