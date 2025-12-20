
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Product, Invoice, Client, Expense, Supplier } from "../types";

// استخدام موديل Gemini 3 Flash لضمان أسرع استجابة وأقل استهلاك للتوكنز
const MODEL_NAME = 'gemini-3-flash-preview';

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
 * توليد تقرير نصي شديد الاختصار لبيانات المتجر
 */
const generateSystemContext = (data: any): string => {
    if (!data) return "لا توجد بيانات متاحة حالياً.";

    const { financials, inventory, clients, metadata } = data;

    return `
خلفية المتجر (${metadata.store_name}):
- المالية: إيرادات ${financials.total_revenue}، مصاريف ${financials.total_expenses}، كاش ${financials.cash_in_hand} MRU.
- الديون: زبائن ${financials.outstanding_customer_debts}، موردين ${financials.debts_to_suppliers} MRU.
- المخزون: ${inventory.total_unique_items} صنف، إجمالي ${inventory.total_stock_count} قطعة، تكلفة ${inventory.inventory_cost_value} MRU.
- المدينين: ${clients.slice(0,5).map((c:any) => `${c.name}:${c.debt}`).join(' | ')}

قواعد:
1. العملة MRU.
2. لا تجب إلا من الأرقام أعلاه. إذا سُئلت عن شيء غير موجود، قل "غير مسجل".
3. كن مختصراً ومهنياً جداً باللغة العربية.
`;
};

export const getChatStream = async (history: { role: string, text: string }[], message: string, storeSnapshot: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = generateSystemContext(storeSnapshot);

    // تنظيف السجل لضمان التناوب الصحيح (user -> model -> user)
    const cleanedHistory: any[] = [];
    let lastRole = '';

    history.forEach(msg => {
        const currentRole = msg.role === 'user' ? 'user' : 'model';
        // لا تضف الرسالة إذا كانت فارغة أو إذا كان الدور متكرراً
        if (msg.text.trim() && currentRole !== lastRole) {
            cleanedHistory.push({
                role: currentRole,
                parts: [{ text: msg.text }]
            });
            lastRole = currentRole;
        }
    });

    // إذا كانت آخر رسالة في السجل هي 'user'، يجب حذفها لأننا سنضيف الرسالة الحالية كـ 'user'
    if (cleanedHistory.length > 0 && cleanedHistory[cleanedHistory.length - 1].role === 'user') {
        cleanedHistory.pop();
    }

    const contents = [
        ...cleanedHistory,
        { role: 'user', parts: [{ text: message }] }
    ];

    try {
        return await ai.models.generateContentStream({
            model: MODEL_NAME,
            contents: contents,
            config: {
                systemInstruction,
                temperature: 0.7,
                topP: 0.8,
            }
        });
    } catch (error: any) {
        console.error("Gemini Critical Error:", error);
        throw error;
    }
};

export const getDashboardInsights = async (context: DashboardContext): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `حلل بيانات متجر ملابس الموريتاني وقدم 3 نصائح قصيرة جداً: ${JSON.stringify(context)}`;
    const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt 
    });
    return (response.text || "").split('\n').filter(l => l.trim()).slice(0, 3);
  } catch { return ["استمر في مراقبة المبيعات."]; }
};

export const getNotificationBriefing = async (sales: number, expenses: number, topProduct: string, debt: number) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `أنت نظام إشعارات لمتجر. مبيعات ${sales}، مصاريف ${expenses}، توب ${topProduct}، ديون ${debt}. اقترح 3 تنبيهات JSON.`;
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
                            title: { type: Type.STRING },
                            text: { type: Type.STRING },
                            type: { type: Type.STRING }
                        },
                        required: ['title', 'text', 'type']
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
        const ctx = `المخزون: ${products.length} أصناف. القيمة: ${products.reduce((s,p)=>s+(p.cost*p.stock),0)}`;
        const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `حلل المخزون في جملة: ${ctx}` });
        return res.text || "";
    } catch { return "المخزون مستقر."; }
};

export const getClientInsights = async (clients: Client[]) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const ctx = `ديون الزبائن: ${clients.reduce((s,c)=>s+c.debt, 0)}`;
        const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `نصيحة حول الديون في جملة: ${ctx}` });
        return res.text || "";
    } catch { return "تابع تحصيل الديون."; }
};

export const getSupplierInsights = async (suppliers: Supplier[]) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const ctx = `ديون الموردين: ${suppliers.reduce((s,su)=>s+su.debt, 0)}`;
        const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `نصيحة حول الموردين: ${ctx}` });
        return res.text || "";
    } catch { return "علاقات الموردين جيدة."; }
};

export const getExpenseInsights = async (expenses: Expense[], totalSales: number) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const ctx = `مصاريف ${expenses.reduce((s,e)=>s+e.amount, 0)} من مبيعات ${totalSales}`;
        const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `تحليل مصاريف: ${ctx}` });
        return [res.text || ""];
    } catch { return ["راقب توازن المصاريف."]; }
};
