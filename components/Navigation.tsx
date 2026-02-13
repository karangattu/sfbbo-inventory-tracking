"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <div>
          <Link href="/" className="text-xl font-bold text-slate-900">
            SFBBO Inventory Tracker
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/inventory"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/inventory")
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Inventory
            </Link>
            <Link
              href="/reservations"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/reservations")
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Reservations
            </Link>
            <Link
              href="/events"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/events")
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Events
            </Link>

            <Link
              href="/calendar"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/calendar")
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Calendar
            </Link>
        </div>
      </div>
    </nav>
  );
}
