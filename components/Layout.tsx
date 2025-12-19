
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  Wallet, 
  FileText, 
  Settings, 
  MessageSquare, 
  Menu, 
  X,
  LogOut,
  ChevronLeft,
  Landmark, 
  Briefcase, 
  IdCard,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import BouslaLogo from './BouslaLogo';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const NAV_ITEMS = [
    { label: 'الرئيسية', icon: LayoutDashboard, path: '/' },
    { label: 'المبيعات', icon: ShoppingCart, path: '/sales' },
    { label: 'المخزون', icon: Package, path: '/inventory' },
    { label: 'المالية', icon: Landmark, path: '/finance' }, 
    { label: 'المشتريات', icon: Truck, path: '/purchases' },
    { label: 'العملاء', icon: Users, path: '/clients' },
    { label: 'الموردين', icon: Briefcase, path: '/suppliers' },
    { label: 'الموظفين', icon: IdCard, path: '/employees' },
    { label: 'المصاريف', icon: Wallet, path: '/expenses' },
    { label: 'التقارير', icon: FileText, path: '/reports' },
    { label: 'الإعدادات', icon: Settings, path: '/settings' },
  ];

  // Subscription Warning Banner for Sidebar
  const isTrial = user?.subscriptionStatus === 'trial';

  return (
    <div className="h-[100dvh] flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden transition-colors duration-300">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 right-0 z-50 w-72 bg-slate-900 dark:bg-slate-950 text-white transition-transform duration-300 ease-out shadow-2xl flex flex-col h-full
          lg:static lg:translate-x-0 border-l border-slate-800/50
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-24 shrink-0 flex items-center justify-center px-6 border-b border-slate-800/50">
          <Link to="/" className="flex items-center gap-3 group w-full justify-center">
            <BouslaLogo className="h-12 w-auto transition-transform group-hover:scale-105 duration-300" isWhite={true} />
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-between overflow-hidden min-h-0">
          <div className="p-4 space-y-1 overflow-y-auto custom-scrollbar flex-1">
            <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2">القائمة الرئيسية</p>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                      ${isActive 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20 font-bold' 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 font-medium'}
                    `}
                  >
                    <item.icon size={20} className={`transition-colors ${isActive ? 'text-white' : 'group-hover:text-emerald-400'}`} />
                    <span>{item.label}</span>
                    {isActive && <ChevronLeft size={16} className="absolute left-3 opacity-50" />}
                  </Link>
                );
              })}
              
              {/* Admin Panel Link */}
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group mt-4 border border-dashed border-red-900/50
                    ${location.pathname === '/admin' ? 'bg-red-600 text-white' : 'text-red-400 hover:bg-red-500/10'}
                  `}
                >
                  <ShieldAlert size={20} />
                  <span className="font-black uppercase tracking-tighter">لوحة الإدارة</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="p-4 bg-slate-950/30 dark:bg-slate-900/50 border-t border-slate-800/50 shrink-0">
             
             {/* Plan Badge */}
             <div className={`mb-4 p-3 rounded-xl flex items-center gap-3 border ${user?.subscriptionPlan === 'pro' ? 'bg-indigo-900/30 border-indigo-700/50' : 'bg-emerald-900/30 border-emerald-700/50'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user?.subscriptionPlan === 'pro' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                    <ShieldCheck size={16} />
                </div>
                <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">الخطة الحالية</p>
                    <p className="text-xs font-black uppercase">{user?.subscriptionPlan === 'pro' ? 'Business Pro' : 'Essential Plus'}</p>
                </div>
             </div>

             <Link
              to="/ai-chat"
              onClick={() => setIsSidebarOpen(false)}
              className="group relative flex items-center gap-3 px-4 py-3.5 rounded-xl mb-4 overflow-hidden transition-all hover:shadow-lg hover:shadow-indigo-900/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 transition-all group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <MessageSquare size={20} className="relative z-10 text-white" />
              <div className="relative z-10 flex flex-col">
                  <span className="font-bold text-white text-sm">المساعد الذكي</span>
                  <span className="text-[10px] text-indigo-200">مدعوم بالذكاء الاصطناعي</span>
              </div>
              <div className="absolute top-2 left-2 w-2 h-2 bg-green-400 rounded-full animate-pulse z-10"></div>
            </Link>

            <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              <span>تسجيل خروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative transition-all duration-300">
        {/* Glass Header */}
        <header className="shrink-0 h-20 px-6 lg:px-10 flex items-center justify-between glass-effect border-b border-slate-200/60 dark:border-slate-800 shadow-sm z-30 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="flex flex-col">
               <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                {NAV_ITEMS.find(i => i.path === location.pathname)?.label || 
                 (location.pathname === '/ai-chat' ? 'المساعد الذكي' : location.pathname === '/admin' ? 'الإدارة' : 'الملف الشخصي')}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <NotificationCenter />

            <Link to="/profile" className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-white dark:hover:bg-slate-800 hover:shadow-md border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all duration-200 group">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{user?.storeName || 'متجري'}</span>
                <span className="text-[10px] text-slate-400 font-medium">{user?.name}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-700 flex items-center justify-center font-bold text-lg border-2 border-white dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform">
                {user?.name?.charAt(0) || 'م'}
              </div>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar relative">
          
          {/* Subscription Warning Overlay (Visual only, Logic in App.tsx) */}
          {user?.subscriptionStatus === 'expired' && (
              <div className="absolute inset-0 bg-red-900/10 backdrop-blur-[1px] z-50 pointer-events-none"></div>
          )}

          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 text-slate-800 dark:text-slate-100">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
