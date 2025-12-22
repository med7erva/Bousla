
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

const ADMIN_PHONE = '47071347';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (sessionUser: any): Promise<User> => {
    try {
      // جلب البيانات من جدول profiles (الذي قمت بتحديثه الآن بـ SQL)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn("Profile fetch warning:", error.message);
      }

      const metadata = sessionUser.user_metadata || {};
      const phone = profile?.phone || metadata.phone || '';
      const sanitizedPhone = phone.replace(/\D/g, '');
      const isAdmin = sanitizedPhone === ADMIN_PHONE || profile?.is_admin === true;

      // الاعتماد الكلي على قيم قاعدة البيانات الجديدة
      let status = profile?.subscription_status || metadata.subscriptionStatus || 'trial';
      let plan = profile?.subscription_plan || metadata.subscriptionPlan || 'plus';
      const trialEnd = profile?.trial_end_date || metadata.trialEndDate;
      const subEnd = profile?.subscription_end_date || metadata.subscriptionEndDate;

      // فحص انتهاء الصلاحية
      const targetDate = status === 'active' ? subEnd : trialEnd;
      if (status !== 'expired' && targetDate && !isAdmin) {
          if (new Date(targetDate) < new Date()) {
              status = 'expired';
          }
      }

      // صلاحيات المسؤول كاملة دائماً
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
        trialEndDate: trialEnd,
        subscriptionEndDate: subEnd,
        isAdmin: isAdmin
      };
    } catch (err) {
      // نظام أمان احتياطي في حال فشل الاتصال بالقاعدة
      console.error("Auth fallback triggered");
      const metadata = sessionUser.user_metadata || {};
      return {
        id: sessionUser.id,
        name: metadata.name || 'User',
        phone: metadata.phone || '',
        storeName: metadata.storeName || 'My Store',
        email: sessionUser.email,
        createdAt: sessionUser.created_at,
        subscriptionStatus: metadata.subscriptionStatus || 'trial',
        subscriptionPlan: metadata.subscriptionPlan || 'plus',
        trialEndDate: metadata.trialEndDate,
        isAdmin: metadata.phone === ADMIN_PHONE
      };
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          const userData = await fetchUserProfile(session.user);
          setUser(userData);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userData = await fetchUserProfile(session.user);
        if (isMounted) setUser(userData);
      } else {
        if (isMounted) setUser(null);
      }
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
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
  if (context === undefined) throw new Error('useAuth error');
  return context;
};
