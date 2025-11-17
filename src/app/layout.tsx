import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./syntax-highlighting.css";
import { TransitionProvider } from "@/components/TransitionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ward.sh - Personal Portfolio",
  description: "Stephen Ward's personal portfolio showcasing projects and experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <TransitionProvider>
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}
