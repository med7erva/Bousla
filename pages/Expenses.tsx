
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
    
    // Batch Form State
    const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
    const [batchPaymentMethodId, setBatchPaymentMethodId] = useState('');
    const [expenseRows, setExpenseRows] = useState<ExpenseRow[]>([
        { id: '1', categoryId: '', employeeId: '', title: '', amount: 0 }
    ]);

    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    // Dropdown State
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
        
        if (!batchPaymentMethodId && defaultPm) {
            setBatchPaymentMethodId(defaultPm.id);
        }

        if (catsData.length > 0 && expenseRows[0].categoryId === '') {
            setExpenseRows(rows => rows.map(r => ({ ...r, categoryId: catsData[0].id })));
        }

        if (expData.length > 0 && aiTips.length === 0) {
            const tips = await getExpenseInsights(expData, salesData.totalSales);
            setAiTips(tips);
        }
    };

    useEffect(() => {
        loadData();
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuId(null);
            }
        };
        const handleScroll = () => setActiveMenuId(null);

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [user]);

    const handleExportPDF = () => {
        if (expenses.length === 0) return;
        setIsExporting(true);
        
        const element = document.getElementById('expenses-history-section');
        const opt = {
            margin: 0.5,
            filename: `سجل_المصاريف_${user?.storeName}_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            setIsExporting(false);
        });
    };

    const addRow = () => {
        setExpenseRows([...expenseRows, { 
            id: Date.now().toString(), 
            categoryId: categories[0]?.id || '', 
            employeeId: '', 
            title: '', 
            amount: 0 
        }]);
    };

    const removeRow = (id: string) => {
        if (expenseRows.length === 1) return; 
        setExpenseRows(expenseRows.filter(r => r.id !== id));
    };

    const updateRow = (id: string, field: keyof ExpenseRow, value: any) => {
        setExpenseRows(expenseRows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const calculateTotalBatch = () => expenseRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    const getCategoryTotal = (catId: string) => {
        return expenses
            .filter(e => e.categoryId === catId)
            .reduce((sum, e) => sum + e.amount, 0);
    };

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
            setExpenseRows([{ 
                id: Date.now().toString(), 
                categoryId: categories[0]?.id || '', 
                employeeId: '', 
                title: '', 
                amount: 0 
            }]);
            loadData();
        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء حفظ المصاريف. يرجى التأكد من الاتصال.");
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
            
            await updateExpense({
                ...editingExpense,
                title: finalTitle
            });

            setIsEditExpenseModalOpen(false);
            setEditingExpense(null);
            loadData();
        } catch (error) {
            console.error(error);
            alert("فشل تحديث المصروف");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if(window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
            try {
                await deleteExpense(id);
                loadData();
                setActiveMenuId(null);
            } catch (error) {
                console.error(error);
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
        if (window.confirm("حذف هذا التصنيف؟ سيتم إلغاء تصنيف المصاريف المرتبطة به.")) {
            if (!user) return;
            await deleteExpenseCategory(user.id, id);
            loadData();
        }
    };

    const activeExpense = expenses.find(e => e.id === activeMenuId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">المصاريف</h1>
                
                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('expenses')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'expenses' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                    >
                        <LayoutList size={18} />
                        سجل العمليات
                    </button>
                    <button 
                        onClick={() => setActiveTab('accounts')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'accounts' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                    >
                        <Layers size={18} />
                        إدارة الحسابات
                    </button>
                </div>
            </div>

            <AIInsightAlert 
                title="تحليل المصاريف"
                insight={aiTips}
                icon={TrendingDown}
                baseColor="rose"
            />

            {activeTab === 'expenses' && (
                <>
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={handleExportPDF}
                            disabled={isExporting || expenses.length === 0}
                            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-3 rounded-xl transition border border-slate-200 dark:border-slate-700 shadow-sm disabled:opacity-70 font-bold"
                        >
                            {isExporting ? <Loader2 size={20} className="animate-spin" /> : <FileDown size={20} />}
                            <span>تصدير سجل PDF</span>
                        </button>
                        <button 
                            onClick={() => setIsAddExpenseModalOpen(true)}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 dark:shadow-none font-bold"
                        >
                            <Plus size={20} />
                            <span>تسجيل مصروفات</span>
                        </button>
                    </div>

                    <div id="expenses-history-section" className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                        <div className="hidden print:block mb-4 text-center border-b p-6">
                            <h2 className="text-xl font-bold">{user?.storeName} - سجل المصاريف التشغيلية</h2>
                            <p className="text-sm text-gray-500">تاريخ الطباعة: {new Date().toLocaleDateString('ar-MA')}</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right whitespace-nowrap min-w-[600px]">
                                <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">التاريخ</th>
                                        <th className="px-6 py-4">العنوان / البيان</th>
                                        <th className="px-6 py-4">التصنيف</th>
                                        <th className="px-6 py-4">المبلغ</th>
                                        <th className="px-6 py-4" data-html2canvas-ignore="true">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {expenses.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-400 dark:text-slate-500">لا توجد مصاريف مسجلة</td></tr>
                                    ) : (
                                        expenses.map(exp => (
                                            <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 group transition">
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 font-mono">{new Date(exp.date).toLocaleDateString('ar-MA')}</td>
                                                <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">{exp.title}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-bold">{exp.categoryName}</span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-red-600 dark:text-red-400">{exp.amount} {CURRENCY}</td>
                                                <td className="px-6 py-4" data-html2canvas-ignore="true">
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setMenuPos({ top: rect.bottom, left: rect.left });
                                                            setActiveMenuId(activeMenuId === exp.id ? null : exp.id); 
                                                        }}
                                                        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full text-gray-500 dark:text-slate-400 transition"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'accounts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-800 dark:text-white">تصنيفات المصاريف</h3>
                            <button 
                                onClick={() => setIsAddCategoryModalOpen(true)}
                                className="text-sm bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
                            >
                                + إضافة تصنيف
                            </button>
                        </div>
                        <div className="space-y-3">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-700">
                                    <span className="font-medium text-gray-700 dark:text-slate-200">{cat.name}</span>
                                    
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-700 dark:text-white text-sm bg-white dark:bg-slate-800 px-2 py-1 rounded border border-gray-100 dark:border-slate-600 min-w-[80px] text-center">
                                            {getCategoryTotal(cat.id).toLocaleString()} {CURRENCY}
                                        </span>
                                        
                                        {cat.isDefault ? (
                                            <span className="text-xs text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded border dark:border-slate-600">افتراضي</span>
                                        ) : (
                                            <button onClick={() => handleDeleteCategory(cat.id, !!cat.isDefault)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                        <div className="flex items-center gap-3 mb-4 text-emerald-800 dark:text-emerald-400">
                            <AlertOctagon />
                            <h3 className="font-bold">نصيحة مالية</h3>
                        </div>
                        <p className="text-emerald-700 dark:text-emerald-300 text-sm leading-relaxed">
                            قم بتقسيم مصاريفك بدقة (إيجار، رواتب، كهرباء...) لتتمكن من معرفة أين تذهب أموالك بالضبط. 
                            التحكم في المصاريف الصغيرة هو الخطوة الأولى لزيادة الأرباح.
                        </p>
                    </div>
                </div>
            )}

            {activeMenuId && activeExpense && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)}></div>
                    <div 
                        ref={menuRef} 
                        className="fixed z-50 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200"
                        style={{ top: menuPos.top, left: menuPos.left }}
                    >
                        <button 
                            onClick={() => openEditModal(activeExpense)}
                            className="w-full text-right px-4 py-3 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                        >
                            <Edit2 size={14} /> تعديل
                        </button>
                        <button 
                            onClick={() => handleDeleteExpense(activeExpense.id)}
                            className="w-full text-right px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 rounded-b-lg"
                        >
                            <Trash2 size={14} /> حذف
                        </button>
                    </div>
                </>
            )}

            {isAddExpenseModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">تسجيل مصروفات جديدة</h2>
                                <p className="text-sm text-gray-500 dark:text-slate-400">يمكنك إضافة عدة مصاريف دفعة واحدة</p>
                            </div>
                            <button onClick={() => setIsAddExpenseModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-600 dark:hover:text-white" /></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-2 gap-4 mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                <div>
                                    <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">تاريخ المصروفات</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-2 border border-blue-200 dark:border-blue-800 rounded-lg bg-white dark:bg-slate-800 dark:text-white text-sm outline-none"
                                        value={batchDate}
                                        onChange={(e) => setBatchDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">طريقة الدفع (الخزينة)</label>
                                    <select 
                                        className="w-full p-2 border border-blue-200 dark:border-blue-800 rounded-lg bg-white dark:bg-slate-800 dark:text-white text-sm outline-none"
                                        value={batchPaymentMethodId}
                                        onChange={(e) => setBatchPaymentMethodId(e.target.value)}
                                    >
                                        {paymentMethods.map(pm => (
                                            <option key={pm.id} value={pm.id}>{pm.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {expenseRows.map((row, index) => (
                                    <div key={row.id} className="flex gap-2 items-start animate-in slide-in-from-right-4 duration-300">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-slate-400 mt-1 shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2">
                                            <div className="md:col-span-3">
                                                <select 
                                                    className="w-full p-2 border dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-600 transition outline-none"
                                                    value={row.categoryId}
                                                    onChange={(e) => updateRow(row.id, 'categoryId', e.target.value)}
                                                >
                                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            
                                            {categories.find(c => c.id === row.categoryId)?.name === 'رواتب' ? (
                                                <div className="md:col-span-3">
                                                    <select 
                                                        className="w-full p-2 border dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-600 transition outline-none"
                                                        value={row.employeeId}
                                                        onChange={(e) => updateRow(row.id, 'employeeId', e.target.value)}
                                                    >
                                                        <option value="">اختر الموظف...</option>
                                                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="md:col-span-3">
                                                     <input 
                                                        type="text" 
                                                        placeholder="تفاصيل المصروف..." 
                                                        className="w-full p-2 border dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-600 transition outline-none"
                                                        value={row.title}
                                                        onChange={(e) => updateRow(row.id, 'title', e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            <div className="md:col-span-3">
                                                <div className="relative">
                                                    <input 
                                                        type="number" 
                                                        placeholder="المبلغ" 
                                                        className="w-full p-2 border dark:border-slate-600 rounded-lg text-sm font-bold text-red-600 dark:text-red-400 bg-gray-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 outline-none"
                                                        value={row.amount || ''}
                                                        onChange={(e) => updateRow(row.id, 'amount', Number(e.target.value))}
                                                    />
                                                    <span className="absolute left-2 top-2 text-xs text-gray-400 dark:text-slate-500">{CURRENCY}</span>
                                                </div>
                                            </div>

                                            <div className="md:col-span-1 flex justify-center">
                                                <button onClick={() => removeRow(row.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <button 
                                onClick={addRow}
                                className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-3 py-2 rounded-lg transition"
                            >
                                <Plus size={16} /> إضافة سطر جديد
                            </button>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 flex justify-between items-center shrink-0">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-slate-400 block">الإجمالي الكلي</span>
                                <span className="text-2xl font-black text-slate-800 dark:text-white">{calculateTotalBatch()} {CURRENCY}</span>
                            </div>
                            <button 
                                onClick={handleSaveBatch}
                                disabled={isSubmitting}
                                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                <span>حفظ المصاريف</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditExpenseModalOpen && editingExpense && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">تعديل مصروف</h2>
                            <button onClick={() => setIsEditExpenseModalOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600 dark:hover:text-white" /></button>
                        </div>
                        <form onSubmit={handleUpdateExpense} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">التصنيف</label>
                                <select 
                                    className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none"
                                    value={editingExpense.categoryId}
                                    onChange={(e) => setEditingExpense({...editingExpense, categoryId: e.target.value})}
                                >
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">العنوان / التفاصيل</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none"
                                    value={editingExpense.title}
                                    onChange={(e) => setEditingExpense({...editingExpense, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">المبلغ</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none font-bold"
                                    value={editingExpense.amount || ''}
                                    onChange={(e) => setEditingExpense({...editingExpense, amount: Number(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">التاريخ</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none"
                                    value={editingExpense.date.split('T')[0]}
                                    onChange={(e) => setEditingExpense({...editingExpense, date: e.target.value})}
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 flex justify-center mt-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'حفظ التعديلات'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isAddCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm p-6 shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">تصنيف جديد</h3>
                            <button onClick={() => setIsAddCategoryModalOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600 dark:hover:text-white" /></button>
                        </div>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="اسم التصنيف (مثلاً: تسويق)"
                                className="w-full p-3 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700">
                                    {isSubmitting ? <Loader2 className="animate-spin mx-auto"/> : 'إضافة'}
                                </button>
                                <button type="button" onClick={() => setIsAddCategoryModalOpen(false)} className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 py-2 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-slate-600">إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
