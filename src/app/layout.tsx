import { getColors } from "@/lib/siteStore";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ConditionalStorefrontLayout from "@/components/layout/ConditionalStorefrontLayout";
import { CartProvider } from "@/context/CartContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LaserUVCreatives | Custom Engraved Gifts Made Just for You (Pakistan)",
  description:
    "Pakistan's premier personalized engraving studio for customized metal pens, handcrafted wooden pens, engraved insulated water bottles, and executive corporate gift sets with Cash on Delivery.",
  keywords: [
    "customized pens Pakistan",
    "laser engraved pens Karachi Lahore Islamabad",
    "wooden pen engraved case",
    "customized water bottles Pakistan",
    "executive gift sets Pakistan",
    "Cash on delivery gifts Pakistan",
    "laser engraving studio Pakistan",
    "UV printing gifts",
  ],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t;try{t=localStorage.getItem('luc_theme')}catch(e){}var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'})()` }} />
      </head>
      <body className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">
        <CustomerAuthProvider>
          <CartProvider>
            <ConditionalStorefrontLayout colors={getColors()}>{children}</ConditionalStorefrontLayout>
          </CartProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
