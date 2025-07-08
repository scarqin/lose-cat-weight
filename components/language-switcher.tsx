"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { useI18n, languages, LanguageCode } from "../context/i18nContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const changeLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        className="flex items-center gap-1"
        size="sm"
        variant="light"
        onClick={toggleDropdown}
      >
        <span className="mr-1">{languages[language].flag}</span>
        <span className="hidden sm:inline">{languages[language].name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {Object.entries(languages).map(([code, { name, flag }]) => (
              <button
                key={code}
                className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                  language === code ? "bg-gray-50 text-primary" : "text-gray-700"
                }`}
                onClick={() => changeLanguage(code as LanguageCode)}
              >
                <span className="mr-2">{flag}</span>
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
