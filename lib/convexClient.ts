import { ConvexHttpClient } from "convex/browser";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

// Create a Convex HTTP client for server-side actions with authentication
export async function getAuthenticatedConvexClient() {
  try {
    // Get the current user
    const user = await currentUser();
    
    // Create a Convex HTTP client
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    
    // If we have a user, get a token for Convex
    if (user) {
      // Get token using the Session API
      const sessions = await clerkClient.users.getSessions(user.id);
      if (sessions.length > 0) {
        const token = await clerkClient.sessions.getToken(sessions[0].id, { template: "convex" });
        if (token) {
          convex.setAuth(token);
        }
      }
    }
    
    return convex;
  } catch (error) {
    console.error("Error creating authenticated Convex client:", error);
    // Fallback to non-authenticated client
    return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }
}

// Default non-authenticated client (for backward compatibility)
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
export default convex;
