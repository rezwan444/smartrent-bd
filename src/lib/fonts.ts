// lib/fonts.ts
import { Inter, Oswald, Roboto } from "next/font/google";

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = Roboto({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const fontHeading = Oswald({
  subsets: ["latin"],
  variable: "--font-heading",
});
