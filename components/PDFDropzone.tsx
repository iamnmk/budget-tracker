import React, { useState, useCallback } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { uploadPDF } from "@/app/actions";

interface PDFDropzoneProps {
  onUploadComplete?: () => void;
}

export default function PDFDropzone({ onUploadComplete }: PDFDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const pdfFiles = fileArray.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf"),
    );

    if (pdfFiles.length === 0) {
      alert("Please drop only PDF files.");
      return;
    }

    setIsUploading(true);

    try {
      for (const file of pdfFiles) {
        // Create a FormData object to use with the server action
        const formData = new FormData();
        formData.append("file", file);

        // Call the server action to handle the upload
        const result = await uploadPDF(formData);

        if (!result.success) {
          throw new Error(result.error);
        }

        setUploadedFiles((prev) => [...prev, file.name]);
      }

      // Clear uploaded files list after 5 seconds
      setTimeout(() => {
        setUploadedFiles([]);
      }, 5000);

      // Call the callback to notify parent component that upload is complete
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert(
        `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Set up sensors for drag detection
  const sensors = useSensors(useSensor(PointerSensor));

  // Handle file drop via native browser events for better PDF support
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, []);

  return (
    <DndContext sensors={sensors}>
      <div className="w-full max-w-md mx-auto">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDraggingOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <p>Uploading...</p>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Drag and drop PDF files here, or click to select files
              </p>
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "application/pdf,.pdf";
                  input.multiple = true;
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) {
                      handleUpload(files);
                    }
                  };
                  input.click();
                }}
              >
                Select files
              </button>
            </>
          )}
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium">Uploaded files:</h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-1">
              {uploadedFiles.map((fileName, i) => (
                <li key={i} className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {fileName}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DndContext>
  );
}
