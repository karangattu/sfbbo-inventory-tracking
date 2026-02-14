"use client";

import { markAsReturned } from "@/actions/inventory";
import { useState } from "react";

type ReservationCardProps = {
  reservation: {
    id: number;
    quantity: number;
    status: string;
    conditionNotes: string | null;
    reservedBy?: string | null;
    returnedBy?: string | null;
    reservedAt: Date;
    returnedAt: Date | null;
    item: {
      id: number;
      name: string;
      category: string;
    } | null;
    event: {
      id: number;
      name: string;
      eventDate: Date;
    } | null;
  };
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: number, checked: boolean) => void;
  people?: string[];
};

export default function ReservationCard({
  reservation,
  selectable,
  selected,
  onToggleSelect,
  people = [],
}: ReservationCardProps) {
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [conditionNotes, setConditionNotes] = useState("");
  const [returnedBy, setReturnedBy] = useState<string | undefined>(reservation.returnedBy || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleReturn() {
    setIsSubmitting(true);
    try {
      await markAsReturned(reservation.id, conditionNotes, returnedBy);
      setShowReturnForm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to mark as returned");
    } finally {
      setIsSubmitting(false);
    }
  }

  const reservedDate = new Date(reservation.reservedAt).toLocaleDateString();
  const returnedDate = reservation.returnedAt
    ? new Date(reservation.returnedAt).toLocaleDateString()
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {selectable && (
            <input
              type="checkbox"
              checked={!!selected}
              onChange={(e) => onToggleSelect?.(reservation.id, e.target.checked)}
              className="mt-1 h-4 w-4"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {reservation.item?.name || "Unknown Item"}
            </h3>
            <p className="text-sm text-gray-600">{reservation.item?.category}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Event:</span>
          <span className="font-medium text-gray-900">{reservation.event?.name || "Unknown Event"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Event Date:</span>
          <span className="font-medium text-gray-900">
            {reservation.event?.eventDate
              ? new Date(reservation.event.eventDate).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Quantity:</span>
          <span className="font-medium text-gray-900">{reservation.quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Reserved:</span>
          <span className="font-medium text-gray-900">{reservedDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Reserved by:</span>
          <span className="font-medium text-gray-900">{reservation.reservedBy || "—"}</span>
        </div>
        {reservation.status === "returned" && returnedDate && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Returned:</span>
              <span className="font-medium text-gray-900">{returnedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Returned by:</span>
              <span className="font-medium text-gray-900">{reservation.returnedBy || "—"}</span>
            </div>
          </>
        )}
      </div>

      {reservation.status === "reserved" && !showReturnForm && (
        <button
          onClick={() => setShowReturnForm(true)}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
        >
          Mark as Returned
        </button>
      )}

      {showReturnForm && (
        <div className="space-y-3">
          <div>
            <label
              htmlFor={`notes-${reservation.id}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Condition Notes
            </label>
            <textarea
              id={`notes-${reservation.id}`}
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              rows={3}
              placeholder="Note any damage or issues..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor={`returnedBy-${reservation.id}`} className="block text-sm font-medium text-gray-700 mb-1">Returned by</label>
            <input list="people-list" id={`returnedBy-${reservation.id}`} value={returnedBy} onChange={(e) => setReturnedBy(e.target.value)} placeholder="Full name" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <datalist id="people-list">
              {people.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleReturn}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {isSubmitting ? "Confirming..." : "Confirm Return"}
            </button>
            <button
              onClick={() => setShowReturnForm(false)}
              disabled={isSubmitting}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {reservation.status === "returned" && (
        <div className="mt-3">
          <div className="px-3 py-2 bg-green-100 text-green-800 text-sm rounded-md">
            <p className="font-medium">Returned</p>
            {reservation.conditionNotes && (
              <p className="mt-1 text-xs">{reservation.conditionNotes}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
