"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LayoutDashboard, History, TrendingUp, Plus } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "Riwayat", icon: History },
  { href: "/progress", label: "Progress", icon: TrendingUp },
] as const;

export default function Header() {
  const pathname = usePathname();
  const isAddPage = pathname === "/add";

  return (
    <header className="border-b border-carbon-800/80 bg-carbon-950/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-3xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* App brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group select-none"
        >
          <div className="w-8 h-8 rounded-md bg-carbon-900 border border-carbon-700/80 flex items-center justify-center text-volt-400 group-hover:border-volt-500/60 group-hover:bg-carbon-850 transition-all shadow-inner">
            <Dumbbell className="w-4 h-4 -rotate-45 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wider text-sm sm:text-base text-white uppercase flex items-center gap-1.5">
              IRON<span className="text-volt-400">LOG</span>
              <span className="text-[10px] font-mono tracking-tighter px-1.5 py-0.2 rounded bg-carbon-800 text-carbon-500 font-semibold border border-carbon-750 hidden sm:inline">
                PRO
              </span>
            </span>
          </div>
        </Link>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2">
          {/* Navigation switchboard */}
          <nav className="flex items-center bg-carbon-900/90 p-1 rounded-lg border border-carbon-800 shadow-inner">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-carbon-800 text-volt-400 border border-carbon-700 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-carbon-850"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-volt-400" : "text-slate-400"}`} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Log Button if not on /add */}
          {!isAddPage && (
            <Link
              href="/add"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-volt-500 hover:bg-volt-400 active:scale-95 text-carbon-950 font-bold text-xs tracking-wider uppercase transition-all shadow-sm shadow-volt-500/10"
              title="Catat Sesi Baru"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Catat</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}


