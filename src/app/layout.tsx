import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FontSizeProvider } from "@/contexts/font-size-provider";
import { I18nProvider } from "@/i18n/provider";
import { AuthProvider } from "@/contexts/auth-provider";
import "./globals.css";

const outfit = Outfit({
    variable: "--font-geist-sans", // keeping variable name for CSS compatibility
    subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
    variable: "--font-geist-mono", // keeping variable name for CSS compatibility
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Climb AI",
    description: "Educational platform for learning without limits.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${outfit.variable} ${spaceGrotesk.variable} h-full antialiased`}
        >
            <head>
                <Script
                    id="theme-and-fontsize"
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'light';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                  var fSize = localStorage.getItem('fontSize');
                  if (fSize === 'S') document.documentElement.style.fontSize = '14px';
                  else if (fSize === 'L') document.documentElement.style.fontSize = '21px';
                } catch(e) {}
              })();
            `,
                    }}
                />
            </head>
            <body className="min-h-full flex flex-col" suppressHydrationWarning>
                <AuthProvider>
                    <I18nProvider>
                        <FontSizeProvider>
                            <TooltipProvider>{children}</TooltipProvider>
                        </FontSizeProvider>
                    </I18nProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
