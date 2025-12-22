
import { supabase } from './supabase';
import { Product, Invoice, SaleItem, User, Client, Expense, Purchase, Supplier, PurchaseItem, PaymentMethod, Employee, ExpenseCategory, FinancialTransaction, ProductCategory, AppSettings } from '../types';
import { SEED_PRODUCTS, SEED_PAYMENT_METHODS } from '../constants';

// --- Auth Operations ---
export const registerUser = async (user: Omit<User, 'id' | 'createdAt' | 'email' | 'subscriptionStatus' | 'subscriptionPlan' | 'trialEndDate'>) => {
  const sanitizedPhone = user.phone.replace(/\D/g, ''); 
  const pseudoEmail = `${sanitizedPhone}@bousla.app`;
  
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 30);

  const { data, error } = await supabase.auth.signUp({
    email: pseudoEmail,
    password: user.password!,
    options: {
      data: {
        name: user.name,
        storeName: user.storeName,
        phone: sanitizedPhone,
        subscriptionStatus: 'trial',
        subscriptionPlan: 'pro',
        trialEndDate: trialEndDate.toISOString(),
        isAdmin: sanitizedPhone === '47071347'
      }
    }
  });

  if (error) {
      if (error.message.includes('already registered')) {
          throw new Error('رقم الهاتف هذا مسجل مسبقاً');
      }
      throw error;
  }
  
  if (!data.user) throw new Error("Registration failed");

  const userId = data.user.id;

  const methodsToInsert = SEED_PAYMENT_METHODS.map(pm => ({
      user_id: userId,
      name: pm.name,
      type: pm.type,
      provider: pm.provider,
      balance: 0,
      is_default: pm.isDefault
  }));
  await supabase.from('payment_methods').insert(methodsToInsert);

  const seedExpCats = ['إيجار', 'رواتب', 'فواتير', 'صيانة', 'أخرى'];
  await supabase.from('expense_categories').insert(seedExpCats.map(c => ({ 
      user_id: userId, name: c, is_default: c === 'رواتب' 
  })));

  await supabase.from('clients').insert({
      user_id: userId, name: 'عميل افتراضي', phone: '00000000', debt: 0, notes: 'للزبائن العابرين'
  });
  await supabase.from('suppliers').insert({
      user_id: userId, name: 'مورد افتراضي', phone: '00000000', debt: 0
  });

  return { 
    id: userId, 
    ...user, 
    email: pseudoEmail, 
    createdAt: new Date().toISOString(),
    subscriptionStatus: 'trial' as const,
    subscriptionPlan: 'pro' as const,
    trialEndDate: trialEndDate.toISOString(),
    isAdmin: sanitizedPhone === '47071347'
  };
};

export const loginUser = async (phone: string, password: string): Promise<User> => {
    const sanitizedPhone = phone.replace(/\D/g, '');
    const pseudoEmail = `${sanitizedPhone}@bousla.app`;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: pseudoEmail,
        password
    });

    if (error) {
        if (error.message.includes('Invalid login credentials')) {
            throw new Error('رقم الهاتف أو كلمة المرور غير صحيحة');
        }
        throw error;
    }
    
    if (!data.user) throw new Error("Login failed");

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

    let subStatus: 'trial' | 'active' | 'expired' = profile?.subscription_status || data.user.user_metadata.subscriptionStatus || 'trial';
    const subPlan: 'plus' | 'pro' = profile?.subscription_plan || data.user.user_metadata.subscriptionPlan || 'pro';
    const trialEnd = profile?.trial_end_date || data.user.user_metadata.trialEndDate;
    const subEnd = profile?.subscription_end_date;

    if (subStatus === 'trial' && trialEnd && new Date(trialEnd) < new Date()) {
        subStatus = 'expired';
    } else if (subStatus === 'active' && subEnd && new Date(subEnd) < new Date()) {
        subStatus = 'expired';
    }

    return {
        id: data.user.id,
        name: profile?.name || data.user.user_metadata.name,
        email: data.user.email,
        phone: profile?.phone || data.user.user_metadata.phone || sanitizedPhone,
        storeName: profile?.store_name || data.user.user_metadata.storeName,
        createdAt: data.user.created_at,
        subscriptionStatus: subStatus,
        subscriptionPlan: subPlan,
        trialEndDate: trialEnd,
        subscriptionEndDate: subEnd,
        isAdmin: profile?.is_admin || data.user.user_metadata.isAdmin || sanitizedPhone === '47071347'
    };
};

