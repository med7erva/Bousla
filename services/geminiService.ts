
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Product, Invoice, Client, Expense, Supplier } from "../types";

// Initialize AI with the API key from environment variables
// Using process.env.API_KEY as per @google/genai guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

// --- Caching Helpers ---
const CACHE_DURATION = 1000 * 60 * 60; // 1 Hour

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

مهمتك هي تحليل كل البيانات الظاهرة أمامك في الصفحة المرسلة لك، سواء كانت تتعلق بالمبيعات، المصاريف، المخزون، الموردين، الديون، الربح، أو حركة المنتجات.
قم بفهم السياق الكامل كما لو أنك محلل مالي داخل متجر فعلي.

البيانات للتحليل:
${dataContext}

يجب عليك:
1. تحليل كل الأرقام الموجودة بعمق، واكتشاف أي نمط أو مشكلة أو فرصة.
2. تقديم توصية واحدة فقط، جوهرية، عملية، ومباشرة، وليست عامة أو نظرية.
3. إذا وُجد خطأ أو خلل في البيانات أو تناقض، قم بالتنبيه عليه بوضوح.
4. توقع التغيّرات المحتملة بناءً على البيانات.
5. تقديم نصيحة قابلة للتطبيق فورًا داخل المتجر.
6. أن تكون مختصرًا جدًا وواضحًا، بدون مقدمات، وبدون شرح طويل.
7. أن تكون النصيحة مبنية على البيانات المعروضة فقط.
8. عدم إرجاع أي صياغة عامة مثل "راقب المبيعات" أو "حسّن الإدارة".
9. مراعاة واقع السوق الموريتاني.

صيغة الرد يجب أن تكون:
- جملة واحدة مركزة.
- لا تتجاوز 30 كلمة كحد أقصى.
- لا تسأل المستخدم أسئلة، فقط قدّم أفضل تحليل ممكن بناءً على البيانات.
`;

// --- Notification Center Briefing (NEW) ---
export const getNotificationBriefing = async (
    sales: number, 
    expenses: number, 
    topProduct: string,
    debt: number
): Promise<{text: string, type: 'opportunity' | 'warning'}[]> => {
    // Cache per day per stats snapshot
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `notif_brief_${today}_${sales}_${expenses}`;
    
    const cached = getCachedInsight(cacheKey);
    if (cached && Array.isArray(cached)) return cached as {text: string, type: 'opportunity' | 'warning'}[];

    try {
        const prompt = `
        أنت نظام إشعارات ذكي لمتجر.
        البيانات: مبيعات اليوم=${sales}، المصاريف=${expenses}، المنتج الأفضل=${topProduct}، ديون العملاء=${debt}.
        
        المطلوب: جملتين قصيرتين جداً (كإشعار موبايل).
        1. الجملة الأولى: فرصة أو نقطة إيجابية (مثلاً عن المنتج الأفضل أو هامش الربح).
        2. الجملة الثانية: تحذير أو تنبيه (مثلاً عن الديون أو ارتفاع المصاريف).
        
        نسق الإجابة JSON فقط:
        [
          {"text": "...", "type": "opportunity"},
          {"text": "...", "type": "warning"}
        ]
        `;

        const response = await ai.models.generateContent({ 
            model: MODEL_NAME, 
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        const result = JSON.parse(response.text || "[]");
        setCachedInsight(cacheKey, result);
        return result;
    } catch (e) {
        return [
            { text: "تحقق من المنتجات الأكثر مبيعاً لضمان توفرها.", type: "opportunity" }
        ];
    }
};

// --- Dashboard (Specific Prompt Mode) ---
export interface DashboardContext {
    totalSales: number;
    totalProfit: number;
    totalExpenses: number;
    netIncome: number;
    lowStockItems: string[];
    topSellingProducts: {name: string, qty: number, revenue: number}[];
    salesTrend: 'up' | 'down' | 'stable';
    expenseRatio: number; // Percentage of sales
}

export const getDashboardInsights = async (context: DashboardContext): Promise<string[]> => {
  // Advanced cache key based on financial metrics
  const cacheKey = `dash_v3_${context.totalSales}_${context.totalExpenses}_${context.topSellingProducts.length}`;
  const cached = getCachedInsight(cacheKey);
  if (cached && Array.isArray(cached)) return cached;

  try {
    const prompt = `
