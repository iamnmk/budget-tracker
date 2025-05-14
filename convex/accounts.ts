import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Function to get all accounts for a user
export const getAccounts = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Convex: Getting accounts for user:", args.userId);
    
    // Return accounts for the authenticated user
    const accounts = await ctx.db
      .query("accounts")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
      
    console.log("Convex: Found accounts:", accounts.length, accounts);
    return accounts;
  },
});

// Function to create a new account
export const createAccount = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    type: v.string(),
    balance: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Create a new account
    const accountId = await ctx.db.insert("accounts", {
      userId: args.userId,
      name: args.name,
      type: args.type,
      balance: args.balance,
      currency: args.currency,
      createdAt: now,
      updatedAt: now,
    });

    return accountId;
  },
});

// Function to update an account
export const updateAccount = mutation({
  args: {
    id: v.id("accounts"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    balance: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify account exists
    const account = await ctx.db.get(args.id);
    if (!account) {
      throw new Error("Account not found");
    }

    // Verify user has access to this account
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    if (account.userId !== userId) {
      throw new Error("Not authorized to update this account");
    }

    // Update fields if provided
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.type !== undefined) updates.type = args.type;
    if (args.balance !== undefined) updates.balance = args.balance;
    if (args.currency !== undefined) updates.currency = args.currency;

    await ctx.db.patch(args.id, updates);
    return true;
  },
});

// Function to delete an account
export const deleteAccount = mutation({
  args: {
    id: v.id("accounts"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.id);
    if (!account) {
      throw new Error("Account not found");
    }

    // Verify user has access to this account
    if (account.userId !== args.userId) {
      throw new Error("Not authorized to delete this account");
    }

    // Delete the account
    await ctx.db.delete(args.id);
    return true;
  },
});

// Function to get a single account by ID
export const getAccountById = query({
  args: {
    id: v.id("accounts"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the account
    const account = await ctx.db.get(args.id);

    // Verify the account exists and user has access to it
    if (!account) {
      return null;
    }

    if (account.userId !== args.userId) {
      return null; // Don't throw error, just return null for security
    }

    return account;
  },
}); 