// --- PREPAID CODES ---
export const generatePrepaidCode = async (days: number, plan: 'plus' | 'pro') => {
    // جلب معرف المسؤول الحالي لربطه بالكود (مطلوب لسياسات Supabase)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("يجب تسجيل الدخول كمسؤول أولاً");

    const code = `BSL-${plan.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${days}`;
    const { error } = await supabase.from('prepaid_codes').insert({
        code,
        days,
        plan,
        is_used: false,
        created_by: user.id // ربط الكود بمن أنشأه
    });
    
    if (error) {
        console.error("Supabase Insert Error:", error);
        throw new Error(error.message || "فشل في تحديث قاعدة البيانات");
    }
    return code;
};

export const getUnusedCodes = async () => {
    const { data, error } = await supabase
        .from('prepaid_codes')
        .select('*')
        .eq('is_used', false)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const activateSubscription = async (userId: string, code: string) => {
    const { data: codeData, error: codeError } = await supabase
        .from('prepaid_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('is_used', false)
        .single();

    if (codeError || !codeData) {
        throw new Error("كود تفعيل غير صحيح أو تم استخدامه مسبقاً");
    }

    const daysToAdd = codeData.days;
    const plan = codeData.plan;
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    const { error: profileError } = await supabase.from('profiles').update({
        subscription_status: 'active',
        subscription_plan: plan,
        subscription_end_date: newEndDate.toISOString()
    }).eq('id', userId);

    if (profileError) throw profileError;

    await supabase.from('prepaid_codes').update({ is_used: true }).eq('id', codeData.id);

    return { endDate: newEndDate.toISOString(), plan };
};

export const initDB = async () => { return true; };

// --- Settings & Profile ---
const DEFAULT_SETTINGS: AppSettings = {
    system: { language: 'ar', darkMode: false, dataView: 'detailed' },
    store: { currency: 'MRU', unit: 'piece', discountPolicy: 'none' },
    notifications: { lowStock: true, lowStockThreshold: 5, outOfStock: true, lowSales: false, lowSalesPeriod: 'daily', highExpenses: true, highExpensesThreshold: 10000 },
    ai: { enabled: true, level: 'medium', smartAlerts: true }
};

export const getAppSettings = (): AppSettings => {
    try {
        const stored = localStorage.getItem('bousla_settings');
        return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
};

export const saveAppSettings = (settings: AppSettings) => {
    localStorage.setItem('bousla_settings', JSON.stringify(settings));
};

export const updateUserProfile = async (userId: string, data: { name?: string, storeName?: string, activityType?: string }) => {
    const updates: any = {};
    if (data.name) updates.name = data.name;
    if (data.storeName) updates.store_name = data.storeName;
    
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (!error) {
        await supabase.auth.updateUser({ data: updates });
    }
    if (error) throw error;
};

// --- Payment Methods ---
export const getPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
    const { data, error } = await supabase.from('payment_methods').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((d: any) => ({
        id: d.id, userId: d.user_id, name: d.name, type: d.type, provider: d.provider, balance: d.balance || 0, isDefault: d.is_default
    }));
};

export const ensurePaymentMethodsExist = async (userId: string) => {
    const { count } = await supabase.from('payment_methods').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    if (count === 0) {
        const methodsToInsert = SEED_PAYMENT_METHODS.map(pm => ({
            user_id: userId,
            name: pm.name,
            type: pm.type,
            provider: pm.provider,
            balance: 0,
            is_default: pm.isDefault
        }));
        await supabase.from('payment_methods').insert(methodsToInsert);
    }
};

// --- Products ---
export const getProducts = async (userId: string): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((d: any) => ({
        id: d.id, userId: d.user_id, name: d.name, category: d.category, price: d.price || 0, cost: d.cost || 0, stock: d.stock || 0, barcode: d.barcode
    }));
};

export const getProductCategories = async (userId: string): Promise<ProductCategory[]> => {
    const { data, error } = await supabase.from('product_categories').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((d: any) => ({ id: d.id, userId: d.user_id, name: d.name }));
};

export const addProductCategory = async (userId: string, name: string) => {
    const { data, error } = await supabase.from('product_categories').insert({ user_id: userId, name }).select().single();
    if (error) throw error;
    return { id: data.id, userId: data.user_id, name: data.name };
};

export const deleteProductCategory = async (id: string) => {
    const { error } = await supabase.from('product_categories').delete().eq('id', id);
    if (error) throw error;
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
    const finalBarcode = product.barcode.trim() === '' ? `GEN-${Date.now().toString().slice(-6)}` : product.barcode;
    const { data, error } = await supabase.from('products').insert({
        user_id: product.userId,
        name: product.name,
        category: product.category,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        barcode: finalBarcode
    }).select().single();
    
    if (error) throw error;
    return { ...product, id: data.id, barcode: finalBarcode };
};

export const updateProduct = async (product: Product) => {
    await supabase.from('products').update({
        name: product.name,
        category: product.category,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        barcode: product.barcode
    }).eq('id', product.id);
};

export const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
};

