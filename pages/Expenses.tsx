
import React, { useState, useEffect, useRef } from 'react';
import { Wallet, Plus, TrendingDown, Trash2, LayoutList, Layers, MoreVertical, Edit2, Save, X, Loader2, FileDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getExpenses, addExpensesBatch, getSalesAnalytics, getPaymentMethods, ensurePaymentMethodsExist, getExpenseCategories, addExpenseCategory, deleteExpenseCategory, getEmployees, deleteExpense } from '../services/db';
import { getExpenseInsights } from '../services/geminiService';
import { Expense, PaymentMethod, ExpenseCategory, Employee } from '../types';
import { CURRENCY } from '../constants';
import AIInsightAlert from '../components/AIInsightAlert';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface ExpenseRow {
    id: string;
    categoryId: string;
    employeeId: string;
    title: string;
    amount: number;
}

const Expenses: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'expenses' | 'accounts'>('expenses');
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [aiTips, setAiTips] = useState<string[]>([]);
    const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
    const [batchPaymentMethodId, setBatchPaymentMethodId] = useState('');
    const [expenseRows, setExpenseRows] = useState<ExpenseRow[]>([{ id: '1', categoryId: '', employeeId: '', title: '', amount: 0 }]);

    const loadData = async () => {
        if (!user) return;
        await ensurePaymentMethodsExist(user.id);
        const [expData, catsData, salesData, pmData, empData] = await Promise.all([
            getExpenses(user.id),
            getExpenseCategories(user.id),
            getSalesAnalytics(user.id),
            getPaymentMethods(user.id),
            getEmployees(user.id)
        ]);
        setExpenses(expData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setCategories(catsData);
        setPaymentMethods(pmData);
        setEmployees(empData);
        if (catsData.length > 0) setExpenseRows(prev => prev.map(r => r.categoryId === '' ? { ...r, categoryId: catsData[0].id } : r));
        const defaultPm = pmData.find(m => m.isDefault) || pmData[0];
        if (!batchPaymentMethodId && defaultPm) setBatchPaymentMethodId(defaultPm.id);
        if (expData.length > 0 && aiTips.length === 0) {
            const tips = await getExpenseInsights(expData, salesData.totalSales);
            setAiTips(tips);
        }
    };

    useEffect(() => { loadData(); }, [user]);

    const addRow = () => setExpenseRows([...expenseRows, { id: Date.now().toString(), categoryId: categories[0]?.id || '', employeeId: '', title: '', amount: 0 }]);
    const removeRow = (id: string) => expenseRows.length > 1 && setExpenseRows(expenseRows.filter(r => r.id !== id));
    const updateRow = (id: string, field: keyof ExpenseRow, value: any) => setExpenseRows(expenseRows.map(r => r.id === id ? { ...r, [field]: value } : r));
    const calculateTotalBatch = () => expenseRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    const handleSaveBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        const validRows = expenseRows.filter(r => r.amount > 0);
        if (validRows.length === 0) return;
        setIsSubmitting(true);
        try {
            const processedRows = validRows.map(row => {
                const category = categories.find(c => c.id === row.categoryId);
                const employee = employees.find(emp => emp.id === row.employeeId);
                return { ...row, title: row.title.trim() ? row.title : (employee ? `راتب: ${employee.name}` : (category?.name || 'مصروف عام')) };
            });
            await addExpensesBatch(user.id, { date: batchDate, paymentMethodId: batchPaymentMethodId, expenses: processedRows });
            setIsAddExpenseModalOpen(false);
            setExpenseRows([{ id: Date.now().toString(), categoryId: categories[0]?.id || '', employeeId: '', title: '', amount: 0 }]);
            loadData();
        } finally { setIsSubmitting(false); }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newCategoryName.trim()) return;
        setIsSubmitting(true);
        try {
            await addExpenseCategory(user.id, newCategoryName);
            setNewCategoryName('');
            setIsAddCategoryModalOpen(false);
            loadData();
        } finally { setIsSubmitting(false); }
    };

    const handleDeleteCategory = async (id: string) => {
        if(window.confirm('هل تريد حذف هذا التصنيف؟ سيتم الاحتفاظ بالمصاريف المسجلة تحت "غير مصنف"')) {
            await deleteExpenseCategory(user!.id, id);
            loadData();
        }
    };

    const getCategoryTotal = (catId: string) => {
        return expenses
            .filter(e => e.categoryId === catId)
            .reduce((sum, e) => sum + e.amount, 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <h1 className="text-2xl font-black text-gray-800 dark:text-white">إدارة المصاريف</h1>
                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button onClick={() => setActiveTab('expenses')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'expenses' ? 'bg-white dark:bg-slate-600 text-emerald-600 shadow-sm' : 'text-gray-500'}`}>
                        <LayoutList size={18} /> سجل العمليات
                    </button>
                    <button onClick={() => setActiveTab('accounts')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'accounts' ? 'bg-white dark:bg-slate-600 text-emerald-600 shadow-sm' : 'text-gray-500'}`}>
                        <Layers size={18} /> إدارة الحسابات
                    </button>
                </div>
            </div>

            <AIInsightAlert title="تحليل المصاريف" insight={aiTips} icon={TrendingDown} baseColor="rose" />

            {activeTab === 'expenses' ? (
                <>
                    <div className="flex justify-end gap-3 no-print">
                        <button onClick={() => setIsAddExpenseModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 shadow-lg font-bold">
                            <Plus size={20} /> تسجيل مصروف
                        </button>
                    </div>

                    <div id="expenses-history-section" className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 text-xs font-bold uppercase">
                                    <tr>
                                        <th className="px-6 py-4 border-b">التاريخ</th>
                                        <th className="px-6 py-4 border-b">البيان</th>
                                        <th className="px-6 py-4 border-b text-center">التصنيف</th>
                                        <th className="px-6 py-4 border-b">المبلغ</th>
                                        <th className="px-6 py-4 border-b no-print"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {expenses.length === 0 ? (
                                        <tr><td colSpan={5} className="p-12 text-center text-gray-400 font-bold">لا توجد مصاريف مسجلة</td></tr>
                                    ) : (
                                        expenses.map(exp => (
                                            <tr key={exp.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{new Date(exp.date).toLocaleDateString('ar-MA')}</td>
                                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">{exp.title}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black">{exp.categoryName}</span>
                                                </td>
                                                <td className="px-6 py-4 font-black text-red-600 dark:text-red-400">{exp.amount} {CURRENCY}</td>
                                                <td className="px-6 py-4 no-print text-center">
                                                    <button onClick={() => window.confirm('حذف؟') && deleteExpense(exp.id).then(loadData)} className="p-2 text-gray-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                /* ACCOUNTS TAB - Updated to match image */
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-8">
                        <button 
                            onClick={() => setIsAddCategoryModalOpen(true)}
                            className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-all flex items-center gap-2"
                        >
                            <Plus size={18} />
                            إضافة تصنيف
                        </button>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white">تصنيفات المصاريف</h2>
                    </div>

                    <div className="space-y-3 max-w-2xl mx-auto">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-2xl group hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => !cat.isDefault && handleDeleteCategory(cat.id)}
                                        className={`p-2 transition-colors ${cat.isDefault ? 'opacity-0 cursor-default' : 'text-slate-300 hover:text-red-500'}`}
                                        disabled={cat.isDefault}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-4 py-1.5 rounded-lg text-sm font-black text-slate-700 dark:text-slate-200 shadow-sm min-w-[100px] text-center">
                                        {getCategoryTotal(cat.id).toLocaleString()} <span className="text-[10px] font-bold opacity-60">أوقية</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {cat.isDefault && (
                                        <span className="bg-gray-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">افتراضي</span>
                                    )}
                                    <span className="font-black text-slate-800 dark:text-white text-base">{cat.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL: ADD EXPENSE */}
            {isAddExpenseModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 no-print">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 flex justify-between items-center border-b dark:border-slate-700">
                            <h2 className="text-xl font-black text-slate-800 dark:text-white">تسجيل مصروف جديد</h2>
                            <button onClick={() => setIsAddExpenseModalOpen(false)} className="text-slate-400"><X size={24} /></button>
                        </div>
                        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-blue-600 mb-1 text-center">التاريخ</label>
                                    <input type="date" className="w-full p-2.5 rounded-xl border-none shadow-sm bg-white dark:bg-slate-900 text-sm font-bold outline-none text-center" value={batchDate} onChange={(e) => setBatchDate(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-blue-600 mb-1 text-center">الخزينة</label>
                                    <select className="w-full p-2.5 rounded-xl border-none shadow-sm bg-white dark:bg-slate-900 text-sm font-bold outline-none text-center" value={batchPaymentMethodId} onChange={(e) => setBatchPaymentMethodId(e.target.value)}>
                                        {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {expenseRows.map((row, idx) => {
                                    const isSalary = categories.find(c => c.id === row.categoryId)?.name === 'رواتب';
                                    return (
                                        <div key={row.id} className="bg-gray-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 space-y-3 relative">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-slate-400">بند {idx + 1}</span>
                                                {expenseRows.length > 1 && <button onClick={() => removeRow(row.id)} className="text-red-400"><Trash2 size={14} /></button>}
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                <select className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 text-sm font-bold outline-none border border-slate-200 dark:border-slate-700" value={row.categoryId} onChange={(e) => updateRow(row.id, 'categoryId', e.target.value)}>
                                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                                {isSalary ? (
                                                    <select className="w-full p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-sm font-bold outline-none border-none text-emerald-700" value={row.employeeId} onChange={(e) => updateRow(row.id, 'employeeId', e.target.value)}>
                                                        <option value="">اختر الموظف...</option>
                                                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                                    </select>
                                                ) : (
                                                    <input type="text" placeholder="البيان (اختياري)..." className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 text-sm outline-none border border-slate-200 dark:border-slate-700" value={row.title} onChange={(e) => updateRow(row.id, 'title', e.target.value)} />
                                                )}
                                                <input type="number" placeholder="المبلغ" className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 text-sm font-black text-slate-800 outline-none border border-slate-200 dark:border-slate-700" value={row.amount || ''} onChange={(e) => updateRow(row.id, 'amount', Number(e.target.value))} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={addRow} className="w-full py-3 border-2 border-dashed border-emerald-200 rounded-2xl text-emerald-600 font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors text-sm"><Plus size={16} /> إضافة بند مصروفات</button>
                        </div>
                        <div className="p-5 bg-slate-50 dark:bg-slate-900 border-t flex items-center justify-between">
                            <div className="text-right">
                                <span className="text-[10px] font-black text-slate-400 block">الإجمالي</span>
                                <div className="text-xl font-black text-slate-900 dark:text-white">{calculateTotalBatch()} {CURRENCY}</div>
                            </div>
                            <button onClick={handleSaveBatch} disabled={isSubmitting} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black shadow-lg flex items-center gap-2 disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} حفظ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: ADD CATEGORY */}
            {isAddCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-black mb-6 text-gray-800 dark:text-white text-center">إضافة تصنيف مصروفات</h2>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <input 
                                required 
                                autoFocus
                                type="text" 
                                placeholder="اسم التصنيف (مثلاً: الكهرباء)" 
                                className="w-full p-4 border dark:border-slate-600 rounded-2xl bg-gray-50 dark:bg-slate-700 dark:text-white font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                value={newCategoryName} 
                                onChange={e => setNewCategoryName(e.target.value)} 
                            />
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black shadow-lg hover:bg-emerald-700 transition disabled:opacity-50">
                                    {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'حفظ التصنيف'}
                                </button>
                                <button type="button" onClick={() => setIsAddCategoryModalOpen(false)} className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 py-3 rounded-xl font-bold">إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
