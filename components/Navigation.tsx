"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            SFBBO Inventory
          </Link>
          
          <div className="flex space-x-4">
            <Link
              href="/inventory"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/inventory")
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Inventory
            </Link>
            <Link
              href="/reservations"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/reservations")
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Reservations
            </Link>
            <Link
              href="/events"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/events")
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Events
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
