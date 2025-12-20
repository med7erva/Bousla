
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Product, Invoice, Client, Expense, Supplier } from "../types";

// تهيئة الذكاء الاصطناعي
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// استخدام الموديل الأقوى للتحليل المالي
const MODEL_NAME = 'gemini-3-pro-preview';

// Add DashboardContext interface for analytics
// Fix: Added missing export for DashboardContext to resolve import error in Dashboard.tsx
export interface DashboardContext {
    totalSales: number;
    totalExpenses: number;
    totalProfit: number;
    netIncome: number;
    lowStockItems: string[];
    topSellingProducts: { name: string; qty: number; revenue: number }[];
    salesTrend: 'up' | 'down';
    expenseRatio: number;
}

// دالة مساعدة لتحويل كائن البيانات إلى تقرير نصي يفهمه الذكاء الاصطناعي بذكاء
const formatStoreDataToReport = (data: any): string => {
    if (!data) return "لا توجد بيانات متاحة حالياً.";

    const { financials, inventory, recent_activity, clients, metadata } = data;

    return `
تقرير متجر ${metadata.store_name} (بتاريخ ${new Date(metadata.sync_time).toLocaleDateString('ar-MR')}):

1. الملخص المالي:
- إجمالي الإيرادات: ${financials.total_revenue} أوقية.
- إجمالي المصاريف: ${financials.total_expenses} أوقية.
- الرصيد النقدي الحالي: ${financials.cash_in_hand} أوقية.
- ديون العملاء المطلوب تحصيلها: ${financials.outstanding_customer_debts} أوقية.
- ديون الموردين المطلوب دفعها: ${financials.debts_to_suppliers} أوقية.

2. حالة المخزون:
- عدد الأصناف المختلفة: ${inventory.total_unique_items} صنف.
- إجمالي قطع البضاعة: ${inventory.total_stock_count} قطعة.
- قيمة المخزون بسعر التكلفة: ${inventory.inventory_cost_value} أوقية.
- القيمة السوقية المتوقعة للمخزون: ${inventory.inventory_market_value} أوقية.
- تنبيه: هناك ${inventory.critical_stock_items.length} أصناف أوشكت على النفاد.

3. النشاط الأخير:
- آخر المبيعات تشمل زبائن مثل: ${recent_activity.last_5_sales.map((s:any) => s.customer).join('، ')}.
- آخر المصاريف المسجلة: ${recent_activity.recent_expenses.map((e:any) => e.title).join('، ')}.

4. قائمة كبار المدينين:
${clients.map((c:any) => `- ${c.name}: عليه ${c.debt} أوقية`).join('\n')}
`;
};

export const getChatStream = async (history: { role: string, text: string }[], message: string, storeSnapshot: any) => {
    // 1. تحويل البيانات لتقرير نصي
    const storeReport = formatStoreDataToReport(storeSnapshot);

    // 2. صياغة تعليمات النظام الصارمة
    const systemInstruction = `
أنت "مستشار بوصلة المالي"، خبير في محاسبة محلات الملابس في موريتانيا.
مهمتك: تحليل بيانات المتجر المقدمة لك والإجابة بدقة من واقع الأرقام.

قواعدك:
- العملة هي الأوقية الموريتانية (MRU).
- لا تخمن أرقاماً غير موجودة في التقرير. إذا سألك المستخدم عن شيء غير متوفر، قل: "هذه المعلومة غير مسجلة في نظام بوصلة حالياً".
- كن مستشاراً ناصحاً: إذا رأيت ديوناً عالية أو مصاريف زائدة، نبه المستخدم تلقائياً.
- الربح الصافي = (الإيرادات - تكلفة البضاعة المباعة) - المصاريف.
- تحدث بلغة عربية مهنية وودودة.

البيانات المرجعية الحالية للمتجر:
${storeReport}
`;

    // 3. بناء المحتوى للموديل
    // نضع التقرير كأول رسالة في السياق لضمان رؤيته بوضوح
    const contents = [
        { role: 'user', parts: [{ text: `إليك بيانات متجري الحالية: \n ${storeReport}` }] },
        { role: 'model', parts: [{ text: "فهمت تماماً. لقد قمت بتحليل بيانات متجرك وأنا جاهز للإجابة على أي سؤال حول المبيعات أو الأرباح أو المخزون." }] },
        ...history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
        })),
        { role: 'user', parts: [{ text: message }] }
    ];

    // 4. إرسال الطلب عبر البث المباشر
    return await ai.models.generateContentStream({
        model: MODEL_NAME,
        contents: contents,
        config: {
            systemInstruction,
            temperature: 0.7,
            topP: 0.95,
        }
    });
};

// --- وظائف التنبيهات والتحليل السريع (تستخدم Flash للسرعة) ---

// Fix: Using DashboardContext interface for the context parameter
export const getDashboardInsights = async (context: DashboardContext): Promise<string[]> => {
  try {
    const prompt = `حلل هذه البيانات المالية لمتجر ملابس وقدم 3 نصائح استراتيجية: ${JSON.stringify(context)}. الرد بالعربية بلهجة عملية.`;
    const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt 
    });
    return (response.text || "").split('\n').filter(l => l.trim()).slice(0, 3);
  } catch { return ["راجع مبيعاتك اليوم."]; }
};

export const getNotificationBriefing = async (sales: number, expenses: number, topProduct: string, debt: number) => {
    try {
        const prompt = `أنت نظام إشعارات. بيانات اليوم: مبيعات ${sales}، مصاريف ${expenses}، المنتج الأفضل ${topProduct}، ديون ${debt}. اقترح 3 تنبيهات JSON (title, text, type: warning/opportunity/info).`;
        const response = await ai.models.generateContent({ 
            model: 'gemini-3-flash-preview', 
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    } catch { return []; }
};

export const getInventoryInsights = async (products: Product[]) => {
    const context = `المخزون: ${products.length} أصناف. القيمة: ${products.reduce((s,p)=>s+(p.cost*p.stock),0)}`;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: context });
    return response.text || "";
};

export const getClientInsights = async (clients: Client[]) => {
    const context = `إجمالي ديون العملاء: ${clients.reduce((s,c)=>s+c.debt, 0)}`;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: context });
    return response.text || "";
};

export const getSupplierInsights = async (suppliers: Supplier[]) => {
    const context = `ديون الموردين: ${suppliers.reduce((s,su)=>s+su.debt, 0)}`;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: context });
    return response.text || "";
};

export const getExpenseInsights = async (expenses: Expense[], totalSales: number) => {
    const context = `مصاريف: ${expenses.reduce((s,e)=>s+e.amount, 0)} مقابل مبيعات ${totalSales}`;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: context });
    return [response.text || ""];
};
