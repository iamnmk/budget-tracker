"use server";

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

// Create a Convex HTTP client for server-side actions
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Server action to upload a PDF file to Convex storage
 */
export async function uploadPDF(formData: FormData) {
  try {
    // Get the file from the form data
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    if (
      !file.type.includes("pdf") &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return { success: false, error: "Only PDF files are allowed" };
    }

    // Get upload URL from Convex
    const uploadUrl = await convex.mutation(api.receipts.generateUploadUrl, {});

    // Convert file to arrayBuffer for fetch API
    const arrayBuffer = await file.arrayBuffer();

    // Upload the file to Convex storage
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
      },
      body: new Uint8Array(arrayBuffer),
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
    }

    // Get storage ID from the response
    const { storageId } = await uploadResponse.json();

    // Add receipt to the database
    const receiptId = await convex.mutation(api.receipts.storeReceipt, {
      fileId: storageId,
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
    });

    return {
      success: true,
      data: {
        receiptId,
        fileName: file.name,
      },
    };
  } catch (error) {
    console.error("Server action upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Server action to get a download URL for a file in Convex storage
 */
export async function getFileDownloadUrl(fileId: Id<"_storage"> | string) {
  try {
    // Get download URL from Convex
    const downloadUrl = await convex.query(api.receipts.getReceiptDownloadUrl, {
      fileId: fileId as Id<"_storage">,
    });

    if (!downloadUrl) {
      throw new Error("Could not generate download URL");
    }

    return {
      success: true,
      downloadUrl,
    };
  } catch (error) {
    console.error("Error generating download URL:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Server action to update receipt status
 */
export async function updateReceiptStatus(receiptId: string, status: string) {
  try {
    await convex.mutation(api.receipts.updateReceiptStatus, {
      id: receiptId as Id<"receipts">,
      status,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating receipt status:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Server action to delete a receipt
 */
export async function deleteReceipt(receiptId: string) {
  try {
    await convex.mutation(api.receipts.deleteReceipt, {
      id: receiptId as Id<"receipts">,
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting receipt:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
