import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="surface-card p-8">
        <h1 className="page-title">Welcome to SFBBO Inventory Tracker</h1>
        <p className="page-subtitle">
          Reserve items for events, return items in bulk, and monitor availability in one place.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/inventory"
          className="surface-card block p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="section-title mb-2">Inventory</h2>
          <p className="text-sm text-slate-600">Add and organize items, storage locations, and available counts.</p>
        </Link>

        <Link
          href="/reservations"
          className="surface-card block p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="section-title mb-2">Reservations</h2>
          <p className="text-sm text-slate-600">Reserve multiple items per event and return selected items in one click.</p>
        </Link>

        <Link
          href="/calendar"
          className="surface-card block p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="section-title mb-2">Calendar</h2>
          <p className="text-sm text-slate-600">View monthly event bookings with item-level reservation details.</p>
        </Link>
      </div>

      <section className="surface-card p-6">
        <h2 className="section-title">Quick Start</h2>
        <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-600">
          <li>Add items to inventory with total quantities.</li>
          <li>Create or import upcoming events.</li>
          <li>Reserve one or more items for an event with per-item quantity.</li>
          <li>Use bulk return to close all checked reservations at once.</li>
        </ol>
      </section>
    </div>
  );
}
