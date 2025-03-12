import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { pdfFunction } from "@/inngest/agent";

// Opt out of caching; every request should send a new event
export const dynamic = "force-dynamic";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [pdfFunction],
});