export const manufactureProduct = async (sourceId: string, targetId: string, qty: number, rawPerUnit: number, laborCostPerUnit: number = 0, supplierId: string = '') => {
    
    const { data: source } = await supabase.from('products').select('*').eq('id', sourceId).single();
    const { data: target } = await supabase.from('products').select('*').eq('id', targetId).single();

    if (!source || !target) throw new Error("منتج غير موجود");

    const totalRawNeeded = qty * rawPerUnit;
    if ((source as any).stock < totalRawNeeded) throw new Error(`نقص مواد خام. متاح: ${(source as any).stock}`);

    await supabase.from('products').update({ stock: (source as any).stock - totalRawNeeded }).eq('id', sourceId);

    const totalRawCost = totalRawNeeded * (source as any).cost;
    const totalLaborCost = qty * laborCostPerUnit;
    const newUnitCost = (totalRawCost + totalLaborCost) / qty;
    
    const currentStockVal = (target as any).stock * (target as any).cost;
    const newBatchVal = qty * newUnitCost;
    const newTotalStock = (target as any).stock + qty;
    const weightedCost = Math.round((currentStockVal + newBatchVal) / newTotalStock);

    await supabase.from('products').update({ stock: newTotalStock, cost: weightedCost }).eq('id', targetId);

    if (supplierId && totalLaborCost > 0) {
        const { data: supplier } = await supabase.from('suppliers').select('*').eq('id', supplierId).single();
        if (supplier) {
            await supabase.from('suppliers').update({ debt: Number((supplier as any).debt) + totalLaborCost }).eq('id', supplierId);
        }
    }
    return true;
};

// --- Invoices ---
export const getInvoices = async (userId: string): Promise<Invoice[]> => {
    const { data, error } = await supabase.from('invoices').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    
    return (data || []).map((d: any) => ({
        id: d.id,
        userId: d.user_id,
        customerName: d.customer_name || 'عميل غير معروف',
        date: d.date || new Date().toISOString(),
        total: d.total || 0,
        paidAmount: d.paid_amount || 0,
        remainingAmount: d.remaining_amount || 0,
        status: d.status,
        items: Array.isArray(d.items) ? d.items : [],
        paymentMethodId: d.payment_method_id
    }));
};

export const createInvoice = async (userId: string, items: SaleItem[], total: number, paidAmount: number, customerName: string, paymentMethodId: string, customDate?: string) => {
    const date = customDate || new Date().toISOString();
    const netChange = total - paidAmount; 
    const finalCustomerName = (customerName && customerName.trim() !== '') ? customerName : 'عميل افتراضي';

    const { data: invoice, error } = await supabase.from('invoices').insert({
        user_id: userId,
        customer_name: finalCustomerName,
        date: date,
        total: total,
        paid_amount: paidAmount,
        remaining_amount: netChange,
        status: netChange > 0 ? 'Pending' : 'Completed',
        payment_method_id: paymentMethodId,
        items: items 
    }).select().single();

    if (error) throw error;

    for (const item of items) {
        if (!item.productId.startsWith('custom-') && !item.productId.startsWith('opening-bal')) {
            const { data: prod } = await supabase.from('products').select('stock').eq('id', item.productId).single();
            if (prod) {
                await supabase.from('products').update({ stock: (prod as any).stock - item.quantity }).eq('id', item.productId);
            }
        }
    }

    const { data: clients } = await supabase.from('clients').select('*').eq('user_id', userId).ilike('name', finalCustomerName).limit(1);
    let client = clients && clients.length > 0 ? clients[0] : null;

    if (client) {
        const updateData: any = { last_purchase_date: date };
        updateData.debt = Number((client as any).debt) + netChange;
        await supabase.from('clients').update(updateData).eq('id', (client as any).id);
    } else if (netChange !== 0) {
        await supabase.from('clients').insert({
            user_id: userId, name: finalCustomerName, phone: '', debt: netChange, last_purchase_date: date
        });
    }

    if (paymentMethodId && paidAmount > 0) {
        const { data: pm } = await supabase.from('payment_methods').select('balance').eq('id', paymentMethodId).single();
        if (pm) {
            await supabase.from('payment_methods').update({ balance: (pm as any).balance + paidAmount }).eq('id', paymentMethodId);
        }
    }

    return invoice;
};

