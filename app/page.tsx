"use client";

import { useState } from "react";

import PDFDropzone from "@/components/PDFDropzone";
import ReceiptList from "@/components/ReceiptList";

function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to force a refresh of the receipt list
  const handleUploadComplete = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center">PDF Receipt Uploader</h1>
      <p className="text-center text-gray-600 mb-8">
        Upload your PDF receipts for processing
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <PDFDropzone onUploadComplete={handleUploadComplete} />
        </div>

        <div>
          {/* Using refreshKey to force re-render of the ReceiptList when uploads complete */}
          <ReceiptList key={refreshKey} />
        </div>
      </div>
    </div>
  );
}

export default Home;
