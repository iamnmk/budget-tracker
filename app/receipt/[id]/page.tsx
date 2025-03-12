"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getFileDownloadUrl } from "@/actions/getFileDownloadUrl";
import { updateReceiptStatus } from "@/actions/updateReceiptStatus";
import { deleteReceipt } from "@/actions/deleteReceipt";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default function ReceiptPage() {
  const router = useRouter();
  const [receiptId, setReceiptId] = useState<Id<"receipts"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(false);
  const [isLoadingDownload, setIsLoadingDownload] = useState(false);
  const params = useParams<{ id: string }>();

  // Convert the URL string ID to a Convex ID
  useEffect(() => {
    try {
      const id = params.id as Id<"receipts">;
      setReceiptId(id);
    } catch (error) {
      console.error("Invalid receipt ID:", error);
      router.push("/");
    }
  }, [params.id, router]);

  // Fetch receipt details
  const receipt = useQuery(
    api.receipts.getReceiptById,
    receiptId ? { id: receiptId } : "skip",
  );

  // Get file download URL (for the view button)
  const fileId = receipt?.fileId;
  const downloadUrl = useQuery(
    api.receipts.getReceiptDownloadUrl,
    fileId ? { fileId } : "skip",
  );

  // Function to handle downloading the PDF using server action
  const handleDownload = async () => {
    if (!receipt || !receipt.fileId) return;

    try {
      setIsLoadingDownload(true);

      // Call the server action to get download URL
      const result = await getFileDownloadUrl(receipt.fileId);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      if (result.downloadUrl) {
        link.href = result.downloadUrl;
        link.download = receipt.fileName || "receipt.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error("No download URL found");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download the file. Please try again.");
    } finally {
      setIsLoadingDownload(false);
    }
  };

  // Function to mark receipt as processed using server action
  const handleMarkAsProcessed = async () => {
    if (!receiptId || !receipt) return;

    try {
      setProcessingStatus(true);

      // Call the server action to update status
      const newStatus =
        receipt.status === "processed" ? "pending" : "processed";
      const result = await updateReceiptStatus(receiptId, newStatus);

      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setProcessingStatus(false);
    }
  };

  // Function to delete receipt using server action
  const handleDeleteReceipt = async () => {
    if (!receiptId) return;

    if (
      window.confirm(
        "Are you sure you want to delete this receipt? This action cannot be undone.",
      )
    ) {
      try {
        setIsDeleting(true);

        // Call the server action to delete the receipt
        const result = await deleteReceipt(receiptId);

        if (!result.success) {
          throw new Error(result.error);
        }

        router.push("/");
      } catch (error) {
        console.error("Error deleting receipt:", error);
        alert("Failed to delete the receipt. Please try again.");
        setIsDeleting(false);
      }
    }
  };

  if (!receiptId) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <p>Invalid receipt ID. Redirecting...</p>
        </div>
      </div>
    );
  }

  if (receipt === undefined) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-2">Loading receipt details...</p>
        </div>
      </div>
    );
  }

  if (receipt === null) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Receipt Not Found</h1>
          <p className="mb-6">
            The receipt you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            href="/"
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Format upload date
  const uploadDate = new Date(receipt.uploadedAt).toLocaleString();

  // Check if receipt has extracted data
  const hasExtractedData = !!(
    receipt.merchantName ||
    receipt.merchantAddress ||
    receipt.transactionDate ||
    receipt.transactionAmount
  );

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-6">
          <Link
            href="/"
            className="text-blue-500 hover:underline flex items-center"
          >
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Receipts
          </Link>
        </nav>

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {receipt.fileDisplayName || receipt.fileName}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  receipt.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : receipt.status === "processed"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {receipt.status.charAt(0).toUpperCase() +
                  receipt.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    File Information
                  </h3>
                  <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Uploaded</p>
                        <p className="font-medium">{uploadDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Size</p>
                        <p className="font-medium">
                          {formatFileSize(receipt.size)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="font-medium">{receipt.mimeType}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">ID</p>
                        <p className="font-medium truncate" title={receipt._id}>
                          {receipt._id.slice(0, 10)}...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <svg
                    className="h-16 w-16 text-red-500 mx-auto"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.5,2H6A2,2,0,0,0,4,4V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V7.5ZM14,15h1a1,1,0,0,1,0,2H14a1,1,0,0,1,0-2Zm-6,0h3a1,1,0,0,1,0,2H8a1,1,0,0,1,0-2Zm8-3H8a1,1,0,0,1,0-2h8a1,1,0,0,1,0,2ZM15,7h2.5L15,4.5Z" />
                  </svg>
                  <p className="mt-4 text-sm text-gray-500">PDF Preview</p>
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 inline-block"
                    >
                      View PDF
                    </a>
                  )}
                </div>
              </div>
            </div>

            {hasExtractedData && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Receipt Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Merchant Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Merchant Information
                    </h4>
                    <div className="space-y-2">
                      {receipt.merchantName && (
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">{receipt.merchantName}</p>
                        </div>
                      )}
                      {receipt.merchantAddress && (
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium">
                            {receipt.merchantAddress}
                          </p>
                        </div>
                      )}
                      {receipt.merchantContact && (
                        <div>
                          <p className="text-sm text-gray-500">Contact</p>
                          <p className="font-medium">
                            {receipt.merchantContact}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transaction Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Transaction Details
                    </h4>
                    <div className="space-y-2">
                      {receipt.transactionDate && (
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">
                            {receipt.transactionDate}
                          </p>
                        </div>
                      )}
                      {receipt.transactionAmount && (
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="font-medium">
                            {receipt.transactionAmount} {receipt.currency || ""}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Receipt Summary */}
                {receipt.receiptSummary && (
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Receipt Summary
                    </h4>
                    <p className="text-sm whitespace-pre-line">
                      {receipt.receiptSummary}
                    </p>
                  </div>
                )}

                {/* Items Section */}
                {receipt.items && receipt.items.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Items ({receipt.items.length})
                    </h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {receipt.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {item.name}
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>
                                {formatCurrency(
                                  item.unitPrice,
                                  receipt.currency,
                                )}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(
                                  item.totalPrice,
                                  receipt.currency,
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={3} className="text-right">
                              Total
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(
                                receipt.items.reduce(
                                  (sum, item) => sum + item.totalPrice,
                                  0,
                                ),
                                receipt.currency,
                              )}
                            </TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 border-t pt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">
                Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  className={`px-4 py-2 border rounded text-sm ${
                    processingStatus
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : receipt.status === "processed"
                        ? "bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100"
                        : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                  }`}
                  onClick={handleMarkAsProcessed}
                  disabled={processingStatus}
                >
                  {processingStatus
                    ? "Updating..."
                    : receipt.status === "processed"
                      ? "Mark as Pending"
                      : "Mark as Processed"}
                </button>
                <button
                  className={`px-4 py-2 bg-white border border-gray-300 rounded text-sm text-gray-700 ${
                    isLoadingDownload
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={handleDownload}
                  disabled={isLoadingDownload || !fileId}
                >
                  {isLoadingDownload ? "Downloading..." : "Download PDF"}
                </button>
                <button
                  className={`px-4 py-2 rounded text-sm ${
                    isDeleting
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
                  }`}
                  onClick={handleDeleteReceipt}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Receipt"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Helper function to format currency
function formatCurrency(amount: number, currency: string = ""): string {
  return `${amount.toFixed(2)}${currency ? ` ${currency}` : ""}`;
}
