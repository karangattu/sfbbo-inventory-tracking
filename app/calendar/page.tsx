import { getEvents, getReservations, getItems } from "@/actions/inventory";
import CalendarView from "@/components/CalendarView";

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export type CalendarDayData = {
  date: number;
  dateKey: string;
  isToday: boolean;
  events: Array<{ id: number; name: string }>;
  reservations: Array<{ id: number; itemName: string; quantity: number; reservedBy: string }>;
} | null;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams?: Promise<{ year?: string; month?: string; eventId?: string; itemId?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const [allEvents, reservations, items] = await Promise.all([
    getEvents(),
    getReservations(),
    getItems(),
  ]);

  const now = new Date();
  const qsYear = resolvedSearchParams.year ? parseInt(resolvedSearchParams.year, 10) : now.getFullYear();
  const qsMonth = resolvedSearchParams.month ? parseInt(resolvedSearchParams.month, 10) - 1 : now.getMonth();
  const filterEventId = resolvedSearchParams.eventId ? parseInt(resolvedSearchParams.eventId, 10) : undefined;
  const filterItemId = resolvedSearchParams.itemId ? parseInt(resolvedSearchParams.itemId, 10) : undefined;

  const year = qsYear;
  const month = qsMonth;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0=Sun .. 6=Sat

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
    if (evDate.getFullYear() !== year || evDate.getMonth() !== month) return;
    if (filterEventId && r.event?.id !== filterEventId) return;
    if (filterItemId && r.item?.id !== filterItemId) return;

    const key = toDateKey(evDate);
    reservationsByDate[key] = reservationsByDate[key] || [];
    reservationsByDate[key].push(r);
  });

  // Build calendar grid with proper weekday alignment
  const todayKey = toDateKey(now);
  const calendarDays: CalendarDayData[] = [];

  // Empty cells before the 1st
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const key = toDateKey(dateObj);
    const dayEvents = eventsByDate[key] || [];
    const dayReservations = reservationsByDate[key] || [];

    calendarDays.push({
      date: d,
      dateKey: key,
      isToday: key === todayKey,
      events: dayEvents.map((event: any) => ({ id: event.id, name: event.name })),
      reservations: dayReservations.map((reservation: any) => ({
        id: reservation.id,
        itemName: reservation.item?.name || "Item",
        quantity: reservation.quantity,
        reservedBy: reservation.reservedBy || "Unknown",
      })),
    });
  }

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

  const monthLabel = firstDay.toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <CalendarView
      calendarDays={calendarDays}
      monthLabel={monthLabel}
      year={year}
      month={month}
      prevHref={buildHref(prev.getFullYear(), prev.getMonth())}
      nextHref={buildHref(next.getFullYear(), next.getMonth())}
      allEvents={allEvents.map((e) => ({ id: e.id, name: e.name }))}
      items={items.map((i) => ({ id: i.id, name: i.name }))}
      filterEventId={filterEventId}
      filterItemId={filterItemId}
    />
  );
}
