
import React, { useState, useEffect, useRef } from 'react';
import { Truck, Plus, Trash2, Save, ShoppingCart, User, AlertCircle, Loader2, MoreVertical, Edit2, X } from 'lucide-react';
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

    if (view === 'create') {
        const total = calculateTotal();
        const numericPaid = Number(paidAmount) || 0;
        const debt = Math.max(0, total - numericPaid);

        return (
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">فاتورة مشتريات جديدة</h1>
                    <button onClick={() => setView('list')} className="text-gray-500 hover:text-gray-800">إلغاء</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Supplier & Date */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">المورد</label>
                                <select 
                                    className="w-full p-2.5 border rounded-lg bg-gray-50"
                                    value={selectedSupplierId}
                                    onChange={e => setSelectedSupplierId(e.target.value)}
                                >
                                    <option value="">اختر المورد...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الفاتورة</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2.5 border rounded-lg bg-gray-50"
                                    value={invoiceDate}
                                    onChange={e => setInvoiceDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Add Items */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <ShoppingCart size={20} className="text-emerald-600" />
                                المنتجات
                            </h3>
                            <div className="flex gap-2 mb-4 bg-gray-50 p-3 rounded-xl flex-wrap">
                                <select 
                                    className="flex-1 p-2 border rounded-lg text-sm min-w-[150px]"
                                    value={tempProduct.id}
                                    onChange={e => {
                                        const p = products.find(x => x.id === e.target.value);
                                        setTempProduct({...tempProduct, id: e.target.value, cost: p?.cost || 0});
                                    }}
                                >
                                    <option value="">اختر المنتج...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <input 
                                    type="number" placeholder="الكمية" className="w-20 p-2 border rounded-lg text-sm"
                                    value={tempProduct.qty === 0 ? '' : tempProduct.qty}
                                    onChange={e => setTempProduct({...tempProduct, qty: Number(e.target.value)})}
                                />
                                <input 
                                    type="number" placeholder="التكلفة" className="w-24 p-2 border rounded-lg text-sm"
                                    value={tempProduct.cost === 0 ? '' : tempProduct.cost}
                                    onChange={e => setTempProduct({...tempProduct, cost: Number(e.target.value)})}
                                />
                                <button 
                                    onClick={addToCart}
                                    disabled={!tempProduct.id}
                                    className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-900 disabled:opacity-50"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {/* Cart List */}
                            <div className="space-y-2">
                                {cartItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                                        <div>
                                            <p className="font-bold text-gray-800">{item.productName}</p>
                                            <p className="text-xs text-gray-500">{item.quantity} × {item.costPrice} {CURRENCY}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold">{item.quantity * item.costPrice} {CURRENCY}</span>
                                            <button onClick={() => removeFromCart(idx)} className="text-red-500"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                                {cartItems.length === 0 && <p className="text-center text-gray-400 text-sm">لم يتم إضافة منتجات بعد</p>}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Summary */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                        <h3 className="font-bold text-gray-800 mb-6">ملخص الفاتورة</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-lg font-bold">
                                <span>الإجمالي</span>
                                <span>{total} {CURRENCY}</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">المدفوع الآن</label>
                                <input 
                                    type="number" 
                                    className="w-full p-3 border rounded-lg font-bold text-emerald-700"
                                    value={paidAmount}
                                    placeholder="0"
                                    onChange={e => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
                                <select 
                                    className="w-full p-2.5 border rounded-lg bg-gray-50"
                                    value={selectedPaymentMethodId}
                                    onChange={e => setSelectedPaymentMethodId(e.target.value)}
                                >
                                    {paymentMethods.map(pm => (
                                        <option key={pm.id} value={pm.id}>{pm.name} (رصيد: {pm.balance})</option>
                                    ))}
                                </select>
                            </div>
                            {debt > 0 && (
                                <div className="bg-red-50 p-3 rounded-lg text-red-700 text-sm font-bold flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    سيتم تسجيل دين: {debt} {CURRENCY}
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={handleSavePurchase}
                            disabled={cartItems.length === 0 || !selectedSupplierId || isSubmitting}
                            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">سجل المشتريات</h1>
                    <p className="text-gray-500 text-sm">إدارة فواتير الموردين وتكاليف المخزون</p>
                </div>
                <button 
                    onClick={() => setView('create')}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition shadow-sm"
                >
                    <Plus size={20} />
                    <span>فاتورة جديدة</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto min-h-[400px]">
                <table className="w-full text-right min-w-[700px]">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">رقم الفاتورة</th>
                            <th className="px-6 py-4">المورد</th>
                            <th className="px-6 py-4">التاريخ</th>
                            <th className="px-6 py-4">إجمالي التكلفة</th>
                            <th className="px-6 py-4">المدفوع</th>
                            <th className="px-6 py-4">الدين</th>
                            <th className="px-6 py-4">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {purchases.length === 0 ? (
                            <tr><td colSpan={7} className="p-8 text-center text-gray-400">لا توجد مشتريات مسجلة</td></tr>
                        ) : (
                            purchases.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 relative group">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-2">
                                        <Truck size={16} className="text-gray-400" />
                                        {p.supplierName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                        {new Date(p.date).toLocaleDateString('ar-MA', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 font-bold">{p.totalCost} {CURRENCY}</td>
                                    <td className="px-6 py-4 text-emerald-600">{p.paidAmount}</td>
                                    <td className="px-6 py-4">
                                        {p.totalCost - p.paidAmount > 0 ? (
                                            <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">
                                                {p.totalCost - p.paidAmount}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">خالص</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setMenuPos({ top: rect.bottom, left: rect.left });
                                                setActiveMenuId(activeMenuId === p.id ? null : p.id); 
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition"
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

            {/* Floating Action Menu */}
            {activeMenuId && (
                <>
                <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)}></div>
                <div 
                    className="fixed z-50 w-40 bg-white rounded-lg shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
                    style={{ top: menuPos.top, left: menuPos.left }}
                >
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            const p = purchases.find(x => x.id === activeMenuId);
                            if(p) openEditModal(p);
                        }}
                        className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Edit2 size={14} /> تعديل
                    </button>
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            handleDeletePurchase(activeMenuId);
                        }}
                        className="w-full text-right px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                    >
                        <Trash2 size={14} /> حذف
                    </button>
                </div>
                </>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && editingPurchase && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800">تعديل الفاتورة</h3>
                            <button onClick={() => setIsEditModalOpen(false)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        
                        <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-xs mb-4">
                            تنبيه: لا يمكن تعديل المنتجات أو الكميات بعد الحفظ لضمان سلامة المخزون. إذا كان هناك خطأ في الكميات، يرجى حذف الفاتورة وإعادة إنشائها.
                        </div>

                        <form onSubmit={handleUpdatePurchase} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">المورد</label>
                                <select 
                                    className="w-full p-2 border rounded-lg"
                                    value={editingPurchase.supplierId}
                                    onChange={(e) => setEditingPurchase({...editingPurchase, supplierId: e.target.value})}
                                >
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الفاتورة</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2 border rounded-lg"
                                    value={editingPurchase.date.split('T')[0]}
                                    onChange={(e) => setEditingPurchase({...editingPurchase, date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ المدفوع (تعديل القيمة)</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border rounded-lg"
                                    value={editingPurchase.paidAmount || ''}
                                    onChange={(e) => setEditingPurchase({...editingPurchase, paidAmount: Number(e.target.value)})}
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-900"
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
