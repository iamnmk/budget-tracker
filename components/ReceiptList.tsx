import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";

export default function ReceiptList() {
  const receipts = useQuery(api.receipts.getReceipts);

  if (!receipts) {
    return (
      <div className="w-full p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading receipts...</p>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="w-full p-8 text-center border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-600">No receipts have been uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Your Receipts</h2>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {receipts.map((receipt: Doc<"receipts">) => (
            <li key={receipt._id} className="hover:bg-gray-50">
              <Link
                href={`/receipt/${receipt._id}`}
                className="flex items-center p-4"
              >
                <div className="flex-shrink-0 mr-4">
                  <svg
                    className="h-9 w-9 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.5,2H6A2,2,0,0,0,4,4V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V7.5ZM14,15h1a1,1,0,0,1,0,2H14a1,1,0,0,1,0-2Zm-6,0h3a1,1,0,0,1,0,2H8a1,1,0,0,1,0-2Zm8-3H8a1,1,0,0,1,0-2h8a1,1,0,0,1,0,2ZM15,7h2.5L15,4.5Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {receipt.fileDisplayName || receipt.fileName}
                  </p>
                  <div className="flex text-xs text-gray-500 mt-1">
                    <p>
                      Uploaded: {new Date(receipt.uploadedAt).toLocaleString()}
                    </p>
                    <p className="ml-4">Size: {formatFileSize(receipt.size)}</p>
                    <span
                      className={`ml-4 px-2 py-0.5 rounded-full text-xs ${
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
                </div>
                <div className="flex-shrink-0 ml-2">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            </li>
          ))}
        </ul>
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
