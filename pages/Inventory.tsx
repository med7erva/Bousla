
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Package, X, MoreVertical, AlertCircle, Scissors, Settings, Trash2, Edit2, Save, Truck, DollarSign, Loader2, Lock, ArrowRight, User } from 'lucide-react';
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManuModalOpen, setIsManuModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: 0, cost: 0, stock: 0, barcode: '' });
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
  }, [user]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isExpired) return;
    setIsSubmitting(true);
    try {
        await addProduct({ ...newProduct, userId: user.id });
        setIsAddModalOpen(false);
        loadData();
        setNewProduct({ name: '', category: categories[0]?.id || '', price: 0, cost: 0, stock: 0, barcode: '' });
    } finally { setIsSubmitting(false); }
  };

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

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  const totalLaborFee = Number(manuData.quantityToMake) * Number(manuData.laborCostPerUnit);

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إدارة المخزون</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">تتبع المنتجات والمواد الخام وعمليات الإنتاج</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setIsCatModalOpen(true)} disabled={isExpired} className="p-2.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition disabled:opacity-50"><Settings size={20} /></button>
            <button onClick={() => setIsManuModalOpen(true)} disabled={isExpired} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"><Scissors size={20} /><span>تصنيع / خياطة</span>{isPlusPlan && <Lock size={14} className="opacity-50" />}</button>
            <button onClick={() => setIsAddModalOpen(true)} disabled={isExpired} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"><Plus size={20} /><span>منتج جديد</span></button>
        </div>
      </div>

      <AIInsightAlert title="تحليل المخزون الذكي" insight={insight} icon={Package} baseColor="blue" />

      {/* Table & Other UI ... (omitted for brevity but assumed unchanged unless needed) */}

      {/* MODAL: MANUFACTURING / TAILORING (Matches Image) */}
      {isManuModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                
                <div className="p-8 flex justify-between items-center border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                             <Scissors size={28} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white">تصنيع / خياطة</h2>
                    </div>
                    <button onClick={() => setIsManuModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <X size={28} />
                    </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-8">
                    {/* Information Banner */}
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 p-6 rounded-3xl">
                        <p className="text-indigo-800 dark:text-indigo-300 text-sm font-bold leading-relaxed text-center">
                            قم بتحويل المواد الخام إلى منتجات جاهزة. سيتم حساب التكلفة وإضافتها كدين على الخياط (المورد) إذا لزم الأمر.
                        </p>
                    </div>

                    <form onSubmit={handleManufacture} className="space-y-6">
                        {/* Source & Target Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 text-center">المادة الخام (المصدر)</label>
                                <select required className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold text-slate-700 outline-none text-center" value={manuData.sourceId} onChange={e => setManuData({...manuData, sourceId: e.target.value})}>
                                    <option value="">اختر الخام...</option>
                                    {products.filter(p => p.category === 'RawMaterial' || p.stock > 0).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 text-center">المنتج النهائي</label>
                                <select required className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold text-slate-700 outline-none text-center" value={manuData.targetId} onChange={e => setManuData({...manuData, targetId: e.target.value})}>
                                    <option value="">اختر المنتج...</option>
                                    {products.filter(p => p.category !== 'RawMaterial').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Quatity & Usage Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 text-center">الكمية المراد إنتاجها</label>
                                <input required type="number" className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-black text-slate-800 outline-none text-center" value={manuData.quantityToMake || ''} onChange={e => setManuData({...manuData, quantityToMake: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 text-center">استهلاك الخام (للقطعة)</label>
                                <input required type="number" step="0.01" className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-black text-slate-800 outline-none text-center" value={manuData.rawPerUnit || ''} onChange={e => setManuData({...manuData, rawPerUnit: Number(e.target.value)})} />
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-700 border-dashed border-t"></div>

                        {/* Tailor/Supplier Section */}
                        <div className="space-y-4">
                             <label className="block text-xs font-black text-slate-500 uppercase tracking-widest text-center">الخياط / المورد (اختياري)</label>
                             <select className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold text-slate-700 outline-none text-center" value={manuData.supplierId} onChange={e => setManuData({...manuData, supplierId: e.target.value})}>
                                <option value="">اختر الخياط...</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                             </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 text-center">تكلفة الخياطة (للقطعة)</label>
                                <input type="number" className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-black text-slate-800 outline-none text-center" value={manuData.laborCostPerUnit || ''} onChange={e => setManuData({...manuData, laborCostPerUnit: Number(e.target.value)})} placeholder="0" />
                            </div>
                            <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl text-center flex flex-col justify-center h-[56px]">
                                <span className="text-[10px] font-black text-rose-400 uppercase">إجمالي أجرة الخياط</span>
                                <div className="text-lg font-black text-rose-600 dark:text-rose-400">{totalLaborFee.toLocaleString()} أوقية</div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-xl hover:bg-indigo-500 shadow-xl shadow-indigo-100 dark:shadow-none transition-all transform active:scale-95 disabled:opacity-50 mt-4"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'تأكيد التصنيع'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
