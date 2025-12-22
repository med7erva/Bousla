
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
    // جلب الميتاداتا كخيار احتياطي فوري
    const metadata = sessionUser.user_metadata || {};
    const fallbackUser: User = {
        id: sessionUser.id,
        name: metadata.name || 'User',
        phone: (metadata.phone || '').replace(/\D/g, ''),
        storeName: metadata.storeName || 'My Store',
        email: sessionUser.email,
        createdAt: sessionUser.created_at,
        subscriptionStatus: metadata.subscriptionStatus || 'trial',
        subscriptionPlan: metadata.subscriptionPlan || 'plus',
        trialEndDate: metadata.trialEndDate,
        isAdmin: (metadata.phone || '') === ADMIN_PHONE
    };

    try {
      // محاولة جلب البيانات الإضافية من الجدول
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (error) {
          console.warn("Profile table error (Safe fallback used):", error.message);
          return fallbackUser;
      }

      if (profile) {
          const phone = profile.phone || metadata.phone || '';
          const sanitizedPhone = phone.replace(/\D/g, '');
          const isAdmin = sanitizedPhone === ADMIN_PHONE || profile.is_admin === true;
          
          let status = profile.subscription_status || metadata.subscriptionStatus || 'trial';
          let plan = profile.subscription_plan || metadata.subscriptionPlan || 'plus';
          const trialEnd = profile.trial_end_date || metadata.trialEndDate;
          const subEnd = profile.subscription_end_date || metadata.subscriptionEndDate;

          const targetDate = status === 'active' ? subEnd : trialEnd;
          if (status !== 'expired' && targetDate && !isAdmin) {
              if (new Date(targetDate) < new Date()) {
                  status = 'expired';
              }
          }

          if (isAdmin) { status = 'active'; plan = 'pro'; }

          return {
            ...fallbackUser,
            name: profile.name || fallbackUser.name,
            phone: sanitizedPhone,
            storeName: profile.store_name || fallbackUser.storeName,
            subscriptionStatus: status as any,
            subscriptionPlan: plan as any,
            trialEndDate: trialEnd,
            subscriptionEndDate: subEnd,
            isAdmin: isAdmin
          };
      }
      return fallbackUser;
    } catch (err) {
      return fallbackUser;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // صمام أمان: إذا استغرقت عملية التحميل أكثر من 6 ثوانٍ، أغلق شاشة التحميل مهما كانت النتيجة
    const safetyTimeout = setTimeout(() => {
        if (isMounted && loading) {
            console.log("Auth safety timeout triggered");
            setLoading(false);
        }
    }, 6000);

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          const userData = await fetchUserProfile(session.user);
          setUser(userData);
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userData = await fetchUserProfile(session.user);
        if (isMounted) {
            setUser(userData);
            setLoading(false);
        }
      } else {
        if (isMounted) {
            setUser(null);
            setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
        await supabase.auth.signOut();
        setUser(null);
    } catch (e) {
        window.location.reload(); // في حال فشل الخروج برمجياً، أنعش الصفحة
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm animate-pulse">جاري تأمين الاتصال...</p>
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
