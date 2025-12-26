
import React, { useState, useEffect, useRef } from 'react';
import { Wallet, Plus, TrendingDown, Calendar, AlertTriangle, Trash2, LayoutList, Layers, User, AlertOctagon, MoreVertical, Edit2, Save, X, Loader2, FileDown } from 'lucide-react';
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
    
    // Data States
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    
    // UI States
    const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
    const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
    const [aiTips, setAiTips] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    
    const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
    const [batchPaymentMethodId, setBatchPaymentMethodId] = useState('');
    const [expenseRows, setExpenseRows] = useState<ExpenseRow[]>([
        { id: '1', categoryId: '', employeeId: '', title: '', amount: 0 }
    ]);

    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

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

        const defaultPm = pmData.find(m => m.isDefault) || pmData[0];
        if (!batchPaymentMethodId && defaultPm) setBatchPaymentMethodId(defaultPm.id);

        if (expData.length > 0 && aiTips.length === 0) {
            const tips = await getExpenseInsights(expData, salesData.totalSales);
            setAiTips(tips);
        }
    };

    useEffect(() => {
        loadData();
        const handleScroll = () => setActiveMenuId(null);
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
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

            html2pdf().set(opt).from(element).save().then(() => {
                setIsExporting(false);
            });
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
                return {
                    ...row,
                    title: row.title.trim() ? row.title : (category?.name || 'مصروف عام')
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

    const handleUpdateExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!editingExpense) return;
        setIsSubmitting(true);
        try {
            const category = categories.find(c => c.id === editingExpense.categoryId);
            const finalTitle = editingExpense.title.trim() ? editingExpense.title : (category?.name || 'مصروف عام');
            await updateExpense({ ...editingExpense, title: finalTitle });
            setIsEditExpenseModalOpen(false);
            setEditingExpense(null);
            loadData();
        } catch (error) {
            alert("فشل تحديث المصروف");
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

    const openEditModal = (exp: Expense) => {
        setEditingExpense(exp);
        setIsEditExpenseModalOpen(true);
        setActiveMenuId(null);
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

    const handleDeleteCategory = async (id: string, isDefault: boolean) => {
        if (isDefault) return;
        if (window.confirm("حذف هذا التصنيف؟")) {
            if (!user) return;
            await deleteExpenseCategory(user.id, id);
            loadData();
        }
    };

    const activeExpense = expenses.find(e => e.id === activeMenuId);

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
                        <button 
                            onClick={handleExportPDF}
                            disabled={isExporting || expenses.length === 0}
                            className="flex items-center gap-2 text-sm text-slate-600 bg-white border px-4 py-3 rounded-xl transition shadow-sm font-bold disabled:opacity-70"
                        >
                            {isExporting ? <Loader2 size={20} className="animate-spin" /> : <FileDown size={20} />}
                            <span>تصدير السجل PDF</span>
                        </button>
                        <button onClick={() => setIsAddExpenseModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 shadow-lg font-bold">
                            <Plus size={20} /> تسجيل مصروف
                        </button>
                    </div>

                    <div id="expenses-history-section" className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden pdf-container p-8">
                        {/* PDF Specific Header */}
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
                                                <td className="px-6 py-4 no-print">
                                                    <button onClick={(e) => { 
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setMenuPos({ top: rect.bottom, left: rect.left });
                                                        setActiveMenuId(activeMenuId === exp.id ? null : exp.id); 
                                                    }} className="p-2 text-gray-400"><MoreVertical size={18} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {/* Totals for PDF */}
                                <tfoot className="print:table-footer-group">
                                    <tr>
                                        <td colSpan={3} className="px-6 py-6 font-black text-right border-t-2">إجمالي المصاريف الموضحة</td>
                                        <td className="px-6 py-6 font-black text-red-600 text-lg border-t-2">{expenses.reduce((s,e) => s+e.amount, 0).toLocaleString()} {CURRENCY}</td>
                                        <td className="no-print border-t-2"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="hidden print:block mt-12 pt-6 border-t text-center text-[10px] text-gray-400 font-bold">مستخرج من نظام بوصلة للمحاسبة الرقمية</div>
                    </div>
                </>
            )}

            {activeTab === 'accounts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-black text-gray-800 dark:text-white">تصنيفات المصاريف</h3>
                            <button onClick={() => setIsAddCategoryModalOpen(true)} className="text-sm bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold hover:bg-emerald-100 transition">+ إضافة تصنيف</button>
                        </div>
                        <div className="space-y-3">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                                    <span className="font-bold text-gray-700 dark:text-slate-200">{cat.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-slate-800 dark:text-white text-sm">{expenses.filter(e => e.categoryId === cat.id).reduce((s,e) => s+e.amount, 0).toLocaleString()} {CURRENCY}</span>
                                        {!cat.isDefault && <button onClick={() => handleDeleteCategory(cat.id, !!cat.isDefault)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-[2rem] border border-emerald-100 dark:border-emerald-800">
                        <div className="flex items-center gap-3 mb-6 text-emerald-800 dark:text-emerald-400"><AlertOctagon /><h3 className="font-black">لماذا التصنيفات؟</h3></div>
                        <p className="text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">توزيع المصاريف يساعدك على تحديد نقاط الهدر الحقيقية. هل تدفع الكثير في الكهرباء؟ أم أن الرواتب لا تتناسب مع مبيعات هذا الشهر؟ الإجابة في تصنيف عملياتك بدقة.</p>
                    </div>
                </div>
            )}

            {activeMenuId && activeExpense && (
                <div ref={menuRef} className="fixed z-50 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 no-print" style={{ top: menuPos.top, left: menuPos.left }}>
                    <button onClick={() => openEditModal(activeExpense)} className="w-full text-right px-4 py-3 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 flex items-center gap-2 font-bold"><Edit2 size={14} /> تعديل</button>
                    <button onClick={() => handleDeleteExpense(activeExpense.id)} className="w-full text-right px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-xl font-bold"><Trash2 size={14} /> حذف</button>
                </div>
            )}

            {isAddExpenseModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm no-print">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 bg-gray-50 dark:bg-slate-700/50 border-b flex justify-between items-center shrink-0">
                            <div><h2 className="text-xl font-black text-gray-800 dark:text-white">تسجيل مصروفات</h2></div>
                            <button onClick={() => setIsAddExpenseModalOpen(false)}><X size={24} className="text-gray-400" /></button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1 space-y-6">
                            <div className="grid grid-cols-2 gap-4 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl">
                                <div><label className="block text-xs font-black text-blue-700 mb-1">تاريخ العمليات</label><input type="date" className="w-full p-2 border-none rounded-lg bg-white outline-none" value={batchDate} onChange={(e) => setBatchDate(e.target.value)} /></div>
                                <div><label className="block text-xs font-black text-blue-700 mb-1">الخزينة</label><select className="w-full p-2 border-none rounded-lg bg-white outline-none" value={batchPaymentMethodId} onChange={(e) => setBatchPaymentMethodId(e.target.value)}>{paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}</select></div>
                            </div>
                            <div className="space-y-3">
                                {expenseRows.map((row, index) => (
                                    <div key={row.id} className="flex gap-2 items-center bg-gray-50 dark:bg-slate-700/50 p-3 rounded-2xl">
                                        <select className="flex-1 p-2 bg-white border-none rounded-lg outline-none text-sm font-bold" value={row.categoryId} onChange={(e) => updateRow(row.id, 'categoryId', e.target.value)}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                                        <input type="text" placeholder="البيان..." className="flex-[2] p-2 bg-white border-none rounded-lg outline-none text-sm" value={row.title} onChange={(e) => updateRow(row.id, 'title', e.target.value)} />
                                        <input type="number" placeholder="المبلغ" className="flex-1 p-2 bg-white border-none rounded-lg outline-none text-sm font-black text-red-600" value={row.amount || ''} onChange={(e) => updateRow(row.id, 'amount', Number(e.target.value))} />
                                        <button onClick={() => removeRow(row.id)} className="text-gray-400 p-2"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addRow} className="font-black text-emerald-600 flex items-center gap-1">+ سطر جديد</button>
                        </div>
                        <div className="p-8 border-t flex justify-between items-center bg-gray-50">
                            <div><span className="text-xs font-bold text-gray-400 block">الإجمالي</span><span className="text-2xl font-black">{calculateTotalBatch()} {CURRENCY}</span></div>
                            <button onClick={handleSaveBatch} disabled={isSubmitting} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-200">حفظ الكل</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
