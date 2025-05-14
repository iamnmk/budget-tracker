"use server";

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Server action to delete a receipt
 */
export async function deleteReceipt(receiptId: string) {
  try {
    // Ensure the user is authenticated
    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        error: "User not authenticated"
      };
    }

    // Create a new Convex client for this request
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    
    // Call the delete mutation with the user ID
    await convex.mutation(api.receipts.deleteReceipt, {
      id: receiptId as Id<"receipts">,
      userId: user.id
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting receipt:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
