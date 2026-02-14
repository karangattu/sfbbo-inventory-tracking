"use client";

import { deleteEvent, updateEvent } from "@/actions/inventory";
import { useState } from "react";
import { useRouter } from "next/navigation";

function formatForDateTimeLocal(input: Date) {
  const date = new Date(input.getTime() - input.getTimezoneOffset() * 60000);
  return date.toISOString().slice(0, 16);
}

type EventCardProps = {
  event: {
    id: number;
    name: string;
    description: string | null;
    eventDate: Date;
    location: string | null;
  };
};

export default function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const parsedEventDate = new Date(event.eventDate);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    name: event.name,
    description: event.description ?? "",
    eventDate: formatForDateTimeLocal(parsedEventDate),
    location: event.location ?? "",
  });

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${event.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteEvent(event.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete event");
      setIsDeleting(false);
    }
  }

  function openEditForm() {
    setFormValues({
      name: event.name,
      description: event.description ?? "",
      eventDate: formatForDateTimeLocal(new Date(event.eventDate)),
      location: event.location ?? "",
    });
    setIsEditing(true);
  }

  async function handleSave(editEvent: React.FormEvent<HTMLFormElement>) {
    editEvent.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.set("name", formValues.name);
      formData.set("description", formValues.description);
      formData.set("eventDate", formValues.eventDate);
      formData.set("location", formValues.location);

      await updateEvent(event.id, formData);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update event");
    } finally {
      setIsSaving(false);
    }
  }

  const formattedDate = parsedEventDate.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = parsedEventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Edit Event</h3>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label htmlFor={`edit-event-name-${event.id}`} className="block text-xs font-medium text-gray-700 mb-1">
              Event Name *
            </label>
            <input
              id={`edit-event-name-${event.id}`}
              type="text"
              required
              value={formValues.name}
              onChange={(editEvent) =>
                setFormValues((previous) => ({ ...previous, name: editEvent.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor={`edit-event-date-${event.id}`} className="block text-xs font-medium text-gray-700 mb-1">
              Event Date *
            </label>
            <input
              id={`edit-event-date-${event.id}`}
              type="datetime-local"
              required
              value={formValues.eventDate}
              onChange={(editEvent) =>
                setFormValues((previous) => ({ ...previous, eventDate: editEvent.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor={`edit-event-location-${event.id}`} className="block text-xs font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              id={`edit-event-location-${event.id}`}
              type="text"
              value={formValues.location}
              onChange={(editEvent) =>
                setFormValues((previous) => ({ ...previous, location: editEvent.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor={`edit-event-description-${event.id}`} className="block text-xs font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id={`edit-event-description-${event.id}`}
              rows={2}
              value={formValues.description}
              onChange={(editEvent) =>
                setFormValues((previous) => ({ ...previous, description: editEvent.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-300 disabled:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={openEditForm}
            className="text-blue-600 hover:text-blue-800"
            title="Edit event"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 010 2.828l-9.5 9.5a1 1 0 01-.46.263l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.263-.46l9.5-9.5a2 2 0 012.828 0z" />
            </svg>
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 disabled:text-gray-400"
            title="Delete event"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {event.description && (
        <p className="text-sm text-gray-600 mb-3">{event.description}</p>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{formattedTime}</span>
        </div>
        {event.location && (
          <div className="flex items-center text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{event.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
