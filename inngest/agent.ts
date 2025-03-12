import {
  createAgent,
  anthropic,
  createNetwork,
  State,
  createTool,
  InferenceResult,
  TextMessage,
  ToolCallMessage,
  ToolResultMessage,
  createRoutingAgent,
  Agent,
  getDefaultRoutingAgent,
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
    receiptSummary: z
      .string()
      .describe(
        "A summary of the receipt, including the merchant name, address, contact, transaction date, transaction amount, and currency. Include a human readable summary of the receipt. Mention both invoice number and receipt number if both are present. ",
      ),
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
      receiptSummary,
      currency,
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
          });

          console.log("Successfully saved receipt data to Convex database:", {
            receiptId,
            merchantName,
            merchantAddress,
            merchantContact,
            transactionDate,
            transactionAmount,
            currency,
            receiptSummary,
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
  model: anthropic({
    model: "claude-3-5-haiku-20241022",
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
      model: anthropic({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 3094,
      }),
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
      },
    });
  },
});

const supervisorRoutingAgent = createRoutingAgent({
  name: "Supervisor",
  description: "I am a Support supervisor.",
  system: `You are a supervisor.
You route requests to the appropriate agent using the following instructions:
- Any database related tasks to the 
- Any task to do with extraction of data to the receiptScanning agent

Think step by step and reason through your decision.
Once the information is successfully extracted and saved to the database, call the "done" tool.`,
  model: anthropic({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 1000,
  }),
  lifecycle: {
    onRoute: ({ result, network, agent }) => {
      const lastMessage = lastResult(network?.state.results);

      console.log("DEBUG >>> lastMessage", lastMessage);
      console.log("DEBUG >>> agent", agent);
      // ensure to loop back to the last executing agent if a tool has been called
      if (lastMessage && isLastMessageOfType(lastMessage, "tool_call")) {
        return [lastMessage?.agent.name];
      }

      const tool = result.toolCalls[0];

      console.log("DEBUG >>> tool", tool);
      if (!tool) {
        return;
      }

      console.log("DEBUG 2>>> tool", tool);
      const toolName = tool.tool.name;
      if (toolName === "done") {
        console.log("DEBUG 3>>> calling done");
        return;
      } else if (toolName === "route_to_agent") {
        console.log("DEBUG 4>>> calling route_to_agent");
        if (
          typeof tool.content === "object" &&
          tool.content !== null &&
          "data" in tool.content &&
          typeof tool.content.data === "string"
        ) {
          console.log("DEBUG 5>>> returning route_to_agent");
          return [tool.content.data];
        }
      }
      return;
    },
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
    model: "claude-3-5-sonnet-latest",
    max_tokens: 1000,
  }),
  defaultRouter: ({ network, lastResult }) => {
    console.log("STATE 2 >>>", network.state);
    const savedToDatabase = network.state.kv.get("saved-to-database");
    console.log("DEBUG >>> savedToDatabase", savedToDatabase);
    if (savedToDatabase !== undefined) {
      console.log("DEBUG >>> returning undefined");
      return undefined;
    }
    console.log("DEBUG >>> returning getDefaultRoutingAgent");
    return getDefaultRoutingAgent();
  },
});
export const server = createServer({
  agents: [databaseAgent, receiptScanningAgent],
  networks: [agentNetwork],
});

export const pdfFunction = inngest.createFunction(
  { id: "pdf-function" },
  { event: "pdf-function/event" },
  async ({ event, step }) => {
    // step 1: extract the data from the receipt
    const result = await agentNetwork.run(
      `Extract the key data from this pdf: ${event.data.url}. Once the data is extracted, save it to the database using the receiptId: ${event.data.receiptId}. Once the receipt is successfully saved to the database you can terminate the agent process. Start with the Supervisor agent.`,
    );
    return result.state.kv.get("receipt");
  },
);

export function lastResult(results: InferenceResult[] | undefined) {
  if (!results) {
    return undefined;
  }
  return results[results.length - 1];
}

type MessageType =
  | TextMessage["type"]
  | ToolCallMessage["type"]
  | ToolResultMessage["type"];

export function isLastMessageOfType(
  result: InferenceResult,
  type: MessageType,
) {
  return result.output[result.output.length - 1]?.type === type;
}
