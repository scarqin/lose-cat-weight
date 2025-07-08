"use client";

import React from "react";
import { I18nProvider } from "@/context/i18nContext";

export function I18nProviderWrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
