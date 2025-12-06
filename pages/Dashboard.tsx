
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
  Sparkles
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
      // Fetch all required data for a comprehensive analysis
      const [products, analytics, expenses, invoices] = await Promise.all([
          getProducts(user.id),
          getSalesAnalytics(user.id),
          getExpenses(user.id),
          getInvoices(user.id)
      ]);
      
      const lowStockItems = products.filter(p => p.stock < 10).map(p => p.name);
      
      // Calculate Financials
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalSales = analytics.totalSales;
      // Net Profit = Sales - Expenses (Simple Cash Flow View for Dashboard)
      const netIncome = totalSales - totalExpenses; 
      
      // Calculate Top Products
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

      // Trend Analysis (Simple)
      const salesTrend = analytics.chartData.length > 2 && 
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

      // AI Insights - Pass RICH Context
      setLoadingAi(true);
      const context: DashboardContext = {
          totalSales,
          totalExpenses,
          totalProfit: netIncome, // Using Net Income as main profit indicator here
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
    { label: 'إجمالي المبيعات', value: `${stats.totalSales.toLocaleString()} ${CURRENCY}`, change: 12, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'صافي الدخل (تقريبي)', value: `${stats.netProfit.toLocaleString()} ${CURRENCY}`, change: 8, icon: DollarSign, color: stats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600', bg: stats.netProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100' },
    { label: 'عدد الفواتير', value: stats.invoiceCount.toString(), change: -3, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'تنبيهات المخزون', value: stats.lowStockCount.toString(), change: 0, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  // Helper to choose icon for tip based on content keywords
  const getTipIcon = (text: string) => {
      if (text.includes('تنبيه') || text.includes('خطر') || text.includes('انتباه')) return <ShieldAlert size={20} className="text-red-500" />;
      if (text.includes('فرصة') || text.includes('زيادة') || text.includes('نمو')) return <Rocket size={20} className="text-emerald-500" />;
      return <Lightbulb size={20} className="text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Msg */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">مرحباً، {user?.name.split(' ')[0]} 👋</h2>
        <p className="text-gray-500 text-sm">إليك ملخص أداء متجرك "{user?.storeName}" اليوم.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${stat.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                <span>{Math.abs(stat.change)}%</span>
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">تحليل المبيعات</h3>
          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Card (Simple Style) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-indigo-50 p-2 rounded-lg">
                <Sparkles className="text-indigo-600" size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">تحليلات الذكاء الاصطناعي</h3>
          </div>

          <div className="space-y-4 flex-1">
            {loadingAi ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-gray-100 rounded-xl w-full"></div>
                <div className="h-16 bg-gray-100 rounded-xl w-full"></div>
                <div className="h-16 bg-gray-100 rounded-xl w-full"></div>
              </div>
            ) : aiTips.length > 0 ? (
              aiTips.map((tip, i) => (
                <div key={i} className="flex gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 transition hover:border-indigo-100">
                  <div className="mt-1 shrink-0">
                      {getTipIcon(tip)}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">{tip}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                  <Lightbulb className="mb-2 opacity-50" />
                  جاري تحليل بيانات متجرك...
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
               <Sparkles size={10} />
               تم التحديث: {new Date().toLocaleTimeString('ar-MA', {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
