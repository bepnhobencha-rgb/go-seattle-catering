import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

// Default tax rate (overridden by Settings.taxRate at runtime).
export const DEFAULT_TAX_RATE = 0.1025;

export function calcTax(subtotal: number, rate: number = DEFAULT_TAX_RATE) {
  return Math.round(subtotal * rate * 100) / 100;
}

export function genOrderNumber(prefix = "GO") {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${ymd}-${rnd}`;
}
