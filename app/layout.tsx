import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {ClientSessionProvider} from '@/provider/SessionProvider'
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";
import { JobProvider } from '@/provider/JobProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trainer",
  description: "Unleash the Power of Ai to build manage your training",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <ClientSessionProvider>
          <JobProvider>
          <Header></Header>
            {children}
          <Footer></Footer>
          </JobProvider>
      </ClientSessionProvider>
      </body>
    </html>
  );
}
