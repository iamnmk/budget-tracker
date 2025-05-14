import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: "my-app",
  // This allows us to use Inngest in development without needing API keys
  baseUrl: process.env.NODE_ENV === "development" ? "http://127.0.0.1:8288" : undefined,
});
