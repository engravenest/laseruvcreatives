"use client";

import StorefrontTheme from "@/components/site/StorefrontTheme";
import type { SiteColors } from "@/types/site";
import { usePathname } from "next/navigation";
import CartAwareHeader from "@/components/layout/CartAwareHeader";
import Footer from "@/components/layout/Footer";

interface Props {
  children: React.ReactNode;
  colors: SiteColors;
}

export default function ConditionalStorefrontLayout({ children, colors }: Props) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <main className="min-h-screen w-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">{children}</main>;
  }

  return (
    <StorefrontTheme initial={colors}>
      <CartAwareHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </StorefrontTheme>
  );
}
