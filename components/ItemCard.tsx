"use client";

import { deleteItem, getItems, updateItem } from "@/actions/inventory";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [formValues, setFormValues] = useState({
    name: item.name,
    description: item.description ?? "",
    category: item.category,
    quantity: String(item.quantity),
    storageLocation: item.storageLocation ?? "",
  });

  useEffect(() => {
    let isActive = true;

    async function loadCategories() {
      try {
        const existingItems = await getItems();
        const categories = Array.from(
          new Set(
            existingItems
              .map((existingItem) => existingItem.category?.trim())
              .filter((category): category is string => Boolean(category))
          )
        ).sort((first, second) => first.localeCompare(second));

        if (isActive) {
          setCategoryOptions(categories);
        }
      } catch {
        // keep form usable even if suggestions fail to load
      }
    }

    loadCategories();

    return () => {
      isActive = false;
    };
  }, []);

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

  function openEditForm() {
    setFormValues({
      name: item.name,
      description: item.description ?? "",
      category: item.category,
      quantity: String(item.quantity),
      storageLocation: item.storageLocation ?? "",
    });
    setIsEditing(true);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.set("name", formValues.name);
      formData.set("description", formValues.description);
      formData.set("category", formValues.category);
      formData.set("quantity", formValues.quantity);
      formData.set("storageLocation", formValues.storageLocation);

      await updateItem(item.id, formData);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update item");
    } finally {
      setIsSaving(false);
    }
  }

  const availabilityColor = 
    item.available === 0 
      ? "text-red-600" 
      : item.available < item.quantity / 2 
      ? "text-yellow-600" 
      : "text-green-600";

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Edit Item</h3>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label htmlFor={`edit-name-${item.id}`} className="block text-xs font-medium text-gray-700 mb-1">
              Item Name *
            </label>
            <input
              id={`edit-name-${item.id}`}
              type="text"
              required
              value={formValues.name}
              onChange={(event) => setFormValues((previous) => ({ ...previous, name: event.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor={`edit-category-${item.id}`} className="block text-xs font-medium text-gray-700 mb-1">
              Category *
            </label>
            <input
              id={`edit-category-${item.id}`}
              type="text"
              required
              list={`category-options-${item.id}`}
              value={formValues.category}
              onChange={(event) => setFormValues((previous) => ({ ...previous, category: event.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id={`category-options-${item.id}`}>
              {categoryOptions.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor={`edit-quantity-${item.id}`} className="block text-xs font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              id={`edit-quantity-${item.id}`}
              type="number"
              required
              min={1}
              value={formValues.quantity}
              onChange={(event) => setFormValues((previous) => ({ ...previous, quantity: event.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor={`edit-location-${item.id}`} className="block text-xs font-medium text-gray-700 mb-1">
              Storage Location
            </label>
            <input
              id={`edit-location-${item.id}`}
              type="text"
              value={formValues.storageLocation}
              onChange={(event) => setFormValues((previous) => ({ ...previous, storageLocation: event.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor={`edit-description-${item.id}`} className="block text-xs font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id={`edit-description-${item.id}`}
              rows={2}
              value={formValues.description}
              onChange={(event) => setFormValues((previous) => ({ ...previous, description: event.target.value }))}
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
        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={openEditForm}
            className="text-blue-600 hover:text-blue-800"
            title="Edit item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 010 2.828l-9.5 9.5a1 1 0 01-.46.263l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.263-.46l9.5-9.5a2 2 0 012.828 0z" />
            </svg>
          </button>

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
      </div>

      {item.description && (
        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Quantity:</span>
          <span className="font-medium text-gray-900">{item.quantity}</span>
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
            <span className="font-medium text-gray-900">{item.storageLocation}</span>
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
