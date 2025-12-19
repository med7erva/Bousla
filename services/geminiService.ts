
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Product, Invoice, Client, Expense, Supplier } from "../types";

// تهيئة الذكاء الاصطناعي باستخدام مفتاح API من بيئة العمل
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// استخدام موديل Gemini 3 Pro لضمان أعلى جودة في التحليل والمنطق المالي
const MODEL_NAME = 'gemini-3-pro-preview';

// --- Caching Helpers ---
const CACHE_DURATION = 1000 * 60 * 60; // ساعة واحدة

const getCachedInsight = (key: string): any => {
    try {
        const item = localStorage.getItem(`ai_cache_${key}`);
        if (!item) return null;
        const parsed = JSON.parse(item);
        if (Date.now() - parsed.timestamp > CACHE_DURATION) {
            localStorage.removeItem(`ai_cache_${key}`);
            return null;
        }
        return parsed.data;
    } catch {
        return null;
    }
};

const setCachedInsight = (key: string, data: any) => {
    try {
        localStorage.setItem(`ai_cache_${key}`, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.warn("Storage full, cannot cache AI insight");
    }
};

// --- Shared Prompt Builder ---
const buildAnalystPrompt = (dataContext: string) => `
أنت مساعد ذكاء اصطناعي متخصص في التحليل المالي والمحاسبي وإدارة المتاجر، وتركّز على محلات الملابس في موريتانيا.
البيانات للتحليل:
${dataContext}
قم بتقديم توصية واحدة فقط، جوهرية، وعملية بناءً على هذه الأرقام.
`;

// --- Notification Center Briefing ---
export const getNotificationBriefing = async (
    sales: number, 
    expenses: number, 
    topProduct: string,
    debt: number
): Promise<{title: string, text: string, type: 'opportunity' | 'warning' | 'info'}[]> => {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `notif_${today}_${sales}_${expenses}`;
    
    const cached = getCachedInsight(cacheKey);
    if (cached) return cached;

    try {
        const prompt = `أنت نظام إشعارات ذكي لمتجر ملابس بموريتانيا. بناءً على هذه الأرقام اليوم (مبيعات: ${sales}، مصاريف: ${expenses}، المنتج الأعلى مبيعاً: ${topProduct}، إجمالي الديون: ${debt})، اقترح 3 إشعارات قصيرة جداً (تنبيه مالي، فرصة نمو، تذكير بالتحصيل). الرد JSON فقط كصفوف في مصفوفة تحتوي title و text و type.`;
        const response = await ai.models.generateContent({ 
            model: 'gemini-3-flash-preview', 
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const result = JSON.parse(response.text || "[]");
        setCachedInsight(cacheKey, result);
        return result;
    } catch {
        return [{ title: "مرحباً", text: "متجرك في وضع جيد اليوم.", type: "info" }];
    }
};

// --- Advanced Financial Insights ---
export interface DashboardContext {
    totalSales: number;
    totalProfit: number;
    totalExpenses: number;
    netIncome: number;
    lowStockItems: string[];
    topSellingProducts: {name: string, qty: number, revenue: number}[];
    salesTrend: 'up' | 'down' | 'stable';
    expenseRatio: number; 
}

export const getDashboardInsights = async (context: DashboardContext): Promise<string[]> => {
  try {
    const prompt = `حلل هذه البيانات المالية لمتجر ملابس وقدم 3 نصائح استراتيجية للتاجر: ${JSON.stringify(context)}. الرد بالعربية بلهجة عملية ومباشرة.`;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return (response.text || "").split('\n').filter(l => l.trim()).slice(0, 3);
  } catch {
    return ["راجع ميزانيتك اليومية بانتظام."];
  }
};

// --- CHAT STREAM WITH SUPABASE CONTEXT ---
export const getChatStream = async (history: { role: string, text: string }[], message: string, storeData: any) => {
    const systemInstruction = `
أنت "مساعد بوصلة المالي"، خبير استشاري في إدارة المحلات التجارية في موريتانيا.
لديك وصول كامل لبيانات متجر المستخدم من قاعدة بيانات Supabase.

مهمتك: الإجابة على أسئلة المستخدم بدقة بناءً على الأرقام الحقيقية المرفقة لك في السياق أدناه.

قواعدك المالية:
1. العملة: الأوقية الموريتانية (MRU).
2. الربح الصافي = (المبيعات - تكلفة المنتجات المباعة) - المصاريف.
3. الديون: هي ديون على العملاء يجب تحصيلها، أو ديون للموردين يجب دفعها.
4. المخزون: هو رأس مال مجمد، ركز على تحريك الراكد منه.

--- سياق بيانات المتجر الحالية المستخرجة من Supabase ---
${JSON.stringify(storeData, null, 2)}
--- نهاية البيانات ---

توجيهات الحوار:
- إذا سأل "كيف حال المتجر؟" قم بإجراء مقارنة بين المبيعات والمصاريف واعرض صافي الربح.
- إذا سأل عن "المنتجات الأكثر مبيعاً" استخرجها من قسم المبيعات.
- إذا سأل عن "الديون" قدم له قائمة بأسماء العملاء والمبالغ المستحقة.
- كن استباقياً: إذا وجدت أن المصاريف قريبة من المبيعات، حذره من ذلك فوراً.
- لا تقدم وعوداً أو معلومات لا تظهر في البيانات المرفقة.
- تحدث باللغة العربية بأسلوب مهني وودود.
    `;

    const chat = ai.chats.create({
        model: MODEL_NAME,
        history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        config: { 
            systemInstruction,
            temperature: 0.8,
            topP: 0.95,
        }
    });

    return await chat.sendMessageStream({ message });
};

// Insights functions (Minimal wrappers)
export const getInventoryInsights = async (products: Product[]) => {
    const context = `المخزون: ${products.length} منتجات. القيمة الإجمالية: ${products.reduce((s,p)=>s+(p.cost*p.stock),0)}`;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: buildAnalystPrompt(context) });
    return response.text || "";
};

export const getClientInsights = async (clients: Client[]) => {
    const context = `الديون: ${clients.reduce((s,c)=>s+c.debt, 0)} لأكثر من ${clients.length} عملاء.`;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: buildAnalystPrompt(context) });
    return response.text || "";
};

export const getSupplierInsights = async (suppliers: Supplier[]) => {
    const context = `الموردون: ${suppliers.length}. الديون المستحقة لهم: ${suppliers.reduce((s,su)=>s+su.debt, 0)}`;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: buildAnalystPrompt(context) });
    return response.text || "";
};

export const getExpenseInsights = async (expenses: Expense[], totalSales: number) => {
    const context = `المصاريف: ${expenses.reduce((s,e)=>s+e.amount, 0)}. المبيعات: ${totalSales}`;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: buildAnalystPrompt(context) });
    return [response.text || ""];
};
