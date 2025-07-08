// Type definitions for Google Analytics gtag.js
interface Window {
  gtag: (
    command: string,
    target: string,
    params?: {
      [key: string]: any;
    }
  ) => void;
  dataLayer: any[];
}

declare const gtag: (
  command: string,
  target: string,
  params?: {
    [key: string]: any;
  }
) => void;
