"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/inventory", label: "Inventory" },
  { href: "/reservations", label: "Reservations" },
  { href: "/events", label: "Events" },
  { href: "/calendar", label: "Calendar" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="text-lg font-bold text-slate-900 sm:text-xl" onClick={() => setOpen(false)}>
          SFBBO Inventory
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(href)
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-3 pt-1 md:hidden">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(href)
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
