"use client";

import { useState } from "react";
import { inngest } from "@/inngest/client";
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

          <div className="mt-10 text-center lg:hidden">
            <h2 className="text-xl font-semibold mb-4">
              Test Inngest Functions
            </h2>
            <button
              onClick={async () => {
                await inngest.send({
                  name: "hello.world",
                  data: {
                    email: "testUser@example.com",
                  },
                });

                await inngest.send({
                  name: "pdf-function/event",
                  data: {
                    url: "https://slicedinvoices.com/pdf/wordpress-pdf-invoice-plugin-sample.pdf",
                  },
                });
                console.log("Hello");
              }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Click me
            </button>
          </div>
        </div>

        <div>
          {/* Using refreshKey to force re-render of the ReceiptList when uploads complete */}
          <ReceiptList key={refreshKey} />
        </div>
      </div>

      <div className="mt-10 text-center hidden lg:block">
        <h2 className="text-xl font-semibold mb-4">Test Inngest Functions</h2>
        <button
          onClick={async () => {
            await inngest.send({
              name: "hello.world",
              data: {
                email: "testUser@example.com",
              },
            });

            await inngest.send({
              name: "pdf-function/event",
              data: {
                url: "https://slicedinvoices.com/pdf/wordpress-pdf-invoice-plugin-sample.pdf",
              },
            });
            console.log("Hello");
          }}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Click me
        </button>
      </div>
    </div>
  );
}

export default Home;

// await inngest.send({
//   name: "hello.world",
//   data: {
//     email: "testUser@example.com",
//   },
// });

// await inngest.send({
//   name: "pdf-function/event",
//   data: {
//     url: "https://slicedinvoices.com/pdf/wordpress-pdf-invoice-plugin-sample.pdf",
//   },
// });
// console.log("Hello");
// }}
