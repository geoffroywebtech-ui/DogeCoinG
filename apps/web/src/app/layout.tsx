import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/components/providers/query-provider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Petoo — L'app pour votre animal", template: "%s | Petoo" },
  description:
    "Petoo — L'application tout-en-un pour les propriétaires de chiens, chats et lapins. Calendrier santé intelligent, toilettage, vétérinaire et programme fidélité.",
  keywords: ["animaux de compagnie", "toilettage", "vétérinaire", "chien", "chat", "lapin", "santé animale"],
  authors: [{ name: "Petoo" }],
  creator: "Petoo",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://petoo.app",
    title: "Petoo — L'app pour votre animal",
    description: "Gérez la santé, le toilettage et les rendez-vous de votre animal en un seul endroit.",
    siteName: "Petoo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Petoo — L'app pour votre animal",
    description: "Gérez la santé, le toilettage et les rendez-vous de votre animal en un seul endroit.",
  },
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#ff5a0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
