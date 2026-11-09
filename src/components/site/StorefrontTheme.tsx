"use client";
import { useEffect, useState, type CSSProperties } from "react";
import type { SiteColors } from "@/types/site";
import { siteThemeStyle } from "@/lib/siteTheme";
export default function StorefrontTheme({ initial, children }: { initial: SiteColors; children: React.ReactNode }) {
  const [colors, setColors] = useState(initial);
  useEffect(() => {
    let controller: AbortController;
    const refresh = () => {
      controller?.abort(); controller = new AbortController();
      fetch("/api/site", { cache: "no-store", signal: controller.signal }).then(response => response.ok ? response.json() : Promise.reject()).then(data => setColors(data.colors)).catch(() => {});
    };
    window.addEventListener("focus", refresh);
    return () => { controller?.abort(); window.removeEventListener("focus", refresh); };
  }, []);
  return <div className="storefront flex min-h-screen flex-1 flex-col" style={siteThemeStyle(colors) as CSSProperties}>{children}</div>;
}
