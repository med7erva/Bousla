
import { supabase } from './supabase';
import { Product, Invoice, SaleItem, User, Client, Expense, Purchase, Supplier, PurchaseItem, PaymentMethod, Employee, ExpenseCategory, FinancialTransaction, ProductCategory, AppSettings } from '../types';
import { SEED_PRODUCTS, SEED_PAYMENT_METHODS } from '../constants';

// --- Auth & Subscription ---
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

  if (error) throw error;
  if (!data.user) throw new Error("Registration failed");

  // إضافة للملف الشخصي
  await supabase.from('profiles').upsert({
      id: data.user.id,
      name: user.name,
      store_name: user.storeName,
      phone: sanitizedPhone,
      subscription_status: 'trial',
      subscription_plan: 'pro',
      trial_end_date: trialEndDate.toISOString(),
      is_admin: sanitizedPhone === '47071347'
  });

  // البذور (Seeds)
  await supabase.from('payment_methods').insert(SEED_PAYMENT_METHODS.map(pm => ({
      user_id: data.user!.id, name: pm.name, type: pm.type, provider: pm.provider, balance: 0, is_default: pm.isDefault
  })));
  
  const seedExpCats = ['إيجار', 'رواتب', 'فواتير', 'صيانة', 'أخرى'];
  await supabase.from('expense_categories').insert(seedExpCats.map(c => ({ 
      user_id: data.user!.id, name: c, is_default: c === 'رواتب' 
  })));

  return { id: data.user.id, ...user, email: pseudoEmail, createdAt: new Date().toISOString(), subscriptionStatus: 'trial' as const, subscriptionPlan: 'pro' as const, trialEndDate: trialEndDate.toISOString() };
};

export const loginUser = async (phone: string, password: string): Promise<User> => {
    const sanitizedPhone = phone.replace(/\D/g, '');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: `${sanitizedPhone}@bousla.app`,
        password
    });
    if (error) throw new Error('بيانات الدخول غير صحيحة');
    
    // AuthContext سيتكفل بالباقي عبر fetchUserProfile
    return {} as User; 
};

export const activateSubscription = async (userId: string, code: string) => {
    // 1. التحقق من الكود
    const { data: codeData, error: codeError } = await supabase
        .from('prepaid_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('is_used', false)
        .single();

    if (codeError || !codeData) throw new Error("كود تفعيل غير صحيح أو مستخدم");

    const daysToAdd = codeData.days;
    const plan = codeData.plan;
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    // 2. تحديث البروفايل (القاعدة الجديدة)
    const { error: profileError } = await supabase.from('profiles').update({
        subscription_status: 'active',
        subscription_plan: plan,
        subscription_end_date: newEndDate.toISOString()
    }).eq('id', userId);

    if (profileError) throw new Error("فشل تحديث الاشتراك");

    // 3. حرق الكود
    await supabase.from('prepaid_codes').update({ is_used: true }).eq('id', codeData.id);

    return { endDate: newEndDate.toISOString(), plan };
};

export const generatePrepaidCode = async (days: number, plan: 'plus' | 'pro') => {
    const { data: { user } } = await supabase.auth.getUser();
    const code = `BSL-${plan.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${days}`;
    await supabase.from('prepaid_codes').insert({ code, days, plan, is_used: false, created_by: user?.id });
    return code;
};

export const getUnusedCodes = async () => {
    const { data } = await supabase.from('prepaid_codes').select('*').eq('is_used', false).order('created_at', { ascending: false });
    return data || [];
};

// --- Products ---
export const getProducts = async (userId: string): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((d: any) => ({
        id: d.id, userId: d.user_id, name: d.name, category: d.category, price: d.price || 0, cost: d.cost || 0, stock: d.stock || 0, barcode: d.barcode
    }));
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
    const { data, error } = await supabase.from('products').insert({
        user_id: product.userId,
        name: product.name,
        category: product.category,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        barcode: product.barcode || `BC-${Date.now()}`
    }).select().single();
    if (error) throw error;
    return (data as any);
};

export const updateProduct = async (product: Product) => {
    const { error } = await supabase.from('products').update({
        name: product.name,
        category: product.category,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        barcode: product.barcode
    }).eq('id', product.id);
    if (error) throw error;
};

export const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
};

