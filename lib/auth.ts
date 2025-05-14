import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";

/**
 * Helps create an authenticated Convex client for server actions
 */
export async function createAuthenticatedConvexClient() {
  // Create a Convex client
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  
  try {
    // Get current session user
    const user = await currentUser();
    
    if (user) {
      // Get the session token from cookies
      const cookieStore = cookies();
      const sessionToken = cookieStore.get("__session")?.value;
      
      if (sessionToken) {
        // Set the session token as the auth for Convex
        convex.setAuth(sessionToken);
      }
    }
  } catch (error) {
    console.error("Error setting up authenticated Convex client:", error);
  }
  
  return convex;
} 