export const deleteInvoice = async (id: string) => {
    const { data: inv, error } = await supabase.from('invoices').select('*').eq('id', id).single();
    if(error || !inv) throw new Error("Invoice not found");

    const items = Array.isArray((inv as any).items) ? (inv as any).items : [];
    for(const item of items) {
        if(item.productId && !item.productId.startsWith('custom-') && !item.productId.startsWith('opening-bal')) {
             const { data: prod } = await supabase.from('products').select('stock').eq('id', item.productId).single();
             if(prod) {
                 await supabase.from('products').update({ stock: ((prod as any).stock || 0) + item.quantity }).eq('id', item.productId);
             }
        }
    }

    if((inv as any).remaining_amount !== 0) {
         const { data: client } = await supabase.from('clients').select('*').eq('user_id', (inv as any).user_id).ilike('name', (inv as any).customer_name).single();
         if(client) {
             const newDebt = Number((client as any).debt) - Number((inv as any).remaining_amount);
             await supabase.from('clients').update({ debt: newDebt }).eq('id', (client as any).id);
         }
    }

    if((inv as any).payment_method_id && (inv as any).paid_amount > 0) {
         const { data: pm } = await supabase.from('payment_methods').select('balance').eq('id', (inv as any).payment_method_id).single();
         if(pm) {
             const newBalance = Number((pm as any).balance) - Number((inv as any).paid_amount);
             await supabase.from('payment_methods').update({ balance: newBalance }).eq('id', (inv as any).payment_method_id);
         }
    }

    await supabase.from('invoices').delete().eq('id', id);
};

export const updateInvoice = async (invoice: Invoice) => {
    await supabase.from('invoices').update({
        customer_name: invoice.customerName,
        date: invoice.date
    }).eq('id', invoice.id);
};

export const getSalesAnalytics = async (userId: string) => {
    const allInvoices = await getInvoices(userId);
    const invoices = allInvoices.filter(inv => !inv.items.some(i => i.productId === 'opening-bal'));
    const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalInvoices = invoices.length;
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });
    const salesMap: Record<string, number> = {};
    last7Days.forEach(date => { salesMap[date] = 0; });
    invoices.forEach(inv => {
        if (inv.date) {
            const invDate = inv.date.split('T')[0];
            if (salesMap[invDate] !== undefined) {
                salesMap[invDate] += inv.total;
            }
        }
    });
    const chartData = last7Days.map(date => ({
        name: new Date(date).toLocaleDateString('ar-MA', { weekday: 'long' }), 
        sales: salesMap[date]
    }));
    return { totalSales, totalInvoices, chartData };
};

// --- Clients ---
export const getClients = async (userId: string): Promise<Client[]> => {
    const { data, error } = await supabase.from('clients').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((d: any) => ({
        id: d.id, userId: d.user_id, name: d.name, phone: d.phone, debt: Number(d.debt) || 0, lastPurchaseDate: d.last_purchase_date, notes: d.notes, 
        openingBalance: Number(d.opening_balance) || 0
    }));
};

export const addClient = async (client: Omit<Client, 'id'>) => {
    const totalDebt = (client.debt || 0) + (client.openingBalance || 0);
    const { data: newClient, error } = await supabase.from('clients').insert({
        user_id: client.userId, name: client.name, phone: client.phone, debt: 0, notes: client.notes
    }).select().single();
    
    if (error) throw error;

    if (totalDebt !== 0) {
        const openingItem = { productId: 'opening-bal', productName: 'رصيد افتتاحي (سابق)', quantity: 1, priceAtSale: totalDebt };
        const date = new Date().toISOString();
        await supabase.from('invoices').insert({
            user_id: client.userId, customer_name: client.name, date: date, total: totalDebt, paid_amount: 0, remaining_amount: totalDebt, status: 'Pending', items: [openingItem]
        });
        await supabase.from('clients').update({ debt: totalDebt, last_purchase_date: date }).eq('id', (newClient as any).id);
    }
};

