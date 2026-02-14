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

export async function updateEvent(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const eventDateRaw = formData.get("eventDate") as string;
  const location = formData.get("location") as string;

  if (!name || !eventDateRaw) {
    throw new Error("Name and event date are required");
  }

  const eventDate = new Date(eventDateRaw);
  if (Number.isNaN(eventDate.getTime())) {
    throw new Error("Invalid event date");
  }

  if (eventDate < new Date()) {
    throw new Error("Event date must be in the future");
  }

  try {
    await db
      .update(events)
      .set({
        name,
        description,
        eventDate,
        location,
      })
      .where(eq(events.id, id));

    revalidatePath("/events");
    revalidatePath("/calendar");
    revalidatePath("/reservations");
  } catch (error) {
    console.error("Error updating event:", error);
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
        reservedBy: reservations.reservedBy,
        returnedBy: reservations.returnedBy,
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
  // Support bulk reservation: form can submit multiple itemIds (checkboxes)
  const itemIds = formData.getAll("itemIds") as string[];
  const eventId = parseInt(formData.get("eventId") as string);
  const reservedBy = (formData.get("reservedBy") as string) || null;

  if (!eventId || !reservedBy) {
    throw new Error("Event and reserver name are required");
  }

  // If multiple itemIds provided -> bulk insert
  if (itemIds && itemIds.length > 0) {
    const parsed = Array.from(
      new Set(
        itemIds
          .map((value) => Number.parseInt(value, 10))
          .filter((value) => Number.isInteger(value) && value > 0)
      )
    );

    if (parsed.length === 0) {
      throw new Error("Select at least one valid item");
    }

    // Validate quantities and availability for each
    for (const id of parsed) {
      const qtyStr = formData.get(`quantity-${id}`) as string | null;
      const quantity = qtyStr ? Number.parseInt(qtyStr, 10) : 1;
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Quantity must be at least 1 for each selected item");
      }

      const item = await getItemById(id);
      if (!item) {
        throw new Error(`Item ${id} does not exist`);
      }

      if (quantity > item.quantity) {
        throw new Error(
          `Cannot reserve ${quantity} of ${item.name}. Max inventory is ${item.quantity}.`
        );
      }

      const available = await getAvailableQuantity(id, eventId);
      if (available < quantity) {
        throw new Error(
          `Only ${available} of ${item.name} available. Cannot reserve ${quantity}.`
        );
      }
    }

    try {
      for (const id of parsed) {
        const qtyStr = formData.get(`quantity-${id}`) as string | null;
        const quantity = qtyStr ? Number.parseInt(qtyStr, 10) : 1;
        await db.insert(reservations).values({
          itemId: id,
          eventId,
          quantity,
          status: "reserved",
          reservedBy,
        });
      }
      revalidatePath("/reservations");
      revalidatePath("/inventory");
      return;
    } catch (error) {
      console.error("Error creating reservations:", error);
      throw error;
    }
  }

  // Backward-compatible single-reservation handling
  const itemId = Number.parseInt(formData.get("itemId") as string, 10);
  const quantity = Number.parseInt(formData.get("quantity") as string, 10);

  if (!Number.isInteger(itemId) || !Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Item and quantity are required");
  }

  const item = await getItemById(itemId);
  if (!item) {
    throw new Error("Selected item does not exist");
  }

  if (quantity > item.quantity) {
    throw new Error(
      `Cannot reserve ${quantity} of ${item.name}. Max inventory is ${item.quantity}.`
    );
  }

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
      reservedBy,
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
  conditionNotes: string,
  returnedBy?: string
) {
  try {
    await db
      .update(reservations)
      .set({
        status: "returned",
        conditionNotes,
        returnedBy: returnedBy || null,
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

export async function markReservationsAsReturned(
  reservationIds: number[],
  conditionNotes?: string,
  returnedBy?: string
) {
  if (!reservationIds || reservationIds.length === 0) {
    throw new Error("No reservations selected");
  }

  try {
    for (const id of reservationIds) {
      await db
        .update(reservations)
        .set({
          status: "returned",
          conditionNotes: conditionNotes || null,
          returnedBy: returnedBy || null,
          returnedAt: new Date(),
        })
        .where(eq(reservations.id, id));
    }
    revalidatePath("/reservations");
    revalidatePath("/inventory");
  } catch (error) {
    console.error("Error marking reservations as returned:", error);
    throw error;
  }
}

// Return a deduplicated list of people who reserved/returned items (for autocomplete)
export async function getPeople() {
  try {
    const rows = await db.select({ reservedBy: reservations.reservedBy, returnedBy: reservations.returnedBy }).from(reservations);
    const set = new Set<string>();
    for (const r of rows) {
      if (r.reservedBy) set.add(r.reservedBy);
      if (r.returnedBy) set.add(r.returnedBy);
    }
    return Array.from(set).sort();
  } catch (error) {
    console.error("Error fetching people:", error);
    return [];
  }
}
