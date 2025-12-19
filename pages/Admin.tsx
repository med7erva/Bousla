
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { generatePrepaidCode, getUnusedCodes } from '../services/db';
import { Ticket, Plus, Copy, Check, Loader2, ShieldAlert, History } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Admin: React.FC = () => {
    const { user } = useAuth();
    const [codes, setCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [genLoading, setGenLoading] = useState(false);
    const [copyId, setCopyId] = useState<string | null>(null);

    // Only allow Admin
    if (!user || !user.isAdmin) {
        return <Navigate to="/" replace />;
    }

    const loadCodes = async () => {
        setLoading(true);
        try {
            const data = await getUnusedCodes();
            setCodes(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCodes();
    }, []);

    const handleGenerate = async (days: number, plan: 'plus' | 'pro') => {
        setGenLoading(true);
        try {
            await generatePrepaidCode(days, plan);
            await loadCodes();
        } catch (e) {
            alert("فشل توليد الكود");
        } finally {
            setGenLoading(false);
        }
    };

    const handleCopy = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopyId(id);
        setTimeout(() => setCopyId(null), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                        <ShieldAlert className="text-red-500" /> لوحة الإدارة
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">توليد أكواد التفعيل لعملاء بوصلة</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Generation Card Plus */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                    <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-6 flex items-center gap-2">
                        <Plus /> توليد كود Plus
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        <button 
                            disabled={genLoading}
                            onClick={() => handleGenerate(30, 'plus')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
                        >
                            شهر واحد (30 يوم)
                        </button>
                        <button 
                            disabled={genLoading}
                            onClick={() => handleGenerate(180, 'plus')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
                        >
                            6 أشهر (180 يوم)
                        </button>
                        <button 
                            disabled={genLoading}
                            onClick={() => handleGenerate(365, 'plus')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
                        >
                            سنة كاملة (365 يوم)
                        </button>
                    </div>
                </div>

                {/* Generation Card Pro */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-indigo-100 dark:border-indigo-900/30">
                    <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 mb-6 flex items-center gap-2">
                        <Plus /> توليد كود Pro
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        <button 
                            disabled={genLoading}
                            onClick={() => handleGenerate(30, 'pro')}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
                        >
                            شهر واحد (30 يوم)
                        </button>
                        <button 
                            disabled={genLoading}
                            onClick={() => handleGenerate(180, 'pro')}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
                        >
                            6 أشهر (180 يوم)
                        </button>
                        <button 
                            disabled={genLoading}
                            onClick={() => handleGenerate(365, 'pro')}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
                        >
                            سنة كاملة (365 يوم)
                        </button>
                    </div>
                </div>
            </div>

            {/* Codes List */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <History size={20} className="text-slate-400" />
                        الأكواد المتاحة (غير المستخدمة)
                    </h3>
                    <button onClick={loadCodes} className="text-xs font-bold text-indigo-600">تحديث</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
                            <tr>
                                <th className="px-6 py-4">الكود</th>
                                <th className="px-6 py-4">الخطة</th>
                                <th className="px-6 py-4">المدة</th>
                                <th className="px-6 py-4">تاريخ التوليد</th>
                                <th className="px-6 py-4">نسخ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                            ) : codes.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400">لا توجد أكواد متاحة</td></tr>
                            ) : (
                                codes.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                        <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-white text-sm">{c.code}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${c.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {c.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">{c.days} يوم</td>
                                        <td className="px-6 py-4 text-slate-400 text-xs">{new Date(c.created_at).toLocaleDateString('ar-MA')}</td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => handleCopy(c.code, c.id)}
                                                className={`p-2 rounded-lg transition ${copyId === c.id ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-indigo-600'}`}
                                            >
                                                {copyId === c.id ? <Check size={18} /> : <Copy size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Admin;
