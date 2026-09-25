"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Latihan" },
  { href: "/history", label: "Riwayat" },
  { href: "/progress", label: "Progres" },
] as const;

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-neutral-900 bg-black/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link 
          href="/" 
          className="text-sm font-semibold tracking-tight text-white hover:opacity-80 transition-opacity"
        >
          Gym Tracker
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive =
              href === "/" 
                ? pathname === "/" || pathname === "/add"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
