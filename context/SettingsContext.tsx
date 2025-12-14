
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { getAppSettings, saveAppSettings } from '../services/db';

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: (section: keyof AppSettings, key: string, value: any) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<AppSettings>(getAppSettings());

  // Apply Side Effects (Dark Mode & Direction)
  useEffect(() => {
    const root = document.documentElement;
    
    // 1. Dark Mode Application
    if (settings.system.darkMode) {
      root.classList.add('dark');
      root.style.setProperty('color-scheme', 'dark');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('color-scheme', 'light');
    }

    // 2. Language/Direction Application
    if (settings.system.language === 'ar') {
      root.setAttribute('dir', 'rtl');
      root.setAttribute('lang', 'ar');
    } else {
      root.setAttribute('dir', 'ltr');
      root.setAttribute('lang', 'en');
    }

  }, [settings.system.darkMode, settings.system.language]);

  const updateSetting = (section: keyof AppSettings, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };
    setSettingsState(newSettings);
    saveAppSettings(newSettings);
  };

  const resetSettings = () => {
    const defaults = getAppSettings(); // Logic in db.ts returns defaults if empty
    setSettingsState(defaults);
    saveAppSettings(defaults);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
