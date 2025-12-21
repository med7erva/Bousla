
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

  const mapUser = (sessionUser: any): User => {
    const metadata = sessionUser.user_metadata;
    const phone = metadata.phone || sessionUser.phone || '';
    const sanitizedPhone = phone.replace(/\D/g, '');

    return {
      id: sessionUser.id,
      name: metadata.name || 'User',
      phone: sanitizedPhone,
      storeName: metadata.storeName || 'My Store',
      email: sessionUser.email,
      createdAt: sessionUser.created_at,
      subscriptionStatus: metadata.subscriptionStatus || 'trial',
      subscriptionPlan: metadata.subscriptionPlan || 'pro',
      trialEndDate: metadata.trialEndDate || new Date().toISOString(),
      subscriptionEndDate: metadata.subscriptionEndDate,
      // فرض صلاحية الأدمن إذا طابق الرقم
      isAdmin: sanitizedPhone === ADMIN_PHONE || metadata.isAdmin === true
    };
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapUser(session.user));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapUser(session.user));
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
