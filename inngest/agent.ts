import {
  createAgent,
  anthropic,
  createNetwork,
  State,
  createTool,
} from "@inngest/agent-kit";
import { createServer } from "@inngest/agent-kit/server";
import { inngest } from "./client";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import convex from "@/lib/convexClient";

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
    currency: z.string(),
  }),
  handler: async (params, context) => {
    const {
      receiptId,
      merchantName,
      merchantAddress,
      merchantContact,
      transactionDate,
      transactionAmount,
      currency,
    } = params;

    return await context.step?.run("save-receipt-to-database", async () => {
      try {
        // Call the Convex mutation to update the receipt with extracted data
        await convex.mutation(api.receipts.updateReceiptWithExtractedData, {
          id: receiptId as Id<"receipts">,
          merchantName,
          merchantAddress,
          merchantContact,
          transactionDate,
          transactionAmount,
          currency,
        });

        console.log("Successfully saved receipt data to Convex database:", {
          receiptId,
          merchantName,
          merchantAddress,
          merchantContact,
          transactionDate,
          transactionAmount,
          currency,
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
        };
      } catch (error) {
        console.error("Error saving to Convex database:", error);
        return {
          addedToDb: "Failed",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });
  },
});

export const databaseAgent = createAgent({
  name: "Database Agent",
  description:
    "responsible for taking key information regarding receipts and saving it to the convex database.",
  system:
    "You are a helpful assistant that takes key information regarding receipts and saves it to the convex database.",
  model: anthropic({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 1000,
  }),
  tools: [saveToDatabaseTool],
});

const parsePdfTool = createTool({
  name: "parse-pdf",
  description: "Analyzes the given PDF ",
  parameters: z.object({
    pdfUrl: z.string(),
  }),
  handler: async ({ pdfUrl }, { step }) => {
    return await step?.ai.infer("parse-pdf", {
      model: anthropic({ model: "claude-3-5-sonnet-latest", max_tokens: 3094 }),
      body: {
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "url",
                  url: pdfUrl,
                },
              },
              {
                type: "text",
                text: `Extract the data from the receipt and return the structured output as follows: 
                {
                  "merchant": {
                    "name": "Store Name",
                    "address": "123 Main St, City, Country",
                    "contact": "+123456789"
                  },
                  "transaction": {
                    "date": "YYYY-MM-DD",
                    "receipt_number": "ABC123456",
                    "payment_method": "Credit Card"
                  },
                  "items": [
                    {
                      "name": "Item 1",
                      "quantity": 2,
                      "unit_price": 10.00,
                      "total_price": 20.00
                    }
                  ],
                  "totals": {
                    "subtotal": 20.00,
                    "tax": 2.00,
                    "total": 22.00,
                    "currency": "USD"
                  },
                }
                `,
              },
            ],
          },
        ],
      } as any,
    });
  },
});

const receiptScanningAgent = createAgent({
  name: "Receipt Scanning Agent",
  description:
    "Processes receipt images and PDFs to extract key information such as vendor names, dates, amounts, and line items",
  system: `You are an AI-powered receipt scanning assistant. Your primary role is to accurately extract and structure relevant information from scanned receipts. Your task includes recognizing and parsing details such as: 
    • Merchant Information: Store name, address, contact details 
    • Transaction Details: Date, time, receipt number, payment method 
    • Itemized Purchases: Product names, quantities, individual prices, discounts 
    • Total Amounts: Subtotal, taxes, total paid, and any applied discounts 
    • Ensure high accuracy by detecting OCR errors and correcting misread text when possible. 
    • Normalize dates, currency values, and formatting for consistency. 
    • If any key details are missing or unclear, return a structured response indicating incomplete data. 
    • Handle multiple formats, languages, and varying receipt layouts efficiently. 
    • Maintain a structured JSON output for easy integration with databases or expense tracking systems. 
    `,
  model: anthropic({
    model: "claude-3-5-haiku-latest",
    max_tokens: 1000,
  }),
  tools: [parsePdfTool],
});

const agentNetwork = createNetwork({
  name: "Agent Team",
  agents: [databaseAgent, receiptScanningAgent],
  defaultModel: anthropic({
    model: "claude-3-5-haiku-latest",
    max_tokens: 1000,
  }),
});
export const server = createServer({
  agents: [databaseAgent, receiptScanningAgent],
  networks: [agentNetwork],
});

export const pdfFunction = inngest.createFunction(
  { id: "pdf-function" },
  { event: "pdf-function/event" },
  async ({ event, step }) => {
    const result = await agentNetwork.run(
      `Extract the key data from this pdf and save it to the database: ${event.data.url}`,
    );
    return result.state.kv.get("receipt");
  },
);

export const receiptImporter = inngest.createFunction(
  {
    id: "receipt-importer",
  },
  {
    event: "receipts.import",
  },
  async ({ event, step }) => {
    // step 1: download the reciept
    const receipt = await step.run("download-receipt", async () => {
      const response = await fetch(event.data.receipt);
      return response.arrayBuffer();
    });

    // step 2: extract the data from the receipt
    const result = await agentNetwork.run(
      `Extract the data from the receipt and return the structured output as follows: 
      "{ 
        "merchant": { 
          "name": "Store Name", 
          "address": "123 Main St, City, Country", 
          "contact": "+123456789" 
        }, 
        "transaction": { 
          "date": "YYYY-MM-DD", 
          "time": "HH:MM:SS", 
          "receipt_number": "ABC123456", 
          "payment_method": "Credit Card" 
        }`,
      {
        state: new State({ receipt: event.data.receipt }),
      },
    );
    return result.state.kv.get("receipt");
  },
);
