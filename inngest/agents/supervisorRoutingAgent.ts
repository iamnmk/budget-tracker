import { createRoutingAgent } from "@inngest/agent-kit";
import { anthropic } from "@inngest/agent-kit";
import { z } from "zod";
import { createTool } from "@inngest/agent-kit";
import { lastResult } from "../utils";
import { isLastMessageOfType } from "../utils";
import { databaseAgent } from "./databaseAgent";
import { receiptScanningAgent } from "./receiptScanningAgent";

const agents = [databaseAgent, receiptScanningAgent];

export const supervisorRoutingAgent = createRoutingAgent({
  name: "Supervisor",
  description: "I am a receipts personal assistant.",
  system: `receipts personal assistant.
  Your goal is to parse the provided receipt URL and save the data to the database using the following agents:
  ${agents.map((agent) => `- ${agent.name}: ${agent.description}`).join(`\n`)}
  
    Think step by step and reason through your decision.
    Once you have parsed the information from the receipt, route to the database agent to save the data to the database.
    Once the information is successfully extracted and saved to the database, call the "done" tool.`,
  tools: [
    createTool({
      name: "done",
      description: "Call this when the ticket is solved or escalated",
      handler: async () => {},
    }),
    createTool({
      name: "route_to_agent",
      description: "Route the ticket to the appropriate agent",
      parameters: z.object({
        agent: z.string().describe("The agent to route the ticket to"),
      }),
      handler: async ({ agent }) => {
        return agent;
      },
    }),
  ],
  model: anthropic({
    model: "claude-3-5-haiku-20241022",
    defaultParameters: {
      max_tokens: 1000,
    },
  }),
  lifecycle: {
    onRoute: ({ result, network }) => {
      const lastMessage = lastResult(network?.state.results);

      // ensure to loop back to the last executing agent if a tool has been called
      if (lastMessage && isLastMessageOfType(lastMessage, "tool_call")) {
        return [lastMessage?.agent.name];
      }

      const tool = result.toolCalls[0];

      if (!tool) {
        return;
      }

      const toolName = tool.tool.name;
      if (toolName === "done") {
        return;
      } else if (toolName === "route_to_agent") {
        if (
          typeof tool.content === "object" &&
          tool.content !== null &&
          "data" in tool.content &&
          typeof tool.content.data === "string"
        ) {
          return [tool.content.data];
        }
      }
      return;
    },
  },
});