export const updateClient = async (client: Client) => {
    const { error } = await supabase.from('clients').update({
        name: client.name, phone: client.phone, debt: client.debt, notes: client.notes
    }).eq('id', client.id);
    if (error) throw error;
};

export const deleteClient = async (id: string) => {
    await supabase.from('transactions').update({ entity_id: null }).eq('entity_id', id).eq('entity_type', 'Client');
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
};

// --- Suppliers ---
export const getSuppliers = async (userId: string): Promise<Supplier[]> => {
    const { data, error } = await supabase.from('suppliers').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((d: any) => ({
        id: d.id, userId: d.user_id, name: d.name, phone: d.phone, debt: d.debt || 0, productsSummary: d.products_summary
    }));
};

export const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    const { error } = await supabase.from('suppliers').insert({
        user_id: supplier.userId, name: supplier.name, phone: supplier.phone, debt: supplier.debt, products_summary: supplier.productsSummary
    });
    if (error) throw error;
};

export const updateSupplier = async (supplier: Supplier) => {
    const { error } = await supabase.from('suppliers').update({
        name: supplier.name, phone: supplier.phone, debt: supplier.debt, products_summary: supplier.productsSummary
    }).eq('id', supplier.id);
    if (error) throw error;
};

export const deleteSupplier = async (id: string) => {
    await supabase.from('purchases').update({ supplier_id: null }).eq('supplier_id', id);
    await supabase.from('transactions').update({ entity_id: null }).eq('entity_id', id).eq('entity_type', 'Supplier');
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
};

// --- Purchases ---
export const getPurchases = async (userId: string): Promise<Purchase[]> => {
    const { data, error } = await supabase.from('purchases').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map((d: any) => ({
        id: d.id, userId: d.user_id, supplierId: d.supplier_id, supplierName: d.supplier_name, date: d.date || new Date().toISOString(), totalCost: d.total_cost || 0, paidAmount: d.paid_amount || 0, items: Array.isArray(d.items) ? d.items : [], status: d.status, paymentMethodId: d.payment_method_id
    }));
};

export const createPurchase = async (userId: string, supplierId: string, supplierName: string, items: PurchaseItem[], totalCost: number, paidAmount: number, date: string, paymentMethodId: string) => {
    const { data: purchase, error } = await supabase.from('purchases').insert({
        user_id: userId, supplier_id: supplierId, supplier_name: supplierName, date, total_cost: totalCost, paid_amount: paidAmount, status: 'Completed', payment_method_id: paymentMethodId, items
    }).select().single();
    if (error) throw error;
    for (const item of items) {
        const { data: prod } = await supabase.from('products').select('*').eq('id', item.productId).single();
        if (prod) {
            await supabase.from('products').update({ stock: ((prod as any).stock || 0) + item.quantity, cost: item.costPrice }).eq('id', item.productId);
        }
    }
    const debtAmount = totalCost - paidAmount;
    if (debtAmount > 0) {
        const { data: supp } = await supabase.from('suppliers').select('debt').eq('id', supplierId).single();
        if (supp) {
            await supabase.from('suppliers').update({ debt: Number((supp as any).debt) + debtAmount }).eq('id', supplierId);
        }
    }
    if (paidAmount > 0 && paymentMethodId) {
        const { data: pm } = await supabase.from('payment_methods').select('balance').eq('id', paymentMethodId).single();
        if (pm) {
            await supabase.from('payment_methods').update({ balance: Number((pm as any).balance) - paidAmount }).eq('id', paymentMethodId);
        }
    }
    return purchase;
};

export const updatePurchase = async (purchase: Purchase) => {
    await supabase.from('purchases').update({ supplier_id: purchase.supplierId, supplier_name: purchase.supplierName, date: purchase.date, paid_amount: purchase.paidAmount }).eq('id', purchase.id);
};

