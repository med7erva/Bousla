
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Product, Invoice, Client, Expense, Supplier } from "../types";

// استخدام موديل Lite لضمان استمرارية الخدمة طوال اليوم بحدود استخدام مرتفعة
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
    if (!data) return "لا توجد بيانات.";
    const { financials, inventory, metadata } = data;
    return `أنت "بوصلة الذكي"، مستشار مالي خبير للمتاجر في موريتانيا.
سياق المتجر: ${metadata.store_name}. العملة: MRU.
البيانات الحالية: إيرادات (${financials.total_revenue})، مصاريف (${financials.total_expenses})، سيولة (${financials.cash_in_hand})، ديون زبائن (${financials.outstanding_customer_debts}).
قواعد الرد:
1. كن محللاً مالياً لا مجرد قارئ أرقام (استنتج الأنماط).
2. الإجابة منسقة بنقاط واضحة.
3. تجنب المقدمات الطويلة، ادخل في صلب النصيحة مباشرة.
4. استخدم لغة مهنية ومبسطة.`;
};

export const getChatStream = async (history: { role: string, text: string }[], message: string, storeSnapshot: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = generateSystemContext(storeSnapshot) + "\nقدم إجابة مركزة، منسقة، ولا تزيد عن 3 فقرات قصيرة إلا إذا طُلب منك تفصيل دقيق.";

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
        config: { systemInstruction, temperature: 0.6, topP: 0.8 }
    });
};

export const getDashboardInsights = async (context: DashboardContext): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({ 
        model: MODEL_NAME, 
        contents: `بصفتك محلل بيانات، استنتج من هذه الأرقام 3 نقاط فقط (نقطة عن الأرباح، نقطة عن المخزون، ونقطة عن نمو المبيعات). كن مباشراً جداً وقدم أرقاماً إذا لزم الأمر: ${JSON.stringify(context)}`,
        config: { temperature: 0.4 }
    });
    // تنظيف المخرجات لضمان الحصول على 3 أسطر نظيفة
    return (response.text || "").split('\n').filter(l => l.trim().length > 5).slice(0, 3);
  } catch { return ["المبيعات مستقرة، راقب المصاريف.", "تأكد من توفر الأصناف الأكثر مبيعاً.", "تحقق من تحصيل ديون العملاء."]; }
};

export const getNotificationBriefing = async (sales: number, expenses: number, topProduct: string, debt: number) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({ 
            model: MODEL_NAME, 
            contents: `حلل بيانات اليوم: مبيعات ${sales}، مصاريف ${expenses}، المنتج الأفضل ${topProduct}، الديون ${debt}. قدم 3 تنبيهات تشغيلية ذكية ومختصرة جداً بصيغة JSON.`,
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
        const res = await ai.models.generateContent({ 
            model: MODEL_NAME, 
            contents: `حلل حالة المخزون (القيمة الإجمالية: ${products.reduce((s,p)=>s+(p.cost*p.stock),0)}) وأعطِ نصيحة واحدة ذكية جداً في سطر واحد.` 
        });
        return res.text || "";
    } catch { return "المخزون يحتاج مراجعة دورية للأصناف الراكدة."; }
};

export const getClientInsights = async (clients: Client[]) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const res = await ai.models.generateContent({ 
            model: MODEL_NAME, 
            contents: `إجمالي ديون العملاء: ${clients.reduce((s,c)=>s+c.debt, 0)}. اقترح إجراءً واحداً للتحصيل في جملة قصيرة.` 
        });
        return res.text || "";
    } catch { return "ركز على تحصيل الديون القديمة أولاً."; }
};

export const getSupplierInsights = async (suppliers: Supplier[]) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const res = await ai.models.generateContent({ 
            model: MODEL_NAME, 
            contents: `إجمالي التزامات الموردين: ${suppliers.reduce((s,su)=>s+su.debt, 0)}. قدم نصيحة واحدة للجدولة في سطر واحد.` 
        });
        return res.text || "";
    } catch { return "راجع مواعيد سداد الموردين لتجنب ضغط السيولة."; }
};

export const getExpenseInsights = async (expenses: Expense[], totalSales: number) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const res = await ai.models.generateContent({ 
            model: MODEL_NAME, 
            contents: `المصاريف ${expenses.reduce((s,e)=>s+e.amount, 0)} مقابل مبيعات ${totalSales}. أعطِ استنتاجاً واحداً عن كفاءة الإنفاق في سطر واحد.` 
        });
        return [res.text || ""];
    } catch { return ["راقب نسبة المصاريف التشغيلية مقارنة بالدخل."]; }
};
