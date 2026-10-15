import { CustomToaster } from "@/components/shared/CustomToaster";
import { WEBSITE_DETAILS } from "@/lib/constants";
import ReduxProvider from "@/redux/ReduxProvider";
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

/* === DEFAULT FONT === */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* === SECONDARY FONT === */
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: WEBSITE_DETAILS.SITE_NAME,
  description: WEBSITE_DETAILS.SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${inter.variable}
          ${manrope.variable}
          
          antialiased
        `}
      >
        <ReduxProvider>
          <div>
            <CustomToaster />
            <main className="min-h-screen">{children}</main>
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
