
import React, { useState, useEffect } from 'react';
import { 
    Monitor, 
    Store, 
    Bell, 
    Sparkles, 
    Save, 
    Loader2, 
    Check, 
    Globe, 
    Moon, 
    LayoutTemplate,
    DollarSign,
    Percent,
    AlertTriangle,
    BarChart3,
    Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext'; // Import Hook
import { updateUserProfile } from '../services/db';
import { AppSettings } from '../types';

const Settings: React.FC = () => {
    const { user } = useAuth();
    const { settings, updateSetting } = useSettings(); // Use Global State
    const [activeTab, setActiveTab] = useState<'system' | 'store' | 'notifications' | 'ai'>('system');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Temp state for Store Profile fields which live in DB
    const [storeProfile, setStoreProfile] = useState({
        name: '',
        storeName: '',
        activityType: ''
    });

    useEffect(() => {
        if(user) {
            setStoreProfile({
                name: user.name,
                storeName: user.storeName,
                activityType: 'ملابس' 
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setSuccess(false);

        try {
            // Settings are already saved to localStorage via Context, 
            // so we only need to sync the DB profile data here.
            
            if (activeTab === 'store') {
                await updateUserProfile(user.id, {
                    name: storeProfile.name,
                    storeName: storeProfile.storeName,
                    activityType: storeProfile.activityType
                });
            }

            setTimeout(() => {
                setSaving(false);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }, 500);

        } catch (error) {
            console.error("Failed to save settings", error);
            setSaving(false);
            alert("حدث خطأ أثناء حفظ الإعدادات");
        }
    };

    if (!settings) return null;

    const tabs = [
        { id: 'system', label: 'إعدادات النظام', icon: Monitor },
        { id: 'store', label: 'إعدادات المتجر', icon: Store },
        { id: 'notifications', label: 'الإشعارات', icon: Bell },
        { id: 'ai', label: 'الذكاء الاصطناعي', icon: Sparkles },
    ];

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">الإعدادات</h1>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all shadow-md ${success ? 'bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : success ? <Check size={20} /> : <Save size={20} />}
                    <span>{saving ? 'جاري الحفظ...' : success ? 'تم الحفظ' : 'حفظ التغييرات'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* Sidebar Navigation */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden lg:sticky lg:top-24">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-5 py-4 transition-colors font-medium border-l-4 ${
                                activeTab === tab.id 
                                ? 'bg-emerald-50 dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 border-emerald-500' 
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border-transparent'
                            }`}
                        >
                            <tab.icon size={20} className={activeTab === tab.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    
                    {/* SYSTEM SETTINGS */}
                    {activeTab === 'system' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 animate-in fade-in slide-in-from-bottom-2">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <Monitor className="text-emerald-600" /> إعدادات النظام
                            </h2>
                            
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 border dark:border-slate-600 rounded-xl hover:border-emerald-200 transition bg-slate-50/50 dark:bg-slate-900/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Globe size={18} className="text-slate-400" /> اللغة
                                            </label>
                                            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">الافتراضي: العربية</span>
                                        </div>
                                        <select 
                                            value={settings.system.language}
                                            onChange={(e) => updateSetting('system', 'language', e.target.value)}
                                            className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="ar">العربية</option>
                                            <option value="en">English (تجريبي)</option>
                                        </select>
                                    </div>

                                    <div className="p-4 border dark:border-slate-600 rounded-xl hover:border-emerald-200 transition bg-slate-50/50 dark:bg-slate-900/50">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Moon size={18} className="text-slate-400" /> الوضع الليلي
                                            </label>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer"
                                                    checked={settings.system.darkMode}
                                                    onChange={(e) => updateSetting('system', 'darkMode', e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">تفعيل الوضع الداكن لواجهة التطبيق لتقليل إجهاد العين.</p>
                                    </div>

                                    <div className="p-4 border dark:border-slate-600 rounded-xl hover:border-emerald-200 transition bg-slate-50/50 dark:bg-slate-900/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <LayoutTemplate size={18} className="text-slate-400" /> طريقة عرض البيانات
                                            </label>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => updateSetting('system', 'dataView', 'compact')}
                                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition ${settings.system.dataView === 'compact' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-gray-200 dark:border-slate-600'}`}
                                            >
                                                مختصر
                                            </button>
                                            <button 
                                                onClick={() => updateSetting('system', 'dataView', 'detailed')}
                                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition ${settings.system.dataView === 'detailed' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-gray-200 dark:border-slate-600'}`}
                                            >
                                                تفصيلي
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STORE SETTINGS */}
                    {activeTab === 'store' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 animate-in fade-in slide-in-from-bottom-2">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <Store className="text-emerald-600" /> إعدادات المتجر
                            </h2>
                            
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">اسم المتجر</label>
                                        <input 
                                            type="text" 
                                            value={storeProfile.storeName}
                                            onChange={(e) => setStoreProfile({...storeProfile, storeName: e.target.value})}
                                            className="w-full p-3 border dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">اسم المالك</label>
                                        <input 
                                            type="text" 
                                            value={storeProfile.name}
                                            onChange={(e) => setStoreProfile({...storeProfile, name: e.target.value})}
                                            className="w-full p-3 border dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">نوع النشاط</label>
                                        <input 
                                            type="text" 
                                            value={storeProfile.activityType}
                                            onChange={(e) => setStoreProfile({...storeProfile, activityType: e.target.value})}
                                            placeholder="مثلاً: ملابس، أحذية، اكسسوارات"
                                            className="w-full p-3 border dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                                
                                <hr className="border-slate-100 dark:border-slate-700" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 border dark:border-slate-600 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                                        <label className="font-bold text-slate-700 dark:text-slate-300 mb-2 block flex items-center gap-2">
                                            <DollarSign size={16} className="text-slate-400" /> العملة الافتراضية
                                        </label>
                                        <select 
                                            value={settings.store.currency}
                                            onChange={(e) => updateSetting('store', 'currency', e.target.value)}
                                            className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none"
                                        >
                                            <option value="MRU">أوقية جديدة (MRU)</option>
                                            <option value="MRO">أوقية قديمة (MRO)</option>
                                        </select>
                                    </div>

                                    <div className="p-4 border dark:border-slate-600 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                                        <label className="font-bold text-slate-700 dark:text-slate-300 mb-2 block flex items-center gap-2">
                                            <Package size={16} className="text-slate-400" /> وحدة الكمية الافتراضية
                                        </label>
                                        <select 
                                            value={settings.store.unit}
                                            onChange={(e) => updateSetting('store', 'unit', e.target.value)}
                                            className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none"
                                        >
                                            <option value="piece">قطعة</option>
                                            <option value="pair">زوج</option>
                                            <option value="box">علبة/كرتون</option>
                                            <option value="kg">كيلوجرام</option>
                                        </select>
                                    </div>

                                    <div className="p-4 border dark:border-slate-600 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 col-span-full">
                                        <label className="font-bold text-slate-700 dark:text-slate-300 mb-2 block flex items-center gap-2">
                                            <Percent size={16} className="text-slate-400" /> سياسة التخفيضات الافتراضية
                                        </label>
                                        <div className="flex gap-4 flex-wrap">
                                            {['none', 'fixed', 'product'].map(option => (
                                                <label key={option} className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="discount" 
                                                        value={option}
                                                        checked={settings.store.discountPolicy === option}
                                                        onChange={() => updateSetting('store', 'discountPolicy', option)}
                                                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {option === 'none' && 'بدون تخفيض'}
                                                        {option === 'fixed' && 'نسبة ثابتة'}
                                                        {option === 'product' && 'حسب المنتج'}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NOTIFICATION SETTINGS */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 animate-in fade-in slide-in-from-bottom-2">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <Bell className="text-emerald-600" /> إعدادات الإشعارات والتنبيهات
                            </h2>
                            
                            <div className="space-y-4">
                                {/* Low Stock */}
                                <div className="flex items-start justify-between p-4 border dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-slate-700 dark:text-slate-200">تنبيه انخفاض المخزون</h3>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">إظهار تنبيه عندما تقل كمية المنتج عن حد معين.</p>
                                        {settings.notifications.lowStock && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-slate-600 dark:text-slate-400">الحد الأدنى:</span>
                                                <input 
                                                    type="number" 
                                                    value={settings.notifications.lowStockThreshold}
                                                    onChange={(e) => updateSetting('notifications', 'lowStockThreshold', Number(e.target.value))}
                                                    className="w-20 p-1 border dark:border-slate-500 rounded text-center outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                                                />
                                                <span className="text-slate-400 text-xs">قطعة</span>
                                            </div>
                                        )}
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={settings.notifications.lowStock}
                                            onChange={(e) => updateSetting('notifications', 'lowStock', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>

                                {/* Out of Stock */}
                                <div className="flex items-center justify-between p-4 border dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                    <div>
                                        <h3 className="font-bold text-slate-700 dark:text-slate-200">تنبيه نفاد المنتج</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">تنبيه فوري عند وصول الكمية إلى صفر.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={settings.notifications.outOfStock}
                                            onChange={(e) => updateSetting('notifications', 'outOfStock', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>

                                {/* High Expenses */}
                                <div className="flex items-start justify-between p-4 border dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                    <div>
                                        <h3 className="font-bold text-slate-700 dark:text-slate-200">تنبيه المصاريف الكبيرة</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">تحذير عند تسجيل مصروف يتجاوز حداً معيناً.</p>
                                        {settings.notifications.highExpenses && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-slate-600 dark:text-slate-400">الحد المالي:</span>
                                                <input 
                                                    type="number" 
                                                    value={settings.notifications.highExpensesThreshold}
                                                    onChange={(e) => updateSetting('notifications', 'highExpensesThreshold', Number(e.target.value))}
                                                    className="w-24 p-1 border dark:border-slate-500 rounded text-center outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={settings.notifications.highExpenses}
                                            onChange={(e) => updateSetting('notifications', 'highExpenses', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI SETTINGS */}
                    {activeTab === 'ai' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 animate-in fade-in slide-in-from-bottom-2">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <Sparkles className="text-purple-600" /> إعدادات الذكاء الاصطناعي
                            </h2>
                            
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-800 mb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-purple-900 dark:text-purple-300 mb-2">المساعد الذكي (Gemini 2.0)</h3>
                                        <p className="text-purple-700 dark:text-purple-400 text-sm max-w-lg leading-relaxed">
                                            تفعيل هذا الخيار يسمح للنظام بتحليل بيانات متجرك وتقديم توصيات يومية لتحسين المبيعات وتقليل الهدر.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={settings.ai.enabled}
                                            onChange={(e) => updateSetting('ai', 'enabled', e.target.checked)}
                                        />
                                        <div className="w-14 h-7 bg-purple-200 dark:bg-purple-900 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>
                            </div>

                            <div className={`space-y-6 transition-opacity ${!settings.ai.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="p-4 border dark:border-slate-600 rounded-xl">
                                    <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                                        <BarChart3 size={18} /> مستوى التحليل
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {['basic', 'medium', 'deep'].map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => updateSetting('ai', 'level', level)}
                                                className={`p-4 rounded-xl border-2 text-center transition ${
                                                    settings.ai.level === level 
                                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold' 
                                                    : 'border-slate-100 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-700 text-slate-500 dark:text-slate-400'
                                                }`}
                                            >
                                                <div className="text-sm mb-1 capitalize">
                                                    {level === 'basic' && 'أساسي'}
                                                    {level === 'medium' && 'متوسط'}
                                                    {level === 'deep' && 'عميق'}
                                                </div>
                                                <div className="text-xs font-normal opacity-70">
                                                    {level === 'basic' && 'توصيات عامة وسريعة'}
                                                    {level === 'medium' && 'تحليل الأنماط والاتجاهات'}
                                                    {level === 'deep' && 'استراتيجيات نمو مفصلة'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 border dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-700 dark:text-slate-200">التنبيهات الذكية</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">اقتراح إجراءات فورية عند اكتشاف حالات شاذة في البيانات.</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={settings.ai.smartAlerts}
                                            onChange={(e) => updateSetting('ai', 'smartAlerts', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Settings;
