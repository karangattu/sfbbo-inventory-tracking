import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Welcome to SFBBO Inventory Tracker
      </h1>
      
      <p className="text-lg text-gray-700 mb-8">
        Manage your inventory items, track reservations, and plan for upcoming events.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/inventory"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-semibold text-blue-600 mb-2">
            Inventory Dashboard
          </h2>
          <p className="text-gray-600">
            View all items with real-time availability and manage your inventory
          </p>
        </Link>

        <Link
          href="/reservations"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-semibold text-green-600 mb-2">
            Reservations
          </h2>
          <p className="text-gray-600">
            Reserve items, track status, and mark items as returned
          </p>
        </Link>

        <Link
          href="/events"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-semibold text-purple-600 mb-2">
            Upcoming Events
          </h2>
          <p className="text-gray-600">
            Manage events and plan inventory needs
          </p>
        </Link>
      </div>
    </div>
  );
}
