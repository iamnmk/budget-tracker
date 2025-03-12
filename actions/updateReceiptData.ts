"use server";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import convex from "@/lib/convexClient";

/**
 * Server action to update a receipt with extracted data
 */
export async function updateReceiptData(
  receiptId: string,
  extractedData: {
    merchantName: string;
    merchantAddress: string;
    merchantContact: string;
    transactionDate: string;
    transactionAmount: string;
    receiptSummary: string;
    currency: string;
    items: {
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
  },
) {
  try {
    // Call the Convex mutation to update the receipt
    await convex.mutation(api.receipts.updateReceiptWithExtractedData, {
      id: receiptId as Id<"receipts">,
      ...extractedData,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating receipt data:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
