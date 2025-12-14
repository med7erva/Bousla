
import React, { useState, useEffect } from 'react';
import { 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
    Calendar, 
    FileDown, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Package, 
    AlertTriangle, 
    Loader2,
    ArrowUpRight,
    ArrowDownLeft,
    Activity,
    Percent,
    FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext'; // Import settings context for dark mode check
import { getReportData } from '../services/db';
import { CURRENCY } from '../constants';

const EXPENSE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#6366f1', '#8b5cf6', '#ec4899'];

const Reports: React.FC = () => {
    const { user } = useAuth();
    const { settings } = useSettings(); // Use settings to detect dark mode
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], // Last 30 days
        end: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    
    // Data State with safe defaults
    const [kpis, setKpis] = useState({
        totalSales: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        stockValue: 0,
        grossProfit: 0,
        totalCOGS: 0
    });

    const [salesTrend, setSalesTrend] = useState<any[]>([]);
    const [productStats, setProductStats] = useState<{
        topSelling: any[],
        slowMoving: any[],
        lowStock: any[]
    }>({ topSelling: [], slowMoving: [], lowStock: [] });
    
    const [expenseStats, setExpenseStats] = useState<{
        breakdown: any[]
    }>({ breakdown: [] });

    const [cashFlow, setCashFlow] = useState<{
        inflow: { sales: number, receipts: number, total: number },
        outflow: { expenses: number, purchases: number, payments: number, total: number },
        net: number
    }>({
        inflow: { sales: 0, receipts: 0, total: 0 },
        outflow: { expenses: 0, purchases: 0, payments: 0, total: 0 },
        net: 0
    });

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        
        try {
            const report = await getReportData(user.id, dateRange.start, dateRange.end);
            
            // --- 1. Basic KPIs & P&L Calculation ---
            const totalSales = report.invoices.reduce((sum, i) => sum + (i.total || 0), 0);
            const totalExpenses = report.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
            
            // Calculate COGS (Cost of Goods Sold)
            let totalCOGS = 0;
            report.invoices.forEach(inv => {
                if(inv.items && Array.isArray(inv.items)) {
                    inv.items.forEach(item => {
                        const prod = report.products.find(p => p.id === item.productId);
                        const cost = prod ? prod.cost : 0; 
                        totalCOGS += (cost * item.quantity);
                    });
                }
            });

            const grossProfit = totalSales - totalCOGS;
            const netProfit = grossProfit - totalExpenses;
            const profitMargin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0;
            const stockValue = report.products.reduce((sum, p) => sum + (p.stock * p.cost), 0);

            setKpis({
                totalSales,
                totalExpenses,
                netProfit,
                profitMargin: Number(profitMargin),
                stockValue,
                grossProfit,
                totalCOGS
            });

            // --- 2. Sales Trend (Line Chart) ---
            const dailyMap: Record<string, number> = {};
            let curr = new Date(dateRange.start);
            const end = new Date(dateRange.end);
            
            // Limit loop to prevent infinite loop if dates are invalid
            let safetyCounter = 0;
            while(curr <= end && safetyCounter < 366) {
                const d = curr.toISOString().split('T')[0];
                dailyMap[d] = 0;
                curr.setDate(curr.getDate() + 1);
                safetyCounter++;
            }

            report.invoices.forEach(inv => {
                if(inv.date) {
                    const d = inv.date.split('T')[0];
                    if(dailyMap[d] !== undefined) dailyMap[d] += (inv.total || 0);
                }
            });

            const trendData = Object.keys(dailyMap).map(date => ({
                date: new Date(date).toLocaleDateString('ar-MA', {day: '2-digit', month: '2-digit'}),
                fullDate: date,
                sales: dailyMap[date] // English key for safety
            }));
            setSalesTrend(trendData);

            // --- 3. Product Analysis (Modified for Revenue) ---
            const prodPerformance: Record<string, {name: string, sold: number, stock: number, revenue: number}> = {};
            
            // Initialize
            report.products.forEach(p => {
                prodPerformance[p.id] = { name: p.name, sold: 0, stock: p.stock, revenue: 0 };
            });

            // Calculate Sold Quantity AND Revenue
            report.invoices.forEach(inv => {
                if(inv.items) {
                    inv.items.forEach(item => {
                        if (prodPerformance[item.productId]) {
                            prodPerformance[item.productId].sold += item.quantity;
                            
                            // Calculate Revenue for this item sale
                            const revenue = item.quantity * item.priceAtSale;
                            prodPerformance[item.productId].revenue += revenue;
                        }
                    });
                }
            });

            const allProds = Object.values(prodPerformance);
            
            // Sort by REVENUE instead of Profit
            const topSelling = [...allProds].sort((a,b) => b.revenue - a.revenue).filter(p => p.revenue > 0).slice(0, 5);
            
            // Slow moving (based on quantity sold)
            const slowMoving = [...allProds].sort((a,b) => a.sold - b.sold).slice(0, 5);
            
            // Low Stock
            const lowStock = report.products.filter(p => p.stock <= 5).map(p => ({
                name: p.name, stock: p.stock, sold: prodPerformance[p.id]?.sold || 0
            })).sort((a,b) => a.stock - b.stock).slice(0, 5);

            setProductStats({ topSelling, slowMoving, lowStock });

            // --- 4. Expenses Analysis ---
            const expMap: Record<string, number> = {};
            report.expenses.forEach(e => {
                const cat = e.categoryName || 'غير مصنف';
                expMap[cat] = (expMap[cat] || 0) + e.amount;
            });
            const expBreakdown = Object.keys(expMap).map(name => ({ name, value: expMap[name] })).sort((a,b) => b.value - a.value);
            setExpenseStats({ breakdown: expBreakdown });

            // --- 5. Cash Flow Analysis ---
            const salesIn = report.invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0); 
            const txIn = report.transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + (t.amount || 0), 0);
            const purchasesOut = report.purchases.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
            const expensesOut = totalExpenses;
            const txOut = report.transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + (t.amount || 0), 0);

            setCashFlow({
                inflow: { sales: salesIn, receipts: txIn, total: salesIn + txIn },
                outflow: { expenses: expensesOut, purchases: purchasesOut, payments: txOut, total: expensesOut + purchasesOut + txOut },
                net: (salesIn + txIn) - (expensesOut + purchasesOut + txOut)
            });

        } catch (err) {
            console.error("Report Data Load Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user, dateRange]);

    const handleExportPDF = async () => {
        setExporting(true);
        try {
            // Dynamic import to prevent initial load crash if module missing
            // @ts-ignore
            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = html2pdfModule.default || html2pdfModule;

            const element = document.getElementById('report-container');
            const opt = {
                margin: [0.3, 0.3],
                filename: `تقرير_بوصلة_${dateRange.end}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(element).save();
        } catch (e) {
            console.error("PDF Export failed", e);
            alert("حدث خطأ أثناء التصدير. تأكد من الاتصال بالإنترنت.");
        } finally {
            setExporting(false);
        }
    };

    if (loading) return <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500 dark:text-slate-400 gap-4"><Loader2 className="animate-spin text-emerald-600" size={40} /><span className="text-lg font-medium">جاري إعداد التقارير...</span></div>;

    // Dark Mode Colors for Charts
    const isDark = settings.system.darkMode;
    const gridColor = isDark ? '#334155' : '#f1f5f9';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const tooltipBg = isDark ? '#1e293b' : '#fff';
    const tooltipColor = isDark ? '#fff' : '#1e293b';

    return (
        <div className="space-y-8 pb-10">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">التقارير المالية</h1>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">نظرة شاملة على أداء المتجر، الأرباح، والمخزون</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700 p-2 rounded-xl border border-gray-200 dark:border-slate-600 shadow-sm flex-1 md:flex-none">
                        <Calendar size={18} className="text-gray-400 dark:text-slate-400" />
                        <input 
                            type="date" 
                            className="text-sm outline-none bg-transparent font-medium text-gray-700 dark:text-slate-200"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        />
                        <span className="text-gray-300 dark:text-slate-500">|</span>
                        <input 
                            type="date" 
                            className="text-sm outline-none bg-transparent font-medium text-gray-700 dark:text-slate-200"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        />
                    </div>
                    <button 
                        onClick={handleExportPDF}
                        disabled={exporting}
                        className="flex items-center justify-center gap-2 bg-slate-800 dark:bg-slate-700 text-white px-5 py-2.5 rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition shadow-md font-bold text-sm disabled:opacity-70 min-w-[120px]"
                    >
                        {exporting ? <Loader2 className="animate-spin" size={18} /> : <FileDown size={18} />}
                        تصدير
                    </button>
                </div>
            </div>

            <div id="report-container" className="space-y-8">
                
                {/* PDF Header */}
                <div className="hidden pdf-header flex-col items-center mb-8 border-b-2 border-gray-100 pb-6 text-center">
                    <h1 className="text-3xl font-black text-gray-800 mb-2">{user?.storeName}</h1>
                    <p className="text-gray-500 text-sm">تقرير الفترة: {dateRange.start} إلى {dateRange.end}</p>
                </div>

                {/* --- 1. KEY PERFORMANCE INDICATORS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Net Profit */}
                    <div className="bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-900/10 p-6 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">صافي الربح</p>
                                <h3 className={`text-2xl font-black tracking-tight ${kpis.netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {kpis.netProfit.toLocaleString()} <span className="text-sm font-medium opacity-70">{CURRENCY}</span>
                                </h3>
                            </div>
                            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-emerald-600 dark:text-emerald-400">
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Percent size={10} />
                                {kpis.profitMargin}% هامش
                            </span>
                        </div>
                    </div>

                    {/* Total Sales */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 group hover:border-blue-200 dark:hover:border-blue-800 transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">إجمالي المبيعات</p>
                                <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                                    {kpis.totalSales.toLocaleString()} <span className="text-sm font-medium text-gray-400">{CURRENCY}</span>
                                </h3>
                            </div>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-slate-500">الإيرادات قبل خصم التكاليف</p>
                    </div>

                    {/* Expenses */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 group hover:border-red-200 dark:hover:border-red-900 transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">المصاريف</p>
                                <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                                    {kpis.totalExpenses.toLocaleString()} <span className="text-sm font-medium text-gray-400">{CURRENCY}</span>
                                </h3>
                            </div>
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                                <TrendingDown size={20} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-slate-500">مصاريف تشغيلية ورواتب</p>
                    </div>

                    {/* Stock Value */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 group hover:border-purple-200 dark:hover:border-purple-900 transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">قيمة المخزون</p>
                                <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                                    {kpis.stockValue.toLocaleString()} <span className="text-sm font-medium text-gray-400">{CURRENCY}</span>
                                </h3>
                            </div>
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                <Package size={20} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-slate-500">محسوبة بسعر التكلفة</p>
                    </div>
                </div>

                {/* --- 2. Sales Chart --- */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 text-lg">
                            <TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" />
                            اتجاه المبيعات (يومي)
                        </h3>
                    </div>
                    <div className="h-80 w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesTrend} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.4} />
                                <XAxis 
                                    dataKey="date" 
                                    fontSize={11} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dy={10} 
                                    tick={{fill: textColor}}
                                />
                                <YAxis 
                                    fontSize={11} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dx={-10}
                                    tick={{fill: textColor}}
                                />
                                <Tooltip 
                                    contentStyle={{backgroundColor: tooltipBg, borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', color: tooltipColor}}
                                    cursor={{stroke: isDark ? '#475569' : '#e2e8f0', strokeWidth: 1}}
                                    itemStyle={{color: tooltipColor}}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="sales" 
                                    name="المبيعات"
                                    stroke="#10b981" 
                                    strokeWidth={3} 
                                    dot={false} 
                                    activeDot={{r: 6, fill: '#059669', strokeWidth: 0}} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- 3. Product Insights --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Top Selling (Revenue) */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-900/10 flex items-center gap-2">
                            <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
                            <h3 className="font-bold text-gray-800 dark:text-white">الأكثر مبيعاً (إيرادات)</h3>
                        </div>
                        <div className="p-2 flex-1">
                            {productStats.topSelling.length === 0 ? <p className="text-center text-gray-400 p-4 text-sm">لا توجد بيانات</p> : (
                                <table className="w-full text-right text-sm">
                                    <tbody>
                                        {productStats.topSelling.map((p, i) => (
                                            <tr key={i} className="border-b border-gray-50 dark:border-slate-700 last:border-0 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 transition">
                                                <td className="p-3 font-medium text-gray-700 dark:text-slate-200">{p.name}</td>
                                                <td className="p-3 text-left">
                                                    <div className="font-bold text-emerald-600 dark:text-emerald-400">{p.revenue.toLocaleString()} {CURRENCY}</div>
                                                    <div className="text-[10px] text-gray-400 dark:text-slate-500">{p.sold} قطعة</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Slow Moving */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-orange-50/50 dark:bg-orange-900/10 flex items-center gap-2">
                            <Activity size={18} className="text-orange-600 dark:text-orange-400" />
                            <h3 className="font-bold text-gray-800 dark:text-white">الأقل حركة</h3>
                        </div>
                        <div className="p-2 flex-1">
                            {productStats.slowMoving.length === 0 ? <p className="text-center text-gray-400 p-4 text-sm">لا توجد بيانات</p> : (
                                <table className="w-full text-right text-sm">
                                    <tbody>
                                        {productStats.slowMoving.map((p, i) => (
                                            <tr key={i} className="border-b border-gray-50 dark:border-slate-700 last:border-0 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition">
                                                <td className="p-3 font-medium text-gray-700 dark:text-slate-200">{p.name}</td>
                                                <td className="p-3 text-orange-600 dark:text-orange-400 font-bold text-left">{p.sold} <span className="text-[10px] text-gray-400 dark:text-slate-500 font-normal">مباع</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Low Stock */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-red-50/50 dark:bg-red-900/10 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
                            <h3 className="font-bold text-gray-800 dark:text-white">على وشك النفاد</h3>
                        </div>
                        <div className="p-2 flex-1">
                            {productStats.lowStock.length === 0 ? <p className="text-center text-gray-400 p-4 text-sm">المخزون جيد</p> : (
                                <table className="w-full text-right text-sm">
                                    <tbody>
                                        {productStats.lowStock.map((p, i) => (
                                            <tr key={i} className="border-b border-gray-50 dark:border-slate-700 last:border-0 hover:bg-red-50/30 dark:hover:bg-red-900/10 transition">
                                                <td className="p-3 font-medium text-gray-700 dark:text-slate-200">{p.name}</td>
                                                <td className="p-3 text-red-600 dark:text-red-400 font-bold text-left">{p.stock} <span className="text-[10px] text-gray-400 dark:text-slate-500 font-normal">باقي</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- 4. Expenses Chart --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <TrendingDown size={20} className="text-red-600 dark:text-red-400" />
                                توزيع المصاريف
                            </h3>
                        </div>
                        <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
                            <div className="h-64 w-full md:w-1/2 relative" dir="ltr">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expenseStats.breakdown}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {expenseStats.breakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{backgroundColor: tooltipBg, borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', color: tooltipColor}}
                                            itemStyle={{color: tooltipColor}}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <span className="block text-xs text-gray-400 dark:text-slate-500">الإجمالي</span>
                                        <span className="block text-lg font-bold text-slate-800 dark:text-white">{kpis.totalExpenses.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 w-full space-y-3">
                                {expenseStats.breakdown.slice(0, 5).map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length]}}></div>
                                            <span className="text-sm text-gray-700 dark:text-slate-200 font-medium">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value.toLocaleString()} {CURRENCY}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-900/50 flex flex-col justify-center items-center text-center">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4 shadow-sm">
                            <TrendingDown size={32} />
                        </div>
                        <h3 className="text-red-800 dark:text-red-300 font-bold mb-1">إجمالي المصاريف</h3>
                        <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">خلال الفترة المحددة</p>
                        <p className="text-3xl font-black text-red-700 dark:text-red-400">{kpis.totalExpenses.toLocaleString()} <span className="text-lg font-medium opacity-70">{CURRENCY}</span></p>
                    </div>
                </div>

                {/* --- 5. Financial Performance Grid --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Cash Flow */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 flex items-center gap-2">
                            <DollarSign size={20} className="text-slate-700 dark:text-slate-300" />
                            <h3 className="font-bold text-slate-800 dark:text-white">حركة السيولة (Cash Flow)</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-emerald-700 dark:text-emerald-400 font-bold mb-3 text-sm flex items-center gap-1"><ArrowDownLeft size={14}/> وارد (Inflow)</h4>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                                    <div className="flex justify-between"><span>مبيعات</span> <span className="font-bold">{cashFlow.inflow.sales.toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span>قبض</span> <span className="font-bold">{cashFlow.inflow.receipts.toLocaleString()}</span></div>
                                    <div className="border-t dark:border-slate-700 pt-2 mt-2 font-black text-emerald-600 dark:text-emerald-400 flex justify-between">
                                        <span>المجموع</span> <span>{cashFlow.inflow.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-red-700 dark:text-red-400 font-bold mb-3 text-sm flex items-center gap-1"><ArrowUpRight size={14}/> صادر (Outflow)</h4>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                                    <div className="flex justify-between"><span>مشتريات</span> <span className="font-bold">{cashFlow.outflow.purchases.toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span>مصاريف</span> <span className="font-bold">{cashFlow.outflow.expenses.toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span>صرف</span> <span className="font-bold">{cashFlow.outflow.payments.toLocaleString()}</span></div>
                                    <div className="border-t dark:border-slate-700 pt-2 mt-2 font-black text-red-600 dark:text-red-400 flex justify-between">
                                        <span>المجموع</span> <span>{cashFlow.outflow.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 mt-2 pt-4 border-t border-dashed border-gray-200 dark:border-slate-700 text-center">
                                <span className="text-gray-500 dark:text-slate-400 text-sm">صافي التدفق</span>
                                <div className={`text-2xl font-black ${cashFlow.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {cashFlow.net > 0 ? '+' : ''}{cashFlow.net.toLocaleString()} {CURRENCY}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* P&L Statement */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-gray-100 dark:border-slate-700 bg-emerald-50/30 dark:bg-emerald-900/10">
                            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <FileText size={18} className="text-emerald-700 dark:text-emerald-400" />
                                قائمة الدخل (P&L Summary)
                            </h3>
                        </div>
                        <div className="p-6 space-y-4 text-sm flex-1">
                            <div className="flex justify-between items-center text-gray-800 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-3">
                                <span className="font-bold text-lg">إجمالي المبيعات (Revenue)</span>
                                <span className="font-bold text-lg">{kpis.totalSales.toLocaleString()} {CURRENCY}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-red-500 dark:text-red-400 pl-4 border-l-2 border-red-100 dark:border-red-900">
                                <span>- تكلفة البضاعة المباعة (COGS)</span>
                                <span className="font-medium">({kpis.totalCOGS.toLocaleString()})</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 p-3 rounded-lg border border-gray-200 dark:border-slate-600">
                                <span className="font-bold">إجمالي الربح (Gross Profit)</span>
                                <span className="font-bold">{kpis.grossProfit.toLocaleString()} {CURRENCY}</span>
                            </div>

                            <div className="space-y-2 pl-4 border-l-2 border-orange-100 dark:border-orange-900">
                                <div className="flex justify-between items-center text-orange-600 dark:text-orange-400">
                                    <span>- المصاريف التشغيلية</span>
                                    <span className="font-medium">({kpis.totalExpenses.toLocaleString()})</span>
                                </div>
                            </div>

                            <div className="border-t-2 border-dashed border-gray-200 dark:border-slate-600 pt-4 mt-auto">
                                <div className="flex justify-between items-center">
                                    <span className="font-black text-xl text-slate-800 dark:text-white">صافي الربح (Net Profit)</span>
                                    <span className={`font-black text-xl px-3 py-1 rounded-lg ${kpis.netProfit >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {kpis.netProfit.toLocaleString()} {CURRENCY}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            
            <style>{`
                .pdf-header { display: none; }
                @media print {
                   body { background-color: white !important; color: black !important; }
                   .dark body { background-color: white !important; color: black !important; }
                   .pdf-header { display: flex; }
                   /* Reset charts background for print */
                   .recharts-wrapper { background-color: white !important; }
                }
            `}</style>
        </div>
    );
};

export default Reports;
