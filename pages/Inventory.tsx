
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Package,
  X,
  MoreVertical,
  AlertCircle,
  Scissors,
  Settings,
  Trash2,
  Edit2,
  Save,
  Truck,
  DollarSign,
  Loader2,
  Lock
} from 'lucide-react';
import { CURRENCY } from '../constants';
import { Product, ProductCategory, Supplier } from '../types';
import { getInventoryInsights } from '../services/geminiService';
import { getProducts, addProduct, manufactureProduct, updateProduct, deleteProduct, getProductCategories, addProductCategory, deleteProductCategory, getSuppliers } from '../services/db';
import { useAuth } from '../context/AuthContext';
import AIInsightAlert from '../components/AIInsightAlert';

const Inventory: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [insight, setInsight] = useState('');
  
  const isExpired = user?.subscriptionStatus === 'expired';
  const isPlusPlan = user?.subscriptionPlan === 'plus';

  // Loading States for Actions
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManuModalOpen, setIsManuModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Forms
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
    barcode: '',
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [manuData, setManuData] = useState({
      sourceId: '',
      targetId: '',
      quantityToMake: 1,
      rawPerUnit: 1,
      laborCostPerUnit: 0,
      supplierId: ''
  });

  const [newCatName, setNewCatName] = useState('');

  // Dropdown Management
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    if (!user) return;
    const [data, catData, supData] = await Promise.all([
        getProducts(user.id),
        getProductCategories(user.id),
        getSuppliers(user.id)
    ]);
    setProducts(data);
    setCategories(catData);
    setSuppliers(supData);
    
    // Set default category
    if (catData.length > 0 && !newProduct.category) {
        setNewProduct(prev => ({ ...prev, category: catData[0].id }));
    }

    if (data.length > 0 && !insight) {
       const text = await getInventoryInsights(data);
       setInsight(text);
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

  // --- Product Actions ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isExpired) return;
    
    setIsSubmitting(true);
    try {
        await addProduct({
            ...newProduct,
            userId: user.id
        });
        setIsAddModalOpen(false);
        loadData();
        setNewProduct({
            name: '',
            category: categories[0]?.id || '',
            price: 0,
            cost: 0,
            stock: 0,
            barcode: ''
        });
    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء إضافة المنتج.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
      if(isExpired) return;
      if(window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
          try {
            await deleteProduct(id);
            loadData();
            setActiveMenuId(null);
          } catch (error) {
            console.error(error);
            alert("لا يمكن حذف هذا المنتج.");
          }
      }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!editingProduct || isExpired) return;
      
      setIsSubmitting(true);
      try {
          await updateProduct(editingProduct);
          setIsEditModalOpen(false);
          setEditingProduct(null);
          loadData();
      } catch (error) {
          alert("فشل تحديث المنتج");
      } finally {
          setIsSubmitting(false);
      }
  };

  const openEditModal = (product: Product) => {
      if(isExpired) return;
      setEditingProduct(product);
      setIsEditModalOpen(true);
      setActiveMenuId(null);
  };

  // --- Category Actions ---
  const handleAddCategory = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!user || !newCatName.trim() || isExpired) return;
      await addProductCategory(user.id, newCatName);
      setNewCatName('');
      loadData();
  };

  const handleDeleteCategory = async (id: string) => {
      if(isExpired) return;
      if(window.confirm("حذف القسم؟")) {
          try {
              await deleteProductCategory(id);
              loadData();
          } catch (error) {
              console.error(error);
              alert("لا يمكن حذف هذا القسم لأنه مستخدم في منتجات.");
          }
      }
  };

  // --- Manufacturing ---
  const handleManufacture = async (e: React.FormEvent) => {
      e.preventDefault();
      if(isExpired) return;
      if(isPlusPlan) {
          alert("ميزة التصنيع متاحة فقط في خطة Pro.");
          return;
      }
      setIsSubmitting(true);
      try {
          await manufactureProduct(
              manuData.sourceId, 
              manuData.targetId, 
              Number(manuData.quantityToMake), 
              Number(manuData.rawPerUnit),
              Number(manuData.laborCostPerUnit),
              manuData.supplierId
          );
          alert('تمت عملية التصنيع بنجاح وتحديث المخزون والديون!');
          setIsManuModalOpen(false);
          loadData();
          setManuData({ sourceId: '', targetId: '', quantityToMake: 1, rawPerUnit: 1, laborCostPerUnit: 0, supplierId: '' });
      } catch (error: any) {
          alert(error.message);
      } finally {
          setIsSubmitting(false);
      }
  };

  const filteredProducts = products.filter(p => 
    p.name.includes(searchTerm) || p.barcode.includes(searchTerm)
  );

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  const activeProduct = activeMenuId ? products.find(p => p.id === activeMenuId) : null;

  return (
    <div className="space-y-6 relative">
      
      {isExpired && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400 font-bold mb-4">
              <AlertCircle />
              <span>اشتراكك منتهي. يرجى التجديد لتتمكن من إضافة أو تعديل المنتجات.</span>
          </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إدارة المخزون</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">تتبع المنتجات، المواد الخام، وعمليات التصنيع</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsCatModalOpen(true)}
                disabled={isExpired}
                className="p-2.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition disabled:opacity-50"
                title="إدارة الأقسام"
            >
                <Settings size={20} />
            </button>
            <button 
                onClick={() => setIsManuModalOpen(true)}
                disabled={isExpired}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
            >
                <Scissors size={20} />
                <span>تصنيع / خياطة</span>
                {isPlusPlan && <Lock size={14} className="opacity-50" />}
            </button>
            <button 
                onClick={() => setIsAddModalOpen(true)}
                disabled={isExpired}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
            >
                <Plus size={20} />
                <span>منتج جديد</span>
            </button>
        </div>
      </div>

      <AIInsightAlert 
        title="تحليل المخزون الذكي"
        insight={insight}
        icon={Package}
        baseColor="blue"
      />

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="بحث باسم المنتج أو الباركود..." 
            className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden min-h-[300px]">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">باركود</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">اسم المنتج</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">القسم</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">السعر</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">الكمية</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">الحالة</th>
                {!isExpired && <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase text-center">إجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-slate-400">{product.barcode}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{product.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${product.category === 'RawMaterial' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {getCategoryName(product.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">{product.price} {CURRENCY}</p>
                        <p className="text-[10px] text-gray-400">ت: {product.cost}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${product.stock < 10 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.stock < 10 ? (
                        <div className="flex items-center gap-1 text-red-500 dark:text-red-400 text-xs font-bold">
                            <AlertCircle size={14} />
                            <span>منخفض</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>متوفر</span>
                        </div>
                    )}
                  </td>
                  {!isExpired && (
                      <td className="px-6 py-4 text-center">
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setMenuPos({ top: rect.bottom + window.scrollY, left: rect.left });
                                setActiveMenuId(activeMenuId === product.id ? null : product.id); 
                            }}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full text-gray-500 dark:text-slate-400 transition"
                        >
                        <MoreVertical size={18} />
                        </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Floating Context Menu */}
      {activeMenuId && activeProduct && (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)}></div>
            <div 
                ref={menuRef} 
                className="fixed z-50 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
                style={{ top: menuPos.top, left: menuPos.left }}
            >
                <button 
                    onClick={() => openEditModal(activeProduct)}
                    className="w-full text-right px-4 py-3 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3 transition"
                >
                    <Edit2 size={16} className="text-blue-500" /> تعديل المنتج
                </button>
                <div className="h-px bg-gray-50 dark:bg-slate-700"></div>
                <button 
                    onClick={() => handleDeleteProduct(activeProduct.id)}
                    className="w-full text-right px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-3 transition"
                >
                    <Trash2 size={16} /> حذف نهائي
                </button>
            </div>
        </>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white">إضافة صنف جديد</h2>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-800 dark:hover:text-white p-1">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleAddProduct} className="space-y-5">
                    <div>
                        <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">اسم المنتج</label>
                        <input 
                            required
                            type="text" 
                            className="w-full p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">القسم</label>
                            <select 
                                className="w-full p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white outline-none transition-all"
                                value={newProduct.category}
                                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">باركود</label>
                            <input 
                                type="text" 
                                placeholder="تلقائي"
                                className="w-full p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white outline-none transition-all"
                                value={newProduct.barcode}
                                onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">السعر</label>
                            <input 
                                required type="number" 
                                className="w-full p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white outline-none font-bold text-emerald-600"
                                value={newProduct.price || ''}
                                onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">التكلفة</label>
                            <input 
                                required type="number" 
                                className="w-full p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white outline-none font-bold text-blue-600"
                                value={newProduct.cost || ''}
                                onChange={(e) => setNewProduct({...newProduct, cost: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">الكمية</label>
                            <input 
                                required type="number" 
                                className="w-full p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white outline-none font-bold"
                                value={newProduct.stock || ''}
                                onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-emerald-700 transition shadow-xl shadow-emerald-200 dark:shadow-none disabled:opacity-50 flex justify-center items-center gap-2 mt-4"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'إضافة للمخزون'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white">تعديل بيانات المنتج</h2>
                    <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-800 dark:hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleUpdateProduct} className="space-y-5">
                    <div>
                        <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">اسم المنتج</label>
                        <input 
                            required
                            type="text" 
                            className="w-full p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">القسم</label>
                            <select 
                                className="w-full p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white outline-none"
                                value={editingProduct.category}
                                onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">الباركود</label>
                            <input 
                                type="text" 
                                className="w-full p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white outline-none"
                                value={editingProduct.barcode}
                                onChange={(e) => setEditingProduct({...editingProduct, barcode: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">السعر</label>
                            <input 
                                required type="number" 
                                className="w-full p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white outline-none font-bold"
                                value={editingProduct.price}
                                onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">التكلفة</label>
                            <input 
                                required type="number" 
                                className="w-full p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white outline-none font-bold"
                                value={editingProduct.cost}
                                onChange={(e) => setEditingProduct({...editingProduct, cost: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">المخزون</label>
                            <input 
                                required type="number" 
                                className="w-full p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white outline-none font-bold"
                                value={editingProduct.stock}
                                onChange={(e) => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-100 dark:shadow-none disabled:opacity-50 flex justify-center items-center"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'حفظ التعديلات'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Categories Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white">إدارة الأقسام</h2>
                    <button onClick={() => setIsCatModalOpen(false)} className="text-gray-400 hover:text-gray-800 dark:hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleAddCategory} className="mb-8 flex gap-2">
                    <input 
                        required
                        type="text" 
                        placeholder="اسم القسم الجديد..."
                        className="flex-1 p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                    />
                    <button type="submit" className="bg-emerald-600 text-white p-3.5 rounded-2xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100">
                        <Plus size={24} />
                    </button>
                </form>

                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {categories.map(cat => (
                        <div key={cat.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                            <span className="font-bold text-gray-800 dark:text-white">{cat.name}</span>
                            <button 
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="text-gray-400 hover:text-red-500 transition p-2"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Manufacturing Modal */}
      {isManuModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <Scissors className="text-indigo-600 dark:text-indigo-400" size={28} />
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white">تصنيع / خياطة</h2>
                    </div>
                    <button onClick={() => setIsManuModalOpen(false)} className="text-gray-400 hover:text-gray-800 dark:hover:text-white p-1">
                        <X size={24} />
                    </button>
                </div>
                
                {isPlusPlan ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Lock size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3">ميزة حصرية لخطة Pro</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">خطة Plus لا تدعم تتبع عمليات التصنيع والتحويل. يرجى الترقية للوصول لهذه الميزة.</p>
                        <button onClick={() => setIsManuModalOpen(false)} className="bg-indigo-600 text-white px-12 py-3.5 rounded-2xl font-black shadow-xl shadow-indigo-100 dark:shadow-none transition-transform hover:scale-105">حسناً</button>
                    </div>
                ) : (
                    <form onSubmit={handleManufacture} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">المادة الخام (المصدر)</label>
                                <select 
                                    required
                                    className="w-full p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white outline-none"
                                    value={manuData.sourceId}
                                    onChange={(e) => setManuData({...manuData, sourceId: e.target.value})}
                                >
                                    <option value="">اختر الخام...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (متوفر: {p.stock})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">المنتج النهائي</label>
                                <select 
                                    required
                                    className="w-full p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white outline-none"
                                    value={manuData.targetId}
                                    onChange={(e) => setManuData({...manuData, targetId: e.target.value})}
                                >
                                    <option value="">اختر المنتج...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">الكمية المراد إنتاجها</label>
                                <input required type="number" className="w-full p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white outline-none"
                                    value={manuData.quantityToMake || ''} onChange={e => setManuData({...manuData, quantityToMake: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">الخام المستهلك للقطعة</label>
                                <input required type="number" step="0.01" className="w-full p-3.5 border dark:border-slate-600 rounded-2xl dark:bg-slate-900 dark:text-white outline-none"
                                    value={manuData.rawPerUnit || ''} onChange={e => setManuData({...manuData, rawPerUnit: Number(e.target.value)})} />
                            </div>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition flex justify-center items-center">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'تأكيد عملية التصنيع'}
                        </button>
                    </form>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