export const getProductCategories = async (userId: string): Promise<ProductCategory[]> => {
    const { data, error } = await supabase.from('product_categories').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((d: any) => ({ id: d.id, userId: d.user_id, name: d.name }));
};

export const addProductCategory = async (userId: string, name: string) => {
    const { error } = await supabase.from('product_categories').insert({ user_id: userId, name: name });
    if (error) throw error;
};

export const deleteProductCategory = async (id: string) => {
    const { error } = await supabase.from('product_categories').delete().eq('id', id);
    if (error) throw error;
};

export const manufactureProduct = async (sourceId: string, targetId: string, qty: number, rawPerUnit: number, laborCostPerUnit: number = 0, supplierId: string = '') => {
    const { data: sourceRes } = await supabase.from('products').select('*').eq('id', sourceId).single();
    const { data: targetRes } = await supabase.from('products').select('*').eq('id', targetId).single();

    const source = sourceRes as any;
    const target = targetRes as any;

    if (!source || !target) throw new Error("منتج غير موجود");

    const totalRawNeeded = qty * rawPerUnit;
    if (source.stock < totalRawNeeded) throw new Error(`نقص مواد خام. متاح: ${source.stock}`);

    await supabase.from('products').update({ stock: source.stock - totalRawNeeded }).eq('id', sourceId);

    const totalRawCost = totalRawNeeded * source.cost;
    const totalLaborCost = qty * laborCostPerUnit;
    const newUnitCost = (totalRawCost + totalLaborCost) / qty;
    
    const currentStockVal = (target.stock || 0) * (target.cost || 0);
    const newBatchVal = qty * newUnitCost;
    const newTotalStock = (target.stock || 0) + qty;
    const weightedCost = Math.round((currentStockVal + newBatchVal) / newTotalStock);

    await supabase.from('products').update({ stock: newTotalStock, cost: weightedCost }).eq('id', targetId);

    if (supplierId && totalLaborCost > 0) {
        const { data: supplierRes } = await supabase.from('suppliers').select('*').eq('id', supplierId).single();
        const supplier = supplierRes as any;
        if (supplier) {
            await supabase.from('suppliers').update({ debt: Number(supplier.debt || 0) + totalLaborCost }).eq('id', supplierId);
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
        customerName: d.customer_name || 'عميل افتراضي',
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
            const { data: prodRes } = await supabase.from('products').select('stock').eq('id', item.productId).single();
            const prod = prodRes as any;
            if (prod) {
                await supabase.from('products').update({ stock: (prod.stock || 0) - item.quantity }).eq('id', item.productId);
            }
        }
    }

    const { data: clients } = await supabase.from('clients').select('*').eq('user_id', userId).ilike('name', finalCustomerName).limit(1);
    let client = clients && clients.length > 0 ? (clients[0] as any) : null;

    if (client) {
        const updateData: any = { last_purchase_date: date };
        updateData.debt = Number(client.debt || 0) + netChange;
        await supabase.from('clients').update(updateData).eq('id', client.id);
    } else if (netChange !== 0) {
        await supabase.from('clients').insert({
            user_id: userId, name: finalCustomerName, phone: '', debt: netChange, last_purchase_date: date
        });
    }

    if (paymentMethodId && paidAmount > 0) {
        const { data: pmRes } = await supabase.from('payment_methods').select('balance').eq('id', paymentMethodId).single();
        const pm = pmRes as any;
        if (pm) {
            await supabase.from('payment_methods').update({ balance: (pm.balance || 0) + paidAmount }).eq('id', paymentMethodId);
        }
    }

    return (invoice as any);
};

