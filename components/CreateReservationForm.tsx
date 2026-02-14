"use client";

import { createReservation, getItems, getEvents, getAvailableQuantity } from "@/actions/inventory";
import { useState, useEffect } from "react";
import { formatPacificDate } from "@/lib/time";

export default function CreateReservationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [availabilityByItem, setAvailabilityByItem] = useState<Record<number, number>>({});
  const [selectedItemIds, setSelectedItemIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadData() {
      const [itemsData, eventsData] = await Promise.all([
        getItems(),
        getEvents(),
      ]);
      setItems(itemsData);

      const availabilityEntries = await Promise.all(
        itemsData.map(async (item) => {
          const available = await getAvailableQuantity(item.id);
          return [item.id, Math.max(available, 0)] as const;
        })
      );
      setAvailabilityByItem(Object.fromEntries(availabilityEntries));

      // Filter to only show future events
      const futureEvents = eventsData.filter(
        (event) => new Date(event.eventDate) >= new Date()
      );
      setEvents(futureEvents);

      // fetch people for autocomplete
      try {
        const res = await fetch('/api/people');
        if (res.ok) setPeople(await res.json());
      } catch (e) {
        /* ignore */
      }
    }
    loadData();
  }, []);

  async function handleSubmit(formData: FormData) {
    const selectedCount = Object.values(selectedItemIds).filter(Boolean).length;
    if (selectedCount === 0) {
      alert("Please select at least one item");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReservation(formData);
      // Reset form
      (document.getElementById("create-reservation-form") as HTMLFormElement)?.reset();
      setSelectedItemIds({});
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create reservation");
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasAnySelected = Object.values(selectedItemIds).some(Boolean);

  return (
    <form id="create-reservation-form" action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Items (select one or more)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-auto border border-gray-100 rounded-md p-3">
            {items.map((item) => (
              <label key={item.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="itemIds"
                    value={item.id}
                    checked={!!selectedItemIds[item.id]}
                    onChange={(e) =>
                      setSelectedItemIds((prev) => ({
                        ...prev,
                        [item.id]: e.target.checked,
                      }))
                    }
                    disabled={(availabilityByItem[item.id] ?? item.quantity) <= 0}
                    className="h-4 w-4"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.category}</div>
                    <div className="text-xs text-gray-500">
                      Available: {availabilityByItem[item.id] ?? item.quantity} / {item.quantity}
                    </div>
                  </div>
                </div>
                <input
                  name={`quantity-${item.id}`}
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={Math.max(availabilityByItem[item.id] ?? item.quantity, 0)}
                  disabled={(availabilityByItem[item.id] ?? item.quantity) <= 0}
                  className="w-20 px-2 py-1 border border-gray-200 rounded text-sm text-gray-900 disabled:bg-gray-100"
                />
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Tip: select multiple items and set quantities for each.</p>
        </div>

        <div>
          <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-1">Event *</label>
          <select id="eventId" name="eventId" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select an event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.name} ({formatPacificDate(event.eventDate)})</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="reservedBy" className="block text-sm font-medium text-gray-700 mb-1">Who is reserving?</label>
          <input list="people-list" id="reservedBy" name="reservedBy" required placeholder="Full name" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <datalist id="people-list">
            {people.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting || !hasAnySelected} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
        {isSubmitting ? "Creating..." : "Create Reservation"}
      </button>
    </form>
  );
}
