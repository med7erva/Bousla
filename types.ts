
export interface User {
  id: string;
  name: string;
  phone: string; 
  password?: string;
  storeName: string;
  email?: string;
  createdAt: string;
  // Subscription Fields
  subscriptionStatus: 'trial' | 'active' | 'expired';
  subscriptionPlan: 'plus' | 'pro'; // New field to differentiate plans
  trialEndDate: string;
  subscriptionEndDate?: string;
  isAdmin?: boolean; // Field to identify app owner
}

export interface AppSettings {
  system: {
    language: 'ar' | 'en';
    darkMode: boolean;
    dataView: 'compact' | 'detailed';
  };
  store: {
    currency: 'MRU' | 'MRO'; // New vs Old Ouguiya
    unit: 'piece' | 'pair' | 'box' | 'kg';
    discountPolicy: 'none' | 'fixed' | 'product';
    activityType?: string;
    ownerName?: string;
  };
  notifications: {
    lowStock: boolean;
    lowStockThreshold: number;
    outOfStock: boolean;
    lowSales: boolean;
    lowSalesPeriod: 'daily' | 'weekly';
    highExpenses: boolean;
    highExpensesThreshold: number;
  };
  ai: {
    enabled: boolean;
    level: 'basic' | 'medium' | 'deep';
    smartAlerts: boolean;
  };
}

export interface PaymentMethod {
  id: string;
  userId: string;
  name: string;
  type: 'Cash' | 'BankApp';
  provider: 'Cash' | 'Bankily' | 'Masrvi' | 'Sedad' | 'Other';
  balance: number;
  isDefault?: boolean;
}

export interface ProductCategory {
  id: string;
  userId: string;
  name: string;
}

export interface Product {
  id: string;
  userId: string; 
  name: string;
  category: string; 
  price: number; 
  cost: number; 
  stock: number;
  barcode: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  priceAtSale: number;
  productName: string;
}

export interface Invoice {
  id: string;
  userId: string;
  customerName: string;
  date: string;
  items: SaleItem[];
  total: number;
  paidAmount: number; 
  remainingAmount: number; 
  status: 'Completed' | 'Pending' | 'Returned';
  paymentMethodId?: string; 
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  phone: string;
  debt: number;
  openingBalance?: number; 
  lastPurchaseDate?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  userId: string;
  name: string;
  phone: string;
  debt: number; 
  productsSummary?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
}

export interface Purchase {
  id: string;
  userId: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  totalCost: number;
  paidAmount: number; 
  paymentMethodId?: string; 
  status: 'Completed' | 'Pending';
}

export interface ExpenseCategory {
  id: string;
  userId: string;
  name: string;
  isDefault?: boolean; 
}

export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  categoryId: string; 
  categoryName?: string; 
  employeeId?: string; 
  date: string;
  paymentMethodId?: string; 
  notes?: string;
}

export interface Employee {
  id: string;
  userId: string;
  name: string;
  role: 'Manager' | 'Sales' | 'Worker' | 'Security';
  phone: string;
  salary: number;
  joinDate: string;
  loanBalance?: number; 
}

export interface FinancialTransaction {
  id: string;
  userId: string;
  type: 'in' | 'out'; 
  amount: number;
  date: string;
  paymentMethodId: string;
  paymentMethodName?: string;
  entityType: 'Client' | 'Supplier' | 'Employee' | 'Other';
  entityId?: string;
  entityName?: string;
  description: string;
}

export interface KPIMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
