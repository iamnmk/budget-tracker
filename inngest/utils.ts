import {
  ToolCallMessage,
  ToolResultMessage,
  TextMessage,
} from "@inngest/agent-kit";
import { InferenceResult } from "@inngest/agent-kit";

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
