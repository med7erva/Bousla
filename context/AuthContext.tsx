
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
    const metadata = sessionUser.user_metadata || {};
    const sanitizedPhone = (metadata.phone || '').replace(/\D/g, '');
    
    // النسخة الاحتياطية (Fallback) من بيانات الجلسة
    const fallbackUser: User = {
        id: sessionUser.id,
        name: metadata.name || 'مستخدم بوصلة',
        phone: sanitizedPhone,
        storeName: metadata.storeName || 'متجري الذكي',
        email: sessionUser.email,
        createdAt: sessionUser.created_at,
        subscriptionStatus: metadata.subscriptionStatus || 'trial',
        subscriptionPlan: metadata.subscriptionPlan || 'pro',
        trialEndDate: metadata.trialEndDate || new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isAdmin: sanitizedPhone === ADMIN_PHONE
    };

    try {
      // محاولة جلب البيانات مع مهلة زمنية صارمة جداً (3 ثوانٍ فقط)
      const profilePromise = supabase.from('profiles').select('*').eq('id', sessionUser.id).single();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));

      const raceResult = await Promise.race([profilePromise, timeoutPromise]) as any;
      
      if (!raceResult || raceResult.error) {
          console.warn("DB Profile Fetch failed or timed out, using fallback.");
          return fallbackUser;
      }

      const profile = raceResult.data;
      const isAdmin = profile.phone === ADMIN_PHONE || profile.is_admin === true;
      let status = profile.subscription_status || fallbackUser.subscriptionStatus;
      let plan = profile.subscription_plan || fallbackUser.subscriptionPlan;
      
      const targetDate = status === 'active' ? profile.subscription_end_date : profile.trial_end_date;
      if (status !== 'expired' && targetDate && !isAdmin) {
          if (new Date(targetDate) < new Date()) {
              status = 'expired';
          }
      }

      if (isAdmin) { status = 'active'; plan = 'pro'; }

      return {
        ...fallbackUser,
        name: profile.name || fallbackUser.name,
        storeName: profile.store_name || fallbackUser.storeName,
        subscriptionStatus: status as any,
        subscriptionPlan: plan as any,
        trialEndDate: profile.trial_end_date || fallbackUser.trialEndDate,
        subscriptionEndDate: profile.subscription_end_date,
        isAdmin: isAdmin
      };
    } catch (err) {
      console.error("Auth Fallback Active:", err);
      return fallbackUser;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // صمام الأمان النهائي (7 ثوانٍ)
    const safetyTimeout = setTimeout(() => {
        if (isMounted && loading) {
            setLoading(false);
        }
    }, 7000);

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          const userData = await fetchUserProfile(session.user);
          setUser(userData);
        }
      } catch (e) {
        console.error("Auth Init Error:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 font-sans" dir="rtl">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-slate-500 dark:text-slate-400 font-bold animate-pulse">جاري تأمين الجلسة...</p>
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
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
