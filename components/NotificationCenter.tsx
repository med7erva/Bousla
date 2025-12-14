
import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, TrendingUp, Sparkles, X, ChevronRight, Package, Users, BellRing } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext'; // Import Settings Context
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
    const { settings } = useSettings(); // Use settings
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
                body: 'ستصلك تنبيهات بنواقص المخزون والتحليلات المهمة.',
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
            let hasCriticalAlert = false;

            // 1. Operational: Low Stock (Respect Settings)
            if (settings.notifications.lowStock) {
                const threshold = settings.notifications.lowStockThreshold || 5;
                const lowStock = products.filter(p => p.stock <= threshold);
                
                if (lowStock.length > 0) {
                    const msg = `يوجد ${lowStock.length} منتجات على وشك النفاد (أقل من ${threshold})، منها: ${lowStock[0].name}`;
                    newNotifications.push({
                        id: 'op-stock',
                        type: 'operational',
                        subtype: 'stock',
                        title: 'تنبيه مخزون',
                        message: msg,
                        date: new Date(),
                        isRead: false,
                        actionLink: '/inventory'
                    });
                    
                    if (!isOpen) {
                        sendSystemNotification('تنبيه مخزون حرج ⚠️', msg);
                        hasCriticalAlert = true;
                    }
                }
            }

            // 1.5. Operational: Out of Stock (Respect Settings)
            if (settings.notifications.outOfStock) {
                const outStock = products.filter(p => p.stock === 0);
                if (outStock.length > 0) {
                     newNotifications.push({
                        id: 'op-out-stock',
                        type: 'operational',
                        subtype: 'stock',
                        title: 'منتجات نفدت',
                        message: `لقد نفد مخزون ${outStock.length} من المنتجات، منها: ${outStock[0].name}`,
                        date: new Date(),
                        isRead: false,
                        actionLink: '/inventory'
                    });
                }
            }

            // 2. Operational: High Client Debt (Threshold Hardcoded for now, could be setting)
            const highDebt = clients.filter(c => c.debt > 10000); 
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

            // 3. Operational: High Expenses (Respect Settings)
            if (settings.notifications.highExpenses && settings.notifications.highExpensesThreshold > 0) {
                // Find recent expenses higher than threshold (last 24h)
                const oneDayAgo = new Date();
                oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                
                const highExp = expenses.find(e => 
                    e.amount >= settings.notifications.highExpensesThreshold && 
                    new Date(e.date) > oneDayAgo
                );

                if (highExp) {
                     newNotifications.push({
                        id: 'op-exp-high',
                        type: 'operational',
                        subtype: 'sales', // reusing icon style
                        title: 'مصروف مرتفع',
                        message: `تم تسجيل مصروف بقيمة ${highExp.amount} بعنوان "${highExp.title}" يتجاوز الحد المسموح.`,
                        date: new Date(highExp.date),
                        isRead: false,
                        actionLink: '/expenses'
                    });
                }
            }

            // 4. Analytical: AI Insights (Respect Settings)
            if (settings.ai.enabled && settings.ai.smartAlerts && analytics.totalSales > 0) {
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
        // Initial load
        loadNotifications();
        
        // Poll every 5 minutes to check for alerts (simulating push)
        const interval = setInterval(() => {
            loadNotifications();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [user, settings]); // Re-run when settings change

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
                className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
                <Bell size={22} />
                {unreadCount > 0 && !isOpen && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                    <div className="p-4 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                        <h3 className="font-bold text-slate-800 dark:text-white">الإشعارات</h3>
                        
                        {permission === 'default' && (
                            <button 
                                onClick={requestPermission}
                                className="flex items-center gap-1 text-[10px] bg-indigo-600 text-white px-2 py-1 rounded-lg hover:bg-indigo-700 transition"
                            >
                                <BellRing size={12} />
                                تفعيل التنبيهات
                            </button>
                        )}
                        
                        {permission === 'granted' && (
                            <button onClick={loadNotifications} className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                                تحديث
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">
                                جاري التحليل...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm flex flex-col items-center">
                                <Bell className="mb-2 opacity-20" size={32} />
                                لا توجد إشعارات جديدة
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 dark:divide-slate-700">
                                {notifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition flex gap-3 ${notif.type === 'analytical' ? 'bg-indigo-50/30 dark:bg-indigo-900/20' : ''}`}
                                    >
                                        <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
                                            ${notif.subtype === 'stock' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                                              notif.subtype === 'debt' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 
                                              'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}
                                        >
                                            {notif.subtype === 'stock' && <Package size={14} />}
                                            {notif.subtype === 'debt' && <Users size={14} />}
                                            {notif.subtype === 'ai' && <Sparkles size={14} />}
                                            {notif.subtype === 'sales' && <TrendingUp size={14} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className={`text-sm font-bold ${notif.type === 'analytical' ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-800 dark:text-white'}`}>
                                                    {notif.title}
                                                </h4>
                                                <span className="text-[10px] text-gray-400">اليوم</span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-slate-300 mt-1 leading-relaxed">
                                                {notif.message}
                                            </p>
                                            {notif.actionLink && (
                                                <a href={`#${notif.actionLink}`} className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 hover:underline">
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
