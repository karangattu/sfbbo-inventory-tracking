import { getEvents, getReservations } from "@/actions/inventory";

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function CalendarPage() {
  const events = await getEvents();
  const reservations = await getReservations();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // build days for current month (start at 1..end)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const eventsByDate: Record<string, any[]> = {};
  events.forEach((ev) => {
    const key = toDateKey(new Date(ev.eventDate));
    eventsByDate[key] = eventsByDate[key] || [];
    eventsByDate[key].push(ev);
  });

  const reservationsByDate: Record<string, any[]> = {};
  reservations.forEach((r) => {
    if (r.event?.eventDate) {
      const key = toDateKey(new Date(r.event.eventDate));
      reservationsByDate[key] = reservationsByDate[key] || [];
      reservationsByDate[key].push(r);
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600">
          This calendar shows events and which items are reserved for each event date.
          Click through <a className="text-blue-600 underline" href="/events">Events</a> or <a className="text-blue-600 underline" href="/reservations">Reservations</a> for details.
        </p>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={d} className="text-xs font-medium text-gray-500 text-center">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-4 mt-2">
        {days.map((day) => {
          const key = toDateKey(day);
          const dayEvents = eventsByDate[key] || [];
          const dayReservations = reservationsByDate[key] || [];
          return (
            <div key={key} className="min-h-[120px] p-3 bg-white rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-semibold text-gray-800">{day.getDate()}</div>
                <div className="text-xs text-gray-500">{day.toLocaleString(undefined, { month: 'short' })}</div>
              </div>

              <div className="space-y-2 text-xs">
                {dayEvents.slice(0,3).map((ev: any) => (
                  <div key={ev.id} className="px-2 py-1 bg-blue-50 text-blue-700 rounded">{ev.name}</div>
                ))}

                {dayReservations.slice(0,3).map((res: any) => (
                  <div key={res.id} className="px-2 py-1 bg-gray-50 text-gray-800 rounded">
                    <div className="font-medium">{res.item?.name || 'Item'}</div>
                    <div className="text-[11px] text-gray-500">x{res.quantity} — {res.reservedBy || '—'}</div>
                  </div>
                ))}

                {dayEvents.length === 0 && dayReservations.length === 0 && (
                  <div className="text-xs text-gray-300">No bookings</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
