
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Store, Phone, Calendar, ShieldCheck, Ticket, ExternalLink, Loader2, CheckCircle, AlertTriangle, Clock, Zap, LogOut } from 'lucide-react';
import { activateSubscription } from '../services/db';
import { CURRENCY } from '../constants';

const Profile: React.FC = () => {
    const { user, logout } = useAuth();
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
            window.location.reload();
        } catch (error: any) {
            setMessage({ text: error.message || "كود التفعيل غير صالح", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const isExpired = user.subscriptionStatus === 'expired';
    
    const targetDate = user.subscriptionStatus === 'active' && user.subscriptionEndDate 
        ? user.subscriptionEndDate 
        : user.trialEndDate;

    const daysLeft = targetDate 
        ? Math.max(0, Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))
        : 0;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">الملف الشخصي</h1>
                <p className="text-slate-500 dark:text-slate-400">إدارة حسابك وحالة الاشتراك في بوصلة</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* User Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-200 dark:shadow-none">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{user.name}</h2>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.subscriptionPlan === 'pro' ? 'bg-indigo-600 text-white' : 'bg-emerald-50 text-white'}`}>
                                        باقة {user.subscriptionPlan === 'pro' ? 'BUSINESS PRO' : 'ESSENTIAL PLUS'}
                                    </span>
                                    {user.isAdmin && (
                                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-[10px] font-black">مسؤول النظام</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">اسم المتجر</label>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <Store size={18} className="text-emerald-500" />
                                    {user.storeName}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم الهاتف</label>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700" dir="ltr">
                                    <Phone size={18} className="text-emerald-500" />
                                    +222 {user.phone}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Status & Countdown */}
                    <div className={`p-8 rounded-3xl border shadow-sm relative overflow-hidden ${
                        isExpired ? 'bg-red-50 border-red-200 dark:bg-red-900/20' : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700'
                    }`}>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isExpired ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'}`}>
                                    <Clock size={32} className={user.subscriptionStatus === 'trial' ? 'animate-pulse' : ''} />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-slate-800 dark:text-white">
                                        {user.subscriptionStatus === 'trial' ? 'الفترة التجريبية' : isExpired ? 'الاشتراك منتهي' : 'اشتراك مفعل'}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        {isExpired ? 'يرجى التجديد لاستعادة كامل الصلاحيات' : `ينتهي في: ${new Date(targetDate!).toLocaleDateString('ar-MA')}`}
                                    </p>
                                </div>
                            </div>

                            {!isExpired && (
                                <div className="bg-slate-900 dark:bg-slate-700 text-white p-6 rounded-3xl text-center min-w-[140px] shadow-xl">
                                    <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">الأيام المتبقية</span>
                                    <div className="flex items-baseline gap-1 justify-center">
                                        <span className={`text-4xl font-black ${daysLeft <= 3 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {daysLeft}
                                        </span>
                                        <span className="text-xs font-bold opacity-60">يوم</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activation Form */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-6">
                            <Ticket className="text-indigo-600" size={24} />
                            <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">تفعيل كود جديد</h4>
                        </div>
                        
                        <form onSubmit={handleActivate} className="flex flex-col md:flex-row gap-3">
                            <input 
                                type="text" 
                                placeholder="مثال: BSL-PRO-XXXXXX"
                                className="flex-1 p-4 rounded-2xl border dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono uppercase tracking-widest text-sm"
                                value={activationCode}
                                onChange={(e) => setActivationCode(e.target.value)}
                            />
                            <button 
                                type="submit"
                                disabled={loading || !activationCode.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : 'تفعيل الآن'}
                            </button>
                        </form>
                        
                        {message.text && (
                            <div className={`mt-6 p-4 rounded-2xl text-sm flex items-center gap-3 font-bold animate-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                                {message.text}
                            </div>
                        )}
                    </div>

                    {/* Logout Button */}
                    <button 
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 text-red-600 border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-black text-lg shadow-sm"
                    >
                        <LogOut size={24} />
                        <span>تسجيل الخروج من النظام</span>
                    </button>
                </div>

                {/* Sidebar Support */}
                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden flex flex-col h-fit">
                    <div className="absolute top-0 right-0 p-24 bg-emerald-500 opacity-10 rounded-full -mr-12 -mt-12 blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                            <Zap size={28} className="text-yellow-400" />
                        </div>
                        <h3 className="text-2xl font-black mb-4 leading-tight">احصل على كود تفعيل</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">
                            يمكنك طلب كود تفعيل (شهري أو سنوي) عبر التحويل إلى حساباتنا في (Bankily) أو (Masrvi). تواصل معنا وسنقوم بالرد فوراً.
                        </p>
                        
                        <a 
                            href={`https://wa.me/22247071347?text=${encodeURIComponent(`مرحباً بوصلة، أرغب في تفعيل حسابي.\nاسم المتجر: ${user.storeName}\nرقم الهاتف: ${user.phone}`)}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-center transition flex items-center justify-center gap-3 shadow-xl"
                        >
                            <ExternalLink size={20} />
                            طلب عبر واتساب
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
