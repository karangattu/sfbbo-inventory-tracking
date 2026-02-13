import { getEvents } from "@/actions/inventory";
import AddEventForm from "@/components/AddEventForm";
import EventCard from "@/components/EventCard";

export default async function EventsPage() {
  const events = await getEvents();

  // Filter to only show future events
  const now = new Date();
  const upcomingEvents = events.filter(
    (event) => new Date(event.eventDate) >= now
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Upcoming Events</h1>

      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Add New Event</h2>
        <AddEventForm />
      </div>

      {upcomingEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">
            No upcoming events. Add your first event above!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
