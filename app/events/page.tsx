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
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Events</h1>
        <p className="page-subtitle">Plan upcoming activities and align reservations ahead of event day.</p>
      </div>

      {upcomingEvents.length === 0 ? (
        <div className="surface-card text-center py-12">
          <p className="text-slate-500 text-lg">
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

      <details className="surface-card p-6 event-form-disclosure">
        <summary className="cursor-pointer list-none section-title flex items-center justify-between">
          <span>Add New Event</span>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
            <span className="label-expand">Expand</span>
            <span className="label-collapse">Collapse</span>
            <svg
              className="h-4 w-4 chevron"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </summary>
        <div className="event-form-content">
          <div className="event-form-content-inner">
            <AddEventForm />
          </div>
        </div>
      </details>
    </div>
  );
}
