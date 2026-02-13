"use client";

import { useState } from "react";

type CalendarEvent = {
  id: number;
  name: string;
};

type CalendarReservation = {
  id: number;
  itemName: string;
  quantity: number;
  reservedBy: string;
};

type CalendarDayCardProps = {
  day: number;
  monthLabel: string;
  fullDateLabel: string;
  events: CalendarEvent[];
  reservations: CalendarReservation[];
};

export default function CalendarDayCard({
  day,
  monthLabel,
  fullDateLabel,
  events,
  reservations,
}: CalendarDayCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const previewEvents = events.slice(0, 2);
  const previewReservations = reservations.slice(0, 2);
  const totalCount = events.length + reservations.length;
  const hiddenCount = totalCount - previewEvents.length - previewReservations.length;
  const hasBookings = totalCount > 0;

  return (
    <div className="group relative">
      <div
        tabIndex={0}
        className="h-44 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm outline-none transition focus-within:ring-2 focus-within:ring-blue-500 hover:shadow-md"
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-800">{day}</div>
          <div className="text-xs text-gray-500">{monthLabel}</div>
        </div>

        {hasBookings ? (
          <>
            <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="inline-flex whitespace-nowrap rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                {events.length} event{events.length === 1 ? "" : "s"}
              </span>
              <span className="inline-flex whitespace-nowrap rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                {reservations.length} reservation{reservations.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {previewEvents.map((event) => (
                <div key={event.id} className="truncate rounded bg-blue-50 px-2 py-1 text-blue-700">
                  {event.name}
                </div>
              ))}

              {previewReservations.map((reservation) => (
                <div key={reservation.id} className="truncate rounded bg-slate-50 px-2 py-1 text-slate-700">
                  {reservation.itemName} · x{reservation.quantity}
                </div>
              ))}

              {hiddenCount > 0 && (
                <div className="pt-1 text-[11px] font-medium text-slate-600">
                  +{hiddenCount} more
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800"
              aria-label={`View details for ${fullDateLabel}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M10 3c-4.5 0-8.26 2.91-9.54 6.94a1 1 0 000 .61C1.74 14.59 5.5 17.5 10 17.5s8.26-2.91 9.54-6.94a1 1 0 000-.61C18.26 5.91 14.5 3 10 3zm0 11a4 4 0 110-8 4 4 0 010 8z" />
                <path d="M10 8a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              View details
            </button>
          </>
        ) : (
          <div className="text-xs text-gray-300">No bookings</div>
        )}
      </div>

      {hasBookings && (
        <div className="pointer-events-none invisible absolute left-0 top-full z-20 mt-2 hidden w-80 rounded-lg border border-slate-200 bg-white p-3 opacity-0 shadow-xl transition group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 md:block">
          <div className="mb-2 text-sm font-semibold text-slate-900">{fullDateLabel}</div>

          <div className="max-h-64 space-y-3 overflow-auto pr-1 text-xs">
            {events.length > 0 && (
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">Events</div>
                <div className="space-y-1">
                  {events.map((event) => (
                    <div key={event.id} className="rounded bg-blue-50 px-2 py-1 text-blue-700">
                      {event.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reservations.length > 0 && (
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">Reserved Items</div>
                <div className="space-y-1">
                  {reservations.map((reservation) => (
                    <div key={reservation.id} className="rounded bg-slate-50 px-2 py-1 text-slate-700">
                      <div className="font-medium text-slate-800">{reservation.itemName}</div>
                      <div className="text-[11px] text-slate-500">x{reservation.quantity} • {reservation.reservedBy}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isModalOpen && hasBookings && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="mt-14 w-full max-w-md rounded-xl bg-white p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">{fullDateLabel}</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="max-h-[70vh] space-y-3 overflow-auto text-sm">
              {events.length > 0 && (
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">Events</div>
                  <div className="space-y-1">
                    {events.map((event) => (
                      <div key={event.id} className="rounded bg-blue-50 px-3 py-2 text-blue-700">
                        {event.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reservations.length > 0 && (
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">Reserved Items</div>
                  <div className="space-y-1">
                    {reservations.map((reservation) => (
                      <div key={reservation.id} className="rounded bg-slate-50 px-3 py-2 text-slate-800">
                        <div className="font-medium">{reservation.itemName}</div>
                        <div className="text-xs text-slate-500">x{reservation.quantity} • {reservation.reservedBy}</div>
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