export const deleteInvoice = async (id: string) => {
    const { data: invRes, error } = await supabase.from('invoices').select('*').eq('id', id).single();
    const inv = invRes as any;
    if(error || !inv) throw new Error("Invoice not found");

    const items = Array.isArray(inv.items) ? inv.items : [];
    for(const item of items) {
        if(item.productId && !item.productId.startsWith('custom-') && !item.productId.startsWith('opening-bal')) {
             const { data: prodRes } = await supabase.from('products').select('stock').eq('id', item.productId).single();
             const prod = prodRes as any;
             if(prod) {
                 await supabase.from('products').update({ stock: (prod.stock || 0) + item.quantity }).eq('id', item.productId);
             }
        }
    }

    if(inv.remaining_amount !== 0) {
         const { data: clientRes } = await supabase.from('clients').select('*').eq('user_id', inv.user_id).ilike('name', inv.customer_name).single();
         const client = clientRes as any;
         if(client) {
             const newDebt = Number(client.debt || 0) - Number(inv.remaining_amount || 0);
             await supabase.from('clients').update({ debt: newDebt }).eq('id', client.id);
         }
    }

    if(inv.payment_method_id && inv.paid_amount > 0) {
         const { data: pmRes } = await supabase.from('payment_methods').select('balance').eq('id', inv.payment_method_id).single();
         const pm = pmRes as any;
         if(pm) {
             const newBalance = Number(pm.balance || 0) - Number(inv.paid_amount || 0);
             await supabase.from('payment_methods').update({ balance: newBalance }).eq('id', inv.payment_method_id);
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
        const { data: prodRes } = await supabase.from('products').select('*').eq('id', item.productId).single();
        const prod = prodRes as any;
        if (prod) {
            await supabase.from('products').update({ stock: (prod.stock || 0) + item.quantity, cost: item.costPrice }).eq('id', item.productId);
        }
    }
    const debtAmount = totalCost - paidAmount;
    if (debtAmount > 0) {
        const { data: suppRes } = await supabase.from('suppliers').select('debt').eq('id', supplierId).single();
        const supp = suppRes as any;
        if (supp) {
            await supabase.from('suppliers').update({ debt: Number(supp.debt || 0) + debtAmount }).eq('id', supplierId);
        }
    }
    if (paidAmount > 0 && paymentMethodId) {
        const { data: pmRes } = await supabase.from('payment_methods').select('balance').eq('id', paymentMethodId).single();
        const pm = pmRes as any;
        if (pm) {
            await supabase.from('payment_methods').update({ balance: Number(pm.balance || 0) - paidAmount }).eq('id', paymentMethodId);
        }
    }
    return (purchase as any);
};

export const updatePurchase = async (purchase: Purchase) => {
    await supabase.from('purchases').update({ supplier_id: purchase.supplierId, supplier_name: purchase.supplierName, date: purchase.date, paid_amount: purchase.paidAmount }).eq('id', purchase.id);
};

export const deletePurchase = async (id: string) => {
    const { data: purchaseRes, error } = await supabase.from('purchases').select('*').eq('id', id).single();
    const purchase = purchaseRes as any;
    if (error || !purchase) throw new Error("الفاتورة غير موجودة");
    
    const items = Array.isArray(purchase.items) ? purchase.items : [];
    for (const item of items) {
        const { data: prodRes } = await supabase.from('products').select('stock, name').eq('id', item.productId).single();
        const prod = prodRes as any;
        if (!prod) continue;
        if ((prod.stock || 0) < item.quantity) {
            throw new Error(`لا يمكن حذف الفاتورة: المنتج "${prod.name}" تم بيع جزء منه أو استهلاكه.`);
        }
    }
    for (const item of items) {
        const { data: prodRes } = await supabase.from('products').select('stock').eq('id', item.productId).single();
        const prod = prodRes as any;
        if (prod) {
            await supabase.from('products').update({ stock: (prod.stock || 0) - item.quantity }).eq('id', item.productId);
        }
    }
    const debtAdded = purchase.total_cost - purchase.paid_amount;
    if (debtAdded > 0 && purchase.supplier_id) {
        const { data: supplierRes = { debt: 0 } } = await supabase.from('suppliers').select('debt').eq('id', purchase.supplier_id).single();
        const supplier = supplierRes as any;
        if (supplier) {
            const newDebt = Math.max(0, Number(supplier.debt || 0) - debtAdded);
            await supabase.from('suppliers').update({ debt: newDebt }).eq('id', purchase.supplier_id);
        }
    }
    if (purchase.paid_amount > 0 && purchase.payment_method_id) {
        const { data: pmRes } = await supabase.from('payment_methods').select('balance').eq('id', purchase.payment_method_id).single();
        const pm = pmRes as any;
        if (pm) {
            await supabase.from('payment_methods').update({ balance: Number(pm.balance || 0) + purchase.paid_amount }).eq('id', purchase.payment_method_id);
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
        id: d.id, userId: d.user_id, title: d.title, amount: d.amount || 0, categoryId: d.category_id, categoryName: (categories as any)?.find((c: any) => c.id === d.category_id)?.name || 'غير مصنف', employeeId: d.employee_id, date: d.date || new Date().toISOString(), paymentMethodId: d.payment_method_id
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
        const { data: pmRes } = await supabase.from('payment_methods').select('balance').eq('id', batchData.paymentMethodId).single();
        const pm = pmRes as any;
        if (pm) {
            await supabase.from('payment_methods').update({ balance: Number(pm.balance || 0) - totalAmount }).eq('id', batchData.paymentMethodId);
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
    const { data: pmRes } = await supabase.from('payment_methods').select('balance').eq('id', paymentMethodId).single();
    const pm = pmRes as any;
    if (pm) {
        const newBal = type === 'in' ? Number(pm.balance || 0) + Number(amount) : Number(pm.balance || 0) - Number(amount);
        await supabase.from('payment_methods').update({ balance: newBal }).eq('id', paymentMethodId);
    }
    return (tx as any);
};

export const transferFunds = async (userId: string, fromPmId: string, toPmId: string, amount: number, date: string, description: string) => {
    const { data: fromPmRes } = await supabase.from('payment_methods').select('name').eq('id', fromPmId).single();
    const { data: toPmRes } = await supabase.from('payment_methods').select('name').eq('id', toPmId).single();
    const fromPm = fromPmRes as any;
    const toPm = toPmRes as any;
    if (!fromPm || !toPm) throw new Error("حساب الدفع غير موجود");
    await addFinancialTransaction({
        userId, type: 'out', amount: Number(amount), date: date, paymentMethodId: fromPmId, entityType: 'Other', entityId: null, description: `تحويل إلى: ${toPm.name} ${description ? `(${description})` : ''}`
    });
    await addFinancialTransaction({
        userId, type: 'in', amount: Number(amount), date: date, paymentMethodId: toPmId, entityType: 'Other', entityId: null, description: `تحويل من: ${fromPm.name} ${description ? `(${description})` : ''}`
    });
    return true;
};

const adjustEntityBalance = async (entityType: string, entityId: string, txType: 'in' | 'out', amount: number) => {
    const numAmount = Number(amount);
    if (entityType === 'Client') {
        const { data: entRes } = await supabase.from('clients').select('debt').eq('id', entityId).single();
        const ent = entRes as any;
        if (ent) {
            const newDebt = txType === 'in' ? Number(ent.debt || 0) - numAmount : Number(ent.debt || 0) + numAmount;
            await supabase.from('clients').update({ debt: newDebt }).eq('id', entityId);
        }
    } else if (entityType === 'Supplier') {
        const { data: entRes } = await supabase.from('suppliers').select('debt').eq('id', entityId).single();
        const ent = entRes as any;
        if (ent) {
            const newDebt = txType === 'out' ? Number(ent.debt || 0) - numAmount : Number(ent.debt || 0) + numAmount;
            await supabase.from('suppliers').update({ debt: newDebt }).eq('id', entityId);
        }
    } else if (entityType === 'Employee') {
        const { data: entRes } = await supabase.from('employees').select('loan_balance').eq('id', entityId).single();
        const ent = entRes as any;
        if (ent) {
            const newLoan = txType === 'out' ? Number(ent.loan_balance || 0) + numAmount : Number(ent.loan_balance || 0) - numAmount;
            await supabase.from('employees').update({ loan_balance: newLoan }).eq('id', entityId);
        }
    }
}

export const updateFinancialTransaction = async (txId: string, newData: Omit<FinancialTransaction, 'id' | 'paymentMethodName' | 'entityName'>) => {
    const { data: oldTxRes, error } = await supabase.from('transactions').select('*').eq('id', txId).single();
    const oldTx = oldTxRes as any;
    if (error || !oldTx) throw new Error("Transaction not found");
    if (oldTx.entity_id) {
        let reverseAmount = -Number(oldTx.amount); 
        await adjustEntityBalance(oldTx.entity_type, oldTx.entity_id, oldTx.type as 'in' | 'out', reverseAmount);
    }
    const { data: oldPmRes } = await supabase.from('payment_methods').select('balance').eq('id', oldTx.payment_method_id).single();
    const oldPm = oldPmRes as any;
    if (oldPm) {
        const revertBal = oldTx.type === 'in' ? Number(oldPm.balance || 0) - Number(oldTx.amount) : Number(oldPm.balance || 0) + Number(oldTx.amount);
        await supabase.from('payment_methods').update({ balance: revertBal }).eq('id', oldTx.payment_method_id);
    }
    if (newData.entityId) { await adjustEntityBalance(newData.entityType, newData.entityId, newData.type, Number(newData.amount)); }
    const { data: newPmRes } = await supabase.from('payment_methods').select('balance').eq('id', newData.paymentMethodId).single();
    const newPm = newPmRes as any;
    if (newPm) {
        const newBal = newData.type === 'in' ? Number(newPm.balance || 0) + Number(newData.amount) : Number(newPm.balance || 0) - Number(newData.amount);
        await supabase.from('payment_methods').update({ balance: newBal }).eq('id', newData.paymentMethodId);
    }
    await supabase.from('transactions').update({ type: newData.type, amount: Number(newData.amount), date: newData.date, payment_method_id: newData.paymentMethodId, entity_type: newData.entityType, entity_id: newData.entityId, description: newData.description }).eq('id', txId);
};

export const deleteFinancialTransaction = async (txId: string) => {
    const { data: oldTxRes, error } = await supabase.from('transactions').select('*').eq('id', txId).single();
    const oldTx = oldTxRes as any;
    if (error || !oldTx) throw new Error("Transaction not found");
    if (oldTx.entity_id) { await adjustEntityBalance(oldTx.entity_type, oldTx.entity_id, oldTx.type as 'in' | 'out', -Number(oldTx.amount)); }
    const { data: pmRes = { balance: 0 } } = await supabase.from('payment_methods').select('balance').eq('id', oldTx.payment_method_id).single();
    const pm = pmRes as any;
    if (pm) {
        const revertBal = oldTx.type === 'in' ? Number(pm.balance || 0) - Number(oldTx.amount) : Number(pm.balance || 0) + Number(oldTx.amount);
        await supabase.from('payment_methods').update({ balance: revertBal }).eq('id', oldTx.payment_method_id);
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
        id: d.id, userId: d.user_id, title: d.title, amount: d.amount || 0, categoryId: d.category_id, categoryName: (categories as any).find((c: any) => c.id === d.category_id)?.name || 'غير مصنف', date: d.date
    }));
    const purchases = (purRes.data || []).map((d: any) => ({
        id: d.id, userId: d.user_id, date: d.date, totalCost: d.total_cost || 0, paidAmount: d.paid_amount || 0
    }));
    const transactions = (txRes.data || []).map((d: any) => ({
        id: d.id, type: d.type, amount: d.amount || 0, date: d.date, entityType: d.entity_type, description: d.description
    }));
    return { invoices, expenses, products, purchases, transactions };
};

export const getPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
    const { data, error } = await supabase.from('payment_methods').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((d: any) => ({
        id: d.id, userId: d.user_id, name: d.name, type: d.type, provider: d.provider, balance: Number(d.balance) || 0, isDefault: d.is_default
    }));
};

export const ensurePaymentMethodsExist = async (userId: string) => {
    const { data } = await supabase.from('payment_methods').select('id').eq('user_id', userId);
    if (!data || data.length === 0) {
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

export const updateUserProfile = async (userId: string, data: { name: string, storeName: string, activityType: string }) => {
    const { error } = await supabase.from('profiles').update({
        name: data.name,
        store_name: data.storeName,
        activity_type: data.activityType
    }).eq('id', userId);
    if (error) throw error;
};

export const getAppSettings = (): AppSettings => {
    try {
        const saved = localStorage.getItem('bousla_settings');
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    
    return {
      system: { language: 'ar', darkMode: false, dataView: 'detailed' },
      store: { currency: 'MRU', unit: 'piece', discountPolicy: 'none' },
      notifications: { 
        lowStock: true, lowStockThreshold: 5, outOfStock: true, 
        lowSales: false, lowSalesPeriod: 'daily', 
        highExpenses: true, highExpensesThreshold: 1000 
      },
      ai: { enabled: true, level: 'medium', smartAlerts: true }
    };
};

export const saveAppSettings = (settings: AppSettings) => {
    localStorage.setItem('bousla_settings', JSON.stringify(settings));
};
