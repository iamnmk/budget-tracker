"use server";

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Server action to get all accounts for the current user
 */
export async function getAccounts() {
  try {
    // Ensure the user is authenticated
    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        error: "User not authenticated"
      };
    }

    console.log("Fetching accounts for user:", user.id);

    // Create a Convex client for this request
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    
    // Get all accounts for this user
    const accounts = await convex.query(api.accounts.getAccounts, {
      userId: user.id
    });

    console.log("Found accounts:", accounts);

    return { 
      success: true,
      data: accounts
    };
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
}

/**
 * Server action to create a new account
 */
export async function createAccount(formData: FormData) {
  try {
    // Ensure the user is authenticated
    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        error: "User not authenticated"
      };
    }

    // Get form data
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const balanceStr = formData.get("balance") as string;
    const currency = formData.get("currency") as string;

    console.log("Creating account:", { name, type, balance: balanceStr, currency, userId: user.id });

    if (!name || !type || !balanceStr || !currency) {
      return {
        success: false,
        error: "All fields are required"
      };
    }

    // Parse balance as a number
    const balance = parseFloat(balanceStr);
    if (isNaN(balance)) {
      return {
        success: false,
        error: "Balance must be a number"
      };
    }

    // Create a Convex client for this request
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    
    // Create the account
    const accountId = await convex.mutation(api.accounts.createAccount, {
      userId: user.id,
      name,
      type,
      balance,
      currency
    });

    console.log("Created account with ID:", accountId);

    return { 
      success: true,
      data: { accountId }
    };
  } catch (error) {
    console.error("Error creating account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
}

/**
 * Server action to delete an account
 */
export async function deleteAccount(accountId: string) {
  try {
    // Ensure the user is authenticated
    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        error: "User not authenticated"
      };
    }

    // Create a Convex client for this request
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    
    // Delete the account
    await convex.mutation(api.accounts.deleteAccount, {
      id: accountId as Id<"accounts">,
      userId: user.id
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
} 