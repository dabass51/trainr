import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import "./globals.css";
import {ClientSessionProvider} from '@/provider/SessionProvider'
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";
import { JobProvider } from '@/provider/JobProvider';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from '@/provider/LanguageProvider';
import { CookieBanner } from '@/components/cookie-banner';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
});

export const metadata: Metadata = {
  title: "Trainer",
  description: "Unleash the Power of Ai to build manage your training",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CVDK2K2TGP"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CVDK2K2TGP');
          `}
        </Script>
      </head>
      <body className={`${inter.className} ${openSans.variable} font-sans`}>
        <ClientSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LanguageProvider>
              <JobProvider>
                <Header />
                {children}
                <Footer />
              </JobProvider>
              <CookieBanner />
            </LanguageProvider>
            <Toaster />
          </ThemeProvider>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
