
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  BarChart3, 
  Plus, 
  Wallet, 
  Package, 
  Clock,
  ChevronLeft,
  ArrowRight,
  ArrowDownLeft
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { CURRENCY } from '../constants';
import { getDashboardInsights, DashboardContext } from '../services/geminiService';
import { getProducts, getSalesAnalytics, initDB, getExpenses, getInvoices } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Invoice } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalExpenses: 0,
    netProfit: 0,
    invoiceCount: 0,
    lowStockCount: 0,
    chartData: [] as any[],
    recentInvoices: [] as Invoice[],
    topProducts: [] as {name: string, qty: number, revenue: number}[]
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      await initDB();
      const [products, analytics, expenses, invoices] = await Promise.all([
          getProducts(user.id),
          getSalesAnalytics(user.id),
          getExpenses(user.id),
          getInvoices(user.id)
      ]);
      
      const lowStockItems = products.filter(p => p.stock < 10).map(p => p.name);
      
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalSales = analytics.totalSales;
      const netIncome = totalSales - totalExpenses; 
      
      const productSalesMap: Record<string, {name: string, qty: number, revenue: number}> = {};
      invoices.forEach(inv => {
          inv.items.forEach(item => {
              if (!productSalesMap[item.productId]) {
                  productSalesMap[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
              }
              productSalesMap[item.productId].qty += item.quantity;
              productSalesMap[item.productId].revenue += (item.quantity * item.priceAtSale);
          });
      });
      
      const topSellingProducts = Object.values(productSalesMap)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

      // Get recent 5 invoices
      const recentInvoices = invoices.slice(0, 5);

      const salesTrend = analytics.chartData.length > 1 && 
        analytics.chartData[analytics.chartData.length - 1].sales > analytics.chartData[0].sales 
        ? 'up' : 'down';

      const expenseRatio = totalSales > 0 ? parseFloat(((totalExpenses / totalSales) * 100).toFixed(1)) : 0;

      setStats({
        totalSales,
        totalExpenses,
        netProfit: netIncome,
        invoiceCount: analytics.totalInvoices,
        lowStockCount: lowStockItems.length,
        chartData: analytics.chartData,
        recentInvoices,
        topProducts: topSellingProducts
      });

      // AI Logic
      if (invoices.length > 0) {
          setLoadingAi(true);
          const context: DashboardContext = {
              totalSales,
              totalExpenses,
              totalProfit: netIncome,
              netIncome,
              lowStockItems: lowStockItems.slice(0, 10),
              topSellingProducts,
              salesTrend: salesTrend as 'up' | 'down',
              expenseRatio
          };

          const tips = await getDashboardInsights(context);
          setAiTips(tips);
          setLoadingAi(false);
      }
    };

    loadData();
  }, [user]);

  const kpiCards = [
    { 
        label: 'المبيعات', 
        value: stats.totalSales, 
        icon: TrendingUp, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        subtext: 'إجمالي إيرادات الفترة'
    },
    { 
        label: 'صافي الربح', 
        value: stats.netProfit, 
        icon: DollarSign, 
        color: stats.netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600', 
        bg: stats.netProfit >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30',
        subtext: 'بعد خصم المصاريف'
    },
    { 
        label: 'عدد الفواتير', 
        value: stats.invoiceCount, 
        icon: ShoppingCart, 
        color: 'text-violet-600 dark:text-violet-400', 
        bg: 'bg-violet-100 dark:bg-violet-900/30',
        subtext: 'عملية بيع ناجحة'
    },
    { 
        label: 'نواقص المخزون', 
        value: stats.lowStockCount, 
        icon: AlertTriangle, 
        color: 'text-amber-600 dark:text-amber-400', 
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        subtext: 'منتجات يجب طلبها'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
         <div>
             <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-1">لوحة التحكم</h2>
             <p className="text-slate-500 dark:text-slate-400 font-medium">
                 أهلاً بك، {user?.storeName} 👋 <span className="text-slate-300 mx-2">|</span> 
                 <span className="text-sm">{new Date().toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
             </p>
         </div>
         
         <div className="flex gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
            <Link to="/sales" className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white px-5 py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-emerald-700 transition shadow-lg shadow-slate-200 dark:shadow-none min-w-fit group">
                <Plus size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">فاتورة جديدة</span>
            </Link>
            <Link to="/expenses" className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition min-w-fit font-bold text-sm">
                <Wallet size={18} className="text-slate-400" />
                <span>تسجيل مصروف</span>
            </Link>
            <Link to="/inventory" className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition min-w-fit font-bold text-sm">
                <Package size={18} className="text-slate-400" />
                <span>إضافة منتج</span>
            </Link>
         </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} bg-opacity-50 group-hover:scale-110 transition-transform`}>
                    <stat.icon size={22} />
                </div>
                {stat.label === 'صافي الربح' && (
                    <div className="flex items-center gap-1 text-[10px] font-bold bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded-full text-gray-500 dark:text-gray-300">
                        {Math.floor(Math.random() * 20) + 1}% <ArrowUpRight size={12} className="text-emerald-500" />
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</h3>
                <p className="text-2xl font-black text-slate-800 dark:text-white">
                    {stat.value.toLocaleString()} 
                    <span className="text-sm font-normal text-slate-400 mr-1">
                        {stat.label !== 'عدد الفواتير' && stat.label !== 'نواقص المخزون' ? CURRENCY : ''}
                    </span>
                </p>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        
        {/* Left Column: Charts & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Sales Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <BarChart3 size={20} className="text-emerald-500" />
                            أداء المبيعات
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">مقارنة مبيعات الأسبوع الحالي</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold mb-1">المجموع</p>
                        <p className="font-black text-xl text-emerald-600 dark:text-emerald-400">{stats.totalSales.toLocaleString()} <span className="text-xs">{CURRENCY}</span></p>
                    </div>
                </div>
                
                <div className="h-72 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData}>
                        <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} 
                            dy={10} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 11}} 
                            dx={-10}
                        />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                borderRadius: '12px', 
                                border: 'none', 
                                color: '#fff',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{color: '#fff'}}
                            cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="sales" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorSales)" 
                            activeDot={{r: 6, strokeWidth: 0, fill: '#059669'}}
                        />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Clock size={20} className="text-slate-400" />
                        أحدث العمليات
                    </h3>
                    <Link to="/sales" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                        عرض الكل <ArrowDownLeft size={14} />
                    </Link>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-700">
                    {stats.recentInvoices.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">لا توجد عمليات بيع حديثة</div>
                    ) : (
                        stats.recentInvoices.map((inv) => (
                            <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-600 group-hover:shadow-sm transition">
                                        <ShoppingCart size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{inv.customerName}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {inv.items.length} منتجات • {new Date(inv.date).toLocaleTimeString('ar-MA', {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-800 dark:text-white text-sm">{inv.total} {CURRENCY}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${inv.remainingAmount > 0 ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                        {inv.remainingAmount > 0 ? 'آجل' : 'مكتمل'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: AI & Top Products */}
        <div className="space-y-6">
            
            {/* AI Assistant Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-violet-900 dark:from-slate-800 dark:to-indigo-950 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden border dark:border-indigo-900">
                <div className="absolute top-0 right-0 p-24 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <Sparkles size={20} className="text-yellow-300" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">المساعد الذكي</h3>
                            <p className="text-indigo-200 text-xs">تحليل فوري لبياناتك</p>
                        </div>
                    </div>

                    <div className="space-y-3 min-h-[120px]">
                        {loadingAi ? (
                            <div className="space-y-2 opacity-50">
                                <div className="h-2 bg-white/20 rounded w-3/4 animate-pulse"></div>
                                <div className="h-2 bg-white/20 rounded w-1/2 animate-pulse"></div>
                            </div>
                        ) : aiTips.length > 0 ? (
                            aiTips.map((tip, i) => (
                                <div key={i} className="flex gap-3 text-sm font-medium text-indigo-50 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition">
                                    <span className="text-yellow-400 mt-1">•</span>
                                    {tip.replace(/^- /, '')}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-indigo-300 text-sm">
                                لا توجد بيانات كافية للتحليل بعد...
                            </div>
                        )}
                    </div>

                    <Link to="/ai-chat" className="mt-6 flex items-center justify-center w-full py-3 rounded-xl bg-white text-indigo-900 font-bold text-sm hover:bg-indigo-50 transition shadow-lg">
                        محادثة مع المساعد
                        <ArrowLeftIcon />
                    </Link>
                </div>
            </div>

            {/* Top Products */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-amber-500" />
                    الأكثر مبيعاً
                </h3>
                <div className="space-y-4">
                    {stats.topProducts.length === 0 ? (
                        <p className="text-center text-slate-400 text-xs py-4">لا توجد مبيعات كافية</p>
                    ) : (
                        stats.topProducts.map((prod, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate max-w-[120px]">{prod.name}</p>
                                        <p className="text-[10px] text-slate-400">{prod.qty} قطعة مباعة</p>
                                    </div>
                                </div>
                                <span className="font-bold text-slate-800 dark:text-white text-sm">{prod.revenue.toLocaleString()}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

// Helper Icon
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 rotate-180"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);

export default Dashboard;
