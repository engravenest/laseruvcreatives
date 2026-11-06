"use client";

import { useEffect, useState } from "react";

const KEY = "luc_theme";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem(KEY); } catch {}
      const isDark = saved === "dark" || (saved !== "light" && media.matches);
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.style.setProperty("color-scheme", isDark ? "dark" : "light");
      setDark(isDark);
    };
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    try { localStorage.setItem(KEY, nextDark ? "dark" : "light"); } catch {}
    document.documentElement.classList.toggle("dark", nextDark);
    document.documentElement.style.setProperty("color-scheme", nextDark ? "dark" : "light");
    setDark(nextDark);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition-colors hover:border-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
    >
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {dark ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></> : <path d="M20.9 13.1A9 9 0 0110.9 3.1 9 9 0 1020.9 13.1Z" />}
      </svg>
    </button>
  );
}
