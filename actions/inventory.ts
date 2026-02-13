"use server";

import { db } from "@/db";
import { items, events, reservations } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Item actions
export async function getItems() {
  try {
    return await db.select().from(items).orderBy(items.name);
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
}

export async function getItemById(id: number) {
  try {
    const result = await db.select().from(items).where(eq(items.id, id));
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching item:", error);
    throw error;
  }
}

export async function addItem(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const storageLocation = formData.get("storageLocation") as string;

  if (!name || !category || !quantity) {
    throw new Error("Name, category, and quantity are required");
  }

  try {
    await db.insert(items).values({
      name,
      description,
      category,
      quantity,
      storageLocation,
    });
    revalidatePath("/inventory");
  } catch (error) {
    console.error("Error adding item:", error);
    throw error;
  }
}

export async function updateItem(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const storageLocation = formData.get("storageLocation") as string;

  try {
    await db
      .update(items)
      .set({
        name,
        description,
        category,
        quantity,
        storageLocation,
        updatedAt: new Date(),
      })
      .where(eq(items.id, id));
    revalidatePath("/inventory");
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
}

export async function deleteItem(id: number) {
  try {
    await db.delete(items).where(eq(items.id, id));
    revalidatePath("/inventory");
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
}

// Event actions
export async function getEvents() {
  try {
    return await db.select().from(events).orderBy(events.eventDate);
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
}

export async function addEvent(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const eventDate = new Date(formData.get("eventDate") as string);
  const location = formData.get("location") as string;

  if (!name || !eventDate) {
    throw new Error("Name and event date are required");
  }

  // Validate that event date is in the future
  if (eventDate < new Date()) {
    throw new Error("Event date must be in the future");
  }

  try {
    await db.insert(events).values({
      name,
      description,
      eventDate,
      location,
    });
    revalidatePath("/events");
  } catch (error) {
    console.error("Error adding event:", error);
    throw error;
  }
}

export async function deleteEvent(id: number) {
  try {
    await db.delete(events).where(eq(events.id, id));
    revalidatePath("/events");
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
}

// Reservation actions
export async function getReservations() {
  try {
    const result = await db
      .select({
        id: reservations.id,
        quantity: reservations.quantity,
        status: reservations.status,
        conditionNotes: reservations.conditionNotes,
        reservedAt: reservations.reservedAt,
        returnedAt: reservations.returnedAt,
        item: {
          id: items.id,
          name: items.name,
          category: items.category,
        },
        event: {
          id: events.id,
          name: events.name,
          eventDate: events.eventDate,
        },
      })
      .from(reservations)
      .leftJoin(items, eq(reservations.itemId, items.id))
      .leftJoin(events, eq(reservations.eventId, events.id))
      .orderBy(reservations.reservedAt);
    return result;
  } catch (error) {
    console.error("Error fetching reservations:", error);
    throw error;
  }
}

export async function getAvailableQuantity(itemId: number, eventId?: number) {
  try {
    const item = await getItemById(itemId);
    if (!item) return 0;

    // Get all active reservations for this item
    const activeReservations = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.itemId, itemId),
          eq(reservations.status, "reserved")
        )
      );

    const reservedQuantity = activeReservations.reduce(
      (sum, res) => sum + res.quantity,
      0
    );

    return item.quantity - reservedQuantity;
  } catch (error) {
    console.error("Error calculating available quantity:", error);
    throw error;
  }
}

export async function createReservation(formData: FormData) {
  const itemId = parseInt(formData.get("itemId") as string);
  const eventId = parseInt(formData.get("eventId") as string);
  const quantity = parseInt(formData.get("quantity") as string);

  if (!itemId || !eventId || !quantity) {
    throw new Error("Item, event, and quantity are required");
  }

  // Check availability
  const available = await getAvailableQuantity(itemId, eventId);
  if (available < quantity) {
    throw new Error(
      `Only ${available} items available. Cannot reserve ${quantity}.`
    );
  }

  try {
    await db.insert(reservations).values({
      itemId,
      eventId,
      quantity,
      status: "reserved",
    });
    revalidatePath("/reservations");
    revalidatePath("/inventory");
  } catch (error) {
    console.error("Error creating reservation:", error);
    throw error;
  }
}

export async function markAsReturned(
  reservationId: number,
  conditionNotes: string
) {
  try {
    await db
      .update(reservations)
      .set({
        status: "returned",
        conditionNotes,
        returnedAt: new Date(),
      })
      .where(eq(reservations.id, reservationId));
    revalidatePath("/reservations");
    revalidatePath("/inventory");
  } catch (error) {
    console.error("Error marking as returned:", error);
    throw error;
  }
}
