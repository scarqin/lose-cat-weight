import "@/styles/globals.css";
import { Viewport } from "next";
import { Metadata } from "next";
import clsx from "clsx";

import { Providers } from "./providers";
import { I18nProviderWrapper } from "@/components/i18n-provider-wrapper";

import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { Analytics } from "@vercel/analytics/next"
import GoogleAnalytics from "@/components/GoogleAnalytics";
import DynamicTitle from "@/components/DynamicTitle";


// Generate metadata with default values
export const metadata: Metadata = {
  title: {
    default: "Meow Cat Weight Loss",
    template: `%s - Meow Cat Weight Loss`,
  },
  description: "Scientifically design cat weight loss plans for healthy slimming",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers
          themeProps={{
            attribute: "class",
            defaultTheme: "light",
            forcedTheme: "light",
          }}
        >
          <I18nProviderWrapper>
            <DynamicTitle />
            <div className="flex relative flex-col h-screen">
              <Navbar />
              <main className="container flex-grow px-6 pt-16 mx-auto max-w-7xl">
                {children}
              </main>
            </div>
          </I18nProviderWrapper>
        </Providers>
        <Analytics/>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
