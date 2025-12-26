
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Product, Invoice, Client, Expense, Supplier } from "../types";

// استخدام أحدث موديل مستقر وذكي من الجيل الثالث
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
    if (!data) return "لا توجد بيانات حالية للمتجر.";
    const { financials, inventory, metadata } = data;
    return `أنت "بوصلة الذكي"، المستشار المالي الرقمي الرائد للمتاجر في موريتانيا.
اسم المتجر: ${metadata.store_name}. العملة: أوقية (MRU).
البيانات المالية الحالية: 
- إيرادات: ${financials.total_revenue}
- مصاريف: ${financials.total_expenses}
- سيولة متوفرة: ${financials.cash_in_hand}
- ديون على العملاء: ${financials.outstanding_customer_debts}

قواعد الرد الصارمة:
1. أنت خبير مالي، حلل الأرقام ولا تكتفِ بسردها.
2. الرد يجب أن يكون منظماً في نقاط قصيرة ومباشرة.
3. استخدم لغة مهنية مشجعة للتاجر.
4. تجنب الردود الطويلة جداً؛ ادخل في صلب النصيحة فوراً.`;
};

export const getChatStream = async (history: { role: string, text: string }[], message: string, storeSnapshot: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = generateSystemContext(storeSnapshot);

    const contents = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    contents.push({ role: 'user', parts: [{ text: message }] });

    return await ai.models.generateContentStream({
        model: MODEL_NAME,
        contents,
        config: { 
            systemInstruction, 
            temperature: 0.7, 
            topP: 0.9,
            thinkingConfig: { thinkingBudget: 0 } // تعطيل التفكير لسرعة الاستجابة في الشات
        }
    });
};

export const getDashboardInsights = async (context: DashboardContext): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({ 
        model: MODEL_NAME, 
        contents: `بصفتك محلل بيانات مالي، استنتج من هذه الأرقام 3 توصيات استراتيجية قصيرة (واحدة عن الأرباح، واحدة عن المخزون، وواحدة عن السيولة). كن مباشراً جداً: ${JSON.stringify(context)}`,
        config: { temperature: 0.4 }
    });
    return (response.text || "").split('\n').filter(l => l.trim().length > 10).slice(0, 3);
  } catch { return ["المبيعات تسير بشكل جيد، حافظ على مراقبة المصاريف.", "تأكد من توفر بضائعك الأكثر طلباً في المخزون.", "تابع تحصيل الديون لضمان توفر السيولة."]; }
};

// Fix: Added missing getInventoryInsights function
export const getInventoryInsights = async (products: Product[]): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const summary = products.map(p => `${p.name}: ${p.stock} units`).join(', ');
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `بصفتك خبير إدارة مخزون، حلل هذه القائمة وقدم نصيحة واحدة مركزة ومباشرة جداً للمتاجر: ${summary}`,
            config: { temperature: 0.4 }
        });
        return response.text || "المخزون مستقر بشكل عام.";
    } catch { return "تأكد من توفر الأصناف الأكثر طلباً في مخزنك."; }
};

// Fix: Added missing getClientInsights function
export const getClientInsights = async (clients: Client[]): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const summary = clients.map(c => `${c.name}: دين ${c.debt}`).join(', ');
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `بصفتك خبير تحصيل ديون، حلل هؤلاء العملاء وقدم نصيحة واحدة مركزة جداً حول التحصيل: ${summary}`,
            config: { temperature: 0.4 }
        });
        return response.text || "تابع تحصيل الديون المتأخرة بانتظام.";
    } catch { return "التواصل المستمر مع العملاء يضمن سرعة التحصيل."; }
};

// Fix: Added missing getExpenseInsights function
export const getExpenseInsights = async (expenses: Expense[], totalSales: number): Promise<string[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const summary = expenses.map(e => `${e.title}: ${e.amount}`).join(', ');
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `بصفتك محلل مالي، حلل هذه المصاريف مقارنة بمبيعات ${totalSales} وقدم 3 نصائح لتقليل الهدر (نقاط قصيرة جداً): ${summary}`,
            config: { temperature: 0.4 }
        });
        return (response.text || "").split('\n').filter(l => l.trim().length > 5).slice(0, 3);
    } catch { return ["راقب المصاريف النثرية.", "قارن بين المصاريف والمبيعات أسبوعياً.", "حدد ميزانية ثابتة للمصاريف الثابتة."]; }
};

// Fix: Added missing getSupplierInsights function
export const getSupplierInsights = async (suppliers: Supplier[]): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const summary = suppliers.map(s => `${s.name}: دين ${s.debt}`).join(', ');
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `بصفتك خبير توريد، حلل هؤلاء الموردين وقدم نصيحة واحدة مركزة حول إدارة الموردين والديون: ${summary}`,
            config: { temperature: 0.4 }
        });
        return response.text || "حافظ على علاقة جيدة مع مورديك الرئيسيين.";
    } catch { return "جدولة دفعات الموردين تزيد من ثقتهم بك."; }
};

export const getNotificationBriefing = async (sales: number, expenses: number, topProduct: string, debt: number) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({ 
            model: MODEL_NAME, 
            contents: `تحليل سريع لبيانات اليوم: مبيعات ${sales}، مصاريف ${expenses}، المنتج الأكثر مبيعاً ${topProduct}، إجمالي الديون المستحقة ${debt}. قدم 3 تنبيهات ذكية ومختصرة جداً بصيغة JSON.`,
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
