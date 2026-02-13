"use client";

import { createReservation, getItems, getEvents, getAvailableQuantity } from "@/actions/inventory";
import { useState, useEffect } from "react";

export default function CreateReservationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [available, setAvailable] = useState<number>(0);

  useEffect(() => {
    async function loadData() {
      const [itemsData, eventsData] = await Promise.all([
        getItems(),
        getEvents(),
      ]);
      setItems(itemsData);
      // Filter to only show future events
      const futureEvents = eventsData.filter(
        (event) => new Date(event.eventDate) >= new Date()
      );
      setEvents(futureEvents);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      getAvailableQuantity(selectedItem).then(setAvailable);
    }
  }, [selectedItem]);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await createReservation(formData);
      // Reset form
      (document.getElementById("create-reservation-form") as HTMLFormElement)?.reset();
      setSelectedItem(null);
      setAvailable(0);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create reservation");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form id="create-reservation-form" action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="itemId" className="block text-sm font-medium text-gray-700 mb-1">
            Item *
          </label>
          <select
            id="itemId"
            name="itemId"
            required
            onChange={(e) => setSelectedItem(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.category})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-1">
            Event *
          </label>
          <select
            id="eventId"
            name="eventId"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} ({new Date(event.eventDate).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity *
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            required
            min="1"
            max={available}
            defaultValue="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {selectedItem && (
            <p className="text-sm text-gray-600 mt-1">
              Available: {available}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !selectedItem || available === 0}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Creating..." : "Create Reservation"}
      </button>
    </form>
  );
}
