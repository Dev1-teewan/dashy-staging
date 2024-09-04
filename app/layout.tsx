import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AntLayout from "./components/AntLayout";
import ThemeProvider from "./components/ThemeProvider";
import AppWalletProvider from "./components/AppWalletProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashy",
  description: "Wallet Manager Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppWalletProvider>
          <ThemeProvider>
            <AntLayout>{children}</AntLayout>
          </ThemeProvider>
        </AppWalletProvider>
      </body>
    </html>
  );
}