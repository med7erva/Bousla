
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Product, Invoice, Client, Expense, Supplier } from "../types";

// Initialize AI with the API key from environment variables
// Using process.env.API_KEY as per @google/genai guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

// --- Caching Helpers ---
const CACHE_DURATION = 1000 * 60 * 60; // 1 Hour

const getCachedInsight = (key: string): string | string[] | null => {
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

const setCachedInsight = (key: string, data: string | string[]) => {
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

// --- Dashboard ---
export const getDashboardInsights = async (sales: any[], products: Product[]): Promise<string[]> => {
  // Simple cache key based on item counts (not perfect but fast for dashboard)
  const cacheKey = `dash_${sales.length}_${products.length}`;
  const cached = getCachedInsight(cacheKey);
  if (cached && Array.isArray(cached)) return cached;

  try {
    const safeSales = sales.slice(-7);
    const safeProducts = products.slice(0, 10).map(p => ({ n: p.name, c: p.category, s: p.stock }));

    const prompt = `
      بصفتك مستشارًا ماليًا لمتجر ملابس بموريتانيا. حلل التالي:
      المبيعات: ${JSON.stringify(safeSales)}
      المنتجات: ${JSON.stringify(safeProducts)}
      أعطني 3 نصائح قصيرة جداً وعملية لزيادة الأرباح.
    `;

    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    const tips = (response.text || "").split('\n').filter(l => l.trim().length > 0).slice(0, 3);
    
    setCachedInsight(cacheKey, tips);
    return tips;
  } catch (error) {
    return ["توصية: ركز على المنتجات الأكثر مبيعاً.", "توصية: راقب المخزون المنخفض."];
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
