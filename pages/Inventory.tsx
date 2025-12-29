
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Package, X, MoreVertical, Scissors, Settings, Trash2, Edit2, Save, Loader2, Lock } from 'lucide-react';
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
  const [manuData, setManuData] = useState({ sourceId: '', targetId: '', quantityToMake: 1, rawPerUnit: 1, laborCostPerUnit: 0, supplierId: '' });

  const [newCatName, setNewCatName] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    if (!user) return;
    const [data, catData, supData] = await Promise.all([ getProducts(user.id), getProductCategories(user.id), getSuppliers(user.id) ]);
    setProducts(data);
    setCategories(catData);
    setSuppliers(supData);
    if (catData.length > 0 && !newProduct.category) setNewProduct(prev => ({ ...prev, category: catData[0].id }));
    if (data.length > 0 && !insight) setInsight(await getInventoryInsights(data));
  };

  useEffect(() => { loadData(); }, [user]);

  const handleManufacture = async (e: React.FormEvent) => {
      e.preventDefault();
      if(isExpired || isPlusPlan) return;
      setIsSubmitting(true);
      try {
          await manufactureProduct(manuData.sourceId, manuData.targetId, Number(manuData.quantityToMake), Number(manuData.rawPerUnit), Number(manuData.laborCostPerUnit), manuData.supplierId);
          setIsManuModalOpen(false);
          loadData();
          setManuData({ sourceId: '', targetId: '', quantityToMake: 1, rawPerUnit: 1, laborCostPerUnit: 0, supplierId: '' });
      } catch (error: any) { alert(error.message); } finally { setIsSubmitting(false); }
  };

  const filteredProducts = products.filter(p => p.name.includes(searchTerm) || p.barcode.includes(searchTerm));
  const totalLaborFee = Number(manuData.quantityToMake) * Number(manuData.laborCostPerUnit);

  return (
    <div className="space-y-6 relative pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-white">إدارة المخزون</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">إدارة المنتجات وعمليات التصنيع</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setIsManuModalOpen(true)} disabled={isExpired} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 font-bold text-sm">
                <Scissors size={18} /><span>تصنيع / خياطة</span>
            </button>
            <button onClick={() => setIsAddModalOpen(true)} disabled={isExpired} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition shadow-sm disabled:opacity-50 font-bold text-sm">
                <Plus size={18} /><span>منتج جديد</span>
            </button>
        </div>
      </div>

      <AIInsightAlert title="تحليل المخزون" insight={insight} icon={Package} baseColor="blue" />

      {/* SEARCH BAR */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 relative">
          <Search className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="بحث باسم المنتج أو الباركود..." className="w-full pr-12 pl-4 py-3 bg-gray-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {/* INVENTORY TABLE */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                  <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                      <tr>
                          <th className="px-6 py-4">المنتج</th>
                          <th className="px-6 py-4">التصنيف</th>
                          <th className="px-6 py-4">سعر البيع</th>
                          <th className="px-6 py-4">المخزون</th>
                          <th className="px-6 py-4 text-center">إجراء</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                      {filteredProducts.map(product => (
                          <tr key={product.id} className="hover:bg-slate-50 transition">
                              <td className="px-6 py-4">
                                  <div className="font-bold text-gray-800 dark:text-white">{product.name}</div>
                                  <div className="text-[10px] text-gray-400 font-mono">{product.barcode}</div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className="text-xs font-medium text-gray-500 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">{categories.find(c => c.id === product.category)?.name || product.category}</span>
                              </td>
                              <td className="px-6 py-4 font-black text-emerald-600 dark:text-emerald-400">{product.price} {CURRENCY}</td>
                              <td className="px-6 py-4">
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${product.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{product.stock} قطعة</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <button onClick={() => window.confirm('حذف؟') && deleteProduct(product.id).then(loadData)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                              </td>
                          </tr>
                      ))}
                      {filteredProducts.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-gray-400 font-bold">لا توجد منتجات مسجلة</td></tr>}
                  </tbody>
              </table>
          </div>
      </div>

      {/* MODAL: MANUFACTURING (Compact Design) */}
      {isManuModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                <div className="p-6 flex justify-between items-center border-b dark:border-slate-700">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2"><Scissors size={20} className="text-indigo-600" /> تصنيع / خياطة</h2>
                    <button onClick={() => setIsManuModalOpen(false)} className="text-slate-400"><X size={24} /></button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-5">
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 p-4 rounded-2xl text-center">
                        <p className="text-indigo-800 dark:text-indigo-300 text-xs font-bold">تحويل الخام لمنتجات جاهزة مع إضافة ديون الموردين</p>
                    </div>
                    <form onSubmit={handleManufacture} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-slate-500 text-center uppercase">المادة الخام</label>
                                <select required className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none border-none text-center" value={manuData.sourceId} onChange={e => setManuData({...manuData, sourceId: e.target.value})}>
                                    <option value="">اختر الخام...</option>
                                    {products.filter(p => p.category === 'RawMaterial' || p.stock > 0).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-slate-500 text-center uppercase">المنتج النهائي</label>
                                <select required className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none border-none text-center" value={manuData.targetId} onChange={e => setManuData({...manuData, targetId: e.target.value})}>
                                    <option value="">اختر المنتج...</option>
                                    {products.filter(p => p.category !== 'RawMaterial').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-slate-500 text-center uppercase">الكمية المطلوبة</label>
                                <input required type="number" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm font-black outline-none border-none text-center" value={manuData.quantityToMake || ''} onChange={e => setManuData({...manuData, quantityToMake: Number(e.target.value)})} />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-slate-500 text-center uppercase">الاستهلاك (للقطعة)</label>
                                <input required type="number" step="0.01" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm font-black outline-none border-none text-center" value={manuData.rawPerUnit || ''} onChange={e => setManuData({...manuData, rawPerUnit: Number(e.target.value)})} />
                            </div>
                        </div>
                        <div className="h-px bg-slate-100 border-dashed border-t dark:border-slate-700"></div>
                        <div className="space-y-1">
                             <label className="block text-[10px] font-black text-slate-500 text-center uppercase">الخياط (المورد)</label>
                             <select className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none border-none text-center" value={manuData.supplierId} onChange={e => setManuData({...manuData, supplierId: e.target.value})}>
                                <option value="">اختر الخياط...</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                             </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3 items-end">
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-slate-500 text-center uppercase">أجرة الخياطة (للقطعة)</label>
                                <input type="number" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm font-black outline-none border-none text-center" value={manuData.laborCostPerUnit || ''} onChange={e => setManuData({...manuData, laborCostPerUnit: Number(e.target.value)})} />
                            </div>
                            <div className="bg-rose-50 dark:bg-rose-900/10 p-3 rounded-xl text-center h-[46px] flex flex-col justify-center">
                                <span className="text-[8px] font-black text-rose-400">إجمالي الأجرة</span>
                                <div className="text-sm font-black text-rose-600">{totalLaborFee.toLocaleString()} أوقية</div>
                            </div>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-lg hover:bg-indigo-500 shadow-xl transition-all disabled:opacity-50 mt-4">
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'تأكيد العملية'}
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