export const deletePurchase = async (id: string) => {
    const { data: purchase, error } = await supabase.from('purchases').select('*').eq('id', id).single();
    if (error || !purchase) throw new Error("الفاتورة غير موجودة");
    
    const items = Array.isArray((purchase as any).items) ? (purchase as any).items : [];
    for (const item of items) {
        const { data: prod } = await supabase.from('products').select('stock, name').eq('id', item.productId).single();
        if (!prod) continue;
        if (((prod as any).stock || 0) < item.quantity) {
            throw new Error(`لا يمكن حذف الفاتورة: المنتج "${(prod as any).name}" تم بيع جزء منه أو استهلاكه.`);
        }
    }
    for (const item of items) {
        const { data: prod } = await supabase.from('products').select('stock').eq('id', item.productId).single();
        if (prod) {
            await supabase.from('products').update({ stock: ((prod as any).stock || 0) - item.quantity }).eq('id', item.productId);
        }
    }
    const debtAdded = (purchase as any).total_cost - (purchase as any).paid_amount;
    if (debtAdded > 0 && (purchase as any).supplier_id) {
        const { data: supplier } = await supabase.from('suppliers').select('debt').eq('id', (purchase as any).supplier_id).single();
        if (supplier) {
            const newDebt = Math.max(0, Number((supplier as any).debt) - debtAdded);
            await supabase.from('suppliers').update({ debt: newDebt }).eq('id', (purchase as any).supplier_id);
        }
    }
    if ((purchase as any).paid_amount > 0 && (purchase as any).payment_method_id) {
        const { data: pm } = await supabase.from('payment_methods').select('balance').eq('id', (purchase as any).payment_method_id).single();
        if (pm) {
            await supabase.from('payment_methods').update({ balance: Number((pm as any).balance) + (purchase as any).paid_amount }).eq('id', (purchase as any).payment_method_id);
        }
    }
    await supabase.from('purchases').delete().eq('id', id);
};

// --- Expenses ---
export const getExpenses = async (userId: string): Promise<Expense[]> => {
    const { data: expenses, error: expError } = await supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (expError) throw expError;
    const { data: categories, error: catError } = await supabase.from('expense_categories').select('*').eq('user_id', userId);
    if (catError) throw catError;
    return (expenses || []).map((d: any) => ({
        id: d.id, userId: d.user_id, title: d.title, amount: d.amount || 0, categoryId: d.category_id, categoryName: categories?.find((c: any) => c.id === d.category_id)?.name || 'غير مصنف', employeeId: d.employee_id, date: d.date || new Date().toISOString(), paymentMethodId: d.payment_method_id
    }));
};

export const getExpenseCategories = async (userId: string): Promise<ExpenseCategory[]> => {
    const { data, error } = await supabase.from('expense_categories').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((d: any) => ({ id: d.id, userId: d.user_id, name: d.name, isDefault: d.is_default }));
};

export const addExpenseCategory = async (userId: string, name: string) => {
    await supabase.from('expense_categories').insert({ user_id: userId, name });
};

export const deleteExpenseCategory = async (userId: string, id: string) => {
    await supabase.from('expenses').update({ category_id: null }).eq('category_id', id);
    const { error } = await supabase.from('expense_categories').delete().eq('id', id);
    if (error) throw error;
};

export const addExpensesBatch = async (userId: string, batchData: { date: string, paymentMethodId: string, expenses: any[] }) => {
    const rowsToInsert = batchData.expenses.map(e => ({
        user_id: userId, title: e.title, amount: e.amount, category_id: e.categoryId, employee_id: e.employeeId || null, date: batchData.date, payment_method_id: batchData.paymentMethodId
    }));
    const { error } = await supabase.from('expenses').insert(rowsToInsert);
    if (error) throw error;
    const totalAmount = batchData.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    if (batchData.paymentMethodId && totalAmount > 0) {
        const { data: pm } = await supabase.from('payment_methods').select('balance').eq('id', batchData.paymentMethodId).single();
        if (pm) {
            await supabase.from('payment_methods').update({ balance: Number((pm as any).balance) - totalAmount }).eq('id', batchData.paymentMethodId);
        }
    }
};

export const updateExpense = async (expense: Expense) => {
    await supabase.from('expenses').update({ title: expense.title, amount: expense.amount, category_id: expense.categoryId, date: expense.date }).eq('id', expense.id);
};

export const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
};

// --- Employees ---
export const getEmployees = async (userId: string): Promise<Employee[]> => {
    const { data, error } = await supabase.from('employees').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((d: any) => ({
        id: d.id, userId: d.user_id, name: d.name, role: d.role, phone: d.phone, salary: d.salary || 0, joinDate: d.join_date, loanBalance: d.loan_balance || 0
    }));
};

export const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    await supabase.from('employees').insert({
        user_id: employee.userId, name: employee.name, role: employee.role, phone: employee.phone, salary: employee.salary, join_date: employee.joinDate, loan_balance: 0
    });
};

