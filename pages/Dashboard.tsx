
import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle, 
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  ShieldAlert,
  Rocket,
  Sparkles,
  BarChart3
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
    chartData: [] as any[]
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
        chartData: analytics.chartData
      });

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
    };

    loadData();
  }, [user]);

  const kpiCards = [
    { 
        label: 'إجمالي المبيعات', 
        value: stats.totalSales, 
        change: 12, 
        icon: TrendingUp, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50', 
        border: 'border-blue-100',
        gradient: 'from-blue-500 to-cyan-500'
    },
    { 
        label: 'صافي الدخل', 
        value: stats.netProfit, 
        change: 8, 
        icon: DollarSign, 
        color: stats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600', 
        bg: stats.netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50',
        border: stats.netProfit >= 0 ? 'border-emerald-100' : 'border-red-100',
        gradient: stats.netProfit >= 0 ? 'from-emerald-500 to-teal-500' : 'from-red-500 to-orange-500'
    },
    { 
        label: 'عدد الفواتير', 
        value: stats.invoiceCount, 
        change: -3, 
        icon: ShoppingCart, 
        color: 'text-violet-600', 
        bg: 'bg-violet-50',
        border: 'border-violet-100',
        gradient: 'from-violet-500 to-purple-500' 
    },
    { 
        label: 'تنبيهات المخزون', 
        value: stats.lowStockCount, 
        change: 0, 
        icon: AlertTriangle, 
        color: 'text-amber-600', 
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        gradient: 'from-amber-500 to-orange-500' 
    },
  ];

  const getTipIcon = (text: string) => {
      if (text.includes('تنبيه') || text.includes('خطر') || text.includes('انتباه')) return <ShieldAlert size={20} className="text-red-500" />;
      if (text.includes('فرصة') || text.includes('زيادة') || text.includes('نمو')) return <Rocket size={20} className="text-emerald-500" />;
      return <Lightbulb size={20} className="text-amber-500" />;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section - Simplified */}
      <div>
         <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">مرحباً، {user?.name.split(' ')[0]} 👋</h2>
         <p className="text-slate-500 text-lg">
             إليك ملخص أداء متجرك <span className="font-bold text-slate-700">"{user?.storeName || 'الخاص'}"</span> اليوم.
         </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((stat, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-300 group ${stat.border}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              {stat.label !== 'تنبيهات المخزون' && (
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {stat.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span>{Math.abs(stat.change)}%</span>
                  </div>
              )}
            </div>
            <div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.label}</h3>
                <p className="text-3xl font-black text-slate-800">
                    {typeof stat.value === 'number' && stat.label !== 'عدد الفواتير' && stat.label !== 'تنبيهات المخزون' 
                        ? stat.value.toLocaleString() 
                        : stat.value} 
                    <span className="text-sm font-normal text-slate-400 mr-1">
                        {stat.label !== 'عدد الفواتير' && stat.label !== 'تنبيهات المخزون' ? CURRENCY : ''}
                    </span>
                </p>
            </div>
            {/* Decorative bottom bar */}
            <div className={`mt-4 h-1 w-full rounded-full bg-gradient-to-r ${stat.gradient} opacity-20`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <BarChart3 size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">تحليل المبيعات الأسبوعي</h3>
             </div>
          </div>
          <div className="flex-1 w-full min-h-[320px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}} 
                    dy={10} 
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}} 
                    dx={-10}
                />
                <Tooltip 
                  contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
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

        {/* AI Insights Card */}
        <div className="bg-white p-0 rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden relative">
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-white border-b border-indigo-50">
             <div className="flex items-center gap-2">
                <div className="bg-indigo-100 p-2 rounded-lg animate-pulse">
                    <Sparkles className="text-indigo-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">توصيات الذكاء الاصطناعي</h3>
             </div>
             <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                 تحليل فوري لبيانات متجرك لمساعدتك على اتخاذ قرارات أفضل.
             </p>
          </div>

          <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[400px]">
            {loadingAi ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full shrink-0"></div>
                        <div className="space-y-2 flex-1">
                            <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
              </div>
            ) : aiTips.length > 0 ? (
              aiTips.map((tip, i) => (
                <div key={i} className="group flex gap-4 bg-slate-50 hover:bg-white p-4 rounded-xl border border-transparent hover:border-slate-100 hover:shadow-sm transition-all duration-200">
                  <div className="mt-1 shrink-0 transition-transform group-hover:scale-110">
                      {getTipIcon(tip)}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{tip}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
                  <Lightbulb className="mb-2 opacity-30 w-8 h-8" />
                  جاري تحليل البيانات...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
