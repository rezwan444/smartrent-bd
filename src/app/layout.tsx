import { CustomToaster } from "@/components/shared/CustomToaster";
import { WEBSITE_DETAILS } from "@/lib/constants";
import { fontBengali, fontSans } from "@/lib/fonts";
import ReduxProvider from "@/redux/ReduxProvider";
import type { Metadata } from "next";
import "./globals.css";

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
          ${fontSans.variable}
          ${fontBengali.variable}
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
