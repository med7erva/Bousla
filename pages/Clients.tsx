

import React, { useState, useEffect } from 'react';
import { User, Phone, Search, UserPlus, AlertCircle, FileText, Clock, X, ShoppingBag, ArrowDownLeft, ArrowUpRight, MoreVertical, Edit2, Trash2, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getClients, addClient, getInvoices, getTransactions, updateClient, deleteClient } from '../services/db';
import { getClientInsights } from '../services/geminiService';
import { Client } from '../types';
import { CURRENCY } from '../constants';
import AIInsightAlert from '../components/AIInsightAlert';

// Ledger Item Interface for the unified history view
interface LedgerItem {
    id: string;
    date: Date;
    type: 'invoice' | 'receipt' | 'payment' | 'opening_balance'; 
    description: string;
    debit: number; // عليه (Sales / Loans given to him)
    credit: number; // له (Payments from him / Refunds)
    balance: number; // Running balance
}

const Clients: React.FC = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [aiInsight, setAiInsight] = useState('');

    // Add Client Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newClient, setNewClient] = useState({
        name: '', phone: '', debt: 0, openingBalance: 0, notes: ''
    });

    // Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    // History Modal State
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [ledgerItems, setLedgerItems] = useState<LedgerItem[]>([]);

    // Dropdown State
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

    const loadClients = async () => {
        if (!user) return;
        try {
            const data = await getClients(user.id);
            setClients(data);
            
            if (data.length > 0 && !aiInsight) {
                const insight = await getClientInsights(data);
                setAiInsight(insight);
            }
        } catch (err) {
            console.error("Failed to load clients", err);
        }
    };

    useEffect(() => {
        loadClients();
        // Close menu on scroll
        const handleScroll = () => setActiveMenuId(null);
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, [user]);

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            await addClient({ userId: user.id, ...newClient });
            setIsAddModalOpen(false);
            setNewClient({ name: '', phone: '', debt: 0, openingBalance: 0, notes: '' });
            loadClients();
        } catch (err) {
            console.error("Failed to add client", err);
            alert("فشل إضافة العميل. يرجى المحاولة مرة أخرى.");
        }
    };

    const handleUpdateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!editingClient) return;
        try {
            await updateClient(editingClient);
            setIsEditModalOpen(false);
            setEditingClient(null);
            loadClients();
        } catch (err) {
            console.error("Failed to update client", err);
            alert("فشل تحديث بيانات العميل.");
        }
    };

    const handleDeleteClient = async (id: string) => {
        if(window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
            try {
                await deleteClient(id);
                loadClients();
                setActiveMenuId(null);
            } catch (error) {
                console.error(error);
                alert("لا يمكن حذف هذا العميل.");
            }
        }
    };

    const openEditModal = (client: Client) => {
        setEditingClient(client);
        setIsEditModalOpen(true);
        setActiveMenuId(null);
    };

    const handleViewHistory = async (client: Client) => {
        if (!user) return;
        setSelectedClient(client);
        
        try {
            // 1. Fetch Raw Data
            const [allInvoices, allTransactions] = await Promise.all([
                getInvoices(user.id),
                getTransactions(user.id)
            ]);

            // 2. Filter for this client
            const clientInvoices = allInvoices.filter(inv => 
                inv.customerName && inv.customerName.trim().toLowerCase() === client.name.trim().toLowerCase()
            );
            
            const clientTransactions = allTransactions.filter(tx => 
                tx.entityType === 'Client' && tx.entityId === client.id
            );

            // 3. Transform to Unsorted Ledger Items
            let rawItems: Omit<LedgerItem, 'balance'>[] = [];

            // Invoices
            clientInvoices.forEach(inv => {
                const items = inv.items || [];
                const description = items.map(i => 
                    i.quantity > 1 ? `${i.productName} (${i.quantity})` : i.productName
                ).join('، ');
                
                rawItems.push({
                    id: `inv-${inv.id}`,
                    date: new Date(inv.date || new Date()),
                    type: 'invoice',
                    description: description || 'فاتورة بيع',
                    debit: inv.total || 0,      // عليه (Total Bill)
                    credit: inv.paidAmount || 0 // له (Paid Now)
                });
            });

            // Transactions
            clientTransactions.forEach(tx => {
                if (tx.type === 'in') {
                    // Receipt (قبض) = Credit for Client
                    rawItems.push({
                        id: tx.id,
                        date: new Date(tx.date || new Date()),
                        type: 'receipt',
                        description: tx.description || 'سند قبض',
                        debit: 0,
                        credit: tx.amount || 0
                    });
                } else {
                    // Payment (صرف) = Debit for Client (Loan)
                    rawItems.push({
                        id: tx.id,
                        date: new Date(tx.date || new Date()),
                        type: 'payment',
                        description: tx.description || 'سند صرف (سلفة)',
                        debit: tx.amount || 0,
                        credit: 0
                    });
                }
            });

            // 4. Sort Chronologically (Oldest to Newest) for correct running balance calc
            // IMPORTANT: Forward Calculation starts here
            rawItems.sort((a, b) => {
                const timeA = a.date instanceof Date && !isNaN(a.date.getTime()) ? a.date.getTime() : 0;
                const timeB = b.date instanceof Date && !isNaN(b.date.getTime()) ? b.date.getTime() : 0;
                return timeA - timeB;
            });

            // 5. Initial Balance from explicit Opening Balance field
            let currentBalance = client.openingBalance || 0;
            const processedItems: LedgerItem[] = [];

            // Add Opening Balance Row if it exists (non-zero)
            const openingRow: LedgerItem | null = (client.openingBalance && client.openingBalance !== 0) ? {
                id: 'opening-bal',
                // Set date to slightly before the first item or now if empty
                date: rawItems.length > 0 ? new Date(rawItems[0].date.getTime() - 60000) : new Date(), 
                type: 'opening_balance',
                description: 'رصيد افتتاحي / سابق',
                debit: client.openingBalance > 0 ? client.openingBalance : 0,
                credit: client.openingBalance < 0 ? Math.abs(client.openingBalance) : 0,
                balance: client.openingBalance
            } : null;

            // Process items chronologically
            rawItems.forEach(item => {
                // Debit increases debt, Credit decreases debt
                currentBalance = currentBalance + item.debit - item.credit;
                
                processedItems.push({
                    ...item,
                    balance: currentBalance
                });
            });

            // 6. Final Assembly & Reverse for Display (Newest First)
            // If opening row exists, it should be at the bottom of the display list (which means first in chrono list)
            const finalLedger = openingRow ? [openingRow, ...processedItems] : [...processedItems];
            
            setLedgerItems(finalLedger.reverse());
            setIsHistoryModalOpen(true);
            setActiveMenuId(null);
        } catch (err) {
            console.error("Failed to generate history", err);
            alert("حدث خطأ أثناء إعداد كشف الحساب.");
        }
    };

    const filteredClients = clients.filter(c => 
        (c.name && c.name.includes(searchTerm)) || (c.phone && c.phone.includes(searchTerm))
    );

    const activeClient = clients.find(c => c.id === activeMenuId);

    const getRowStyle = (type: string) => {
        switch (type) {
            case 'invoice': return 'bg-white';
            case 'receipt': return 'bg-emerald-50/60';
            case 'payment': return 'bg-red-50/50';
            case 'opening_balance': return 'bg-amber-100 border-b-2 border-amber-200';
            default: return 'bg-white';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'invoice': return { text: 'فاتورة بيع', icon: ShoppingBag, color: 'text-blue-600' };
            case 'receipt': return { text: 'سند قبض', icon: ArrowDownLeft, color: 'text-emerald-700' };
            case 'payment': return { text: 'سند صرف', icon: ArrowUpRight, color: 'text-red-600' };
            case 'opening_balance': return { text: 'رصيد سابق', icon: Clock, color: 'text-amber-700 font-bold' };
            default: return { text: type, icon: FileText, color: 'text-gray-600' };
        }
    };

    // Calculate final balance for display in Modal Header
    // Since ledgerItems is reversed (Index 0 is the newest), we take index 0 balance.
    // If empty, we take opening balance or 0.
    const calculatedFinalBalance = ledgerItems.length > 0 
        ? ledgerItems[0].balance 
        : (selectedClient?.openingBalance || 0);

    return (
        <div className="space-y-6" onClick={() => setActiveMenuId(null)}>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">إدارة العملاء</h1>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition shadow-sm"
                >
                    <UserPlus size={20} />
                    <span>عميل جديد</span>
                </button>
            </div>

            {/* AI Insight (Collapsible) */}
            <AIInsightAlert 
                title="استعادة العملاء"
                insight={aiInsight}
                icon={Clock}
                baseColor="indigo"
            />

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="بحث باسم العميل أو رقم الهاتف..." 
                    className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map(client => (
                    <div key={client.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition relative group">
                         <div className="absolute top-4 left-4 z-10">
                             <button 
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    e.stopPropagation();
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setMenuPos({ top: rect.bottom, left: rect.left });
                                    setActiveMenuId(activeMenuId === client.id ? null : client.id);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                             >
                                 <MoreVertical size={20} />
                             </button>
                         </div>

                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{client.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <Phone size={12} />
                                        <span dir="ltr">{client.phone}</span>
                                    </div>
                                </div>
                            </div>
                            {client.debt > 0 && (
                                <div className="bg-red-50 text-red-600 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    <span>مدين</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded">
                            آخر شراء: {client.lastPurchaseDate ? new Date(client.lastPurchaseDate).toLocaleDateString('ar-MA') : 'لا يوجد'}
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm text-gray-500">رصيد الديون</span>
                                <span className={`font-bold ${client.debt > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {client.debt.toLocaleString()} {CURRENCY}
                                </span>
                            </div>
                            <button 
                                onClick={() => handleViewHistory(client)}
                                className="w-full py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition flex items-center justify-center"
                            >
                                <FileText size={16} className="ml-2" />
                                كشف الحساب (السجل)
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Action Menu - Fixed with Transparent Overlay */}
            {activeMenuId && activeClient && (
                 <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)}></div>
                    <div 
                        className="fixed z-50 w-40 bg-white rounded-lg shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
                        style={{ top: menuPos.top, left: menuPos.left }}
                    >
                        <button 
                            onClick={(e) => { e.stopPropagation(); openEditModal(activeClient); }}
                            className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Edit2 size={14} /> تعديل
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteClient(activeClient.id); }}
                            className="w-full text-right px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                        >
                            <Trash2 size={14} /> حذف
                        </button>
                    </div>
                 </>
             )}

            {/* Add Client Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold mb-4">إضافة عميل جديد</h2>
                        <form onSubmit={handleAddClient} className="space-y-4">
                            <input required type="text" placeholder="الاسم" className="w-full p-2 border rounded-lg"
                                value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} />
                            <input required type="text" placeholder="رقم الهاتف" className="w-full p-2 border rounded-lg"
                                value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">رصيد افتتاحي (سابق)</label>
                                <input type="number" className="w-full p-2 border rounded-lg bg-gray-50"
                                    placeholder="0"
                                    value={newClient.openingBalance === 0 ? '' : newClient.openingBalance} 
                                    onChange={e => setNewClient({...newClient, openingBalance: Number(e.target.value)})} 
                                />
                                <p className="text-xs text-gray-500 mt-1">الرصيد الافتتاحي يتم إضافته تلقائياً إلى مجموع الديون</p>
                            </div>

                            <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold">حفظ</button>
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="w-full text-gray-500 py-2">إلغاء</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Client Modal */}
             {isEditModalOpen && editingClient && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold mb-4">تعديل بيانات العميل</h2>
                        <form onSubmit={handleUpdateClient} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                                <input required type="text" className="w-full p-2 border rounded-lg"
                                    value={editingClient.name} onChange={e => setEditingClient({...editingClient, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
                                <input required type="text" className="w-full p-2 border rounded-lg"
                                    value={editingClient.phone} onChange={e => setEditingClient({...editingClient, phone: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الرصيد الافتتاحي</label>
                                <input type="number" className="w-full p-2 border rounded-lg bg-gray-50"
                                    value={editingClient.openingBalance === 0 ? '' : editingClient.openingBalance} 
                                    onChange={e => setEditingClient({...editingClient, openingBalance: Number(e.target.value)})} 
                                />
                                <p className="text-xs text-gray-500 mt-1">تعديل الرصيد الافتتاحي سيؤثر على الرصيد الكلي</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">رصيد الدين الحالي (للتصحيح اليدوي فقط)</label>
                                <input type="number" className="w-full p-2 border rounded-lg border-dashed"
                                    value={editingClient.debt === 0 ? '' : editingClient.debt} 
                                    onChange={e => setEditingClient({...editingClient, debt: Number(e.target.value)})} 
                                />
                            </div>
                            <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold">حفظ التعديلات</button>
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-full text-gray-500 py-2">إلغاء</button>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal (Statement of Account) */}
            {isHistoryModalOpen && selectedClient && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <ShoppingBag className="text-emerald-600" />
                                    كشف حساب: {selectedClient.name}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    الرصيد النهائي (المطلوب): <span className={`${calculatedFinalBalance > 0 ? 'text-red-600' : 'text-emerald-600'} font-bold`}>{calculatedFinalBalance.toLocaleString()} {CURRENCY}</span>
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => window.print()} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 hidden md:block">
                                    <Printer size={20} />
                                </button>
                                <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                                    <X size={24} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right whitespace-nowrap min-w-[700px]">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0 z-10 font-bold border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-4 w-24">التاريخ</th>
                                                <th className="px-4 py-4 w-32">نوع العملية</th>
                                                <th className="px-4 py-4">الوصف (المنتجات)</th>
                                                <th className="px-4 py-4 w-28 text-red-600">عليه (مبلغ الفاتورة)</th>
                                                <th className="px-4 py-4 w-28 text-emerald-600">له (المدفوع)</th>
                                                <th className="px-4 py-4 w-28 bg-gray-100">الباقي (تراكمي)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {ledgerItems.length === 0 ? (
                                                <tr><td colSpan={6} className="p-8 text-center text-gray-400">لا توجد حركات مسجلة لهذا العميل</td></tr>
                                            ) : (
                                                ledgerItems.map(item => {
                                                    const meta = getTypeLabel(item.type);
                                                    const Icon = meta.icon;
                                                    return (
                                                        <tr key={item.id} className={`hover:bg-gray-50 transition ${getRowStyle(item.type)}`}>
                                                            <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                                                                {item.date.toLocaleDateString('ar-MA')}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={`flex items-center gap-1.5 text-xs font-bold ${meta.color}`}>
                                                                    <Icon size={14} /> {meta.text}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-700 font-medium max-w-xs truncate" title={item.description}>
                                                                {item.description}
                                                            </td>
                                                            <td className="px-4 py-3 font-bold text-red-600">
                                                                {item.debit > 0 ? item.debit.toLocaleString() : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 font-bold text-emerald-600">
                                                                {item.credit > 0 ? item.credit.toLocaleString() : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 font-black text-slate-800 bg-gray-50 border-r border-gray-100">
                                                                {item.balance.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
