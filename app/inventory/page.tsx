import { getItems, getAvailableQuantity, getReservations } from "@/actions/inventory";
import AddItemForm from "@/components/AddItemForm";
import ItemCard from "@/components/ItemCard";

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

  // Group items by category
  const itemsByCategory = itemsWithAvailability.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof itemsWithAvailability>);

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

      {Object.keys(itemsByCategory).length === 0 ? (
        <div className="surface-card text-center py-12">
          <p className="text-slate-500 text-lg">
            No items in inventory. Add your first item above!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
            <div key={category}>
              <h2 className="section-title mb-4 capitalize">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
