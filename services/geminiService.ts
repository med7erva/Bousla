
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Product, Invoice, Client, Expense, Supplier } from "../types";

// استخدام موديل Lite لضمان حدود استخدام أعلى واستجابة أسرع
const MODEL_NAME = 'gemini-flash-lite-latest';

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
    return `أنت مساعد مالي ذكي لتطبيق "بوصلة" المحاسبي في موريتانيا. 
متجر المستخدم: ${metadata.store_name}. 
العملة: أوقية (MRU).
البيانات الحالية:
- إيرادات: ${financials.total_revenue}
- مصاريف: ${financials.total_expenses}
- سيولة: ${financials.cash_in_hand}
- ديون زبائن: ${financials.outstanding_customer_debts}
- ديون موردين: ${financials.debts_to_suppliers}
- الأصناف: ${inventory.total_unique_items}
القواعد: كن مختصراً جداً، قدم نصائح عملية لزيادة الربح، وتحدث بلهجة مهنية محببة.`;
};

export const getChatStream = async (history: { role: string, text: string }[], message: string, storeSnapshot: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = generateSystemContext(storeSnapshot);

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
        config: { systemInstruction, temperature: 0.7, topP: 0.8, topK: 40 }
    });
};

export const getDashboardInsights = async (context: DashboardContext): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({ 
        model: MODEL_NAME, 
        contents: `حلل بيانات المتجر الموريتاني وقدم 3 نقاط سريعة (نصيحة أرباح، تنبيه مخزون، نصيحة ديون): ${JSON.stringify(context)}`,
        config: { temperature: 0.4 }
    });
    return (response.text || "").split('\n').filter(l => l.trim()).slice(0, 3);
  } catch { return ["راجع مبيعاتك اليوم.", "تأكد من متابعة المخزون."]; }
};

export const getNotificationBriefing = async (sales: number, expenses: number, topProduct: string, debt: number) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({ 
            model: MODEL_NAME, 
            contents: `أنت نظام ذكاء اصطناعي للتحليل المالي. حلل: مبيعات اليوم ${sales}، مصاريف ${expenses}، المنتج الأفضل ${topProduct}، إجمالي الديون ${debt}. قدم 3 تنبيهات ذكية بصيغة JSON.`,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            text: { type: Type.STRING },
                            type: { type: Type.STRING } // warning, insight, success
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
        const res = await ai.models.generateContent({ 
            model: MODEL_NAME, 
            contents: `حلل حالة المخزون لـ ${products.length} منتج بقيمة إجمالية ${products.reduce((s,p)=>s+(p.cost*p.stock),0)}. أعطِ ملخصاً في جملة واحدة مفيدة جداً.` 
        });
        return res.text || "";
    } catch { return "المخزون يحتاج متابعة دقيقة."; }
};

export const getClientInsights = async (clients: Client[]) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const res = await ai.models.generateContent({ 
            model: MODEL_NAME, 
            contents: `حلل ديون ${clients.length} عملاء بمبلغ إجمالي ${clients.reduce((s,c)=>s+c.debt, 0)}. اقترح استراتيجية تحصيل سريعة في جملة واحدة.` 
        });
        return res.text || "";
    } catch { return "تابع تحصيل الديون المتأخرة."; }
};

export const getSupplierInsights = async (suppliers: Supplier[]) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const res = await ai.models.generateContent({ 
            model: MODEL_NAME, 
            contents: `حلل الالتزامات للموردين ${suppliers.reduce((s,su)=>s+su.debt, 0)} أوقية. نصيحة واحدة للتعامل مع الموردين.` 
        });
        return res.text || "";
    } catch { return "راجع التزاماتك للموردين وجدول السداد."; }
};

export const getExpenseInsights = async (expenses: Expense[], totalSales: number) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const res = await ai.models.generateContent({ 
            model: MODEL_NAME, 
            contents: `حلل نسبة المصاريف ${expenses.reduce((s,e)=>s+e.amount, 0)} مقابل مبيعات بقيمة ${totalSales}. هل النسبة جيدة؟ أعطِ نصيحة للتقليل.` 
        });
        return [res.text || ""];
    } catch { return ["راقب المصاريف التشغيلية بدقة."]; }
};
