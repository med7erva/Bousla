

import React, { useState, useEffect } from 'react';
import { 
  ComposedChart,
  Line,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart,
  Pie,
  Cell,
  Area
} from 'recharts';
import { 
    Calendar, 
    FileDown, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Package, 
    AlertOctagon, 
    Loader2,
    Wallet,
    ShoppingBag,
    Percent
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getReportData, getPaymentMethods } from '../services/db';
import { CURRENCY } from '../constants';
import { Invoice, Expense, Product, PaymentMethod } from '../types';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
const PAYMENT_COLORS = ['#334155', '#059669', '#d97706', '#2563eb', '#7c3aed']; // Dark, Green, Amber, Blue, Violet

interface OutflowItem {
    id: string;
    date: string;
    type: string;
    category: string;
    description: string;
    amount: number;
}

const Reports: React.FC = () => {
    const { user } = useAuth();
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], // Last 30 days
        end: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [data, setData] = useState<{
        kpis: any,
        financialChart: any[],
        paymentMethodsChart: any[],
        topProducts: any[],
        pnlData: any,
        outflowsList: OutflowItem[]
    }>({
        kpis: {}, financialChart: [], paymentMethodsChart: [], topProducts: [], pnlData: {}, outflowsList: []
    });

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        
        // Fetch Report Data & Payment Methods to map names
        const [report, allPaymentMethods] = await Promise.all([
            getReportData(user.id, dateRange.start, dateRange.end),
            getPaymentMethods(user.id)
        ]);
        
        // --- 1. KPIs Calculation ---
        const totalSales = report.invoices.reduce((sum, i) => sum + i.total, 0);
        const totalExpenses = report.expenses.reduce((sum, e) => sum + e.amount, 0);
        const invoiceCount = report.invoices.length;
        const averageBasket = invoiceCount > 0 ? totalSales / invoiceCount : 0;
        
        // COGS Calculation (Approximate based on current cost)
        let totalCOGS = 0;
        report.invoices.forEach(inv => {
            inv.items.forEach(item => {
                const prod = report.products.find(p => p.id === item.productId);
                if (prod) totalCOGS += (prod.cost * item.quantity);
            });
        });

        const grossProfit = totalSales - totalCOGS;
        const netProfit = totalSales - totalExpenses - totalCOGS;
        const profitMargin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0;
        const stockValue = report.products.reduce((sum, p) => sum + (p.stock * p.cost), 0);

        // --- 2. Financial Chart Data (Daily aggregation) ---
        const dailyMap: Record<string, {sales: number, expenses: number, profit: number}> = {};
        let curr = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        while(curr <= end) {
            const d = curr.toISOString().split('T')[0];
            dailyMap[d] = { sales: 0, expenses: 0, profit: 0 };
            curr.setDate(curr.getDate() + 1);
        }

        report.invoices.forEach(inv => {
            const d = inv.date.split('T')[0];
            if(dailyMap[d]) dailyMap[d].sales += inv.total;
        });

        report.expenses.forEach(exp => {
            const d = exp.date.split('T')[0];
            if(dailyMap[d]) dailyMap[d].expenses += exp.amount;
        });

        // Calculate Profit per day (Sales - Expenses - Est. COGS per day would be better, but simplified here)
        Object.keys(dailyMap).forEach(k => {
            // Simplified daily profit for chart: Sales - Expenses (COGS is hard to distribute daily without item detail loop)
            dailyMap[k].profit = dailyMap[k].sales - dailyMap[k].expenses; 
        });

        const financialChart = Object.keys(dailyMap).map(date => ({
            name: new Date(date).toLocaleDateString('ar-MA', {day: '2-digit', month: '2-digit'}),
            مبيعات: dailyMap[date].sales,
            مصاريف: dailyMap[date].expenses,
            ربح: dailyMap[date].profit
        }));

        // --- 3. Sales by Payment Method ---
        const paymentMap: Record<string, number> = {};
        report.invoices.forEach(inv => {
            // Find method name
            const pmName = allPaymentMethods.find(pm => pm.id === inv.paymentMethodId)?.name || 'غير محدد';
            // Only count paid amount for cash flow accuracy
            paymentMap[pmName] = (paymentMap[pmName] || 0) + (inv.paidAmount || 0);
        });
        
        // Add "Credit/Debt" category
        const totalCredit = report.invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);
        if (totalCredit > 0) {
            paymentMap['آجل (دين)'] = totalCredit;
        }

        const paymentMethodsChart = Object.keys(paymentMap).map(name => ({ name, value: paymentMap[name] }));

        // --- 4. Top Products (By Revenue) ---
        const prodSales: Record<string, {name: string, qty: number, total: number, profit: number}> = {};
        report.invoices.forEach(inv => {
            inv.items.forEach(item => {
                if(!prodSales[item.productId]) {
                    const prod = report.products.find(p => p.id === item.productId);
                    const cost = prod ? prod.cost : 0;
                    prodSales[item.productId] = { name: item.productName, qty: 0, total: 0, profit: 0 };
                }
                const prod = report.products.find(p => p.id === item.productId);
                const cost = prod ? prod.cost : 0;
                
                prodSales[item.productId].qty += item.quantity;
                prodSales[item.productId].total += (item.quantity * item.priceAtSale);
                prodSales[item.productId].profit += (item.quantity * (item.priceAtSale - cost));
            });
        });
        const topProducts = Object.values(prodSales).sort((a,b) => b.total - a.total).slice(0, 5);

        // --- 5. Outflows List ---
        const allOutflows: OutflowItem[] = [];
        report.expenses.forEach(exp => {
            allOutflows.push({
                id: exp.id, date: exp.date, type: 'مصروف', category: exp.categoryName || 'عام', description: exp.title, amount: exp.amount
            });
        });
        // Sort table by date desc
        allOutflows.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setData({
            kpis: { totalSales, totalExpenses, netProfit, profitMargin, stockValue, totalCOGS, grossProfit, averageBasket },
            financialChart,
            paymentMethodsChart,
            topProducts,
            pnlData: { totalSales, totalCOGS, grossProfit, totalExpenses, netProfit },
            outflowsList: allOutflows
        });
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [user, dateRange]);

    const handleExportPDF = () => {
        setExporting(true);
        const element = document.getElementById('report-container');
        const opt = {
            margin: [0.3, 0.3],
            filename: `تقرير_بوصلة_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        setTimeout(() => {
            html2pdf().set(opt).from(element).save().then(() => {
                setExporting(false);
            });
        }, 500);
    };

    if (loading) return <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500 gap-4"><Loader2 className="animate-spin text-emerald-600" size={40} /><span className="text-lg font-medium">جاري إعداد التقارير المالية...</span></div>;

    return (
        <div className="space-y-8 pb-10">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">التقارير والتحليلات</h1>
                    <p className="text-gray-500 text-sm">نظرة شاملة على أداء المتجر المالي</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 shadow-sm flex-1 md:flex-none">
                        <Calendar size={18} className="text-gray-400" />
                        <input 
                            type="date" 
                            className="text-sm outline-none bg-transparent font-medium text-gray-700"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        />
                        <span className="text-gray-300">|</span>
                        <input 
                            type="date" 
                            className="text-sm outline-none bg-transparent font-medium text-gray-700"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        />
                    </div>
                    <button 
                        onClick={handleExportPDF}
                        disabled={exporting}
                        className="flex items-center justify-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl hover:bg-slate-900 transition shadow-md font-bold text-sm disabled:opacity-70 min-w-[120px]"
                    >
                        {exporting ? <Loader2 className="animate-spin" size={18} /> : <FileDown size={18} />}
                        PDF
                    </button>
                </div>
            </div>

            {/* PRINTABLE CONTENT AREA */}
            <div id="report-container" className="space-y-8">
                
                {/* PDF Header */}
                <div className="hidden pdf-header flex-col items-center mb-8 border-b-2 border-gray-100 pb-6 text-center">
                    <h1 className="text-3xl font-black text-gray-800 mb-2">{user?.storeName || 'تقرير المتجر'}</h1>
                    <p className="text-gray-500 text-sm">تقرير مالي للفترة من <span className="font-bold text-gray-800">{dateRange.start}</span> إلى <span className="font-bold text-gray-800">{dateRange.end}</span></p>
                </div>

                {/* KPI Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Net Profit */}
                    <div className="bg-gradient-to-br from-white to-emerald-50/50 p-6 rounded-2xl shadow-sm border border-emerald-100 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">صافي الربح</p>
                                <h3 className={`text-2xl font-black tracking-tight ${data.kpis.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                                    {data.kpis.netProfit?.toLocaleString()} <span className="text-sm font-medium opacity-70">{CURRENCY}</span>
                                </h3>
                            </div>
                            <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600">
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Percent size={10} />
                                {data.kpis.profitMargin}% هامش
                            </span>
                        </div>
                    </div>

                    {/* Total Sales */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-blue-200 transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">المبيعات</p>
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                                    {data.kpis.totalSales?.toLocaleString()} <span className="text-sm font-medium text-gray-400">{CURRENCY}</span>
                                </h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <ShoppingBag size={12} />
                            <span>متوسط السلة: </span>
                            <span className="font-bold text-gray-800">{Math.round(data.kpis.averageBasket).toLocaleString()} {CURRENCY}</span>
                        </div>
                    </div>

                    {/* Expenses */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-red-200 transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">المصاريف</p>
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                                    {data.kpis.totalExpenses?.toLocaleString()} <span className="text-sm font-medium text-gray-400">{CURRENCY}</span>
                                </h3>
                            </div>
                            <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                <TrendingDown size={20} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">تشمل التشغيل والرواتب</p>
                    </div>

                    {/* Stock Value */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-purple-200 transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">قيمة المخزون</p>
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                                    {data.kpis.stockValue?.toLocaleString()} <span className="text-sm font-medium text-gray-400">{CURRENCY}</span>
                                </h3>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <Package size={20} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">محسوبة بسعر التكلفة</p>
                    </div>
                </div>

                {/* Main Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Financial Trends Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <TrendingUp size={18} className="text-emerald-600" />
                            الأداء المالي (المبيعات vs الأرباح)
                        </h3>
                        <div className="h-80 w-full" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={data.financialChart} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                                    />
                                    <Legend wrapperStyle={{paddingTop: '20px'}} />
                                    <Bar dataKey="مبيعات" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.8} />
                                    <Bar dataKey="مصاريف" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.8} />
                                    <Line type="monotone" dataKey="ربح" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill: '#6366f1'}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Payment Methods Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Wallet size={18} className="text-blue-600" />
                            توزيع المبيعات (طرق الدفع)
                        </h3>
                        <div className="flex-1 w-full min-h-[250px] relative" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.paymentMethodsChart}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.paymentMethodsChart.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-8">
                                <div className="text-center">
                                    <span className="block text-xs text-gray-400">إجمالي المقبوضات</span>
                                    <span className="block text-lg font-bold text-gray-800">
                                        {data.paymentMethodsChart.reduce((a,b) => a + b.value, 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Tables Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 break-inside-avoid">
                    
                    {/* Top Products Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Package size={18} className="text-purple-600" />
                                المنتجات الأكثر مبيعاً
                            </h3>
                        </div>
                        <div className="flex-1 p-0">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-5 py-3">المنتج</th>
                                        <th className="px-5 py-3">العدد</th>
                                        <th className="px-5 py-3">العائد</th>
                                        <th className="px-5 py-3">هامش تقريبي</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.topProducts.map((p, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition">
                                            <td className="px-5 py-3">
                                                <div className="font-bold text-gray-800 text-sm">{p.name}</div>
                                                {/* Simple progress bar visual */}
                                                <div className="w-full h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                                    <div 
                                                        className="h-full bg-emerald-500 rounded-full" 
                                                        style={{ width: `${Math.min(100, (p.total / (data.topProducts[0]?.total || 1)) * 100)}%` }}
                                                    ></div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-sm font-medium">{p.qty}</td>
                                            <td className="px-5 py-3 font-bold text-gray-800 text-sm">{p.total.toLocaleString()}</td>
                                            <td className="px-5 py-3">
                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                                    {p.profit.toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.topProducts.length === 0 && (
                                        <tr><td colSpan={4} className="p-6 text-center text-gray-400">لا توجد بيانات كافية</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Professional P&L Statement */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <FileDown size={18} className="text-slate-600" />
                                ملخص الدخل (P&L)
                            </h3>
                        </div>
                        <div className="p-6 space-y-4 text-sm">
                            <div className="flex justify-between items-center text-gray-800 border-b border-gray-100 pb-3">
                                <span className="font-bold text-lg">إجمالي المبيعات (Revenue)</span>
                                <span className="font-bold text-lg">{data.pnlData.totalSales?.toLocaleString()} {CURRENCY}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-red-500 pl-4 border-l-2 border-red-100">
                                <span>- تكلفة البضاعة المباعة (COGS)</span>
                                <span className="font-medium">({data.pnlData.totalCOGS?.toLocaleString()})</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <span className="font-bold">إجمالي الربح (Gross Profit)</span>
                                <span className="font-bold">{data.pnlData.grossProfit?.toLocaleString()} {CURRENCY}</span>
                            </div>

                            <div className="space-y-2 pl-4 border-l-2 border-orange-100">
                                <div className="flex justify-between items-center text-orange-600">
                                    <span>- المصاريف التشغيلية</span>
                                    <span className="font-medium">({data.pnlData.totalExpenses?.toLocaleString()})</span>
                                </div>
                            </div>

                            <div className="border-t-2 border-dashed border-gray-200 pt-4 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-black text-xl text-slate-800">صافي الربح (Net Profit)</span>
                                    <span className={`font-black text-xl px-3 py-1 rounded-lg ${data.pnlData.netProfit >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {data.pnlData.netProfit?.toLocaleString()} {CURRENCY}
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
                   body { background-color: white; }
                   .pdf-header { display: flex; }
                }
            `}</style>
        </div>
    );
};

export default Reports;
