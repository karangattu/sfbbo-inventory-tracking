import { getItems, getAvailableQuantity } from "@/actions/inventory";
import AddItemForm from "@/components/AddItemForm";
import ItemCard from "@/components/ItemCard";

export default async function InventoryPage() {
  const items = await getItems();

  // Calculate available quantities for all items
  const itemsWithAvailability = await Promise.all(
    items.map(async (item) => ({
      ...item,
      available: await getAvailableQuantity(item.id),
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
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
      </div>

      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Item</h2>
        <AddItemForm />
      </div>

      {Object.keys(itemsByCategory).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">
            No items in inventory. Add your first item above!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
            <div key={category}>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 capitalize">
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
