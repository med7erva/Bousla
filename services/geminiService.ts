
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Product, Invoice, Client, Expense, Supplier } from "../types";

// استخدام موديل Gemini 3 Flash للتوازن المثالي بين السرعة والذكاء
const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Interface for Dashboard analysis context
 */
// Fix: Added missing DashboardContext interface to resolve error in Dashboard.tsx
export interface DashboardContext {
    totalSales: number;
    totalExpenses: number;
    totalProfit: number;
    netIncome: number;
    lowStockItems: string[];
    topSellingProducts: { name: string, qty: number, revenue: number }[];
    salesTrend: 'up' | 'down';
    expenseRatio: number;
}

/**
 * دالة لتحويل بيانات المتجر إلى تقرير نصي مركز جداً
 * لتقليل عدد التوكنز وضمان تركيز الذكاء الاصطناعي على الأرقام الهامة
 */
const generateSystemContext = (data: any): string => {
    if (!data) return "لا توجد بيانات متاحة حالياً.";

    const { financials, inventory, recent_activity, clients, metadata } = data;

    return `
أنت "مساعد بوصلة المالي الذكي". أنت خبير محاسبي مدمج في تطبيق "بوصلة" لإدارة محلات الملابس في موريتانيا.
لديك صلاحية الوصول الكاملة والآنية لبيانات متجر المستخدم التالية:

[بيانات المتجر - ${metadata.store_name}]
- الإيرادات الكلية: ${financials.total_revenue} MRU
- المصاريف الكلية: ${financials.total_expenses} MRU
- السيولة النقدية (الكاش): ${financials.cash_in_hand} MRU
- إجمالي ديون الزبائن: ${financials.outstanding_customer_debts} MRU
- إجمالي ديون الموردين: ${financials.debts_to_suppliers} MRU

[المخزون]
- عدد المنتجات: ${inventory.total_unique_items}
- إجمالي القطع: ${inventory.total_stock_count}
- قيمة المخزون (تكلفة): ${inventory.inventory_cost_value} MRU
- منتجات قاربت على النفاد: ${inventory.critical_stock_items.length} أصناف.

[النشاط الأخير]
- آخر المبيعات لـ: ${recent_activity.last_5_sales.map((s:any) => s.customer).join(', ')}
- أهم المدينين: ${clients.map((c:any) => `${c.name} (${c.debt} MRU)`).join(' | ')}

[قواعد العمل]
1. العملة: الأوقية الموريتانية (MRU).
2. الإجابة حصراً من البيانات أعلاه. إذا سُئلت عن شيء غير موجود، اطلب من المستخدم تسجيله في التطبيق.
3. كن ناصحاً: إذا وجدت ديوناً تزيد عن 30% من الإيرادات، حذر المستخدم.
4. الأسلوب: مهني، مباشر، وباللغة العربية السليمة.
`;
};

export const getChatStream = async (history: { role: string, text: string }[], message: string, storeSnapshot: any) => {
    // تهيئة API داخل الدالة لضمان استخدام المفتاح الصحيح
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = generateSystemContext(storeSnapshot);

    // بناء مصفوفة المحتوى مع ضمان التناوب الصحيح (user ثم model)
    const contents = history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
    }));

    // إضافة الرسالة الحالية
    contents.push({ role: 'user', parts: [{ text: message }] });

    try {
        return await ai.models.generateContentStream({
            model: MODEL_NAME,
            contents: contents,
            config: {
                systemInstruction,
                temperature: 0.7,
                topP: 0.9,
                topK: 40
            }
        });
    } catch (error: any) {
        console.error("Gemini API Stream Error:", error);
        throw new Error(error.message || "فشل الاتصال بمحرك الذكاء الاصطناعي");
    }
};

// وظائف التحليل السريع للوحة التحكم
// Fix: Updated parameter type to use the newly defined DashboardContext
export const getDashboardInsights = async (context: DashboardContext): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `أنت خبير مالي. حلل هذه البيانات لمتجر ملابس وقدم 3 نصائح قصيرة جداً للمالك: ${JSON.stringify(context)}. الرد بالعربية فقط.`;
    const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt 
    });
    return (response.text || "").split('\n').filter(l => l.trim()).slice(0, 3);
  } catch { return ["استمر في مراقبة مبيعاتك اليومية."]; }
};

export const getNotificationBriefing = async (sales: number, expenses: number, topProduct: string, debt: number) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `أنت نظام تنبيهات. مبيعات: ${sales}، مصاريف: ${expenses}، منتج قمة: ${topProduct}، ديون: ${debt}. اقترح 3 تنبيهات.`;
        // Fix: Configured responseSchema for reliable JSON output according to coding guidelines
        const response = await ai.models.generateContent({ 
            model: 'gemini-3-flash-preview', 
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: 'عنوان التنبيه' },
                            text: { type: Type.STRING, description: 'محتوى التنبيه' },
                            type: { type: Type.STRING, description: 'نوع التنبيه (warning/opportunity/info)' }
                        },
                        required: ['title', 'text', 'type'],
                        propertyOrdering: ["title", "text", "type"]
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch { return []; }
};

export const getInventoryInsights = async (products: Product[]) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const context = `المخزون: ${products.length} أصناف. القيمة: ${products.reduce((s,p)=>s+(p.cost*p.stock),0)}`;
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `حلل هذا المخزون في سطر واحد: ${context}` });
        return response.text || "";
    } catch { return "مخزونك بوضع مستقر."; }
};

export const getClientInsights = async (clients: Client[]) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const context = `ديون العملاء: ${clients.reduce((s,c)=>s+c.debt, 0)} لعدد ${clients.length} عملاء.`;
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `حلل هذه الديون في سطر واحد: ${context}` });
        return response.text || "";
    } catch { return "تابع تحصيل ديونك بانتظام."; }
};

export const getSupplierInsights = async (suppliers: Supplier[]) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const context = `ديون الموردين: ${suppliers.reduce((s,su)=>s+su.debt, 0)}`;
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `حلل هذه الالتزامات في سطر واحد: ${context}` });
        return response.text || "";
    } catch { return "حافظ على علاقات جيدة مع مورديك."; }
};

export const getExpenseInsights = async (expenses: Expense[], totalSales: number) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const context = `مصاريف: ${expenses.reduce((s,e)=>s+e.amount, 0)} من مبيعات ${totalSales}`;
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `حلل المصاريف في سطر واحد: ${context}` });
        return [response.text || ""];
    } catch { return ["راقب توازن المصاريف والإيرادات."]; }
};
