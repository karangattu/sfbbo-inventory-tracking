import { getEvents, getReservations, getItems } from "@/actions/inventory";

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams?: Promise<{ year?: string; month?: string; eventId?: string; itemId?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const allEvents = await getEvents();
  const reservations = await getReservations();
  const items = await getItems();

  const now = new Date();
  const qsYear = resolvedSearchParams.year ? parseInt(resolvedSearchParams.year, 10) : now.getFullYear();
  const qsMonth = resolvedSearchParams.month ? parseInt(resolvedSearchParams.month, 10) - 1 : now.getMonth(); // month in query is 1-based
  const filterEventId = resolvedSearchParams.eventId ? parseInt(resolvedSearchParams.eventId, 10) : undefined;
  const filterItemId = resolvedSearchParams.itemId ? parseInt(resolvedSearchParams.itemId, 10) : undefined;

  const year = qsYear;
  const month = qsMonth;

  // build days for selected month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  // Filter events/reservations by selected filters
  const events = filterEventId ? allEvents.filter((e) => e.id === filterEventId) : allEvents;

  const eventsByDate: Record<string, any[]> = {};
  events.forEach((ev) => {
    const key = toDateKey(new Date(ev.eventDate));
    eventsByDate[key] = eventsByDate[key] || [];
    eventsByDate[key].push(ev);
  });

  const reservationsByDate: Record<string, any[]> = {};
  reservations.forEach((r) => {
    if (!r.event?.eventDate) return;
    const evDate = new Date(r.event.eventDate);
    if (evDate.getFullYear() !== year || evDate.getMonth() !== month) return; // only show reservations in selected month
    if (filterEventId && r.event?.id !== filterEventId) return;
    if (filterItemId && r.item?.id !== filterItemId) return;

    const key = toDateKey(evDate);
    reservationsByDate[key] = reservationsByDate[key] || [];
    reservationsByDate[key].push(r);
  });

  const prev = new Date(year, month - 1, 1);
  const next = new Date(year, month + 1, 1);

  const buildHref = (y: number, m0: number) => {
    const params = new URLSearchParams();
    params.set("year", String(y));
    params.set("month", String(m0 + 1));
    if (filterEventId) params.set("eventId", String(filterEventId));
    if (filterItemId) params.set("itemId", String(filterItemId));
    return `/calendar?${params.toString()}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>

        <div className="flex items-center space-x-3">
          <a href={buildHref(prev.getFullYear(), prev.getMonth())} className="px-3 py-2 bg-gray-100 rounded">◀ Prev</a>
          <div className="text-sm font-medium">{firstDay.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
          <a href={buildHref(next.getFullYear(), next.getMonth())} className="px-3 py-2 bg-gray-100 rounded">Next ▶</a>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Shows events and reserved items for the selected month. Hover or focus a day card to view all bookings.
        </p>

        <form method="get" className="flex items-center space-x-3">
          <input type="hidden" name="year" value={String(year)} />
          <input type="hidden" name="month" value={String(month + 1)} />

          <select name="eventId" defaultValue={filterEventId ?? ""} className="px-2 py-2 border rounded bg-white text-sm">
            <option value="">All events</option>
            {allEvents.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>

          <select name="itemId" defaultValue={filterItemId ?? ""} className="px-2 py-2 border rounded bg-white text-sm">
            <option value="">All items</option>
            {items.map((it) => (
              <option key={it.id} value={it.id}>{it.name}</option>
            ))}
          </select>

          <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded text-sm">Filter</button>
        </form>
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
          const previewEvents = dayEvents.slice(0, 2);
          const previewReservations = dayReservations.slice(0, 2);
          const totalCount = dayEvents.length + dayReservations.length;
          const hiddenCount = totalCount - previewEvents.length - previewReservations.length;
          const hasBookings = totalCount > 0;

          return (
            <div key={key} className="group relative">
              <div
                tabIndex={0}
                className="h-44 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm outline-none transition focus-within:ring-2 focus-within:ring-blue-500 hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-800">{day.getDate()}</div>
                  <div className="text-xs text-gray-500">{day.toLocaleString(undefined, { month: 'short' })}</div>
                </div>

                {hasBookings ? (
                  <>
                    <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{dayEvents.length} event{dayEvents.length === 1 ? "" : "s"}</span>
                      <span>{dayReservations.length} reservation{dayReservations.length === 1 ? "" : "s"}</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {previewEvents.map((ev: any) => (
                        <div key={ev.id} className="truncate rounded bg-blue-50 px-2 py-1 text-blue-700">
                          {ev.name}
                        </div>
                      ))}

                      {previewReservations.map((res: any) => (
                        <div key={res.id} className="truncate rounded bg-slate-50 px-2 py-1 text-slate-700">
                          {(res.item?.name || "Item")} · x{res.quantity}
                        </div>
                      ))}

                      {hiddenCount > 0 && (
                        <div className="pt-1 text-[11px] font-medium text-slate-600">
                          +{hiddenCount} more (hover for details)
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-300">No bookings</div>
                )}
              </div>

              {hasBookings && (
                <div className="pointer-events-none invisible absolute left-0 top-full z-20 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 opacity-0 shadow-xl transition group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
                  <div className="mb-2 text-sm font-semibold text-slate-900">
                    {day.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>

                  <div className="max-h-64 space-y-3 overflow-auto pr-1 text-xs">
                    {dayEvents.length > 0 && (
                      <div>
                        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">Events</div>
                        <div className="space-y-1">
                          {dayEvents.map((ev: any) => (
                            <div key={ev.id} className="rounded bg-blue-50 px-2 py-1 text-blue-700">
                              {ev.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {dayReservations.length > 0 && (
                      <div>
                        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">Reserved Items</div>
                        <div className="space-y-1">
                          {dayReservations.map((res: any) => (
                            <div key={res.id} className="rounded bg-slate-50 px-2 py-1 text-slate-700">
                              <div className="font-medium text-slate-800">{res.item?.name || "Item"}</div>
                              <div className="text-[11px] text-slate-500">x{res.quantity} • {res.reservedBy || "Unknown"}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
