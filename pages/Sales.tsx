
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, Printer, CreditCard, CheckCircle, ShoppingBag, User, Banknote, X, PackagePlus, Wallet, Calendar, AlertCircle, History, FileDown, ChevronDown, ChevronUp, Eye, Loader2, MoreVertical, Edit2, FileText, Phone, Clock } from 'lucide-react';
import { CURRENCY } from '../constants';
import { Product, SaleItem, PaymentMethod, Client, Invoice, ProductCategory } from '../types';
import { getProducts, createInvoice, getPaymentMethods, ensurePaymentMethodsExist, getClients, getInvoices, getProductCategories, deleteInvoice, updateInvoice } from '../services/db';
import { useAuth } from '../context/AuthContext';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const Sales: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [clients, setClients] = useState<Client[]>([]); 
  const [invoices, setInvoices] = useState<Invoice[]>([]); // Invoice History
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // History UI State
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [exportingHistory, setExportingHistory] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 }); // Position for fixed menu
  const menuRef = useRef<HTMLDivElement>(null);

  // Edit Invoice State
  const [isEditInvoiceModalOpen, setIsEditInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // View Details Invoice State
  const [viewDetailsInvoice, setViewDetailsInvoice] = useState<Invoice | null>(null);

  // Checkout & Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'input' | 'processing' | 'success'>('input');
  
  // Payment Details
  const [paymentDetails, setPaymentDetails] = useState({
    customerName: 'عميل افتراضي', 
    invoiceDate: new Date().toISOString().split('T')[0], 
    discount: 0,
    amountPaid: 0,
    paymentMethodId: ''
  });

  // Client Autocomplete State
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const clientInputRef = useRef<HTMLDivElement>(null);

  // Custom Item State
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState(false);
  const [customItem, setCustomItem] = useState({ name: '', price: 0, quantity: 1 });

  const loadData = async () => {
      if (!user) return;
      const [prodData, catData, pmData, cliData, invData] = await Promise.all([
          getProducts(user.id),
          getProductCategories(user.id),
          getPaymentMethods(user.id),
          getClients(user.id),
          getInvoices(user.id)
      ]);
      setProducts(prodData);
      setCategories(catData);
      setClients(cliData);
      
      const salesInvoices = invData.filter(inv => 
          !inv.items.some(item => item.productId === 'opening-bal')
      );
      
      setInvoices(salesInvoices.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      
      if(pmData.length === 0) {
          await ensurePaymentMethodsExist(user.id);
          const newPmData = await getPaymentMethods(user.id);
          setPaymentMethods(newPmData);
          const defaultMethod = newPmData.find(m => m.isDefault) || newPmData[0];
          setPaymentDetails(prev => ({...prev, paymentMethodId: defaultMethod?.id || ''}));
      } else {
          setPaymentMethods(pmData);
          const defaultMethod = pmData.find(m => m.isDefault) || pmData[0];
          setPaymentDetails(prev => ({...prev, paymentMethodId: defaultMethod?.id || ''}));
      }
  };

  useEffect(() => {
    loadData();
    const handleClickOutside = (event: MouseEvent) => {
        if (clientInputRef.current && !clientInputRef.current.contains(event.target as Node)) {
            setShowClientSuggestions(false);
        }
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

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
        alert("عذراً، هذا المنتج نفد من المخزون.");
        return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
             alert("لا توجد كمية كافية في المخزون.");
             return prev;
        }
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, quantity: 1, priceAtSale: product.price, productName: product.name }];
    });
  };

  const addCustomItemToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItem.name || customItem.price <= 0) return;
    const newItem: SaleItem = {
        productId: `custom-${Date.now()}`,
        productName: customItem.name,
        priceAtSale: customItem.price,
        quantity: customItem.quantity
    };
    setCart(prev => [...prev, newItem]);
    setIsCustomItemModalOpen(false);
    setCustomItem({ name: '', price: 0, quantity: 1 });
  };

  const updateQuantity = (productId: string, delta: number) => {
    const isCustom = productId.startsWith('custom-');
    const product = products.find(p => p.id === productId);
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (!isCustom && product && newQty > product.stock) {
            alert("لا توجد كمية كافية في المخزون.");
            return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updatePrice = (productId: string, newPrice: number) => {
      setCart(prev => prev.map(item => 
          item.productId === productId ? { ...item, priceAtSale: newPrice } : item
      ));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + (item.quantity * item.priceAtSale), 0);
  const calculateTotal = () => Math.max(0, calculateSubtotal() - paymentDetails.discount);
  const calculateRemaining = () => paymentDetails.amountPaid - calculateTotal();
  const isDebt = () => calculateRemaining() < 0;

  const openPaymentModal = () => {
      if (cart.length === 0) return;
      const total = calculateTotal();
      const defaultPm = paymentMethods.find(m => m.isDefault) || paymentMethods[0];
      setPaymentDetails(prev => ({
          ...prev,
          discount: 0,
          amountPaid: total,
          paymentMethodId: defaultPm?.id || '',
          customerName: 'عميل افتراضي'
      }));
      setCheckoutStep('input');
      setIsPaymentModalOpen(true);
  };

  const handleFinalizeCheckout = async () => {
    if (!user) return;
    if (isDebt() && !paymentDetails.customerName.trim()) {
        alert("يجب تحديد اسم العميل لتسجيل الدين عليه.");
        return;
    }
    setCheckoutStep('processing');
    try {
        await createInvoice(
            user.id, 
            cart, 
            calculateTotal(), 
            paymentDetails.amountPaid,
            paymentDetails.customerName,
            paymentDetails.paymentMethodId,
            paymentDetails.invoiceDate
        );
        setCheckoutStep('success');
        loadData(); 
        setTimeout(() => {
            setIsPaymentModalOpen(false);
            setCart([]);
            setCheckoutStep('input');
            setPaymentDetails(prev => ({...prev, customerName: 'عميل افتراضي', amountPaid: 0}));
        }, 2000);
    } catch (error) {
        console.error("Checkout failed", error);
        alert("حدث خطأ أثناء عملية الدفع");
        setCheckoutStep('input');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
      if(window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟ سيتم إرجاع المنتجات للمخزون وإلغاء أي ديون مسجلة.')) {
          try {
              await deleteInvoice(id);
              loadData();
              setActiveMenuId(null);
              setViewDetailsInvoice(null);
          } catch (error) {
              console.error(error);
              alert("حدث خطأ أثناء حذف الفاتورة.");
          }
      }
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!editingInvoice) return;
      setIsUpdating(true);
      try {
          await updateInvoice(editingInvoice);
          setIsEditInvoiceModalOpen(false);
          setEditingInvoice(null);
          loadData();
      } catch (error) {
          alert("فشل تحديث الفاتورة");
      } finally {
          setIsUpdating(false);
      }
  };

  const openEditInvoiceModal = (inv: Invoice) => {
      setEditingInvoice(inv);
      setIsEditInvoiceModalOpen(true);
      setActiveMenuId(null);
  };

  const handleExportPDF = () => {
    setExportingHistory(true);
    const wasShowingAll = showAllHistory;
    setShowAllHistory(true);

    setTimeout(() => {
        const element = document.getElementById('sales-history-container');
        const opt = {
            margin: 0.5,
            filename: `سجل_المبيعات_${user?.storeName}_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            setExportingHistory(false);
            setShowAllHistory(wasShowingAll); 
        });
    }, 800); 
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.includes(searchTerm) || p.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return p.category !== 'RawMaterial' && matchesSearch && matchesCategory;
  });
  
  const filteredClients = clients.filter(c => 
     c.name.toLowerCase().includes(paymentDetails.customerName.toLowerCase())
  );

  const displayedInvoices = showAllHistory ? invoices : invoices.slice(0, 7);
  const activeInvoice = invoices.find(i => i.id === activeMenuId);

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto min-h-screen pb-10">
      
      {/* POS UI */}
      <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-8rem)] relative shrink-0 no-print">
        
        {/* Product Browser */}
        <div className="lg:w-2/3 flex flex-col gap-4 h-[500px] lg:h-full">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between shrink-0">
            <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                type="text" 
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-slate-700 border-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white transition-all outline-none"
                placeholder="بحث باسم المنتج أو الباركود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setIsCustomItemModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition font-medium whitespace-nowrap"
            >
                <PackagePlus size={20} />
                <span>منتج يدوي</span>
            </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0 snap-x">
                <button 
                    onClick={() => setSelectedCategory('All')}
                    className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all snap-start min-w-[80px] ${
                        selectedCategory === 'All' 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none' 
                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                    }`}
                >
                    الكل
                </button>
                {categories.map((cat) => (
                    <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all snap-start min-w-[100px] ${
                            selectedCategory === cat.id 
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none' 
                            : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col min-h-0">
                <div className="overflow-y-auto flex-1 h-full">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 dark:bg-slate-700/50 sticky top-0 z-10 border-b border-gray-100 dark:border-slate-700 shadow-sm">
                            <tr>
                                <th className="px-5 py-4 text-xs font-bold text-gray-500 dark:text-slate-400">المنتج</th>
                                <th className="px-5 py-4 text-xs font-bold text-gray-500 dark:text-slate-400">السعر</th>
                                <th className="px-5 py-4 text-xs font-bold text-gray-500 dark:text-slate-400">المخزون</th>
                                <th className="px-5 py-4 text-xs font-bold text-gray-500 dark:text-slate-400">إضافة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                            {filteredProducts.map(product => (
                                <tr 
                                    key={product.id} 
                                    className="hover:bg-emerald-50/60 dark:hover:bg-emerald-900/10 transition cursor-pointer group" 
                                    onClick={() => addToCart(product)}
                                >
                                    <td className="px-5 py-4">
                                        <div className="font-bold text-gray-800 dark:text-slate-200 text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">{product.name}</div>
                                        <div className="text-xs text-gray-400 font-mono mt-0.5">{product.barcode}</div>
                                    </td>
                                    <td className="px-5 py-4 font-bold text-emerald-600 dark:text-emerald-400 text-sm">{product.price} {CURRENCY}</td>
                                    <td className="px-5 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${product.stock < 5 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'}`}>{product.stock}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <button 
                                            className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition shadow-sm"
                                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Cart */}
        <div className="lg:w-1/3 flex flex-col h-[500px] lg:h-full bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30 flex justify-between items-center shrink-0">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="text-emerald-600 dark:text-emerald-400" size={20} />
                    سلة المبيعات
                </h2>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-full">{cart.length} عناصر</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <ShoppingBag size={32} className="opacity-30 mb-2" />
                    <p className="font-medium text-sm">السلة فارغة</p>
                </div>
            ) : (
                cart.map(item => (
                    <div key={item.productId} className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-600">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="font-bold text-gray-800 dark:text-white text-sm line-clamp-1">{item.productName}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-xs text-gray-500 dark:text-slate-400">السعر:</span>
                                    <input 
                                        type="number" 
                                        className="w-20 px-2 py-0.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded focus:border-emerald-500 outline-none"
                                        value={item.priceAtSale || ''}
                                        onChange={(e) => updatePrice(item.productId, Number(e.target.value))}
                                    />
                                    <span className="text-[10px] text-gray-400">{CURRENCY}</span>
                                </div>
                            </div>
                            <button onClick={() => removeFromCart(item.productId)} className="text-gray-400 hover:text-red-500 transition p-1"><Trash2 size={16} /></button>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center bg-white dark:bg-slate-600 rounded-lg border border-gray-200 dark:border-slate-500 shadow-sm h-8 overflow-hidden">
                                <button onClick={() => updateQuantity(item.productId, 1)} className="w-8 h-full flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-l dark:border-slate-500">+</button>
                                <span className="w-8 text-center font-bold text-sm text-gray-800 dark:text-white h-full flex items-center justify-center bg-gray-50 dark:bg-slate-700">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.productId, -1)} className="w-8 h-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 border-r dark:border-slate-500">-</button>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white text-sm">{item.priceAtSale * item.quantity} {CURRENCY}</span>
                        </div>
                    </div>
                ))
            )}
            </div>

            <div className="p-5 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 shadow-[0_-5px_15px_rgba(0,0,0,0.02)] shrink-0 z-20">
                <div className="space-y-3 mb-5">
                    <div className="flex justify-between items-center text-gray-500 dark:text-slate-400 text-sm">
                        <span>المجموع الفرعي</span>
                        <span className="font-medium">{calculateSubtotal()} {CURRENCY}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-extrabold text-gray-900 dark:text-white">
                        <span>الإجمالي</span>
                        <span className="text-emerald-600 dark:text-emerald-400">{calculateSubtotal()} {CURRENCY}</span>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    <button disabled={cart.length === 0} className="col-span-1 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition disabled:opacity-50">
                        <Printer size={20} />
                    </button>
                    <button 
                        onClick={openPaymentModal}
                        disabled={cart.length === 0}
                        className="col-span-3 flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-bold hover:bg-slate-800 dark:hover:bg-emerald-700 shadow-lg transition disabled:opacity-50 active:scale-[0.98]"
                    >
                        <CreditCard size={20} />
                        <span>إكمال</span>
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* SALES HISTORY - PDF OPTIMIZED */}
      <div id="sales-history-container" className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 min-h-[300px] pdf-container">
        <div className="flex justify-between items-center mb-8 no-print">
            <h3 className="font-bold text-gray-800 dark:text-white text-lg flex items-center gap-2">
                <History className="text-slate-500 dark:text-slate-400" />
                سجل المبيعات
            </h3>
            <button 
                onClick={handleExportPDF}
                disabled={exportingHistory}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 px-4 py-2.5 rounded-xl transition border border-slate-200 dark:border-slate-600 disabled:opacity-70 font-bold"
            >
                {exportingHistory ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
                تصدير السجل PDF
            </button>
        </div>

        {/* PDF Header - Visible only in Print/PDF */}
        <div className="hidden print:flex pdf-header flex-col items-center mb-10 border-b-2 border-emerald-500 pb-6 text-center">
             <div className="text-3xl font-black text-slate-900 mb-2">{user?.storeName}</div>
             <div className="text-xl font-bold text-emerald-600 mb-2">سجل المبيعات والتوريد</div>
             <p className="text-sm text-gray-500 font-medium">الفترة: {showAllHistory ? 'كامل السجل' : 'آخر العمليات'} | تاريخ التقرير: {new Date().toLocaleDateString('ar-MA')}</p>
        </div>

        <div className="overflow-x-auto"> 
            <table className="w-full text-right table-auto border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 text-xs uppercase font-bold">
                    <tr>
                        <th className="px-6 py-4 border-b">التاريخ</th>
                        <th className="px-6 py-4 border-b">رقم الفاتورة</th>
                        <th className="px-6 py-4 border-b">العميل</th>
                        <th className="px-6 py-4 border-b">الأصناف</th>
                        <th className="px-6 py-4 border-b">الإجمالي</th>
                        <th className="px-6 py-4 border-b">المدفوع</th>
                        <th className="px-6 py-4 border-b">الحالة</th>
                        <th className="px-6 py-4 border-b no-print">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {displayedInvoices.length === 0 ? (
                        <tr><td colSpan={8} className="p-12 text-center text-gray-400 font-bold">لا توجد مبيعات مسجلة</td></tr>
                    ) : (
                        displayedInvoices.map(inv => (
                            <tr 
                                key={inv.id} 
                                className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition cursor-pointer"
                                onClick={() => setViewDetailsInvoice(inv)}
                            >
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300 font-mono">{new Date(inv.date).toLocaleDateString('ar-MA')}</td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-400">#{inv.id.slice(-6).toUpperCase()}</td>
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">{inv.customerName}</td>
                                <td className="px-6 py-4">
                                    <div className="text-xs text-gray-600 dark:text-slate-300 line-clamp-1">
                                        {inv.items.map(i => i.productName).join('، ')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-black text-emerald-600 dark:text-emerald-400">{inv.total} {CURRENCY}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300 font-bold">{inv.paidAmount}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                        inv.remainingAmount > 0 
                                        ? 'bg-red-50 text-red-600 border border-red-100' 
                                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    }`}>
                                        {inv.remainingAmount > 0 ? 'آجل' : 'مكتمل'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 no-print" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                        onClick={(e) => { 
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setMenuPos({ top: rect.bottom, left: rect.left });
                                            setActiveMenuId(activeMenuId === inv.id ? null : inv.id); 
                                        }}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-400"
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

        {invoices.length > 7 && (
            <div className="mt-8 flex justify-center border-t border-gray-100 dark:border-slate-700 pt-6 no-print">
                <button 
                    onClick={() => setShowAllHistory(!showAllHistory)}
                    className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 text-sm font-black transition-all"
                >
                    {showAllHistory ? (
                        <><span>طي السجل</span><ChevronUp size={16} /></>
                    ) : (
                        <><span>عرض كل المبيعات ({invoices.length})</span><ChevronDown size={16} /></>
                    )}
                </button>
            </div>
        )}

        {/* PDF Footer - Visible only in Print/PDF */}
        <div className="hidden print:block mt-20 border-t pt-6 text-center text-xs text-gray-400 font-bold">
            تم استخراج هذا التقرير آلياً بواسطة نظام بوصلة للمحاسبة الذكية © 2025
        </div>
      </div>

      {/* Floating Action Menu */}
      {activeMenuId && activeInvoice && (
          <div 
            ref={menuRef}
            className="fixed z-50 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 animate-in zoom-in-95 duration-200 no-print"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
               <button onClick={() => openEditInvoiceModal(activeInvoice)} className="w-full text-right px-4 py-3 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 flex items-center gap-2 transition font-bold"><Edit2 size={14} /> تعديل</button>
               <button onClick={() => handleDeleteInvoice(activeInvoice.id)} className="w-full text-right px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-xl transition font-bold"><Trash2 size={14} /> حذف</button>
          </div>
      )}

      {/* MODALS (Input and Details) */}
      {isPaymentModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
              <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                  <div className="bg-gray-50 dark:bg-slate-700/50 p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                          <Banknote className="text-emerald-600" />
                          تفاصيل الدفع
                      </h3>
                      <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-800 p-1"><X size={24} /></button>
                  </div>

                  {checkoutStep === 'success' ? (
                      <div className="p-12 flex flex-col items-center text-center">
                          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce"><CheckCircle size={48} /></div>
                          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">تمت العملية بنجاح!</h2>
                          <p className="text-gray-500 font-medium">تم تسجيل الفاتورة وتحديث المخزون والمالية.</p>
                      </div>
                  ) : (
                      <div className="p-6 space-y-6">
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 text-center border border-emerald-100 dark:border-emerald-800">
                              <p className="text-emerald-700 dark:text-emerald-400 text-sm font-black mb-1">المبلغ الإجمالي</p>
                              <p className="text-4xl font-black text-emerald-800 dark:text-emerald-300 tracking-tight">{calculateTotal()} <span className="text-lg font-bold">{CURRENCY}</span></p>
                          </div>

                          <div className="space-y-4">
                              <div className="relative" ref={clientInputRef}>
                                  <label className="text-xs font-black text-gray-400 uppercase mb-1 block pr-1">اسم العميل</label>
                                  <input 
                                        type="text" 
                                        placeholder="بحث أو إدخال اسم عميل جديد..."
                                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                                        value={paymentDetails.customerName}
                                        onFocus={() => setShowClientSuggestions(true)}
                                        onChange={(e) => {
                                            setPaymentDetails({...paymentDetails, customerName: e.target.value});
                                            setShowClientSuggestions(true);
                                        }}
                                    />
                                  {showClientSuggestions && filteredClients.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-gray-100 rounded-xl shadow-2xl z-50 max-h-40 overflow-y-auto">
                                        {filteredClients.map(client => (
                                            <button key={client.id} className="w-full text-right px-4 py-3 hover:bg-emerald-50 text-sm font-bold flex justify-between items-center border-b last:border-0"
                                                onClick={() => { setPaymentDetails({...paymentDetails, customerName: client.name}); setShowClientSuggestions(false); }}>
                                                <span>{client.name}</span>
                                                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{client.phone}</span>
                                            </button>
                                        ))}
                                    </div>
                                  )}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-xs font-black text-gray-400 uppercase mb-1 block pr-1">خصم</label>
                                      <input type="number" className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-center"
                                          value={paymentDetails.discount === 0 ? '' : paymentDetails.discount} placeholder="0"
                                          onChange={(e) => setPaymentDetails({...paymentDetails, discount: Number(e.target.value)})}
                                      />
                                  </div>
                                  <div>
                                      <label className="text-xs font-black text-gray-400 uppercase mb-1 block pr-1">المدفوع</label>
                                      <input type="number" className="w-full p-4 rounded-xl border-2 border-emerald-500 bg-white dark:bg-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-100 outline-none font-black text-center text-lg"
                                          value={paymentDetails.amountPaid === 0 ? '' : paymentDetails.amountPaid} placeholder="0"
                                          onChange={(e) => setPaymentDetails({...paymentDetails, amountPaid: Number(e.target.value)})}
                                      />
                                  </div>
                              </div>
                              <div className={`flex justify-between items-center p-4 rounded-xl ${isDebt() ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                  <span className="font-black text-sm">{isDebt() ? 'المتبقي (دين):' : 'الباقي (للعميل):'}</span>
                                  <span className="text-xl font-black">{Math.abs(calculateRemaining())} {CURRENCY}</span>
                              </div>
                          </div>
                          <button 
                              onClick={handleFinalizeCheckout}
                              disabled={checkoutStep === 'processing'}
                              className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-black text-xl hover:bg-emerald-700 shadow-xl transition transform active:scale-[0.98] disabled:opacity-50"
                          >
                              {checkoutStep === 'processing' ? 'جاري التنفيذ...' : 'تأكيد العملية'}
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}
      
      {/* Invoice Details Modal */}
      {viewDetailsInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 no-print">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-700/30">
                    <h3 className="font-black text-lg text-gray-800 dark:text-white flex items-center gap-2">
                        <FileText className="text-emerald-600" size={20} />
                        عرض الفاتورة
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="p-2 hover:bg-white rounded-full text-gray-500 transition"><Printer size={18} /></button>
                        <button onClick={() => setViewDetailsInvoice(null)} className="p-2 hover:bg-white rounded-full text-gray-500 transition"><X size={20} /></button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">رقم الفاتورة</p>
                            <p className="font-mono font-black text-gray-900 dark:text-white text-xl">#{viewDetailsInvoice.id.slice(-6).toUpperCase()}</p>
                        </div>
                        <div className="text-left">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                viewDetailsInvoice.remainingAmount > 0 
                                ? 'bg-red-50 text-red-600 border-red-100' 
                                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}>
                                {viewDetailsInvoice.remainingAmount > 0 ? 'غير مكتملة' : 'مدفوعة'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">العميل</p>
                            <p className="font-black text-gray-800 dark:text-white">{viewDetailsInvoice.customerName}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">التاريخ</p>
                            <p className="font-black text-gray-800 dark:text-white">{new Date(viewDetailsInvoice.date).toLocaleDateString('ar-MA')}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShoppingBag size={14} /> المنتجات المباعة
                        </h4>
                        <div className="space-y-3">
                            {viewDetailsInvoice.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl">
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white">{item.productName}</p>
                                        <p className="text-[10px] text-gray-400 font-bold mt-1">{item.quantity} × {item.priceAtSale} {CURRENCY}</p>
                                    </div>
                                    <p className="font-black text-gray-900 dark:text-white">{item.quantity * item.priceAtSale}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t-2 border-dashed border-gray-200 dark:border-slate-600 pt-6 space-y-3">
                        <div className="flex justify-between items-center text-gray-500 font-bold">
                            <span>المجموع الكلي</span>
                            <span className="text-xl font-black text-gray-900 dark:text-white">{viewDetailsInvoice.total.toLocaleString()} {CURRENCY}</span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-600 font-black">
                            <span>المدفوع</span>
                            <span>{viewDetailsInvoice.paidAmount.toLocaleString()} {CURRENCY}</span>
                        </div>
                        {viewDetailsInvoice.remainingAmount > 0 && (
                            <div className="flex justify-between items-center text-red-600 bg-red-50 p-3 rounded-xl font-black mt-2">
                                <span>المتبقي (دين)</span>
                                <span>{viewDetailsInvoice.remainingAmount.toLocaleString()} {CURRENCY}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
