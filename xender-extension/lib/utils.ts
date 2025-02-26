import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function injectStyles(css: string): void {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}
