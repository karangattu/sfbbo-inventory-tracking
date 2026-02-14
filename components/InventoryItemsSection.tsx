"use client";

import { useMemo, useState } from "react";
import ItemCard from "@/components/ItemCard";

type ItemWithAvailability = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  quantity: number;
  storageLocation: string | null;
  available: number;
  activeReservations: Array<{
    id: number;
    quantity: number;
    reservedBy: string | null;
    reservedAt: Date;
    eventName: string;
    eventDate: Date | null;
  }>;
};

type InventoryItemsSectionProps = {
  items: ItemWithAvailability[];
};

export default function InventoryItemsSection({ items }: InventoryItemsSectionProps) {
  const [showReservedOnly, setShowReservedOnly] = useState(false);

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map((item) => item.category?.trim())
            .filter((c): c is string => Boolean(c))
        )
      ).sort(),
    [items]
  );

  const filteredItems = useMemo(() => {
    if (!showReservedOnly) return items;
    return items.filter((item) => item.activeReservations.length > 0);
  }, [items, showReservedOnly]);

  const itemsByCategory = useMemo(
    () =>
      filteredItems.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {} as Record<string, ItemWithAvailability[]>),
    [filteredItems]
  );

  const totalReservedItems = useMemo(
    () => items.filter((item) => item.activeReservations.length > 0).length,
    [items]
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600">
          {showReservedOnly
            ? `Showing ${filteredItems.length} reserved item${filteredItems.length === 1 ? "" : "s"}`
            : `Showing all ${items.length} item${items.length === 1 ? "" : "s"}`}
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setShowReservedOnly(false)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              !showReservedOnly ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All items
          </button>
          <button
            type="button"
            onClick={() => setShowReservedOnly(true)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              showReservedOnly ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Only currently reserved ({totalReservedItems})
          </button>
        </div>
      </div>

      {Object.keys(itemsByCategory).length === 0 ? (
        <div className="surface-card text-center py-12">
          <p className="text-slate-500 text-lg">
            {showReservedOnly
              ? "No items are currently reserved."
              : "No items in inventory. Add your first item above!"}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
            <div key={category}>
              <h2 className="section-title mb-4 capitalize">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryItems.map((item) => (
                  <ItemCard key={item.id} item={item} categoryOptions={categoryOptions} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
