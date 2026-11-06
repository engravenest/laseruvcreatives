import React from "react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
  icon: React.ReactNode;
  accentColor?: "amber" | "emerald" | "cyan" | "purple";
}

export default function KpiCard({
  title,
  value,
  change,
  isPositive = true,
  subtext,
  icon,
  accentColor = "amber",
}: KpiCardProps) {
  const getGradients = () => {
    switch (accentColor) {
      case "emerald":
        return "from-emerald-500/10 via-zinc-900 to-white dark:to-zinc-900 border-emerald-500/20 text-emerald-700 dark:text-emerald-400";
      case "cyan":
        return "from-cyan-500/10 via-zinc-900 to-white dark:to-zinc-900 border-cyan-500/20 text-cyan-400";
      case "purple":
        return "from-purple-500/10 via-zinc-900 to-white dark:to-zinc-900 border-purple-500/20 text-purple-400";
      default:
        return "from-amber-500/10 via-zinc-900 to-white dark:to-zinc-900 border-amber-500/20 text-amber-700 dark:text-amber-400";
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${getGradients()} p-6 shadow-xl backdrop-blur-md transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-2xl`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">{title}</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            {value}
          </h3>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 p-3 shadow-inner">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-200/80 dark:border-zinc-800/80 pt-3">
        {change && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold ${
              isPositive ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
            }`}
          >
            {isPositive ? "↑" : "↓"} {change}
          </span>
        )}
        {subtext && <span className="text-[11px] text-zinc-600 dark:text-zinc-400">{subtext}</span>}
      </div>
    </div>
  );
}
