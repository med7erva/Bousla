

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
  Compass // Import Compass icon
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

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

import { Landmark, Briefcase, IdCard } from 'lucide-react';

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="h-[100dvh] flex bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed width, full height of viewport */}
      <aside 
        className={`
          fixed inset-y-0 right-0 z-50 w-72 bg-slate-900 text-white transition-transform duration-300 ease-out shadow-2xl flex flex-col h-full
          lg:static lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-20 shrink-0 flex items-center px-6 border-b border-slate-800/50">
          <Link to="/" className="flex items-center gap-3 group">
            <Compass className="text-emerald-500 w-8 h-8 transition-transform group-hover:rotate-12" />
            <h1 className="text-3xl font-black text-white tracking-tighter">
              بوصلة
            </h1>
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
            </nav>
          </div>

          <div className="p-4 bg-slate-950/30 border-t border-slate-800/50 shrink-0">
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

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative transition-all duration-300">
        {/* Glass Header */}
        <header className="shrink-0 h-20 px-6 lg:px-10 flex items-center justify-between glass-effect border-b border-slate-200/60 shadow-sm z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="flex flex-col">
               <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                {NAV_ITEMS.find(i => i.path === location.pathname)?.label || 
                 (location.pathname === '/ai-chat' ? 'المساعد الذكي' : 'لوحة التحكم')}
              </h2>
              <span className="text-xs text-slate-500 font-medium hidden sm:block">
                  {new Date().toLocaleDateString('ar-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition-all duration-200 group">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">{user?.storeName || 'متجري'}</span>
                <span className="text-[10px] text-slate-400 font-medium">{user?.name}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-700 flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                {user?.name?.charAt(0) || 'م'}
              </div>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
