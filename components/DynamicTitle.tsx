"use client";

import { useEffect } from "react";
import { useI18n } from "@/context/i18nContext";

/**
 * DynamicTitle component that updates the document title based on the current language
 * This is a client-side component that will run after hydration
 */
export function DynamicTitle() {
  const { t, language } = useI18n();

  useEffect(() => {
    // Update the document title when language changes
    const siteName = t("site.name");
    document.title = siteName;
    
    // Also update the meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", t("site.description"));
    }
  }, [t, language]);

  // This component doesn't render anything
  return null;
}

export default DynamicTitle;
