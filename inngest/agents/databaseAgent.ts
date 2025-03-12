import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import convex from "@/lib/convexClient";
import { createTool, openai } from "@inngest/agent-kit";

import { createAgent } from "@inngest/agent-kit";
import { z } from "zod";

const saveToDatabaseTool = createTool({
  name: "save-to-database",
  description: "Saves the given data to the convex database.",
  parameters: z.object({
    receiptId: z.string().describe("The ID of the receipt to update"),
    merchantName: z.string(),
    merchantAddress: z.string(),
    merchantContact: z.string(),
    transactionDate: z.string(),
    transactionAmount: z.string(),
    receiptSummary: z
      .string()
      .describe(
        "A summary of the receipt, including the merchant name, address, contact, transaction date, transaction amount, and currency. Include a human readable summary of the receipt. Mention both invoice number and receipt number if both are present. ",
      ),
    currency: z.string(),
    items: z.array(
      z
        .object({
          name: z.string(),
          quantity: z.number(),
          unitPrice: z.number(),
          totalPrice: z.number(),
        })
        .describe(
          "An array of items on the receipt. Include the name, quantity, unit price, and total price of each item.",
        ),
    ),
  }),
  handler: async (params, context) => {
    const {
      receiptId,
      merchantName,
      merchantAddress,
      merchantContact,
      transactionDate,
      transactionAmount,
      receiptSummary,
      currency,
      items,
    } = params;

    const result = await context.step?.run(
      "save-receipt-to-database",
      async () => {
        try {
          // Call the Convex mutation to update the receipt with extracted data
          await convex.mutation(api.receipts.updateReceiptWithExtractedData, {
            id: receiptId as Id<"receipts">,
            merchantName,
            merchantAddress,
            merchantContact,
            transactionDate,
            transactionAmount,
            receiptSummary,
            currency,
            items,
          });

          return {
            addedToDb: "Success",
            receiptId,
            merchantName,
            merchantAddress,
            merchantContact,
            transactionDate,
            transactionAmount,
            currency,
            receiptSummary,
            items,
          };
        } catch (error) {
          return {
            addedToDb: "Failed",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    );

    if (result?.addedToDb === "Success") {
      // Only set KV values if the operation was successful
      context.network?.state.kv.set("saved-to-database", true);
      context.network?.state.kv.set("receipt", receiptId);
    }

    return result;
  },
});

export const databaseAgent = createAgent({
  name: "Database Agent",
  description:
    "responsible for taking key information regarding receipts and saving it to the convex database.",
  system:
    "You are a helpful assistant that takes key information regarding receipts and saves it to the convex database.",
  model: openai({
    model: "gpt-4o-mini",
    defaultParameters: {
      max_completion_tokens: 1000,
    },
  }),
  tools: [saveToDatabaseTool],
});