// --- Transactions ---
export const getTransactions = async (userId: string): Promise<FinancialTransaction[]> => {
    const { data, error } = await supabase.from('transactions').select(`*, payment_methods (name)`).eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map((d: any) => ({
        id: d.id, userId: d.user_id, type: d.type, amount: d.amount || 0, date: d.date || new Date().toISOString(), paymentMethodId: d.payment_method_id, paymentMethodName: d.payment_methods?.name, entityType: d.entity_type, entityId: d.entity_id, entityName: d.entity_name, description: d.description
    }));
};

export const addFinancialTransaction = async (txData: Omit<FinancialTransaction, 'id' | 'paymentMethodName' | 'entityName'>) => {
    const { userId, type, amount, date, paymentMethodId, entityType, entityId, description } = txData;
    const { data: tx, error } = await supabase.from('transactions').insert({
        user_id: userId, type, amount, date, payment_method_id: paymentMethodId, entity_type: entityType, entity_id: entityId, description
    }).select().single();
    if(error) throw error;
    if (entityId) { await adjustEntityBalance(entityType, entityId, type, amount); }
    const { data: pm } = await supabase.from('payment_methods').select('balance').eq('id', paymentMethodId).single();
    if (pm) {
        const newBal = type === 'in' ? Number((pm as any).balance) + Number(amount) : Number((pm as any).balance) - Number(amount);
        await supabase.from('payment_methods').update({ balance: newBal }).eq('id', paymentMethodId);
    }
    return tx;
};

export const transferFunds = async (userId: string, fromPmId: string, toPmId: string, amount: number, date: string, description: string) => {
    const { data: fromPm } = await supabase.from('payment_methods').select('name').eq('id', fromPmId).single();
    const { data: toPm } = await supabase.from('payment_methods').select('name').eq('id', toPmId).single();
    if (!fromPm || !toPm) throw new Error("حساب الدفع غير موجود");
    await addFinancialTransaction({
        userId, type: 'out', amount: Number(amount), date: date, paymentMethodId: fromPmId, entityType: 'Other', entityId: null, description: `تحويل إلى: ${(toPm as any).name} ${description ? `(${description})` : ''}`
    });
    await addFinancialTransaction({
        userId, type: 'in', amount: Number(amount), date: date, paymentMethodId: toPmId, entityType: 'Other', entityId: null, description: `تحويل من: ${(fromPm as any).name} ${description ? `(${description})` : ''}`
    });
    return true;
};

const adjustEntityBalance = async (entityType: string, entityId: string, txType: 'in' | 'out', amount: number) => {
    const numAmount = Number(amount);
    if (entityType === 'Client') {
        const { data: ent } = await supabase.from('clients').select('debt').eq('id', entityId).single();
        if (ent) {
            const newDebt = txType === 'in' ? Number((ent as any).debt) - numAmount : Number((ent as any).debt) + numAmount;
            await supabase.from('clients').update({ debt: newDebt }).eq('id', entityId);
        }
    } else if (entityType === 'Supplier') {
        const { data: ent } = await supabase.from('suppliers').select('debt').eq('id', entityId).single();
        if (ent) {
            const newDebt = txType === 'out' ? Number((ent as any).debt) - numAmount : Number((ent as any).debt) + numAmount;
            await supabase.from('suppliers').update({ debt: newDebt }).eq('id', entityId);
        }
    } else if (entityType === 'Employee') {
        const { data: ent } = await supabase.from('employees').select('loan_balance').eq('id', entityId).single();
        if (ent) {
            const newLoan = txType === 'out' ? Number((ent as any).loan_balance) + numAmount : Number((ent as any).loan_balance) - numAmount;
            await supabase.from('employees').update({ loan_balance: newLoan }).eq('id', entityId);
        }
    }
}

