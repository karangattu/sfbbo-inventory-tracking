"use client";

import { deleteItem } from "@/actions/inventory";
import { useState } from "react";

type ItemCardProps = {
  item: {
    id: number;
    name: string;
    description: string | null;
    category: string;
    quantity: number;
    storageLocation: string | null;
    available: number;
  };
};

export default function ItemCard({ item }: ItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteItem(item.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete item");
      setIsDeleting(false);
    }
  }

  const availabilityColor = 
    item.available === 0 
      ? "text-red-600" 
      : item.available < item.quantity / 2 
      ? "text-yellow-600" 
      : "text-green-600";

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 disabled:text-gray-400"
          title="Delete item"
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

      {item.description && (
        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Quantity:</span>
          <span className="font-medium">{item.quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Available:</span>
          <span className={`font-medium ${availabilityColor}`}>
            {item.available}
          </span>
        </div>
        {item.storageLocation && (
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium">{item.storageLocation}</span>
          </div>
        )}
      </div>

      {item.available === 0 && (
        <div className="mt-3 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
          Not Available
        </div>
      )}
      {item.available > 0 && item.available < item.quantity && (
        <div className="mt-3 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
          Partially Reserved
        </div>
      )}
    </div>
  );
}
