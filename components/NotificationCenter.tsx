
import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, TrendingUp, Sparkles, X, ChevronRight, Package, Users, BellRing, Clock, Wallet, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getProducts, getClients, getSalesAnalytics, getExpenses, getInvoices } from '../services/db';
import { getNotificationBriefing } from '../services/geminiService';

interface Notification {
    id: string;
    type: 'operational' | 'analytical';
    subtype: 'stock' | 'debt' | 'sales' | 'expense' | 'time' | 'ai';
    title: string;
    message: string;
    date: Date;
    isRead: boolean;
    actionLink?: string;
    priority?: 'high' | 'normal';
}

const NotificationCenter: React.FC = () => {
    const { user } = useAuth();
    const { settings } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!('Notification' in window)) return;
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === 'granted') {
            new window.Notification('تم تفعيل الإشعارات', {
                body: 'ستصلك تنبيهات تشغيلية يومية.',
                icon: '/icon.svg' 
            });
        }
    };

    const sendSystemNotification = (title: string, body: string) => {
        if (permission === 'granted') {
            try {
                new window.Notification(title, {
                    body,
                    icon: '/icon.svg',
                    tag: 'bousla-alert' 
                });
            } catch (e) {
                console.error("Notification Error", e);
            }
        }
    };

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

            // --- 1. Hardcoded Operational Checks (High Reliability) ---

            // A. Stock Alerts
            if (settings.notifications.lowStock) {
                const threshold = settings.notifications.lowStockThreshold || 5;
                const lowStock = products.filter(p => p.stock <= threshold && p.stock > 0);
                const outStock = products.filter(p => p.stock === 0);
                
                if (outStock.length > 0) {
                    newNotifications.push({
                        id: 'op-out-stock',
                        type: 'operational',
                        subtype: 'stock',
                        title: 'منتجات نفدت',
                        message: `نفد مخزون ${outStock.length} صنفاً، منها: ${outStock[0].name}`,
                        date: new Date(),
                        isRead: false,
                        actionLink: '/inventory',
                        priority: 'high'
                    });
                } else if (lowStock.length > 0) {
                    newNotifications.push({
                        id: 'op-low-stock',
                        type: 'operational',
                        subtype: 'stock',
                        title: 'مخزون منخفض',
                        message: `${lowStock.length} منتجات قاربت على النفاد.`,
                        date: new Date(),
                        isRead: false,
                        actionLink: '/inventory'
                    });
                }
            }

            // B. Sales Check (No Sales Yet)
            const todayStr = new Date().toISOString().split('T')[0];
            const todayInvoices = invoices.filter(inv => inv.date.startsWith(todayStr) && !inv.items.some(i => i.productId === 'opening-bal'));
            
            if (todayInvoices.length === 0 && new Date().getHours() > 12) {
                 newNotifications.push({
                    id: 'op-no-sales',
                    type: 'operational',
                    subtype: 'sales',
                    title: 'تنبيه مبيعات',
                    message: 'لم يتم تسجيل أي مبيعات اليوم حتى الآن.',
                    date: new Date(),
                    isRead: false,
                    actionLink: '/sales'
                });
            }

            // C. Expenses Check
            const todayExpenses = expenses.filter(e => e.date.startsWith(todayStr)).reduce((sum, e) => sum + e.amount, 0);
            const todayRevenue = todayInvoices.reduce((sum, i) => sum + i.total, 0);
            
            if (todayExpenses > todayRevenue && todayRevenue > 0) {
                 newNotifications.push({
                    id: 'op-exp-warning',
                    type: 'operational',
                    subtype: 'expense',
                    title: 'تنبيه مالي',
                    message: 'المصاريف اليومية تجاوزت المبيعات حتى الآن.',
                    date: new Date(),
                    isRead: false,
                    actionLink: '/expenses',
                    priority: 'high'
                });
            }

            // --- 2. AI Operational Briefing (Context Aware) ---
            if (settings.ai.enabled) {
                const prodMap: any = {};
                todayInvoices.forEach(inv => inv.items.forEach(i => {
                    prodMap[i.productName] = (prodMap[i.productName] || 0) + i.quantity;
                }));
                const topProd = Object.keys(prodMap).sort((a,b) => prodMap[b] - prodMap[a])[0] || 'لا يوجد';
                const totalDebt = clients.reduce((s,c) => s + c.debt, 0);

                // Only fetch if we have some data to talk about
                if (todayRevenue > 0 || todayExpenses > 0) {
                    const aiInsights = await getNotificationBriefing(
                        todayRevenue,
                        todayExpenses,
                        topProd,
                        totalDebt
                    );

                    aiInsights.forEach((insight, idx) => {
                        newNotifications.push({
                            id: `ai-${idx}`,
                            type: 'operational', // Mark as operational as requested
                            subtype: insight.type === 'opportunity' ? 'sales' : insight.type === 'warning' ? 'expense' : 'time',
                            title: insight.title,
                            message: insight.text,
                            date: new Date(),
                            isRead: false
                        });
                    });
                }
            }

            // Sort by priority then date
            setNotifications(newNotifications.sort((a, b) => {
                if (a.priority === 'high' && b.priority !== 'high') return -1;
                if (a.priority !== 'high' && b.priority === 'high') return 1;
                return 0;
            }));

            // System Notification for High Priority items
            const highPriority = newNotifications.find(n => n.priority === 'high');
            if (highPriority && !isOpen) {
                sendSystemNotification(highPriority.title, highPriority.message);
            }

        } catch (e) {
            console.error("Failed to load notifications", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 10 * 60 * 1000); // 10 mins
        return () => clearInterval(interval);
    }, [user, settings]);

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

    const unreadCount = notifications.length;

    const getIcon = (subtype: string) => {
        switch(subtype) {
            case 'stock': return <Package size={18} className="text-red-500" />;
            case 'sales': return <TrendingUp size={18} className="text-emerald-500" />;
            case 'expense': return <Wallet size={18} className="text-orange-500" />;
            case 'debt': return <Users size={18} className="text-blue-500" />;
            case 'time': return <Clock size={18} className="text-indigo-500" />;
            case 'ai': return <Sparkles size={18} className="text-purple-500" />;
            default: return <Info size={18} className="text-gray-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Mobile Backdrop */}
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)}></div>
                    
                    {/* Notification Panel */}
                    <div className={`
                        fixed bottom-0 left-0 right-0 top-auto md:absolute md:top-full md:left-0 md:bottom-auto md:right-auto
                        w-full md:w-96 
                        bg-white dark:bg-slate-800 
                        md:rounded-2xl rounded-t-3xl 
                        shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)] md:shadow-2xl 
                        border-t md:border border-gray-100 dark:border-slate-700 
                        overflow-hidden z-50 
                        animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200 origin-top-left
                        max-h-[85vh] md:max-h-[500px] flex flex-col
                    `}>
                        <div className="p-4 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800 dark:text-white text-lg">الإشعارات اليومية</h3>
                                <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono">{unreadCount}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {permission === 'default' && (
                                    <button 
                                        onClick={requestPermission}
                                        className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition"
                                        title="تفعيل التنبيهات"
                                    >
                                        <BellRing size={18} />
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full md:hidden">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
                            {loading ? (
                                <div className="p-12 text-center text-gray-400 dark:text-slate-500 text-sm">
                                    جاري تحديث البيانات...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-12 text-center text-gray-400 dark:text-slate-500 text-sm flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-3">
                                        <Bell className="opacity-20" size={32} />
                                    </div>
                                    <p>لا توجد إشعارات تشغيلية حالياً</p>
                                    <p className="text-xs mt-1 opacity-70">أمورك تمام!</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.map((notif) => (
                                        <div 
                                            key={notif.id} 
                                            className={`
                                                relative p-4 rounded-xl border transition-all active:scale-[0.98]
                                                ${notif.priority === 'high' 
                                                    ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' 
                                                    : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'}
                                            `}
                                        >
                                            <div className="flex gap-4">
                                                <div className={`mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 shadow-sm border border-gray-100 dark:border-slate-600`}>
                                                    {getIcon(notif.subtype)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">
                                                            {notif.title}
                                                        </h4>
                                                        <span className="text-[10px] text-gray-400 shrink-0">
                                                            {notif.date.toLocaleTimeString('ar-MA', {hour: '2-digit', minute:'2-digit'})}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed mb-2 line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                    {notif.actionLink && (
                                                        <a 
                                                            href={`#${notif.actionLink}`} 
                                                            onClick={() => setIsOpen(false)}
                                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-slate-900 dark:bg-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition shadow-sm"
                                                        >
                                                            اتخاذ إجراء <ChevronRight size={10} className="rtl:rotate-180" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            {notif.priority === 'high' && (
                                                <span className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="p-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700 text-center">
                            <button onClick={loadNotifications} className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition font-medium">
                                تحديث القائمة
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
