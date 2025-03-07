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
      // Initialize extracted data fields as null
      merchantName: null,
      merchantAddress: null,
      merchantContact: null,
      transactionDate: null,
      transactionAmount: null,
      currency: null,
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

// Update a receipt with extracted data
export const updateReceiptWithExtractedData = mutation({
  args: {
    id: v.id("receipts"),
    merchantName: v.string(),
    merchantAddress: v.string(),
    merchantContact: v.string(),
    transactionDate: v.string(),
    transactionAmount: v.string(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify the receipt exists
    const receipt = await ctx.db.get(args.id);
    if (!receipt) {
      throw new Error("Receipt not found");
    }

    // Update the receipt with the extracted data
    await ctx.db.patch(args.id, {
      merchantName: args.merchantName,
      merchantAddress: args.merchantAddress,
      merchantContact: args.merchantContact,
      transactionDate: args.transactionDate,
      transactionAmount: args.transactionAmount,
      currency: args.currency,
      status: "processed", // Mark as processed now that we have extracted data
    });

    return true;
  },
});
