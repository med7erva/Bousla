
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
      
      // Filter out Opening Balance invoices from Sales History
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
    
    // Close menu on scroll to prevent detached floating menu
    const handleScroll = () => setActiveMenuId(null);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true); 
    
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
    };
  }, [user]);

  // --- Cart Actions ---
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

  // --- Calculations ---
  const calculateSubtotal = () => cart.reduce((sum, item) => sum + (item.quantity * item.priceAtSale), 0);
  const calculateTotal = () => Math.max(0, calculateSubtotal() - paymentDetails.discount);
  const calculateRemaining = () => paymentDetails.amountPaid - calculateTotal();
  const isDebt = () => calculateRemaining() < 0;

  // --- Checkout Process ---
  const openPaymentModal = () => {
      if (cart.length === 0) return;
      const total = calculateTotal();
      const defaultPm = paymentMethods.find(m => m.isDefault) || paymentMethods[0];
      setPaymentDetails(prev => ({
          ...prev,
          discount: 0,
          amountPaid: total,
          paymentMethodId: defaultPm?.id || '',
          customerName: 'عميل افتراضي' // Reset to default on new sale
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
        loadData(); // Refresh history
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

  // --- Invoice Actions ---
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
    // Force showing all history for the PDF
    const wasShowingAll = showAllHistory;
    setShowAllHistory(true);

    setTimeout(() => {
        const element = document.getElementById('sales-history-container');
        const opt = {
            margin: 0.5,
            filename: `سجل_المبيعات_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            setExportingHistory(false);
            setShowAllHistory(wasShowingAll); // Restore state
        });
    }, 500); // Delay to allow render
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.includes(searchTerm) || p.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return p.category !== 'RawMaterial' && matchesSearch && matchesCategory;
  });
  
  const filteredClients = clients.filter(c => 
     c.name.toLowerCase().includes(paymentDetails.customerName.toLowerCase())
  );

  // History Slice
  const displayedInvoices = showAllHistory ? invoices : invoices.slice(0, 7);

  // Find active invoice for menu
  const activeInvoice = invoices.find(i => i.id === activeMenuId);

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto min-h-screen pb-10">
      
      {/* --- TOP SECTION: POS & CART --- */}
      <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-8rem)] relative shrink-0">
        
        {/* Left Side: Product Browser */}
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

            {/* Category Filter */}
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

        {/* Right Side: Cart & Checkout */}
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
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className="w-20 px-2 py-0.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                            value={item.priceAtSale || ''}
                                            placeholder="0"
                                            onChange={(e) => updatePrice(item.productId, Number(e.target.value))}
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </div>
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
                        className="col-span-3 flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-bold hover:bg-slate-800 dark:hover:bg-emerald-700 shadow-lg shadow-slate-200 dark:shadow-none transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                        <CreditCard size={20} />
                        <span>إكمال</span>
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: SALES HISTORY --- */}
      <div id="sales-history-container" className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 min-h-[300px]">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 dark:text-white text-lg flex items-center gap-2">
                <History className="text-slate-500 dark:text-slate-400" />
                سجل المبيعات الأخيرة
            </h3>
            <button 
                onClick={handleExportPDF}
                disabled={exportingHistory}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 px-3 py-2 rounded-lg transition border border-slate-200 dark:border-slate-600 disabled:opacity-70"
                data-html2canvas-ignore="true" 
            >
                {exportingHistory ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
                تصدير PDF
            </button>
        </div>

        {/* Hidden Header for PDF only */}
        <div className="hidden pdf-header-sales mb-4 border-b pb-2">
             <h2 className="text-xl font-bold">سجل المبيعات - {user?.storeName}</h2>
             <p className="text-sm text-gray-500">تاريخ الطباعة: {new Date().toLocaleDateString('ar-MA')}</p>
        </div>

        <div className="overflow-x-auto"> 
            <table className="w-full text-right">
                <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-4 rounded-r-xl">رقم الفاتورة</th>
                        <th className="px-6 py-4">التاريخ</th>
                        <th className="px-6 py-4">العميل</th>
                        <th className="px-6 py-4">العناصر</th>
                        <th className="px-6 py-4">الإجمالي</th>
                        <th className="px-6 py-4">المدفوع</th>
                        <th className="px-6 py-4">الحالة</th>
                        <th className="px-6 py-4 rounded-l-xl" data-html2canvas-ignore="true">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {displayedInvoices.length === 0 ? (
                        <tr><td colSpan={8} className="p-8 text-center text-gray-400">لا توجد مبيعات مسجلة حتى الآن</td></tr>
                    ) : (
                        displayedInvoices.map(inv => (
                            <tr 
                                key={inv.id} 
                                className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition group relative cursor-pointer"
                                onClick={() => setViewDetailsInvoice(inv)}
                            >
                                <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-slate-400">{inv.id.slice(-6)}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">{new Date(inv.date).toLocaleDateString('ar-MA')}</td>
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">{inv.customerName}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-0.5 max-w-[200px]">
                                        {inv.items.slice(0, 2).map((item, idx) => (
                                            <div key={idx} className="text-sm font-bold text-gray-700 dark:text-slate-200 truncate" title={item.productName}>
                                                {item.productName} 
                                                {item.quantity > 1 && <span className="text-xs text-gray-400 dark:text-slate-500 mr-1">x{item.quantity}</span>}
                                            </div>
                                        ))}
                                        {inv.items.length > 2 && (
                                            <span className="text-[10px] text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md w-fit font-bold">
                                                +{inv.items.length - 2} أصناف أخرى
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">{inv.total} {CURRENCY}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">{inv.paidAmount}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        inv.remainingAmount > 0 
                                        ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    }`}>
                                        {inv.remainingAmount > 0 ? 'آجل' : 'مكتمل'}
                                    </span>
                                </td>
                                <td className="px-6 py-4" data-html2canvas-ignore="true">
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setMenuPos({ top: rect.bottom, left: rect.left });
                                            setActiveMenuId(activeMenuId === inv.id ? null : inv.id); 
                                        }}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-slate-400 transition"
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
            <div className="mt-4 flex justify-center border-t border-gray-100 dark:border-slate-700 pt-4" data-html2canvas-ignore="true">
                <button 
                    onClick={() => setShowAllHistory(!showAllHistory)}
                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium transition"
                >
                    {showAllHistory ? (
                        <>
                            <span>إخفاء السجل الكامل</span>
                            <ChevronUp size={16} />
                        </>
                    ) : (
                        <>
                            <span>عرض المزيد ({invoices.length - 7})</span>
                            <ChevronDown size={16} />
                        </>
                    )}
                </button>
            </div>
        )}
      </div>

      {/* Floating Action Menu (Portal-like) */}
      {activeMenuId && activeInvoice && (
          <div 
            ref={menuRef}
            className="fixed z-50 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
               <button 
                    onClick={(e) => { e.preventDefault(); openEditInvoiceModal(activeInvoice); }}
                    className="w-full text-right px-4 py-3 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                    <Edit2 size={14} /> تعديل
                </button>
                <button 
                    onClick={(e) => { e.preventDefault(); handleDeleteInvoice(activeInvoice.id); }}
                    className="w-full text-right px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 rounded-b-lg"
                >
                    <Trash2 size={14} /> حذف
                </button>
          </div>
      )}

      <style>{`
         .pdf-header-sales { display: none; }
         .html2pdf__page-break { page-break-before: always; }
      `}</style>

      {/* --- MODALS --- */}
      {isPaymentModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                  <div className="bg-gray-50 dark:bg-slate-700/50 p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                          <Banknote className="text-emerald-600 dark:text-emerald-400" />
                          تفاصيل الدفع
                      </h3>
                      <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-800 dark:hover:text-white"><X size={24} /></button>
                  </div>

                  {checkoutStep === 'success' ? (
                      <div className="p-10 flex flex-col items-center text-center text-gray-800 dark:text-white">
                          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 animate-bounce">
                              <CheckCircle size={40} />
                          </div>
                          <h2 className="text-2xl font-bold mb-2">تمت العملية بنجاح!</h2>
                          <p className="text-gray-500 dark:text-slate-400">تم تسجيل الفاتورة وتحديث الحسابات.</p>
                      </div>
                  ) : (
                      <div className="p-6 space-y-6">
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 text-center border border-emerald-100 dark:border-emerald-800">
                              <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-1">المبلغ الإجمالي</p>
                              <p className="text-4xl font-black text-emerald-800 dark:text-emerald-300 tracking-tight">{calculateTotal()} <span className="text-lg font-bold">{CURRENCY}</span></p>
                          </div>

                          <div className="space-y-4">
                              <div>
                                  <label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block">تاريخ الفاتورة</label>
                                  <div className="relative">
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="date"
                                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={paymentDetails.invoiceDate}
                                        onChange={(e) => setPaymentDetails({...paymentDetails, invoiceDate: e.target.value})}
                                    />
                                  </div>
                              </div>
                              <div className="relative" ref={clientInputRef}>
                                  <label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block">اسم العميل {isDebt() && <span className="text-red-500 text-xs">(مطلوب للدين)</span>}</label>
                                  <div className="relative">
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="بحث أو إدخال اسم عميل جديد..."
                                        className={`w-full pl-4 pr-10 py-3 rounded-xl border bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 focus:ring-2 outline-none ${isDebt() && !paymentDetails.customerName ? 'border-red-300 dark:border-red-700 focus:ring-red-500' : 'border-gray-200 dark:border-slate-600 focus:ring-emerald-500'}`}
                                        value={paymentDetails.customerName}
                                        onFocus={() => setShowClientSuggestions(true)}
                                        onChange={(e) => {
                                            setPaymentDetails({...paymentDetails, customerName: e.target.value});
                                            setShowClientSuggestions(true);
                                        }}
                                    />
                                  </div>
                                  {showClientSuggestions && filteredClients.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl shadow-xl z-20 max-h-40 overflow-y-auto">
                                        {filteredClients.map(client => (
                                            <button
                                                key={client.id}
                                                className="w-full text-right px-4 py-3 hover:bg-emerald-50 dark:hover:bg-slate-600 text-sm text-gray-700 dark:text-white flex justify-between items-center border-b border-gray-50 dark:border-slate-600 last:border-0"
                                                onClick={() => {
                                                    setPaymentDetails({...paymentDetails, customerName: client.name});
                                                    setShowClientSuggestions(false);
                                                }}
                                            >
                                                <span className="font-bold">{client.name}</span>
                                                <span className="text-xs text-gray-400 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full" dir="ltr">{client.phone}</span>
                                            </button>
                                        ))}
                                    </div>
                                  )}
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block">طريقة الاستلام</label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {paymentMethods.map(pm => (
                                        <button
                                            key={pm.id}
                                            onClick={() => setPaymentDetails({...paymentDetails, paymentMethodId: pm.id})}
                                            className={`p-3 rounded-xl border text-sm font-bold transition flex items-center justify-center gap-2 ${paymentDetails.paymentMethodId === pm.id ? 'bg-slate-800 text-white border-slate-800 dark:bg-emerald-600 dark:border-emerald-600' : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600'}`}
                                        >
                                            <Wallet size={16} />
                                            {pm.name}
                                        </button>
                                    ))}
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block">خصم</label>
                                      <input 
                                          type="number" 
                                          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-center"
                                          value={paymentDetails.discount === 0 ? '' : paymentDetails.discount}
                                          placeholder="0"
                                          onChange={(e) => setPaymentDetails({...paymentDetails, discount: Number(e.target.value)})}
                                          onFocus={(e) => e.target.select()}
                                      />
                                  </div>
                                  <div>
                                      <label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block">المدفوع</label>
                                      <input 
                                          type="number" 
                                          className="w-full p-3 rounded-xl border-2 border-emerald-500 bg-white dark:bg-slate-600 text-gray-900 dark:text-white focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 outline-none font-bold text-center text-lg"
                                          value={paymentDetails.amountPaid === 0 ? '' : paymentDetails.amountPaid}
                                          placeholder="0"
                                          onChange={(e) => setPaymentDetails({...paymentDetails, amountPaid: Number(e.target.value)})}
                                          onFocus={(e) => e.target.select()}
                                      />
                                  </div>
                              </div>
                              <div className={`flex justify-between items-center p-4 rounded-xl ${isDebt() ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                                  <span className={`font-bold ${isDebt() ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>{isDebt() ? 'المتبقي (دين):' : 'الباقي (للعميل):'}</span>
                                  <span className={`text-xl font-bold ${isDebt() ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>{Math.abs(calculateRemaining())} {CURRENCY}</span>
                              </div>
                              {isDebt() && !paymentDetails.customerName && (
                                  <div className="text-red-500 text-xs flex items-center gap-1 font-bold"><AlertCircle size={12} />يجب اختيار عميل لتسجيل الدين</div>
                              )}
                          </div>
                          <button 
                              onClick={handleFinalizeCheckout}
                              disabled={checkoutStep === 'processing' || (isDebt() && !paymentDetails.customerName)}
                              className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none transition transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-700/30">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                        <FileText className="text-emerald-600 dark:text-emerald-400" size={20} />
                        تفاصيل الفاتورة
                    </h3>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-slate-400 transition" title="طباعة">
                            <Printer size={18} onClick={() => window.print()} />
                        </button>
                        <button onClick={() => setViewDetailsInvoice(null)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-slate-400 transition">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Header Info */}
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-slate-400">رقم الفاتورة</p>
                            <p className="font-mono font-bold text-gray-800 dark:text-white text-lg">#{viewDetailsInvoice.id.slice(-6)}</p>
                        </div>
                        <div className="text-left">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                viewDetailsInvoice.remainingAmount > 0 
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}>
                                {viewDetailsInvoice.remainingAmount > 0 ? 'غير مكتملة' : 'مدفوعة بالكامل'}
                            </span>
                        </div>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-700/30 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <User size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-slate-400">العميل</p>
                                <p className="font-bold text-sm text-gray-800 dark:text-white">{viewDetailsInvoice.customerName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-slate-400">التاريخ</p>
                                <p className="font-bold text-sm text-gray-800 dark:text-white">{new Date(viewDetailsInvoice.date).toLocaleDateString('ar-MA')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                            <ShoppingBag size={14} /> المنتجات
                        </h4>
                        <div className="border border-gray-100 dark:border-slate-700 rounded-xl overflow-hidden">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">المنتج</th>
                                        <th className="px-4 py-3 text-center">الكمية</th>
                                        <th className="px-4 py-3">السعر</th>
                                        <th className="px-4 py-3">المجموع</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {viewDetailsInvoice.items.map((item, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-3 text-gray-800 dark:text-white font-medium">{item.productName}</td>
                                            <td className="px-4 py-3 text-center text-gray-600 dark:text-slate-300">{item.quantity}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{item.priceAtSale}</td>
                                            <td className="px-4 py-3 font-bold text-gray-800 dark:text-white">{(item.quantity * item.priceAtSale).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="border-t border-dashed border-gray-200 dark:border-slate-600 pt-4 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-slate-400">المجموع الكلي</span>
                            <span className="font-bold text-gray-900 dark:text-white text-lg">{viewDetailsInvoice.total.toLocaleString()} {CURRENCY}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle size={14}/> المدفوع</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{viewDetailsInvoice.paidAmount.toLocaleString()} {CURRENCY}</span>
                        </div>
                        {viewDetailsInvoice.remainingAmount > 0 && (
                            <div className="flex justify-between items-center text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg mt-2">
                                <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1"><AlertCircle size={14}/> المتبقي (دين)</span>
                                <span className="font-bold text-red-600 dark:text-red-400">{viewDetailsInvoice.remainingAmount.toLocaleString()} {CURRENCY}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Edit Invoice Metadata Modal */}
      {isEditInvoiceModalOpen && editingInvoice && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-800 dark:text-white">تعديل بيانات الفاتورة</h3>
                      <button onClick={() => setIsEditInvoiceModalOpen(false)}><X size={20} className="text-gray-400" /></button>
                  </div>
                  <form onSubmit={handleUpdateInvoice} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">اسم العميل</label>
                          <input 
                              type="text" 
                              className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                              value={editingInvoice.customerName}
                              onChange={(e) => setEditingInvoice({...editingInvoice, customerName: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">تاريخ الفاتورة</label>
                          <input 
                              type="date" 
                              className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                              value={editingInvoice.date.split('T')[0]}
                              onChange={(e) => setEditingInvoice({...editingInvoice, date: e.target.value})}
                          />
                      </div>
                      <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 p-2 rounded">
                          ملاحظة: لتعديل المنتجات أو الكميات، يرجى حذف الفاتورة وإعادة إنشائها لضمان سلامة المخزون والحسابات.
                      </div>
                      <button 
                          type="submit" 
                          disabled={isUpdating}
                          className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-900 flex justify-center items-center"
                      >
                          {isUpdating ? <Loader2 className="animate-spin" size={20} /> : 'حفظ التعديلات'}
                      </button>
                  </form>
              </div>
          </div>
      )}

      {isCustomItemModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-800 dark:text-white">إضافة منتج يدوي</h3>
                      <button onClick={() => setIsCustomItemModalOpen(false)}><X size={20} className="text-gray-400" /></button>
                  </div>
                  <form onSubmit={addCustomItemToCart} className="space-y-4">
                      <input 
                          autoFocus type="text" placeholder="الاسم" 
                          className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                          value={customItem.name} onChange={(e) => setCustomItem({...customItem, name: e.target.value})} required
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="number" placeholder="السعر" className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={customItem.price || ''} onChange={(e) => setCustomItem({...customItem, price: Number(e.target.value)})} required />
                        <input type="number" placeholder="الكمية" className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={customItem.quantity || ''} onChange={(e) => setCustomItem({...customItem, quantity: Number(e.target.value)})} required />
                      </div>
                      <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">إضافة</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Sales;
