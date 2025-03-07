"use server";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import convex from "@/lib/convexClient";

/**
 * Server action to update receipt status
 */
export async function updateReceiptStatus(receiptId: string, status: string) {
  try {
    await convex.mutation(api.receipts.updateReceiptStatus, {
      id: receiptId as Id<"receipts">,
      status,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating receipt status:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
