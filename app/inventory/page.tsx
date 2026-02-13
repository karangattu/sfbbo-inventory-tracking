import { getItems, getAvailableQuantity, getReservations } from "@/actions/inventory";
import AddItemForm from "@/components/AddItemForm";
import InventoryItemsSection from "@/components/InventoryItemsSection";

export default async function InventoryPage() {
  const items = await getItems();
  const reservations = await getReservations();

  const activeReservationsByItem = reservations.reduce(
    (acc, reservation) => {
      if (reservation.status !== "reserved" || !reservation.item?.id) {
        return acc;
      }

      const itemId = reservation.item.id;
      if (!acc[itemId]) {
        acc[itemId] = [];
      }

      acc[itemId].push({
        id: reservation.id,
        quantity: reservation.quantity,
        reservedBy: reservation.reservedBy,
        reservedAt: reservation.reservedAt,
        eventName: reservation.event?.name ?? "Unknown Event",
        eventDate: reservation.event?.eventDate ?? null,
      });

      return acc;
    },
    {} as Record<
      number,
      Array<{
        id: number;
        quantity: number;
        reservedBy: string | null;
        reservedAt: Date;
        eventName: string;
        eventDate: Date | null;
      }>
    >
  );

  // Calculate available quantities for all items
  const itemsWithAvailability = await Promise.all(
    items.map(async (item) => ({
      ...item,
      available: await getAvailableQuantity(item.id),
      activeReservations: (activeReservationsByItem[item.id] ?? []).sort(
        (first, second) =>
          new Date(first.reservedAt).getTime() - new Date(second.reservedAt).getTime()
      ),
    }))
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Inventory</h1>
        <p className="page-subtitle">Track available stock and maintain item details for all programs.</p>
      </div>

      <p className="text-sm text-slate-600">
        Expand <span className="font-medium">Current reservations</span> in any item card to see who reserved it and for which event.
      </p>

      <div className="surface-card p-6">
        <h2 className="section-title mb-4">Add New Item</h2>
        <AddItemForm />
      </div>

      <InventoryItemsSection items={itemsWithAvailability} />
    </div>
  );
}
