"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LayoutDashboard, History, TrendingUp } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/history", label: "Riwayat", icon: History },
  { href: "/progress", label: "Progress", icon: TrendingUp },
] as const;

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/5 bg-gray-950/60 backdrop-blur-xl sticky top-0 z-50 supports-[backdrop-filter]:bg-gray-950/40">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* App name / logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
            <Dumbbell className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-white tracking-tight text-lg group-hover:text-indigo-300 transition-colors">
            GymTracker
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "opacity-100" : "opacity-70"}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="hidden sm:block">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

