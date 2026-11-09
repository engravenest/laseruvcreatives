"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
export default function PageLinks() {
  const [pages, setPages] = useState<{ id: string; slug: string; title: string }[]>([]);
  useEffect(() => { const controller = new AbortController(); fetch("/api/site", { signal: controller.signal }).then(response => response.json()).then(data => setPages(data.pages || [])).catch(() => {}); return () => controller.abort(); }, []);
  return <>{pages.map(page => <li key={page.id}><Link href={`/${page.slug}`} className="hover:text-amber-400">{page.title}</Link></li>)}</>;
}
