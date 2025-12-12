
import React, { useState, useEffect } from 'react';
import { Truck, Plus, Trash2, Save, ShoppingCart, Search, AlertCircle, Loader2, MoreVertical, Edit2, X, Package, Calendar, DollarSign, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSuppliers, getProducts, createPurchase, getPurchases, getPaymentMethods, ensurePaymentMethodsExist, deletePurchase, updatePurchase } from '../services/db';
import { Supplier, Product, PurchaseItem, Purchase, PaymentMethod } from '../types';
import { CURRENCY } from '../constants';

const Purchases: React.FC = () => {
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'create'>('list');
    
    // Data
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    // List View State
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [cartItems, setCartItems] = useState<PurchaseItem[]>([]);
    const [paidAmount, setPaidAmount] = useState<number | string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Temp item input
    const [tempProduct, setTempProduct] = useState({ id: '', qty: 1, cost: 0 });

    // Dropdown & Edit State
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

    useEffect(() => {
        if(user) {
            loadInitialData();
        }
        
        const handleScroll = () => setActiveMenuId(null);
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);

    }, [user, view]);

    const loadInitialData = async () => {
        if(!user) return;
        await ensurePaymentMethodsExist(user.id);
        const [supData, prodData, purData, pmData] = await Promise.all([
            getSuppliers(user.id),
            getProducts(user.id),
            getPurchases(user.id),
            getPaymentMethods(user.id)
        ]);
        setSuppliers(supData);
        setProducts(prodData);
        setPurchases(purData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setPaymentMethods(pmData);
        
        const defaultPm = pmData.find(m => m.isDefault) || pmData[0];
        setSelectedPaymentMethodId(defaultPm?.id || '');
    };

    const addToCart = () => {
        if(!tempProduct.id) return;
        const product = products.find(p => p.id === tempProduct.id);
        if(!product) return;

        setCartItems(prev => [
            ...prev,
            {
                productId: product.id,
                productName: product.name,
                quantity: tempProduct.qty,
                costPrice: tempProduct.cost
            }
        ]);
        setTempProduct({ id: '', qty: 1, cost: 0 });
    };

    const removeFromCart = (idx: number) => {
        setCartItems(prev => prev.filter((_, i) => i !== idx));
    };

    const calculateTotal = () => cartItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);

    const handleSavePurchase = async () => {
        if(!user || !selectedSupplierId || cartItems.length === 0) return;
        if(isSubmitting) return; // Prevent double click
        
        const supplier = suppliers.find(s => s.id === selectedSupplierId);
        if(!supplier) return;

        setIsSubmitting(true);
        try {
            await createPurchase(
                user.id,
                supplier.id,
                supplier.name,
                cartItems,
                calculateTotal(),
                Number(paidAmount) || 0,
                invoiceDate,
                selectedPaymentMethodId
            );
            
            // Reset and go back to list
            setCartItems([]);
            setPaidAmount('');
            setSelectedSupplierId('');
            setView('list');
            loadInitialData(); // Refresh list immediately
        } catch (error) {
            alert("حدث خطأ أثناء حفظ الفاتورة");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePurchase = async (id: string) => {
        if(window.confirm('هل أنت متأكد من حذف فاتورة الشراء؟ سيتم خصم الكميات من المخزون وإلغاء الدين. (لن يتم الحذف إذا تم بيع جزء من المنتجات)')) {
            try {
                await deletePurchase(id);
                loadInitialData();
                setActiveMenuId(null);
            } catch (error: any) {
                console.error(error);
                alert(error.message || "حدث خطأ أثناء حذف الفاتورة");
            }
        }
    };

    const openEditModal = (purchase: Purchase) => {
        setEditingPurchase(purchase);
        setIsEditModalOpen(true);
        setActiveMenuId(null);
    };

    const handleUpdatePurchase = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!editingPurchase) return;
        
        // Find supplier name if changed
        const supplier = suppliers.find(s => s.id === editingPurchase.supplierId);
        const updatedPurchase = {
            ...editingPurchase,
            supplierName: supplier ? supplier.name : editingPurchase.supplierName
        };

        try {
            await updatePurchase(updatedPurchase);
            setIsEditModalOpen(false);
            setEditingPurchase(null);
            loadInitialData();
        } catch (error) {
            alert("فشل تحديث الفاتورة");
        }
    };

    // Filter Logic
    const filteredPurchases = purchases.filter(p => 
        p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Render Logic for Product Column
    const renderProductSummary = (items: PurchaseItem[]) => {
        if (!items || items.length === 0) return <span className="text-gray-400 text-xs">لا توجد أصناف</span>;
        
        const firstItem = items[0];
        const remainingCount = items.length - 1;
        
        return (
            <div className="flex flex-col max-w-[200px]" title={items.map(i => `${i.productName} (${i.quantity})`).join('\n')}>
                <span className="font-bold text-gray-800 text-sm truncate block">
                    {firstItem.productName}
                </span>
                {remainingCount > 0 && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full w-fit mt-1 flex items-center gap-1">
                        <Package size={10} /> +{remainingCount} أصناف أخرى
                    </span>
                )}
                {remainingCount === 0 && (
                    <span className="text-[10px] text-gray-400 mt-0.5">
                        الكمية: {firstItem.quantity}
                    </span>
                )}
            </div>
        );
    };

    if (view === 'create') {
        const total = calculateTotal();
        const numericPaid = Number(paidAmount) || 0;
        const debt = Math.max(0, total - numericPaid);

        return (
            <div className="space-y-6 pb-20">
                 <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-0 z-20">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Truck className="text-emerald-600" />
                            فاتورة مشتريات جديدة
                        </h1>
                    </div>
                    <button onClick={() => setView('list')} className="text-gray-500 hover:text-gray-800 font-medium text-sm px-4 py-2 hover:bg-gray-50 rounded-lg transition">
                        إلغاء والعودة
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Supplier & Date */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Truck size={16} className="text-gray-400" /> المورد
                                </label>
                                <select 
                                    className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={selectedSupplierId}
                                    onChange={e => setSelectedSupplierId(e.target.value)}
                                >
                                    <option value="">اختر المورد...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" /> تاريخ الفاتورة
                                </label>
                                <input 
                                    type="date" 
                                    className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={invoiceDate}
                                    onChange={e => setInvoiceDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Add Items */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <ShoppingCart size={18} className="text-emerald-600" />
                                بنود الفاتورة
                            </h3>
                            
                            <div className="flex flex-col md:flex-row gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">المنتج</label>
                                    <select 
                                        className="w-full p-2.5 border rounded-lg text-sm bg-white outline-none focus:border-emerald-500"
                                        value={tempProduct.id}
                                        onChange={e => {
                                            const p = products.find(x => x.id === e.target.value);
                                            setTempProduct({...tempProduct, id: e.target.value, cost: p?.cost || 0});
                                        }}
                                    >
                                        <option value="">اختر المنتج...</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="w-full md:w-32">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">الكمية</label>
                                    <input 
                                        type="number" className="w-full p-2.5 border rounded-lg text-sm text-center outline-none focus:border-emerald-500"
                                        value={tempProduct.qty === 0 ? '' : tempProduct.qty}
                                        onChange={e => setTempProduct({...tempProduct, qty: Number(e.target.value)})}
                                    />
                                </div>
                                <div className="w-full md:w-32">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">سعر التكلفة</label>
                                    <input 
                                        type="number" className="w-full p-2.5 border rounded-lg text-sm text-center outline-none focus:border-emerald-500"
                                        value={tempProduct.cost === 0 ? '' : tempProduct.cost}
                                        onChange={e => setTempProduct({...tempProduct, cost: Number(e.target.value)})}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button 
                                        onClick={addToCart}
                                        disabled={!tempProduct.id}
                                        className="bg-slate-800 text-white p-2.5 rounded-lg hover:bg-slate-900 disabled:opacity-50 transition w-full md:w-auto flex justify-center items-center"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Cart List */}
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {cartItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-emerald-50/50 transition group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{item.productName}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    <span className="font-medium text-gray-700">{item.quantity}</span> قطعة × <span className="font-medium text-gray-700">{item.costPrice}</span> {CURRENCY}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-gray-900">{item.quantity * item.costPrice} <span className="text-xs text-gray-400">{CURRENCY}</span></span>
                                            <button onClick={() => removeFromCart(idx)} className="text-gray-300 hover:text-red-500 transition p-1">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {cartItems.length === 0 && (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                                        <ShoppingCart className="mx-auto text-gray-300 mb-2" size={32} />
                                        <p className="text-gray-400 text-sm">لم يتم إضافة منتجات بعد</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Summary (Sticky) */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 lg:sticky lg:top-24">
                        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <DollarSign size={20} className="text-emerald-600" />
                            تفاصيل الدفع
                        </h3>
                        <div className="space-y-5 mb-8">
                            <div className="flex justify-between items-center text-lg font-bold p-4 bg-gray-50 rounded-xl">
                                <span className="text-gray-600">الإجمالي</span>
                                <span className="text-slate-900">{total.toLocaleString()} {CURRENCY}</span>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">المدفوع (من الخزينة)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        className="w-full p-3 border-2 border-emerald-100 rounded-xl font-bold text-lg text-emerald-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition"
                                        value={paidAmount}
                                        placeholder="0"
                                        onChange={e => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{CURRENCY}</span>
                                </div>
                            </div>

                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">طريقة الدفع</label>
                                <select 
                                    className="w-full p-3 border rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={selectedPaymentMethodId}
                                    onChange={e => setSelectedPaymentMethodId(e.target.value)}
                                >
                                    {paymentMethods.map(pm => (
                                        <option key={pm.id} value={pm.id}>{pm.name} (رصيد: {pm.balance})</option>
                                    ))}
                                </select>
                            </div>

                            {debt > 0 && (
                                <div className="bg-red-50 p-4 rounded-xl text-red-700 text-sm font-bold flex items-start gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <div>
                                        <p>مبلغ آجل (دين):</p>
                                        <p className="text-lg">{debt.toLocaleString()} {CURRENCY}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={handleSavePurchase}
                            disabled={cartItems.length === 0 || !selectedSupplierId || isSubmitting}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50 shadow-lg flex items-center justify-center gap-3 text-lg"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    <span>جاري الحفظ...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>حفظ الفاتورة</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // LIST VIEW
    return (
        <div className="space-y-6" onClick={() => setActiveMenuId(null)}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">سجل المشتريات</h1>
                    <p className="text-gray-500 text-sm font-medium">إدارة فواتير الموردين وتكاليف المخزون</p>
                </div>
                <button 
                    onClick={() => setView('create')}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 font-bold"
                >
                    <Plus size={20} />
                    <span>فاتورة جديدة</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="بحث برقم الفاتورة أو اسم المورد..." 
                        className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-gray-500">
                    <Filter size={20} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-right min-w-[800px]">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">رقم الفاتورة</th>
                                <th className="px-6 py-4">المورد</th>
                                <th className="px-6 py-4">التاريخ</th>
                                <th className="px-6 py-4 w-64">الأصناف (المنتجات)</th>
                                <th className="px-6 py-4">الإجمالي</th>
                                <th className="px-6 py-4">المدفوع</th>
                                <th className="px-6 py-4">الحالة</th>
                                <th className="px-6 py-4 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPurchases.length === 0 ? (
                                <tr><td colSpan={8} className="p-12 text-center text-gray-400">لا توجد فواتير مطابقة للبحث</td></tr>
                            ) : (
                                filteredPurchases.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition group">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500 bg-gray-50/30 rounded-r-lg group-hover:bg-slate-100/50 transition">
                                            #{p.id.slice(0, 8)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800 flex items-center gap-2">
                                                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                                    <Truck size={14} />
                                                </div>
                                                {p.supplierName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {new Date(p.date).toLocaleDateString('ar-MA', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                        </td>
                                        
                                        {/* Products Column */}
                                        <td className="px-6 py-4 align-middle">
                                            {renderProductSummary(p.items)}
                                        </td>

                                        <td className="px-6 py-4 font-black text-gray-900">{p.totalCost.toLocaleString()} <span className="text-xs font-normal text-gray-400">{CURRENCY}</span></td>
                                        <td className="px-6 py-4 text-emerald-600 font-bold">{p.paidAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            {p.totalCost - p.paidAmount > 0 ? (
                                                <span className="inline-flex items-center gap-1 text-red-700 font-bold bg-red-50 px-2.5 py-1 rounded-lg text-xs border border-red-100">
                                                    <AlertCircle size={12} />
                                                    متبقي: {(p.totalCost - p.paidAmount).toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg text-xs border border-emerald-100">
                                                    <DollarSign size={12} />
                                                    خالص
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center relative">
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setMenuPos({ top: rect.bottom, left: rect.left });
                                                    setActiveMenuId(activeMenuId === p.id ? null : p.id); 
                                                }}
                                                className="p-2 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition"
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

            {/* Floating Action Menu */}
            {activeMenuId && (
                <>
                <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)}></div>
                <div 
                    className="fixed z-50 w-48 bg-white rounded-xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
                    style={{ top: menuPos.top, left: menuPos.left - 150 }} // Adjusted left pos
                >
                    <div className="p-1">
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                const p = purchases.find(x => x.id === activeMenuId);
                                if(p) openEditModal(p);
                            }}
                            className="w-full text-right px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 flex items-center gap-3 rounded-lg transition font-medium"
                        >
                            <Edit2 size={16} className="text-slate-400" /> تعديل البيانات
                        </button>
                        <div className="h-px bg-gray-100 my-1"></div>
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                handleDeletePurchase(activeMenuId);
                            }}
                            className="w-full text-right px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 rounded-lg transition font-medium"
                        >
                            <Trash2 size={16} /> حذف الفاتورة
                        </button>
                    </div>
                </div>
                </>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && editingPurchase && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-gray-800">تعديل الفاتورة</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} className="text-gray-500" /></button>
                        </div>
                        
                        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-xs mb-6 border border-amber-100 leading-relaxed">
                            <strong className="block mb-1 text-sm">تنبيه هام:</strong>
                            لا يمكن تعديل المنتجات أو الكميات بعد الحفظ لضمان سلامة المخزون. إذا كان هناك خطأ في الكميات، يرجى حذف الفاتورة وإعادة إنشائها.
                        </div>

                        <form onSubmit={handleUpdatePurchase} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">المورد</label>
                                <select 
                                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-slate-500"
                                    value={editingPurchase.supplierId}
                                    onChange={(e) => setEditingPurchase({...editingPurchase, supplierId: e.target.value})}
                                >
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الفاتورة</label>
                                <input 
                                    type="date" 
                                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-slate-500"
                                    value={editingPurchase.date.split('T')[0]}
                                    onChange={(e) => setEditingPurchase({...editingPurchase, date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">المبلغ المدفوع (تعديل القيمة)</label>
                                <input 
                                    type="number" 
                                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-slate-500 font-bold text-slate-700"
                                    value={editingPurchase.paidAmount || ''}
                                    onChange={(e) => setEditingPurchase({...editingPurchase, paidAmount: Number(e.target.value)})}
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg mt-2"
                            >
                                حفظ التعديلات
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchases;