export const updateFinancialTransaction = async (txId: string, newData: Omit<FinancialTransaction, 'id' | 'paymentMethodName' | 'entityName'>) => {
    const { data: oldTx, error } = await supabase.from('transactions').select('*').eq('id', txId).single();
    if (error || !oldTx) throw new Error("Transaction not found");
    if ((oldTx as any).entity_id) {
        let reverseAmount = -Number((oldTx as any).amount); 
        await adjustEntityBalance((oldTx as any).entity_type, (oldTx as any).entity_id, (oldTx as any).type as 'in' | 'out', reverseAmount);
    }
    const { data: oldPm } = await supabase.from('payment_methods').select('balance').eq('id', (oldTx as any).payment_method_id).single();
    if (oldPm) {
        const revertBal = (oldTx as any).type === 'in' ? Number((oldPm as any).balance) - Number((oldTx as any).amount) : Number((oldPm as any).balance) + Number((oldTx as any).amount);
        await supabase.from('payment_methods').update({ balance: revertBal }).eq('id', (oldTx as any).payment_method_id);
    }
    if (newData.entityId) { await adjustEntityBalance(newData.entityType, newData.entityId, newData.type, Number(newData.amount)); }
    const { data: newPm } = await supabase.from('payment_methods').select('balance').eq('id', newData.paymentMethodId).single();
    if (newPm) {
        const newBal = newData.type === 'in' ? Number((newPm as any).balance) + Number(newData.amount) : Number((newPm as any).balance) - Number(newData.amount);
        await supabase.from('payment_methods').update({ balance: newBal }).eq('id', newData.paymentMethodId);
    }
    await supabase.from('transactions').update({ type: newData.type, amount: Number(newData.amount), date: newData.date, payment_method_id: newData.paymentMethodId, entity_type: newData.entityType, entity_id: newData.entityId, description: newData.description }).eq('id', txId);
};

export const deleteFinancialTransaction = async (txId: string) => {
    const { data: oldTx, error } = await supabase.from('transactions').select('*').eq('id', txId).single();
    if (error || !oldTx) throw new Error("Transaction not found");
    if ((oldTx as any).entity_id) { await adjustEntityBalance((oldTx as any).entity_type, (oldTx as any).entity_id, (oldTx as any).type as 'in' | 'out', -Number((oldTx as any).amount)); }
    const { data: pm } = await supabase.from('payment_methods').select('balance').eq('id', (oldTx as any).payment_method_id).single();
    if (pm) {
        const revertBal = (oldTx as any).type === 'in' ? Number((pm as any).balance) - Number((oldTx as any).amount) : Number((pm as any).balance) + Number((oldTx as any).amount);
        await supabase.from('payment_methods').update({ balance: revertBal }).eq('id', (oldTx as any).payment_method_id);
    }
    await supabase.from('transactions').delete().eq('id', txId);
};

// --- Report Data ---
export const getReportData = async (userId: string, startDate?: string, endDate?: string) => {
    const filter = (query: any, col: string = 'date') => {
        if(startDate) query = query.gte(col, startDate);
        if(endDate) query = query.lte(col, endDate + 'T23:59:59');
        return query;
    };
    const invReq = supabase.from('invoices').select('*').eq('user_id', userId);
    const expReq = supabase.from('expenses').select('*').eq('user_id', userId); 
    const catsReq = supabase.from('expense_categories').select('*').eq('user_id', userId);
    const purReq = supabase.from('purchases').select('*').eq('user_id', userId);
    const txReq = supabase.from('transactions').select('*').eq('user_id', userId);
    const prodReq = supabase.from('products').select('*').eq('user_id', userId);
    const [invRes, expRes, catsRes, prodRes, purRes, txRes] = await Promise.all([
        filter(invReq).then(), filter(expReq).then(), catsReq.then(), prodReq.then(), filter(purReq).then(), filter(txReq).then()
    ]);
    const products = (prodRes.data || []).map((d: any) => ({
         id: d.id, userId: d.user_id, name: d.name, category: d.category, price: d.price || 0, cost: d.cost || 0, stock: d.stock || 0, barcode: d.barcode
    }));
    const allInvoices = (invRes.data || []).map((d: any) => ({
        id: d.id, userId: d.user_id, customerName: d.customer_name, date: d.date, total: d.total || 0, paidAmount: d.paid_amount || 0, items: Array.isArray(d.items) ? d.items : []
    }));
    const invoices = allInvoices.filter((inv: any) => !inv.items.some((i: any) => i.productId === 'opening-bal'));
    const categories = catsRes.data || [];
    const expenses = (expRes.data || []).map((d: any) => ({
        id: d.id, userId: d.user_id, title: d.title, amount: d.amount || 0, categoryId: d.category_id, categoryName: categories.find((c: any) => c.id === d.category_id)?.name || 'غير مصنف', date: d.date
    }));
    const purchases = (purRes.data || []).map((d: any) => ({
        id: d.id, userId: d.user_id, date: d.date, totalCost: d.total_cost || 0, paidAmount: d.paid_amount || 0
    }));
    const transactions = (txRes.data || []).map((d: any) => ({
        id: d.id, type: d.type, amount: d.amount || 0, date: d.date, entityType: d.entity_type, description: d.description
    }));
    return { invoices, expenses, products, purchases, transactions };
};
