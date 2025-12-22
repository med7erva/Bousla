
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// الرقم المسؤول الوحيد للتطبيق
const ADMIN_PHONE = '47071347';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // دالة لجلب بيانات الملف الشخصي من قاعدة البيانات بدقة
  const fetchUserProfile = async (sessionUser: any): Promise<User> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching profile:", error);
    }

    const metadata = sessionUser.user_metadata || {};
    const phone = profile?.phone || metadata.phone || sessionUser.phone || '';
    const sanitizedPhone = phone.replace(/\D/g, '');
    const isAdmin = sanitizedPhone === ADMIN_PHONE || profile?.is_admin === true;

    // استخراج القيم من البروفايل (قاعدة البيانات) أولاً، ثم الميتاداتا كاحتياط
    let status = profile?.subscription_status || metadata.subscriptionStatus || 'trial';
    let plan = profile?.subscription_plan || metadata.subscriptionPlan || 'plus';
    const trialEnd = profile?.trial_end_date || metadata.trialEndDate;
    const subEnd = profile?.subscription_end_date || metadata.subscriptionEndDate;

    // حساب التاريخ المستهدف للتحقق من الانتهاء
    const targetDate = status === 'active' ? subEnd : trialEnd;
    
    // التحقق التلقائي من انتهاء الصلاحية
    if (status !== 'expired' && targetDate && new Date(targetDate) < new Date()) {
        if (!isAdmin) status = 'expired';
    }

    // إذا كان مسؤولاً، نعطيه صلاحيات كاملة دائماً
    if (isAdmin) {
        status = 'active';
        plan = 'pro';
    }

    return {
      id: sessionUser.id,
      name: profile?.name || metadata.name || 'User',
      phone: sanitizedPhone,
      storeName: profile?.store_name || metadata.storeName || 'My Store',
      email: sessionUser.email,
      createdAt: sessionUser.created_at,
      subscriptionStatus: status as 'trial' | 'active' | 'expired',
      subscriptionPlan: plan as 'plus' | 'pro',
      trialEndDate: trialEnd || new Date().toISOString(),
      subscriptionEndDate: subEnd,
      isAdmin: isAdmin
    };
  };

  useEffect(() => {
    // 1. عند تشغيل التطبيق أول مرة
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userData = await fetchUserProfile(session.user);
        setUser(userData);
      }
      setLoading(false);
    });

    // 2. عند تغيير حالة تسجيل الدخول أو التحديث
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userData = await fetchUserProfile(session.user);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 font-sans">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold">جاري تحميل بوصلة...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
