
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, Download, Database, TrendingUp, Info, Users, Wallet, RefreshCw } from 'lucide-react';
import { getChatStream } from '../services/geminiService';
import { getProducts, getInvoices, getExpenses, getClients, getSuppliers } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { GenerateContentResponse } from '@google/genai';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'أهلاً بك في مستشارك الذكي! لقد قمت للتو بمراجعة كافة بيانات متجرك في قاعدة البيانات. أنا جاهز لتحليل أرباحك، إدارة مخزونك، أو تذكيرك بالديون. ماذا تريد أن تعرف اليوم؟',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [storeSnapshot, setStoreSnapshot] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // وظيفة سحب البيانات الشاملة من Supabase وتحويلها لسياق للذكاء الاصطناعي
  const syncStoreData = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
        const [products, invoices, expenses, clients, suppliers] = await Promise.all([
            getProducts(user.id),
            getInvoices(user.id),
            getExpenses(user.id),
            getClients(user.id),
            getSuppliers(user.id)
        ]);

        // بناء تقرير مالي ومخزني مفصل للذكاء الاصطناعي
        const snapshot = {
            metadata: {
                store_name: user.storeName,
                owner: user.name,
                sync_time: new Date().toISOString()
            },
            financials: {
                total_revenue: invoices.reduce((sum, i) => sum + i.total, 0),
                total_expenses: expenses.reduce((sum, e) => sum + e.amount, 0),
                cash_in_hand: invoices.reduce((sum, i) => sum + i.paidAmount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0),
                outstanding_customer_debts: clients.reduce((sum, c) => sum + c.debt, 0),
                debts_to_suppliers: suppliers.reduce((sum, s) => sum + s.debt, 0)
            },
            inventory: {
                total_unique_items: products.length,
                total_stock_count: products.reduce((sum, p) => sum + p.stock, 0),
                inventory_cost_value: products.reduce((sum, p) => sum + (p.cost * p.stock), 0),
                inventory_market_value: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
                critical_stock_items: products.filter(p => p.stock < 5).map(p => ({ name: p.name, remaining: p.stock })),
                top_products_by_stock: products.sort((a,b) => b.stock - a.stock).slice(0, 5).map(p => p.name)
            },
            recent_activity: {
                last_5_sales: invoices.slice(0, 5).map(inv => ({ 
                    customer: inv.customerName, 
                    amount: inv.total, 
                    date: inv.date.split('T')[0],
                    items_count: inv.items.length
                })),
                recent_expenses: expenses.slice(0, 5).map(e => ({ title: e.title, amount: e.amount, category: e.categoryName }))
            },
            clients: clients.filter(c => c.debt > 0).slice(0, 10).map(c => ({ name: c.name, debt: c.debt }))
        };
        
        setStoreSnapshot(snapshot);
    } catch (error) {
        console.error("Critical Sync Error:", error);
    } finally {
        setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncStoreData();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const aiMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: aiMessageId,
        role: 'model',
        text: '', 
        timestamp: new Date()
      }]);

      // إرسال الرسالة مع أحدث نسخة من بيانات المتجر
      const stream = await getChatStream(
        messages.map(m => ({ role: m.role, text: m.text })), 
        userMessage.text,
        storeSnapshot
      );

      let fullText = '';
      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        fullText += (c.text || '');
        setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: fullText } : msg));
      }

    } catch (error) {
      console.error("AI Analysis Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'عذراً، واجهت عائقاً في تحليل بياناتك الآن. يرجى التأكد من اتصال الإنترنت أو تحديث البيانات يدوياً.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden relative">
      
      {/* Chat Header with Data Status */}
      <div className="p-4 bg-slate-900 text-white flex justify-between items-center shadow-lg z-20">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                <Sparkles className="text-white" size={24} />
            </div>
            <div>
                <h2 className="font-black text-lg">مستشارك المالي الذكي</h2>
                <div className="flex items-center gap-1.5">
                    {isSyncing ? (
                         <div className="flex items-center gap-1">
                            <RefreshCw size={10} className="animate-spin text-emerald-400" />
                            <p className="text-emerald-400 text-[10px] font-bold uppercase">جاري سحب البيانات من Supabase...</p>
                         </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            <p className="text-indigo-200 text-[10px] font-bold uppercase">متصل بقاعدة بياناتك المباشرة</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={syncStoreData}
                disabled={isSyncing}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-all border border-white/10 flex items-center gap-2" 
                title="تحديث البيانات"
            >
                <Database size={18} className={isSyncing ? "animate-pulse" : ""} />
                <span className="text-xs font-bold hidden md:inline">مزامنة</span>
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50 dark:bg-slate-900/50 relative custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div 
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-emerald-600'
              }`}
            >
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            
            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-4 rounded-3xl shadow-sm text-sm leading-relaxed ${
                    msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tl-none'
                    : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 rounded-tr-none border border-gray-100 dark:border-slate-700'
                }`}>
                {msg.text ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                ) : (
                    <div className="flex items-center gap-2 py-1">
                        <Loader2 className="animate-spin w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-slate-400 font-medium">جاري تحليل الأرقام...</span>
                    </div>
                )}
                </div>
                <span className="text-[9px] text-gray-400 dark:text-slate-500 mt-2 font-bold uppercase">
                    {msg.timestamp.toLocaleTimeString('ar-MR', { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 z-20">
        <div className="relative flex items-center gap-3">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسأل عن الأرباح، الديون، أو اطلب تحليلاً للمخزون..."
                className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 block w-full p-4 pr-6 disabled:opacity-50 transition-all outline-none"
                disabled={loading}
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-2xl transition-all shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-50"
            >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="transform rotate-180" />}
            </button>
        </div>
        
        {/* Quick Suggestion Chips */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
                { label: 'حلل أرباحي الصافية', icon: TrendingUp },
                { label: 'من هم أكثر العملاء مديونية؟', icon: Users },
                { label: 'ما هي المنتجات التي لا تباع؟', icon: Info },
                { label: 'كيف أقلل المصاريف؟', icon: Wallet }
            ].map((sug, idx) => (
                <button 
                    key={idx}
                    onClick={() => setInput(sug.label)}
                    className="flex items-center gap-2 text-[11px] font-bold px-4 py-2 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all whitespace-nowrap shadow-sm"
                >
                    <sug.icon size={14} />
                    {sug.label}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AIChat;