أنت مساعد ذكاء اصطناعي متخصص في تحليل بيانات المحلات التجارية، خصوصًا محلات الملابس. يتم تزويدك ببيانات تشمل المبيعات، الأرباح، المنتجات، المخزون، المصاريف، العملاء، الموردين، والفواتير.

مهمتك:
توليد 3 مخرجات فقط، كل مخرج يجب أن يكون بين جملة واحدة إلى ثلاث جمل كحد أقصى.
ويمكن أن تكون هذه المخرجات توصيات – تنبيهات – فرص نمو – ملاحظات تحليلية حسب ما تراه الأهم بناءً على البيانات.

قواعد الكتابة:
باللغة العربية الفصيحة السهلة.
بدون جمل طويلة أو حشو.
كل مخرج يتناول نقطة واحدة مهمة فقط.
اجعل النص عمليًا ودقيقًا ومبنيًا على الأرقام الفعلية.
لا تصف البيانات نفسها؛ بل قدّم تحليلاً أو قرارًا قابلًا للتنفيذ.

صيغة الإخراج المطلوبة:
1. النقطة الأولى (سطر إلى 3 أسطر)
2. النقطة الثانية (سطر إلى 3 أسطر)
3. النقطة الثالثة (سطر إلى 3 أسطر)

هذه هي بيانات المتجر لتحليلها:
${JSON.stringify(context)}

