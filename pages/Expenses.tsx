
import React, { useState, useEffect, useRef } from 'react';
import { Wallet, Plus, TrendingDown, Calendar, AlertTriangle, Trash2, LayoutList, Layers, User, AlertOctagon, MoreVertical, Edit2, Save, X, Loader2, FileDown, Landmark, ReceiptText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getExpenses, addExpensesBatch, getSalesAnalytics, getPaymentMethods, ensurePaymentMethodsExist, getExpenseCategories, addExpenseCategory, deleteExpenseCategory, getEmployees, updateExpense, deleteExpense } from '../services/db';
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
    const [isExporting, setIsExporting] = useState(false);
    const [aiTips, setAiTips] = useState<string[]>([]);
    
    const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
    const [batchPaymentMethodId, setBatchPaymentMethodId] = useState('');
    const [expenseRows, setExpenseRows] = useState<ExpenseRow[]>([
        { id: '1', categoryId: '', employeeId: '', title: '', amount: 0 }
    ]);

    const [newCategoryName, setNewCategoryName] = useState('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 }); 
    const menuRef = useRef<HTMLDivElement>(null);

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

        if (catsData.length > 0) {
            setExpenseRows(prev => prev.map(r => r.categoryId === '' ? { ...r, categoryId: catsData[0].id } : r));
        }

        const defaultPm = pmData.find(m => m.isDefault) || pmData[0];
        if (!batchPaymentMethodId && defaultPm) setBatchPaymentMethodId(defaultPm.id);

        if (expData.length > 0 && aiTips.length === 0) {
            const tips = await getExpenseInsights(expData, salesData.totalSales);
            setAiTips(tips);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handleExportPDF = () => {
        if (expenses.length === 0) return;
        setIsExporting(true);
        setTimeout(() => {
            const element = document.getElementById('expenses-history-section');
            const opt = {
                margin: 0.5,
                filename: `سجل_المصاريف_${user?.storeName}_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };
            html2pdf().set(opt).from(element).save().then(() => setIsExporting(false));
        }, 500);
    };

    const addRow = () => {
        setExpenseRows([...expenseRows, { id: Date.now().toString(), categoryId: categories[0]?.id || '', employeeId: '', title: '', amount: 0 }]);
    };

    const removeRow = (id: string) => {
        if (expenseRows.length === 1) return; 
        setExpenseRows(expenseRows.filter(r => r.id !== id));
    };

    const updateRow = (id: string, field: keyof ExpenseRow, value: any) => {
        setExpenseRows(expenseRows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const calculateTotalBatch = () => expenseRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    const handleSaveBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        const validRows = expenseRows.filter(r => r.amount > 0);
        if (validRows.length === 0) {
            alert("الرجاء إدخال مبلغ لمصروف واحد على الأقل.");
            return;
        }

        setIsSubmitting(true);
        try {
            const processedRows = validRows.map(row => {
                const category = categories.find(c => c.id === row.categoryId);
                const employee = employees.find(emp => emp.id === row.employeeId);
                return {
                    ...row,
                    title: row.title.trim() ? row.title : (employee ? `راتب: ${employee.name}` : (category?.name || 'مصروف عام'))
                };
            });

            await addExpensesBatch(user.id, {
                date: batchDate,
                paymentMethodId: batchPaymentMethodId,
                expenses: processedRows
            });

            setIsAddExpenseModalOpen(false);
            setExpenseRows([{ id: Date.now().toString(), categoryId: categories[0]?.id || '', employeeId: '', title: '', amount: 0 }]);
            loadData();
        } catch (error) {
            alert("حدث خطأ أثناء حفظ المصاريف.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if(window.confirm('حذف هذا المصروف؟')) {
            try {
                await deleteExpense(id);
                loadData();
                setActiveMenuId(null);
            } catch (error) {
                alert("حدث خطأ أثناء حذف المصروف.");
            }
        }
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
        } finally {
            setIsSubmitting(false);
        }
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
                        <Layers size={18} /> التصنيفات
                    </button>
                </div>
            </div>

            <AIInsightAlert title="تحليل المصاريف" insight={aiTips} icon={TrendingDown} baseColor="rose" />

            {activeTab === 'expenses' && (
                <>
                    <div className="flex justify-end gap-3 no-print">
                        <button onClick={handleExportPDF} disabled={isExporting || expenses.length === 0} className="flex items-center gap-2 text-sm text-slate-600 bg-white border px-4 py-3 rounded-xl transition shadow-sm font-bold disabled:opacity-70">
                            {isExporting ? <Loader2 size={20} className="animate-spin" /> : <FileDown size={20} />}
                            <span>تصدير السجل PDF</span>
                        </button>
                        <button onClick={() => setIsAddExpenseModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 shadow-lg font-bold">
                            <Plus size={20} /> تسجيل مصروف
                        </button>
                    </div>

                    <div id="expenses-history-section" className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden pdf-container p-8">
                        <div className="hidden print:flex pdf-header flex-col items-center mb-10 border-b-2 border-red-500 pb-6 text-center">
                            <div className="text-3xl font-black text-slate-900 mb-2">{user?.storeName}</div>
                            <div className="text-xl font-bold text-red-600 mb-2">تقرير المصاريف التشغيلية</div>
                            <p className="text-sm text-gray-500 font-medium">تاريخ التقرير: {new Date().toLocaleDateString('ar-MA')}</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 text-xs font-bold uppercase">
                                    <tr>
                                        <th className="px-6 py-4 border-b">التاريخ</th>
                                        <th className="px-6 py-4 border-b">البيان / التفاصيل</th>
                                        <th className="px-6 py-4 border-b">التصنيف</th>
                                        <th className="px-6 py-4 border-b">المبلغ</th>
                                        <th className="px-6 py-4 border-b no-print">إجراءات</th>
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
                                                <td className="px-6 py-4">
                                                    <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black">{exp.categoryName}</span>
                                                </td>
                                                <td className="px-6 py-4 font-black text-red-600 dark:text-red-400">{exp.amount} {CURRENCY}</td>
                                                <td className="px-6 py-4 no-print text-center">
                                                    <button onClick={() => handleDeleteExpense(exp.id)} className="p-2 text-gray-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot className="print:table-footer-group">
                                    <tr>
                                        <td colSpan={3} className="px-6 py-6 font-black text-right border-t-2">إجمالي المصاريف الموضحة</td>
                                        <td className="px-6 py-6 font-black text-red-600 text-lg border-t-2">{expenses.reduce((s,e) => s+e.amount, 0).toLocaleString()} {CURRENCY}</td>
                                        <td className="no-print border-t-2"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* MODAL: ADD EXPENSE (Custom Design per Image) */}
            {isAddExpenseModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 no-print">
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                        
                        <div className="p-8 pb-4 flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                    تسجيل مصروفات جديدة
                                </h2>
                                <p className="text-slate-400 font-bold text-sm mt-1">يمكنك إضافة عدة مصاريف دفعة واحدة</p>
                            </div>
                            <button onClick={() => setIsAddExpenseModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <X size={28} />
                            </button>
                        </div>

                        <div className="px-8 flex-1 overflow-y-auto custom-scrollbar space-y-6 pb-6">
                            {/* Date & Payment Method Header (Blue Box) */}
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900/30 rounded-3xl p-6 grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 text-center">تاريخ المصروفات</label>
                                    <div className="relative">
                                        <input type="date" className="w-full p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold outline-none text-center" value={batchDate} onChange={(e) => setBatchDate(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 text-center">طريقة الدفع (الخزينة)</label>
                                    <select className="w-full p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold outline-none text-center" value={batchPaymentMethodId} onChange={(e) => setBatchPaymentMethodId(e.target.value)}>
                                        {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Expense Rows */}
                            <div className="space-y-6">
                                {expenseRows.map((row, idx) => {
                                    const selectedCat = categories.find(c => c.id === row.categoryId);
                                    const isSalary = selectedCat?.name === 'رواتب';
                                    
                                    return (
                                        <div key={row.id} className="relative group">
                                            <div className="absolute -right-4 top-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-slate-400 text-xs">
                                                {idx + 1}
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="grid grid-cols-1 gap-4">
                                                    <select 
                                                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold text-slate-700 dark:text-slate-300 outline-none"
                                                        value={row.categoryId}
                                                        onChange={(e) => updateRow(row.id, 'categoryId', e.target.value)}
                                                    >
                                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                    
                                                    {isSalary ? (
                                                        <select 
                                                            className="w-full p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border-none font-bold text-emerald-700 dark:text-emerald-400 outline-none"
                                                            value={row.employeeId}
                                                            onChange={(e) => updateRow(row.id, 'employeeId', e.target.value)}
                                                        >
                                                            <option value="">اختر الموظف...</option>
                                                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                                        </select>
                                                    ) : (
                                                        <input 
                                                            type="text" 
                                                            placeholder="البيان (اختياري)..." 
                                                            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold text-slate-700 dark:text-slate-300 outline-none"
                                                            value={row.title}
                                                            onChange={(e) => updateRow(row.id, 'title', e.target.value)}
                                                        />
                                                    )}

                                                    <div className="relative">
                                                        <input 
                                                            type="number" 
                                                            placeholder="المبلغ" 
                                                            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-black text-slate-800 dark:text-white outline-none text-left"
                                                            value={row.amount || ''}
                                                            onChange={(e) => updateRow(row.id, 'amount', Number(e.target.value))}
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">أوقية</span>
                                                    </div>
                                                </div>
                                                
                                                {expenseRows.length > 1 && (
                                                    <div className="flex justify-center pt-2">
                                                        <button onClick={() => removeRow(row.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                            <Trash2 size={24} strokeWidth={2.5} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button 
                                onClick={addRow}
                                className="w-full py-4 border-2 border-dashed border-emerald-200 dark:border-emerald-800/50 rounded-3xl text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
                            >
                                <Plus size={20} /> إضافة سطر جديد
                            </button>
                        </div>

                        {/* Footer - Total & Save */}
                        <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-6">
                            <div className="text-right">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">الإجمالي الكلي</span>
                                <div className="text-4xl font-black text-slate-900 dark:text-white">
                                    {calculateTotalBatch().toLocaleString()} <span className="text-2xl font-bold">أوقية</span>
                                </div>
                            </div>
                            <button 
                                onClick={handleSaveBatch}
                                disabled={isSubmitting}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-3xl font-black text-xl flex items-center gap-3 shadow-xl shadow-emerald-200 dark:shadow-none transition-all transform active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                                حفظ المصاريف
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
