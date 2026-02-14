"use client";

import { useState } from "react";
import type { CalendarDayData } from "@/app/calendar/page";

type CalendarViewProps = {
  calendarDays: CalendarDayData[];
  monthLabel: string;
  year: number;
  month: number;
  prevHref: string;
  nextHref: string;
  allEvents: Array<{ id: number; name: string }>;
  items: Array<{ id: number; name: string }>;
  filterEventId?: number;
  filterItemId?: number;
};

type ModalData = {
  date: number;
  events: Array<{ id: number; name: string }>;
  reservations: Array<{ id: number; itemName: string; quantity: number; reservedBy: string }>;
} | null;

const WEEKDAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_MIN = ["S", "M", "T", "W", "T", "F", "S"];

export default function CalendarView({
  calendarDays,
  monthLabel,
  year,
  month,
  prevHref,
  nextHref,
  allEvents,
  items,
  filterEventId,
  filterItemId,
}: CalendarViewProps) {
  const [modal, setModal] = useState<ModalData>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Separate days with bookings for mobile list view
  const daysWithBookings = calendarDays.filter(
    (d) => d && (d.events.length > 0 || d.reservations.length > 0)
  ) as NonNullable<CalendarDayData>[];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-title">Calendar</h1>

        <div className="flex items-center gap-2">
          <a
            href={prevHref}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:bg-slate-100"
            aria-label="Previous month"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <span className="min-w-[10rem] text-center text-base font-semibold text-slate-900">{monthLabel}</span>
          <a
            href={nextHref}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:bg-slate-100"
            aria-label="Next month"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="surface-card p-3">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex w-full items-center justify-between text-sm font-medium text-slate-700 sm:hidden"
        >
          <span>Filters {(filterEventId || filterItemId) ? "(active)" : ""}</span>
          <svg className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <form
          method="get"
          className={`${showFilters ? "mt-3 flex" : "hidden"} flex-col gap-3 sm:mt-0 sm:flex sm:flex-row sm:items-center`}
        >
          <input type="hidden" name="year" value={String(year)} />
          <input type="hidden" name="month" value={String(month + 1)} />

          <select
            name="eventId"
            defaultValue={filterEventId ?? ""}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All events</option>
            {allEvents.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>

          <select
            name="itemId"
            defaultValue={filterItemId ?? ""}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All items</option>
            {items.map((it) => (
              <option key={it.id} value={it.id}>{it.name}</option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Desktop calendar grid (hidden on small screens) */}
      <div className="hidden md:block">
        <div className="surface-card overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {WEEKDAYS_SHORT.map((d, i) => (
              <div key={i} className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[7rem] border-b border-r border-slate-100 bg-slate-50/50 lg:min-h-[8rem]"
                  />
                );
              }

              const hasBookings = day.events.length > 0 || day.reservations.length > 0;
              return (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() => hasBookings ? setModal({ date: day.date, events: day.events, reservations: day.reservations }) : undefined}
                  className={`group relative min-h-[7rem] border-b border-r border-slate-100 p-2 text-left transition lg:min-h-[8rem] ${
                    day.isToday ? "bg-blue-50/60" : "bg-white hover:bg-slate-50"
                  } ${hasBookings ? "cursor-pointer" : "cursor-default"}`}
                >
                  {/* Day number */}
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                      day.isToday
                        ? "bg-blue-600 text-white"
                        : "text-slate-800"
                    }`}
                  >
                    {day.date}
                  </span>

                  {/* Event/reservation indicators */}
                  {hasBookings ? (
                    <div className="mt-1 space-y-1">
                      {day.events.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="truncate rounded bg-blue-100 px-1.5 py-0.5 text-[11px] font-medium text-blue-700"
                        >
                          {event.name}
                        </div>
                      ))}
                      {day.reservations.length > 0 && day.events.length < 2 && (
                        <div className="truncate rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                          {day.reservations.length} reserved
                        </div>
                      )}
                      {(day.events.length > 2 || (day.events.length === 2 && day.reservations.length > 0)) && (
                        <div className="text-[10px] font-medium text-slate-500">
                          +{day.events.length + day.reservations.length - 2} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-slate-300">&nbsp;</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile calendar: compact grid + event list */}
      <div className="md:hidden">
        {/* Compact grid */}
        <div className="surface-card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {WEEKDAYS_MIN.map((d, i) => (
              <div key={i} className="py-2 text-center text-[11px] font-semibold uppercase text-slate-500">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return <div key={`empty-m-${idx}`} className="aspect-square border-b border-r border-slate-100 bg-slate-50/50" />;
              }

              const hasBookings = day.events.length > 0 || day.reservations.length > 0;
              return (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() => hasBookings ? setModal({ date: day.date, events: day.events, reservations: day.reservations }) : undefined}
                  className={`relative flex aspect-square flex-col items-center justify-center border-b border-r border-slate-100 text-sm transition ${
                    day.isToday ? "bg-blue-50" : "bg-white"
                  } ${hasBookings ? "cursor-pointer active:bg-slate-100" : "cursor-default"}`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      day.isToday ? "bg-blue-600 text-white" : "text-slate-800"
                    }`}
                  >
                    {day.date}
                  </span>
                  {hasBookings && (
                    <div className="mt-0.5 flex gap-0.5">
                      {day.events.length > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                      {day.reservations.length > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile event list */}
        {daysWithBookings.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">Events this month</h3>
            {daysWithBookings.map((day) => (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => setModal({ date: day.date, events: day.events, reservations: day.reservations })}
                className="surface-card flex w-full items-start gap-3 p-3 text-left transition hover:shadow-md active:bg-slate-50"
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                  day.isToday ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                }`}>
                  {day.date}
                </div>
                <div className="min-w-0 flex-1">
                  {day.events.map((e) => (
                    <div key={e.id} className="truncate text-sm font-medium text-slate-800">{e.name}</div>
                  ))}
                  {day.reservations.length > 0 && (
                    <div className="mt-0.5 text-xs text-emerald-700">
                      {day.reservations.length} item{day.reservations.length !== 1 ? "s" : ""} reserved
                    </div>
                  )}
                </div>
                <svg className="mt-1 h-4 w-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {daysWithBookings.length === 0 && (
          <div className="mt-4 surface-card py-8 text-center">
            <p className="text-sm text-slate-400">No events or reservations this month</p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Events
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Reservations
          </span>
        </div>
      </div>

      {/* Detail modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className="mt-[10vh] w-full max-w-md animate-in rounded-xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {monthLabel.split(" ")[0]} {modal.date}
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[60vh] space-y-4 overflow-auto">
              {modal.events.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600">Events</h4>
                  <div className="space-y-1.5">
                    {modal.events.map((event) => (
                      <div key={event.id} className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">
                        {event.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modal.reservations.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">Reserved Items</h4>
                  <div className="space-y-1.5">
                    {modal.reservations.map((r) => (
                      <div key={r.id} className="rounded-lg bg-emerald-50 px-3 py-2">
                        <div className="text-sm font-medium text-emerald-800">{r.itemName}</div>
                        <div className="mt-0.5 text-xs text-emerald-600">
                          x{r.quantity} &middot; {r.reservedBy}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
