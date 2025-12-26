
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

// وظيفة لتنظيف النص من الرموز الزائدة التي قد تشوه الواجهة
const cleanAIResponse = (text: string): string => {
    return text
        .replace(/\*\*/g, '') // إزالة التغليظ الزائد
        .replace(/###/g, '')  // إزالة العناوين الكبيرة
        .replace(/- /g, '• ') // توحيد شكل النقاط
        .trim();
};

const generateSystemContext = (data: any): string => {
    if (!data) return "لا توجد بيانات حالية للمتجر.";
    const { financials, inventory, metadata } = data;
    return `أنت "المستشار المالي بوصلة". خبير في تحليل بيانات التجزئة بالسوق الموريتاني.
اسم المتجر: ${metadata.store_name}. العملة: أوقية (MRU).

مهمتك:
1. اقرأ البيانات بعمق واستخرج "أنماطاً" (Patterns) وليس مجرد أرقام.
2. لا تكرر الأرقام التي يعرفها التاجر بالفعل، بل أخبره "ماذا تعني".
3. أسلوبك: مهني، مباشر، مشجع، وخالٍ تماماً من التنسيقات المعقدة أو الرموز الكثيرة (تجنب الـ Markdown الكثيف).
4. استخدم لغة عربية سليمة وواضحة جداً.`;
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
            thinkingConfig: { thinkingBudget: 0 }
        }
    });
};

export const getDashboardInsights = async (context: DashboardContext): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({ 
        model: MODEL_NAME, 
        contents: `بصفتك محلل بيانات، لاحظت الأرقام التالية: مبيعات ${context.totalSales}، مصاريف بنسبة ${context.expenseRatio}%، وصافي ربح ${context.netIncome}. 
        قدم 3 ملاحظات ذكية جداً (واحدة عن فرصة ضائعة، واحدة عن خطر محتمل، وواحدة عن توصية للغد). 
        اجعل الرد نصاً بسيطاً جداً بدون نجوم أو رموز Markdown.`,
        config: { temperature: 0.5 }
    });
    
    const lines = (response.text || "").split('\n')
        .map(l => cleanAIResponse(l))
        .filter(l => l.length > 15);
        
    return lines.slice(0, 3);
  } catch { 
    return [
        "لاحظت استقراراً في المبيعات، نقترح زيادة تنويع الأصناف الأكثر طلباً.",
        "نسبة المصاريف الحالية تسمح بهامش ربح جيد، حافظ على هذا التوازن.",
        "تحصيل الديون المتأخرة سيعزز السيولة النقدية لعمليات الشراء القادمة."
    ]; 
  }
};

export const getInventoryInsights = async (products: Product[]): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const summary = products.slice(0, 10).map(p => `${p.name} (${p.stock})`).join(', ');
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `حلل حالة المخزون: ${summary}. أعطِ نصيحة واحدة استراتيجية بناءً على الكميات المتوفرة. لا تستخدم رموزاً خاصة.`,
            config: { temperature: 0.4 }
        });
        return cleanAIResponse(response.text || "المخزون متوازن حالياً.");
    } catch { return "تأكد من توفر الأصناف الأساسية قبل مواسم الطلب المرتفع."; }
};

export const getClientInsights = async (clients: Client[]): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const summary = clients.filter(c => c.debt > 0).slice(0, 5).map(c => `${c.name}: ${c.debt}`).join(', ');
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `حلل ديون العملاء: ${summary}. اقترح خطة تحصيل ذكية في جملة واحدة بسيطة.`,
            config: { temperature: 0.4 }
        });
        return cleanAIResponse(response.text || "متابعة الديون تضمن استمرار تدفق السيولة.");
    } catch { return "جدولة المتابعة مع العملاء المدينين تزيد من فرص التحصيل السريع."; }
};

export const getExpenseInsights = async (expenses: Expense[], totalSales: number): Promise<string[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const summary = expenses.slice(0, 7).map(e => `${e.title}: ${e.amount}`).join(', ');
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `حلل هذه المصاريف مقارنة بمبيعات ${totalSales}: ${summary}. قدم 3 خطوات عملية لضغط المصاريف غير الضرورية. نص نظيف بدون نجوم.`,
            config: { temperature: 0.4 }
        });
        return (response.text || "").split('\n')
            .map(l => cleanAIResponse(l))
            .filter(l => l.length > 10)
            .slice(0, 3);
    } catch { return ["حدد سقفاً يومياً للمصاريف النثرية.", "راجع فواتير الخدمات الشهرية للبحث عن فرص توفير.", "خصص ميزانية ثابتة لكل تصنيف لتجنب التجاوز."]; }
};

export const getSupplierInsights = async (suppliers: Supplier[]): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const summary = suppliers.map(s => `${s.name}: ${s.debt}`).join(', ');
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `حلل التزامات الموردين: ${summary}. اقترح استراتيجية تفاوض أو سداد في جملة واحدة.`,
            config: { temperature: 0.4 }
        });
        return cleanAIResponse(response.text || "تنظيم مواعيد السداد يبني ثقة الموردين.");
    } catch { return "جدولة دفعات الموردين تساعد في الحفاظ على علاقات توريد مستدامة."; }
};

export const getNotificationBriefing = async (sales: number, expenses: number, topProduct: string, debt: number) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({ 
            model: MODEL_NAME, 
            contents: `اقرأ بيانات اليوم: مبيعات ${sales}، مصاريف ${expenses}، المنتج الأفضل ${topProduct}، إجمالي الديون المستحقة ${debt}. 
            أعطِ 3 تنبيهات تشغيلية "ذكية" جداً (مثال: إذا كانت المصاريف > المبيعات، حذر من السيولة). 
            يجب أن يكون الناتج JSON فقط. التزم بالحقول: title, text, type. 
            تجنب استخدام أي Markdown داخل نصوص الـ JSON.`,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            text: { type: Type.STRING },
                            type: { type: Type.STRING, description: "opportunity, warning, or insight" } 
                        },
                        required: ['title', 'text', 'type']
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch { return []; }
};
