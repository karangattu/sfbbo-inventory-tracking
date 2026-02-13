"use client";

import { useState } from "react";
import ReservationCard from "./ReservationCard";
import { markReservationsAsReturned } from "@/actions/inventory";

type Props = {
  initialReservations: any[];
};

export default function ReservationsManager({ initialReservations }: Props) {
  const [reservations, setReservations] = useState(initialReservations || []);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkReturnForm, setShowBulkReturnForm] = useState(false);
  const [returnedBy, setReturnedBy] = useState("");
  const [conditionNotes, setConditionNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  function toggle(id: number, checked: boolean) {
    setSelected((s) => ({ ...s, [id]: checked }));
  }

  function toggleSelectAll(checked: boolean) {
    const next: Record<number, boolean> = {};
    reservations.forEach((r: any) => (next[r.id] = checked));
    setSelected(next);
    setSelectAll(checked);
  }

  const selectedIds = Object.keys(selected)
    .filter((k) => selected[parseInt(k)])
    .map((k) => parseInt(k));

  async function handleBulkReturn(e: React.FormEvent) {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    if (!returnedBy) {
      alert("Returner name is required for bulk return");
      return;
    }
    setIsProcessing(true);
    try {
      await markReservationsAsReturned(selectedIds, conditionNotes || undefined, returnedBy || undefined);
      // remove returned reservations from local list
      setReservations((prev) => prev.filter((r: any) => !selectedIds.includes(r.id)));
      setSelected({});
      setSelectAll(false);
      setShowBulkReturnForm(false);
      setReturnedBy("");
      setConditionNotes("");
    } catch (err: any) {
      alert(err?.message || "Failed to return reservations");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <label className="flex items-center text-sm text-gray-600">
            <input type="checkbox" checked={selectAll} onChange={(e) => toggleSelectAll(e.target.checked)} className="mr-2 h-4 w-4" />
            Select all
          </label>
          <div className="text-sm text-gray-600">{reservations.length} active</div>
        </div>
        <div>
          <button
            onClick={() => setShowBulkReturnForm((s) => !s)}
            disabled={selectedIds.length === 0}
            className={`px-4 py-2 rounded-md text-white ${selectedIds.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            Mark selected as Returned
          </button>
        </div>
      </div>

      {showBulkReturnForm && (
        <form onSubmit={handleBulkReturn} className="mb-6 bg-white p-4 rounded-md border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Returned by *</label>
              <input value={returnedBy} onChange={(e) => setReturnedBy(e.target.value)} required placeholder="Full name" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition notes (optional)</label>
              <input value={conditionNotes} onChange={(e) => setConditionNotes(e.target.value)} placeholder="Damage or notes applied to all selected" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="mt-4 flex space-x-2">
            <button type="submit" disabled={isProcessing} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400">
              {isProcessing ? 'Processing...' : `Confirm return (${selectedIds.length})`}
            </button>
            <button type="button" onClick={() => setShowBulkReturnForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reservations.map((reservation: any) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            selectable
            selected={!!selected[reservation.id]}
            onToggleSelect={toggle}
          />
        ))}
      </div>
    </div>
  );
}
