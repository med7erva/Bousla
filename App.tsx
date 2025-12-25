
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import AIChat from './pages/AIChat';
import Clients from './pages/Clients';
import Expenses from './pages/Expenses';
import Purchases from './pages/Purchases';
import Suppliers from './pages/Suppliers'; 
import Employees from './pages/Employees'; 
import Finance from './pages/Finance';
import Reports from './pages/Reports'; 
import Settings from './pages/Settings'; 
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import Admin from './pages/Admin';
import PrivacyPolicy from './pages/PrivacyPolicy'; // New Import
import TermsOfService from './pages/TermsOfService'; // New Import
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { Wrench, AlertTriangle, ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const PlaceholderPage: React.FC<{ title: string; icon: any }> = ({ title, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-300 dark:border-slate-700">
    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
        <Icon size={40} className="text-gray-400 dark:text-slate-400" />
    </div>
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{title}</h2>
    <p className="text-gray-500 dark:text-slate-400 max-w-md">
      جاري العمل على هذه الصفحة. ستكون متاحة قريباً.
    </p>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.subscriptionStatus === 'expired') {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-sans" dir="rtl">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100 dark:border-red-900/30">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">انتهت صلاحية الحساب</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                    عذراً، لقد انتهت الفترة التجريبية أو مدة اشتراكك الحالي. يرجى التجديد للمتابعة في استخدام نظام بوصلة.
                </p>
                <div className="space-y-3">
                    <Link 
                        to="/pricing" 
                        className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 dark:shadow-none"
                    >
                        عرض خطط الاشتراك
                    </Link>
                    <Link 
                        to="/profile" 
                        className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 py-2 font-bold hover:text-slate-800 dark:hover:text-white transition"
                    >
                        <span>لديك كود تفعيل؟ أدخله هنا</span>
                        <ArrowRight size={16} className="rotate-180" />
                    </Link>
                </div>
            </div>
        </div>
    );
  }

  return <Layout>{children}</Layout>;
};

const ProRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (user?.subscriptionPlan !== 'pro' && !user?.isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white dark:bg-slate-800 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6">
                    <Lock size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">ميزة حصرية لعملاء Pro</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                    هذه الميزة متاحة فقط في خطة الأعمال (Pro). قم بترقية حسابك الآن للاستفادة منها.
                </p>
                <Link to="/pricing" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg">
                    ترقية الآن
                </Link>
            </div>
        );
    }
    return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (!user?.isAdmin) return <Navigate to="/" replace />;
    return <Layout>{children}</Layout>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <Routes>
            <Route path="/landing" element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/pricing" element={isAuthenticated ? <Pricing /> : <Navigate to="/login" />} />
            
            {/* Public Pages */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />

            <Route path="/" element={isAuthenticated ? (
                user?.subscriptionStatus === 'expired' ? <Navigate to="/pricing" /> : <Layout><Dashboard /></Layout>
            ) : <Landing />} />

            <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
            <Route path="/ai-chat" element={<ProtectedRoute><ProRoute><AIChat /></ProRoute></ProtectedRoute>} />
            
            <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><ProRoute><Employees /></ProRoute></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            
            <Route path="*" element={<PlaceholderPage title="صفحة غير موجودة" icon={Wrench} />} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AuthProvider>
          <Router>
              <AppRoutes />
          </Router>
      </AuthProvider>
    </SettingsProvider>
  );
};

export default App;
