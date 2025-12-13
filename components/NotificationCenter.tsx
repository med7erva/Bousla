
import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, TrendingUp, Sparkles, X, ChevronRight, Package, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProducts, getClients, getSalesAnalytics, getExpenses, getInvoices } from '../services/db';
import { getNotificationBriefing } from '../services/geminiService';

interface Notification {
    id: string;
    type: 'operational' | 'analytical';
    subtype: 'stock' | 'debt' | 'sales' | 'ai';
    title: string;
    message: string;
    date: Date;
    isRead: boolean;
    actionLink?: string;
}

const NotificationCenter: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Load Notifications
    const loadNotifications = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [products, clients, analytics, expenses, invoices] = await Promise.all([
                getProducts(user.id),
                getClients(user.id),
                getSalesAnalytics(user.id),
                getExpenses(user.id),
                getInvoices(user.id)
            ]);

            const newNotifications: Notification[] = [];

            // 1. Operational: Low Stock
            const lowStock = products.filter(p => p.stock <= 5);
            if (lowStock.length > 0) {
                newNotifications.push({
                    id: 'op-stock',
                    type: 'operational',
                    subtype: 'stock',
                    title: 'تنبيه مخزون',
                    message: `يوجد ${lowStock.length} منتجات على وشك النفاد، منها: ${lowStock[0].name}`,
                    date: new Date(),
                    isRead: false,
                    actionLink: '/inventory'
                });
            }

            // 2. Operational: High Client Debt
            const highDebt = clients.filter(c => c.debt > 10000); // Threshold example
            if (highDebt.length > 0) {
                newNotifications.push({
                    id: 'op-debt',
                    type: 'operational',
                    subtype: 'debt',
                    title: 'ديون مرتفعة',
                    message: `لديك ${highDebt.length} عملاء تجاوزت ديونهم 10,000 أوقية.`,
                    date: new Date(),
                    isRead: false,
                    actionLink: '/clients'
                });
            }

            // 3. Analytical: AI Insights (Only if we have data)
            if (analytics.totalSales > 0) {
                // Find top product name
                const prodMap: any = {};
                invoices.forEach(inv => inv.items.forEach(i => {
                    prodMap[i.productName] = (prodMap[i.productName] || 0) + i.quantity;
                }));
                const topProd = Object.keys(prodMap).sort((a,b) => prodMap[b] - prodMap[a])[0] || 'غير محدد';
                const totalExp = expenses.reduce((s,e) => s + e.amount, 0);
                const totalDebt = clients.reduce((s,c) => s + c.debt, 0);

                const aiInsights = await getNotificationBriefing(
                    analytics.totalSales,
                    totalExp,
                    topProd,
                    totalDebt
                );

                aiInsights.forEach((insight, idx) => {
                    newNotifications.push({
                        id: `ai-${idx}`,
                        type: 'analytical',
                        subtype: 'ai',
                        title: insight.type === 'opportunity' ? 'فرصة ذكية' : 'تنبيه ذكي',
                        message: insight.text,
                        date: new Date(),
                        isRead: false
                    });
                });
            }

            setNotifications(newNotifications);
        } catch (e) {
            console.error("Failed to load notifications", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && notifications.length === 0) {
            loadNotifications();
        }
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            >
                <Bell size={22} />
                {unreadCount > 0 && !isOpen && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-slate-800">الإشعارات</h3>
                        <button onClick={loadNotifications} className="text-xs text-emerald-600 font-bold hover:underline">
                            تحديث
                        </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                جاري التحليل...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center">
                                <Bell className="mb-2 opacity-20" size={32} />
                                لا توجد إشعارات جديدة
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className={`p-4 hover:bg-gray-50 transition flex gap-3 ${notif.type === 'analytical' ? 'bg-indigo-50/30' : ''}`}
                                    >
                                        <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
                                            ${notif.subtype === 'stock' ? 'bg-red-100 text-red-600' : 
                                              notif.subtype === 'debt' ? 'bg-orange-100 text-orange-600' : 
                                              'bg-indigo-100 text-indigo-600'}`}
                                        >
                                            {notif.subtype === 'stock' && <Package size={14} />}
                                            {notif.subtype === 'debt' && <Users size={14} />}
                                            {notif.subtype === 'ai' && <Sparkles size={14} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className={`text-sm font-bold ${notif.type === 'analytical' ? 'text-indigo-700' : 'text-slate-800'}`}>
                                                    {notif.title}
                                                </h4>
                                                <span className="text-[10px] text-gray-400">اليوم</span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                {notif.message}
                                            </p>
                                            {notif.actionLink && (
                                                <a href={`#${notif.actionLink}`} className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-2 hover:underline">
                                                    عرض التفاصيل <ChevronRight size={10} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
