"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LayoutDashboard, History, TrendingUp } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "Riwayat", icon: History },
  { href: "/progress", label: "Progress", icon: TrendingUp },
] as const;

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        {/* App name / logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold transition-transform group-hover:scale-105">
            <Dumbbell className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-bold text-zinc-100 tracking-tight text-base sm:text-lg">
            GymTracker
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-zinc-400"}`} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}


