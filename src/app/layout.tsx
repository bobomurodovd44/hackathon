import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
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
  title: "Hackathon App",
  description: "A premium hackathon management platform",
};

import { Toaster } from "sonner";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