قدّم أفضل 3 نقاط تحليلية مفيدة للتاجر وفق القواعد أعلاه.
    `;

    const response = await ai.models.generateContent({ 
        model: MODEL_NAME, 
        contents: prompt,
        config: {
            temperature: 0.7, 
        }
    });

    // Robust parsing to handle "1. ", "1-", or just lines
    const text = response.text || "";
    const tips = text
        .split(/\d+[\.\-]\s+/) // Split by number followed by dot or dash
        .map(l => l.trim())
        .filter(l => l.length > 5) // Filter empty or too short lines
        .slice(0, 3); // Take exactly 3
    
    // Fallback if AI fails to format correctly (e.g. returns one block)
    if (tips.length === 0 && text.length > 10) {
        tips.push(text);
    }
    
    // Fallback if completely failed
    if (tips.length === 0) {
        tips.push("راجع تقرير المصاريف والمبيعات للتأكد من تسجيل جميع العمليات بدقة.");
    }

    setCachedInsight(cacheKey, tips);
    return tips;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return [
        "نصيحة: ركز على زيادة مبيعات المنتجات ذات هامش الربح العالي.",
        "تنبيه: تأكد من تسجيل جميع المصاريف للحصول على صافي ربح دقيق.",
        "إجراء: راجع المخزون المنخفض وقم بطلب البضائع الرائجة فوراً."
    ];
  }
};

// --- Inventory (Strict Analyst Mode) ---
export const getInventoryInsights = async (products: Product[]): Promise<string> => {
  const cacheKey = `inv_${products.length}_${products.reduce((sum,p) => sum+p.stock, 0)}`;
  const cached = getCachedInsight(cacheKey);
  if (cached && typeof cached === 'string') return cached;

  try {
    const totalValue = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
    const lowStock = products.filter(p => p.stock < 5).map(p => p.name);
    const highStock = products.filter(p => p.stock > 50).map(p => p.name);
    const categories = [...new Set(products.map(p => p.category))];
    
    const context = JSON.stringify({
        total_inventory_value: totalValue,
        total_items_count: products.length,
        low_stock_items: lowStock,
        overstocked_items: highStock,
        categories_available: categories,
        sample_products: products.slice(0, 10).map(p => ({name: p.name, margin: p.price - p.cost}))
    });

    const prompt = buildAnalystPrompt(context);
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    const insight = response.text || "راجع المنتجات الراكدة وحاول تحريكها بعروض.";
    
    setCachedInsight(cacheKey, insight);
    return insight;
  } catch (error) { return "قم بجرد المخزون وتحديث الكميات لضمان دقة التحليل."; }
};

// --- Clients (Strict Analyst Mode) ---
export const getClientInsights = async (clients: Client[]): Promise<string> => {
    const cacheKey = `cli_${clients.length}_${clients.reduce((s,c) => s+c.debt, 0)}`;
    const cached = getCachedInsight(cacheKey);
    if (cached && typeof cached === 'string') return cached;

    try {
        const totalDebt = clients.reduce((sum, c) => sum + c.debt, 0);
        const debtors = clients.filter(c => c.debt > 0).map(c => ({name: c.name, debt: c.debt}));
        
        const context = JSON.stringify({
            total_clients: clients.length,
            total_outstanding_debt: totalDebt,
            top_debtors: debtors.slice(0, 5),
        });

        const prompt = buildAnalystPrompt(context);
        const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
        const insight = response.text || "تابع ديون العملاء بانتظام.";
        
        setCachedInsight(cacheKey, insight);
        return insight;
    } catch { return ""; }
};

// --- Suppliers (Strict Analyst Mode) ---
export const getSupplierInsights = async (suppliers: Supplier[]): Promise<string> => {
    const cacheKey = `sup_${suppliers.length}_${suppliers.reduce((s,su) => s+su.debt, 0)}`;
    const cached = getCachedInsight(cacheKey);
    if (cached && typeof cached === 'string') return cached;

    try {
        const totalDebt = suppliers.reduce((sum, s) => sum + s.debt, 0);
        const creditors = suppliers.filter(s => s.debt > 0).map(s => ({name: s.name, amount_we_owe: s.debt}));

        const context = JSON.stringify({
            total_suppliers: suppliers.length,
            total_debt_to_suppliers: totalDebt,
            suppliers_we_owe_money: creditors
        });

        const prompt = buildAnalystPrompt(context);
        const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
        const insight = response.text || "حاول التفاوض على فترات سداد أطول.";
        
        setCachedInsight(cacheKey, insight);
        return insight;
    } catch { return ""; }
};

// --- Expenses (Strict Analyst Mode) ---
export const getExpenseInsights = async (expenses: Expense[], totalSales: number): Promise<string[]> => {
    const cacheKey = `exp_${expenses.length}_${totalSales}`;
    const cached = getCachedInsight(cacheKey);
    if (cached && Array.isArray(cached)) return cached;

    try {
        const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
        const expRatio = totalSales > 0 ? (totalExp / totalSales) * 100 : 0;
        
        const context = JSON.stringify({
            total_sales_period: totalSales,
            total_expenses: totalExp,
            expense_to_sales_ratio: expRatio.toFixed(1) + '%',
            top_expenses: expenses.sort((a,b) => b.amount - a.amount).slice(0, 3).map(e => ({title: e.title, amount: e.amount}))
        });

        const prompt = buildAnalystPrompt(context);
        const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
        const tip = response.text || "تحكم في المصاريف المتغيرة لزيادة الربحية.";
        
        const result = [tip];
        setCachedInsight(cacheKey, result);
        return result;
    } catch { return ["راجع بنود الصرف الأعلى تكلفة."]; }
};

export const getChatStream = async (history: { role: string, text: string }[], message: string) => {
    const chat = ai.chats.create({
        model: MODEL_NAME,
        history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        config: { systemInstruction: "أنت مساعد ذكي لتطبيق 'بوصلة'. تتحدث العربية. العملة هي الأوقية." }
    });
    return await chat.sendMessageStream({ message });
};
