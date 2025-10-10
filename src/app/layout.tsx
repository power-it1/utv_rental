import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Adventure Rentals - Motorcycle, UTV & Guided Tours",
    template: "%s | Adventure Rentals",
  },
  description: "Rent motorcycles, UTVs, and join guided tours for unforgettable adventures. Professional equipment and expert guidance for your next journey.",
  keywords: ["motorcycle rental", "UTV rental", "ATV rental", "guided tours", "adventure rentals", "off-road vehicles"],
  authors: [{ name: "Adventure Rentals" }],
  openGraph: {
    title: "Adventure Rentals - Motorcycle, UTV & Guided Tours",
    description: "Rent motorcycles, UTVs, and join guided tours for unforgettable adventures.",
    type: "website",
    locale: "en_US",
    siteName: "Adventure Rentals",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adventure Rentals - Motorcycle, UTV & Guided Tours",
    description: "Rent motorcycles, UTVs, and join guided tours for unforgettable adventures.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
