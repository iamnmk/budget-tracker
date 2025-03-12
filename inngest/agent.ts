import { anthropic, createNetwork } from "@inngest/agent-kit";
import { createServer } from "@inngest/agent-kit/server";
import { inngest } from "./client";
import { databaseAgent } from "./agents/databaseAgent";
import { receiptScanningAgent } from "./agents/receiptScanningAgent";
import { supervisorRoutingAgent } from "./agents/supervisorRoutingAgent";
import events from "./constants";

const agentNetwork = createNetwork({
  name: "Agent Team",
  agents: [databaseAgent, receiptScanningAgent],
  defaultModel: anthropic({
    model: "claude-3-5-sonnet-latest",
    defaultParameters: {
      max_tokens: 1000,
    },
  }),
  defaultRouter: supervisorRoutingAgent,
});
export const server = createServer({
  agents: [databaseAgent, receiptScanningAgent],
  networks: [agentNetwork],
});

export const pdfFunction = inngest.createFunction(
  { id: "pdf-function" },
  { event: events.EXTRACT_DATA_FROM_PDF_AND_SAVE_TO_DATABASE },
  async ({ event }) => {
    // step 1: extract the data from the receipt
    const result = await agentNetwork.run(
      `Extract the key data from this pdf: ${event.data.url}. Once the data is extracted, save it to the database using the receiptId: ${event.data.receiptId}. Once the receipt is successfully saved to the database you can terminate the agent process. Start with the Supervisor agent.`,
    );
    return result.state.kv.get("receipt");
  },
);
