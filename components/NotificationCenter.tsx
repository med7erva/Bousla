
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, AlertTriangle, TrendingUp, Sparkles, X, ChevronRight, Package, Users, BellRing, Clock, Wallet, Info, CheckCheck } from 'lucide-react';
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
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

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

    // Update coordinates when opening
    const toggleOpen = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 10,
                left: rect.left // Align with the left edge of the button (RTL agnostic for simple layout)
            });
        }
        setIsOpen(!isOpen);
    };

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
        <>
            <button 
                ref={buttonRef}
                onClick={toggleOpen}
                className={`
                    relative p-2.5 rounded-full transition-all duration-200
                    ${isOpen 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}
                `}
                aria-label="Notifications"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse shadow-sm"></span>
                )}
            </button>

            {isOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-start overflow-hidden">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Panel */}
                    <div 
                        className={`
                            relative w-full md:w-[380px] bg-white dark:bg-slate-900 
                            rounded-t-3xl md:rounded-2xl shadow-2xl 
                            flex flex-col max-h-[85vh] md:max-h-[600px]
                            animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200
                            border border-gray-100 dark:border-slate-700
                        `}
                        style={
                            window.innerWidth >= 768 
                            ? { 
                                position: 'absolute', 
                                top: coords.top, 
                                left: Math.min(coords.left, window.innerWidth - 390) // Prevent overflow right
                              } 
                            : {}
                        }
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-t-3xl md:rounded-t-2xl sticky top-0 z-10">
                            <div>
                                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">الإشعارات</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">تحديثات تشغيلية يومية</p>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                {permission === 'default' && (
                                    <button 
                                        onClick={requestPermission}
                                        className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition mr-1"
                                        title="تفعيل التنبيهات"
                                    >
                                        <BellRing size={18} />
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto custom-scrollbar flex-1 p-3 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
                            {loading ? (
                                <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                                    <span className="text-sm font-medium">جاري التحديث...</span>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-16 text-center flex flex-col items-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-800 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                        <Bell className="text-slate-300 dark:text-slate-600" size={32} />
                                    </div>
                                    <h4 className="text-slate-900 dark:text-white font-bold mb-1">لا توجد إشعارات</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[200px] leading-relaxed">
                                        أمورك تمام! سننبهك عند وجود أي مستجدات هامة.
                                    </p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className={`
                                            relative p-4 rounded-2xl border transition-all duration-200 group
                                            ${notif.priority === 'high' 
                                                ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' 
                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md'}
                                        `}
                                    >
                                        <div className="flex gap-4">
                                            {/* Icon Column */}
                                            <div className="shrink-0 flex flex-col items-center gap-2">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600`}>
                                                    {getIcon(notif.subtype)}
                                                </div>
                                                {notif.priority === 'high' && (
                                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                                )}
                                            </div>

                                            {/* Content Column */}
                                            <div className="flex-1 min-w-0 pt-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`font-bold text-sm truncate ${notif.priority === 'high' ? 'text-red-800 dark:text-red-300' : 'text-slate-800 dark:text-white'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                                                        {notif.date.toLocaleTimeString('ar-MA', {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3 line-clamp-3">
                                                    {notif.message}
                                                </p>
                                                
                                                {notif.actionLink && (
                                                    <div className="flex justify-end">
                                                        <a 
                                                            href={`#${notif.actionLink}`} 
                                                            onClick={() => setIsOpen(false)}
                                                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                                        >
                                                            <span>اتخاذ إجراء</span>
                                                            <ChevronRight size={12} className="rtl:rotate-180" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {/* Footer */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center rounded-b-3xl md:rounded-b-2xl">
                            <button onClick={loadNotifications} className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition flex items-center gap-1.5">
                                <Clock size={14} />
                                تحديث الآن
                            </button>
                            
                            {notifications.length > 0 && (
                                <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition flex items-center gap-1.5">
                                    <CheckCheck size={16} />
                                    تحديد الكل كمقروء
                                </button>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default NotificationCenter;
