import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Function to generate a Convex upload URL for the client
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // Generate a URL that the client can use to upload a file
    return await ctx.storage.generateUploadUrl();
  },
});

// Store a receipt file and add it to the database
export const storeReceipt = mutation({
  args: {
    fileId: v.id("_storage"),
    fileName: v.string(),
    size: v.number(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    // Save the receipt to the database
    const receiptId = await ctx.db.insert("receipts", {
      fileName: args.fileName,
      fileId: args.fileId,
      uploadedAt: Date.now(),
      size: args.size,
      mimeType: args.mimeType,
      status: "pending",
    });

    return receiptId;
  },
});

// Function to get all receipts
export const getReceipts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("receipts").order("desc").collect();
  },
});

// Function to get a single receipt by ID
export const getReceiptById = query({
  args: {
    id: v.id("receipts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Generate a URL to download a receipt file
export const getReceiptDownloadUrl = query({
  args: {
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Get a temporary URL that can be used to download the file
    return await ctx.storage.getUrl(args.fileId);
  },
});

// Update the status of a receipt
export const updateReceiptStatus = mutation({
  args: {
    id: v.id("receipts"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
    });
    return true;
  },
});

// Delete a receipt and its file
export const deleteReceipt = mutation({
  args: {
    id: v.id("receipts"),
  },
  handler: async (ctx, args) => {
    const receipt = await ctx.db.get(args.id);
    if (!receipt) {
      throw new Error("Receipt not found");
    }

    // Delete the file from storage
    await ctx.storage.delete(receipt.fileId);

    // Delete the receipt record
    await ctx.db.delete(args.id);

    return true;
  },
});
