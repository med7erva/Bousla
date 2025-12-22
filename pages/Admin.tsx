
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { generatePrepaidCode, getUnusedCodes } from '../services/db';
import { Ticket, Plus, Copy, Check, Loader2, ShieldAlert, History, Code, AlertTriangle } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Admin: React.FC = () => {
    const { user } = useAuth();
    const [codes, setCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [genLoading, setGenLoading] = useState(false);
    const [copyId, setCopyId] = useState<string | null>(null);
    const [tableMissing, setTableMissing] = useState(false);

    if (!user || !user.isAdmin) return <Navigate to="/" replace />;

    const loadCodes = async () => {
        setLoading(true);
        setTableMissing(false);
        try {
            const data = await getUnusedCodes();
            setCodes(data);
        } catch (e: any) { 
            console.error(e);
            if (e.message?.includes('relation "public.prepaid_codes" does not exist')) {
                setTableMissing(true);
            }
        }
        finally { setLoading(false); }
    };

    useEffect(() => { loadCodes(); }, []);

    const handleGenerate = async (days: number, plan: 'plus' | 'pro') => {
        setGenLoading(true);
        try {
            await generatePrepaidCode(days, plan);
            await loadCodes();
        } catch (e: any) { 
            console.error("GENERATE ERROR:", e);
            if (e.message?.includes('does not exist')) {
                setTableMissing(true);
            } else {
                alert("فشل توليد الكود: " + (e.message || "خطأ في قاعدة البيانات")); 
            }
        }
        finally { setGenLoading(false); }
    };

    const handleCopy = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopyId(id);
        setTimeout(() => setCopyId(null), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                        <ShieldAlert className="text-red-500" /> مركز الأكواد
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">توليد وإدارة مفاتيح التفعيل للعملاء</p>
                </div>
            </div>

            {tableMissing && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500/50 p-6 rounded-3xl animate-in zoom-in duration-300">
                    <div className="flex items-center gap-4 mb-4 text-red-600 dark:text-red-400">
                        <AlertTriangle size={32} />
                        <h2 className="text-xl font-black">جدول الأكواد مفقود!</h2>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mb-6 font-medium">
                        يبدو أنك لم تقم بإنشاء جدول <code className="bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded">prepaid_codes</code> في قاعدة بيانات Supabase. اتبع الخطوات التالية:
                    </p>
                    <div className="bg-slate-900 rounded-2xl p-4 overflow-hidden relative group">
                        <div className="absolute top-2 left-2 flex gap-2">
                             <button 
                                onClick={() => {
                                    const code = `CREATE TABLE IF NOT EXISTS public.prepaid_codes (\n  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,\n  code text UNIQUE NOT NULL,\n  days integer NOT NULL,\n  plan text NOT NULL,\n  is_used boolean DEFAULT false,\n  created_at timestamp with time zone DEFAULT now(),\n  created_by uuid REFERENCES auth.users(id)\n);`;
                                    navigator.clipboard.writeText(code);
                                    alert('تم نسخ الكود!');
                                }}
                                className="bg-white/10 hover:bg-white/20 text-white text-[10px] px-3 py-1 rounded font-bold transition"
                             >نسخ الكود</button>
                        </div>
                        <pre className="text-emerald-400 text-xs font-mono overflow-x-auto p-2">
{`CREATE TABLE public.prepaid_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  days integer NOT NULL,
  plan text NOT NULL,
  is_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);`}
                        </pre>
                    </div>
                    <div className="mt-6 flex items-center gap-4">
                        <div className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                        <p className="text-sm dark:text-white">انسخ الكود أعلاه واذهب لـ <b>Supabase SQL Editor</b> ونفذه.</p>
                    </div>
                    <button 
                        onClick={loadCodes}
                        className="mt-6 w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        <Check size={18} /> لقد قمت بالتنفيذ، أعد المحاولة
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['plus', 'pro'].map((plan: any) => (
                    <div key={plan} className={`p-8 rounded-3xl border shadow-sm ${plan === 'pro' ? 'bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900' : 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900'}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan === 'pro' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                                <Plus size={24} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">توليد كود {plan}</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[30, 180, 365].map(days => (
                                <button 
                                    key={days}
                                    disabled={genLoading || tableMissing}
                                    onClick={() => handleGenerate(days, plan)}
                                    className={`py-3 rounded-xl font-bold text-xs transition-all transform active:scale-95 disabled:opacity-30 ${plan === 'pro' ? 'bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100' : 'bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100'}`}
                                >
                                    {days} يوم
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-700/30">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <History size={18} className="text-slate-400" /> الأكواد النشطة ({codes.length})
                    </h3>
                    <button onClick={loadCodes} className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">تحديث السجل</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="text-slate-400 text-[10px] font-black uppercase border-b dark:border-slate-700">
                                <th className="px-6 py-4">الكود المولد</th>
                                <th className="px-6 py-4">الخطة</th>
                                <th className="px-6 py-4">المدة</th>
                                <th className="px-6 py-4">تاريخ الإصدار</th>
                                <th className="px-6 py-4 text-center">إجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500" size={40} /></td></tr>
                            ) : codes.length === 0 ? (
                                <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-medium">لا توجد أكواد غير مستخدمة</td></tr>
                            ) : (
                                codes.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                        <td className="px-6 py-4"><span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{c.code}</span></td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase ${c.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>{c.plan}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{c.days} يوم</td>
                                        <td className="px-6 py-4 text-slate-400 text-xs">{new Date(c.created_at).toLocaleDateString('ar-MA')}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleCopy(c.code, c.id)}
                                                className={`p-2.5 rounded-xl transition-all ${copyId === c.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 hover:bg-indigo-600 hover:text-white'}`}
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
