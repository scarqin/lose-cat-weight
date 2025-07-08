"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IntlMessageFormat } from "intl-messageformat";

// Import translations
import en from "../translations/en";
import zh from "../translations/zh";

// Define available languages
export const languages = {
  en: { name: "English", flag: "🇺🇸" },
  zh: { name: "中文", flag: "🇨🇳" },
};

// Define translations object
const translations = {
  en,
  zh,
};

export type LanguageCode = keyof typeof languages;

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, values?: Record<string, any>) => string;
  languages: typeof languages;
}

// Create context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider component
export const I18nProvider = ({ children }: { children: ReactNode }) => {
  // Try to get language from localStorage, default to 'zh'
  const [language, setLanguage] = useState<LanguageCode>("zh");
  
  // Initialize language from localStorage on client side
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as LanguageCode;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0] as LanguageCode;
      if (translations[browserLang]) {
        setLanguage(browserLang);
      }
    }
  }, []);

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("language", language);
    // Update html lang attribute
    document.documentElement.lang = language;
  }, [language]);

  // Translation function
  const t = (key: string, values?: Record<string, any>): string => {
    try {
      // Split the key by dots to access nested properties
      const keys = key.split(".");
      let translation: any = translations[language];
      
      // Navigate through the nested objects
      for (const k of keys) {
        translation = translation[k];
        if (translation === undefined) {
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
      }
      
      // If the translation is a string and there are values to interpolate
      if (typeof translation === "string" && values) {
        try {
          const formatter = new IntlMessageFormat(translation, language);
          return formatter.format(values) as string;
        } catch (error) {
          console.error(`Error formatting message: ${key}`, error);
          return translation;
        }
      }
      
      return translation;
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return key;
    }
  };

  const changeLanguage = (lang: LanguageCode) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage: changeLanguage, t, languages }}>
      {children}
    </I18nContext.Provider>
  );
};

// Custom hook to use the i18n context
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};
