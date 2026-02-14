import { getItems, getReservations } from "@/actions/inventory";
import AddItemForm from "@/components/AddItemForm";
import InventoryItemsSection from "@/components/InventoryItemsSection";

export default async function InventoryPage() {
  const [items, reservations] = await Promise.all([getItems(), getReservations()]);

  // Compute reserved quantities from active reservations in-memory (avoids N+1 DB queries)
  const reservedByItem: Record<number, number> = {};
  const activeReservationsByItem: Record<
    number,
    Array<{
      id: number;
      quantity: number;
      reservedBy: string | null;
      reservedAt: Date;
      eventName: string;
      eventDate: Date | null;
    }>
  > = {};

  for (const reservation of reservations) {
    if (reservation.status !== "reserved" || !reservation.item?.id) continue;
    const itemId = reservation.item.id;
    reservedByItem[itemId] = (reservedByItem[itemId] || 0) + reservation.quantity;
    if (!activeReservationsByItem[itemId]) activeReservationsByItem[itemId] = [];
    activeReservationsByItem[itemId].push({
      id: reservation.id,
      quantity: reservation.quantity,
      reservedBy: reservation.reservedBy,
      reservedAt: reservation.reservedAt,
      eventName: reservation.event?.name ?? "Unknown Event",
      eventDate: reservation.event?.eventDate ?? null,
    });
  }

  const itemsWithAvailability = items.map((item) => ({
    ...item,
    available: item.quantity - (reservedByItem[item.id] || 0),
    activeReservations: (activeReservationsByItem[item.id] ?? []).sort(
      (first, second) =>
        new Date(first.reservedAt).getTime() - new Date(second.reservedAt).getTime()
    ),
  }));

  // Derive category list to pass to forms (computed once server-side)
  const categoryOptions = Array.from(
    new Set(items.map((i) => i.category?.trim()).filter((c): c is string => Boolean(c)))
  ).sort();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Inventory</h1>
        <p className="page-subtitle">Track available stock and maintain item details for all programs.</p>
      </div>

      <div className="surface-card p-6">
        <h2 className="section-title mb-4">Add New Item</h2>
        <AddItemForm categoryOptions={categoryOptions} />
      </div>

      <InventoryItemsSection items={itemsWithAvailability} />
    </div>
  );
}
