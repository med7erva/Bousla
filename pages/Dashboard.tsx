
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
import { getProducts, getSalesAnalytics, getExpenses, getInvoices } from '../services/db';
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
      
      const [products, analytics, expenses, allInvoices] = await Promise.all([
          getProducts(user.id),
          getSalesAnalytics(user.id),
          getExpenses(user.id),
          getInvoices(user.id)
      ]);
      
      const lowStockItems = products.filter(p => p.stock < 10).map(p => p.name);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalSales = analytics.totalSales;
      const netIncome = totalSales - totalExpenses; 
      const validInvoices = allInvoices.filter(inv => !inv.items.some(i => i.productId === 'opening-bal'));

      const productSalesMap: Record<string, {name: string, qty: number, revenue: number}> = {};
      validInvoices.forEach(inv => {
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

      const recentInvoices = validInvoices.slice(0, 5);
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

      if (validInvoices.length > 0) {
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
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-100 dark:border-emerald-800'
    },
    { 
        label: 'صافي الربح', 
        value: stats.netProfit, 
        icon: DollarSign, 
        color: stats.netProfit >= 0 ? 'text-blue-600' : 'text-red-600', 
        bg: stats.netProfit >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-red-50 dark:bg-red-900/20',
        border: stats.netProfit >= 0 ? 'border-blue-100 dark:border-blue-800' : 'border-red-100 dark:border-red-800'
    },
    { 
        label: 'الفواتير', 
        value: stats.invoiceCount, 
        icon: ShoppingCart, 
        color: 'text-violet-600', 
        bg: 'bg-violet-50 dark:bg-violet-900/20',
        border: 'border-violet-100 dark:border-violet-800'
    },
    { 
        label: 'النواقص', 
        value: stats.lowStockCount, 
        icon: AlertTriangle, 
        color: 'text-amber-600', 
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-100 dark:border-amber-800'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
         <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">لوحة التحكم</h2>
             <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">مرحباً بك في بوصلة؛ متجرك بين يديك.</p>
         </div>
         <div className="flex gap-3 w-full lg:w-auto">
            <Link to="/sales" className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 dark:shadow-none font-bold">
                <Plus size={20} />
                <span>بيع جديد</span>
            </Link>
            <Link to="/ai-chat" className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none font-bold">
                <Sparkles size={20} />
                <span>اسأل بوصلة</span>
            </Link>
         </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((stat, idx) => (
          <div key={idx} className={`bg-white dark:bg-slate-800 p-6 rounded-3xl border ${stat.border} shadow-sm transition-all duration-300 hover:shadow-md group relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 delay-${idx*100}`}>
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full ${stat.bg} opacity-20 group-hover:scale-150 transition-transform`}></div>
            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                    <stat.icon size={24} />
                </div>
                {stat.label === 'صافي الربح' && (
                    <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg text-slate-500 dark:text-slate-300">مباشر</span>
                )}
            </div>
            <div>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                    {stat.value.toLocaleString()} 
                    <span className="text-xs font-bold text-slate-400 mr-1">
                        {stat.label.includes('المبيعات') || stat.label.includes('الربح') ? CURRENCY : 'وحدة'}
                    </span>
                </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <BarChart3 size={20} className="text-emerald-500" />
                        أداء المبيعات الأخير
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">مخطط المبيعات اليومي للأسبوع الحالي</p>
                </div>
                <div className="text-left">
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.totalSales.toLocaleString()} <span className="text-xs">{CURRENCY}</span></p>
                </div>
            </div>
            
            <div className="h-72 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData}>
                        <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={15} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dx={-10} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#chartGrad)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* AI & Top Products Sidebar */}
        <div className="space-y-8">
            {/* AI Insight Card */}
            <div className="bg-indigo-600 dark:bg-indigo-900/50 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Sparkles className="text-yellow-300" size={20} />
                        </div>
                        <h3 className="font-black text-lg">تحليل بوصلة الذكي</h3>
                    </div>
                    
                    <div className="space-y-4">
                        {loadingAi ? (
                            <div className="space-y-2">
                                <div className="h-3 bg-white/20 rounded-full w-full animate-pulse"></div>
                                <div className="h-3 bg-white/20 rounded-full w-3/4 animate-pulse"></div>
                            </div>
                        ) : aiTips.length > 0 ? (
                            aiTips.map((tip, i) => (
                                <div key={i} className="flex gap-3 text-sm font-bold bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition cursor-default border border-white/5">
                                    <span className="text-yellow-400">●</span>
                                    <span>{tip.replace(/^- /, '')}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-indigo-200 text-sm font-medium">ابدأ بتسجيل عمليات البيع للحصول على تحليلات.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Products */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <h3 className="font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <Package size={18} className="text-indigo-500" />
                    الأكثر طلباً
                </h3>
                <div className="space-y-4">
                    {stats.topProducts.map((prod, idx) => (
                        <div key={idx} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center font-black text-[10px] text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                                    {idx + 1}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate max-w-[140px]">{prod.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{prod.qty} مباع</p>
                                </div>
                            </div>
                            <span className="font-black text-slate-800 dark:text-white text-sm">{prod.revenue.toLocaleString()}</span>
                        </div>
                    ))}
                    {stats.topProducts.length === 0 && <p className="text-center text-slate-400 text-xs py-4 font-bold">لا توجد بيانات كافية</p>}
                </div>
            </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/30">
              <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Clock size={18} className="text-slate-400" />
                  آخر عمليات البيع
              </h3>
              <Link to="/sales" className="text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">عرض السجل</Link>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700">
              {stats.recentInvoices.map((inv) => (
                  <div key={inv.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300">
                              <ShoppingCart size={20} />
                          </div>
                          <div>
                              <p className="font-bold text-slate-800 dark:text-white">{inv.customerName}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase mt-0.5">{new Date(inv.date).toLocaleTimeString('ar-MA', {hour: '2-digit', minute:'2-digit'})} • {inv.items.length} قطع</p>
                          </div>
                      </div>
                      <div className="text-left">
                          <p className="font-black text-slate-800 dark:text-white">{inv.total} <span className="text-[10px]">{CURRENCY}</span></p>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${inv.remainingAmount > 0 ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                              {inv.remainingAmount > 0 ? 'آجل' : 'مكتمل'}
                          </span>
                      </div>
                  </div>
              ))}
              {stats.recentInvoices.length === 0 && <div className="p-12 text-center text-slate-400 font-bold">لا توجد مبيعات حديثة</div>}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
