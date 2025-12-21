
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Product, Invoice, Client, Expense, Supplier } from "../types";

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

const generateSystemContext = (data: any): string => {
    if (!data) return "لا توجد بيانات متاحة.";
    const { financials, inventory, metadata } = data;
    return `مساعد بوصلة المالي لمتجر: ${metadata.store_name}. 
البيانات الحالية بالعملة MRU:
- إيرادات: ${financials.total_revenue}
- مصاريف: ${financials.total_expenses}
- سيولة: ${financials.cash_in_hand}
- ديون زبائن: ${financials.outstanding_customer_debts}
- ديون موردين: ${financials.debts_to_suppliers}
- عدد المنتجات: ${inventory.total_unique_items}
قواعد: تحدث بالعربية، كن مهنياً، اعتمد على الأرقام فقط.`;
};

export const getChatStream = async (history: { role: string, text: string }[], message: string, storeSnapshot: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = generateSystemContext(storeSnapshot);

    // بناء سجل نظيف يضمن التناوب: user -> model -> user
    const cleanedHistory: any[] = [];
    let expectedRole = 'user';

    history.forEach(msg => {
        const currentRole = msg.role === 'user' ? 'user' : 'model';
        if (currentRole === expectedRole && msg.text.trim() !== '') {
            cleanedHistory.push({
                role: currentRole,
                parts: [{ text: msg.text }]
            });
            expectedRole = currentRole === 'user' ? 'model' : 'user';
        }
    });

    // إذا انتهى السجل بـ user، نحذفه لأن الرسالة الجديدة ستكون هي الـ user
    if (cleanedHistory.length > 0 && cleanedHistory[cleanedHistory.length - 1].role === 'user') {
        cleanedHistory.pop();
    }

    const contents = [
        ...cleanedHistory,
        { role: 'user', parts: [{ text: message }] }
    ];

    return await ai.models.generateContentStream({
        model: MODEL_NAME,
        contents,
        config: { systemInstruction, temperature: 0.7 }
    });
};

export const getDashboardInsights = async (context: DashboardContext): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: `حلل هذه البيانات وقدم 3 نصائح لتاجر ملابس بموريتانيا: ${JSON.stringify(context)}`
    });
    return (response.text || "").split('\n').filter(l => l.trim()).slice(0, 3);
  } catch { return ["راجع مبيعاتك اليوم."]; }
};

export const getNotificationBriefing = async (sales: number, expenses: number, topProduct: string, debt: number) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({ 
            model: 'gemini-3-flash-preview', 
            contents: `أنت نظام إشعارات. حلل: مبيعات ${sales}، مصاريف ${expenses}، منتج ${topProduct}، ديون ${debt}. اقترح 3 تنبيهات.`,
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
        const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `حلل مخزون ${products.length} صنف بقيمة ${products.reduce((s,p)=>s+(p.cost*p.stock),0)} في سطر.` });
        return res.text || "";
    } catch { return "المخزون يحتاج متابعة."; }
};

export const getClientInsights = async (clients: Client[]) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `حلل ديون عملاء بمبلغ ${clients.reduce((s,c)=>s+c.debt, 0)} في سطر.` });
        return res.text || "";
    } catch { return "تابع تحصيل الديون."; }
};

export const getSupplierInsights = async (suppliers: Supplier[]) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `حلل ديون موردين ${suppliers.reduce((s,su)=>s+su.debt, 0)} في سطر.` });
        return res.text || "";
    } catch { return "راجع التزاماتك للموردين."; }
};

export const getExpenseInsights = async (expenses: Expense[], totalSales: number) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `حلل مصاريف ${expenses.reduce((s,e)=>s+e.amount, 0)} مقابل مبيعات ${totalSales} في سطر.` });
        return [res.text || ""];
    } catch { return ["راقب المصاريف."]; }
};
