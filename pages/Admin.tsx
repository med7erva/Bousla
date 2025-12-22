
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { generatePrepaidCode, getUnusedCodes } from '../services/db';
import { Ticket, Plus, Copy, Check, Loader2, ShieldAlert, History, AlertTriangle, Terminal } from 'lucide-react';
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
            if (e.message?.includes('relation') || e.message?.includes('does not exist')) {
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
            alert("خطأ: " + (e.message || "فشل توليد الكود"));
        }
        finally { setGenLoading(false); }
    };

    const handleCopy = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopyId(id);
        setTimeout(() => setCopyId(null), 2000);
    };

    // كود SQL النهائي والمثالي لحل كل مشاكل Supabase
    const getFinalSQL = () => {
        return `-- 1. تفعيل الإضافات اللازمة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. تحديث جدول الملفات الشخصية (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name text,
  phone text UNIQUE,
  store_name text,
  subscription_status text DEFAULT 'trial',
  subscription_plan text DEFAULT 'pro',
  trial_end_date timestamptz DEFAULT (now() + interval '30 days'),
  subscription_end_date timestamptz,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 3. إضافة الأعمدة إذا كان الجدول موجوداً مسبقاً
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'pro';

-- 4. إنشاء جدول الأكواد
CREATE TABLE IF NOT EXISTS public.prepaid_codes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  days integer NOT NULL,
  plan text NOT NULL,
  is_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- 5. تفعيل الحماية RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prepaid_codes ENABLE ROW LEVEL SECURITY;

-- 6. تنظيف وإنشاء سياسات الحماية (حل خطأ 42710)
DO $$ 
BEGIN
    -- سياسات البروفايل
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

    -- سياسات الأكواد
    DROP POLICY IF EXISTS "Allow admins to manage codes" ON public.prepaid_codes;
    CREATE POLICY "Allow admins to manage codes" ON public.prepaid_codes FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (profiles.phone = '47071347' OR profiles.is_admin = true))
    );

    DROP POLICY IF EXISTS "Allow users to read unused codes" ON public.prepaid_codes;
    CREATE POLICY "Allow users to read unused codes" ON public.prepaid_codes FOR SELECT USING (is_used = false);
END $$;

-- 7. نظام الإنشاء التلقائي للبروفايل (حل مشكلة تعليق الدخول)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, store_name, is_admin)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'storeName',
    (new.raw_user_meta_data->>'phone' = '47071347')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                        <ShieldAlert className="text-red-500" /> لوحة التحكم الفنية
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">إصلاح قاعدة البيانات وتوليد المفاتيح</p>
                </div>
            </div>

            {/* Error Fix Panel */}
            <div className={`p-6 rounded-3xl border-2 transition-all ${tableMissing ? 'bg-red-50 border-red-500 dark:bg-red-900/20' : 'bg-blue-50 border-blue-500 dark:bg-blue-900/20'}`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${tableMissing ? 'bg-red-500' : 'bg-blue-500'} text-white shadow-lg`}>
                        {tableMissing ? <AlertTriangle size={24} /> : <Terminal size={24} />}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                            {tableMissing ? 'إصلاح قاعدة البيانات مطلوب!' : 'تحديث كود الحماية والربط'}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
                            لتجنب خطأ <b>42710</b> ولضمان عمل تسجيل الدخول بسلاسة، انسخ الكود أدناه ونفذه في <b>Supabase SQL Editor</b>. هذا الكود سيقوم بحذف السياسات القديمة وإنشاء نظام ربط تلقائي للمستخدمين.
                        </p>
                        
                        <div className="bg-slate-900 rounded-2xl p-4 relative group overflow-hidden">
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(getFinalSQL());
                                    alert('تم نسخ الكود! اذهب لـ Supabase SQL Editor، احذف الكود القديم، الصق هذا واضغط Run.');
                                }}
                                className="absolute top-3 left-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-2 z-10 transition-all"
                            >
                                <Copy size={14} /> نسخ الكود النهائي
                            </button>
                            <pre className="text-emerald-400 text-[10px] font-mono overflow-x-auto max-h-48 pt-10 opacity-80">
                                {getFinalSQL()}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* Codes Management UI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['plus', 'pro'].map((plan: any) => (
                    <div key={plan} className={`p-8 rounded-3xl border shadow-sm ${plan === 'pro' ? 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-900' : 'bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-900'}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan === 'pro' ? 'bg-indigo-600' : 'bg-emerald-600'} text-white`}>
                                <Plus size={24} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">توليد {plan}</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[30, 180, 365].map(days => (
                                <button 
                                    key={days}
                                    disabled={genLoading}
                                    onClick={() => handleGenerate(days, plan)}
                                    className={`py-3 rounded-xl font-bold text-xs transition-all disabled:opacity-30 border ${plan === 'pro' ? 'hover:bg-indigo-600 hover:text-white border-indigo-100 text-indigo-600' : 'hover:bg-emerald-600 hover:text-white border-emerald-100 text-emerald-600'}`}
                                >
                                    {days} يوم
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <History size={18} className="text-slate-400" /> السجل النشط ({codes.length})
                    </h3>
                    <button onClick={loadCodes} className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">تحديث</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 font-bold uppercase text-[10px]">
                            <tr>
                                <th className="px-6 py-4">الكود</th>
                                <th className="px-6 py-4">الخطة</th>
                                <th className="px-6 py-4">المدة</th>
                                <th className="px-6 py-4 text-center">إجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={4} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500" /></td></tr>
                            ) : codes.length === 0 ? (
                                <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-medium">لا توجد أكواد جاهزة</td></tr>
                            ) : (
                                codes.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                        <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{c.code}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${c.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>{c.plan}</span></td>
                                        <td className="px-6 py-4 font-bold">{c.days} يوم</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleCopy(c.code, c.id)} className={`p-2 rounded-xl transition-all ${copyId === c.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
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
