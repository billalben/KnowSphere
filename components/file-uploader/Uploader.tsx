"use client";

import { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { RenderEmptyState, RenderErrorState, RenderImageState, RenderUploadingState } from "./RenderState";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface iUploaderState {
  id: string | null;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
  fileType: "image" | "video";
}

interface UploaderProps {
  onUploadComplete?: (key: string) => void;
}

export function Uploader({ onUploadComplete }: UploaderProps) {
  const [fileState, setFileState] = useState<iUploaderState>({
    error: false,
    file: null,
    id: null,
    uploading: false,
    progress: 0,
    isDeleting: false,
    fileType: "image",
  });

  const uploadFile = useCallback(async (file: File) => {
    setFileState((prev) => ({
      ...prev,
      uploading: true,
      progress: 0,
    }));

    try {
      // get presigned url
      const response = await fetch("/api/s3/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          isImage: true, // TODO: make this dynamic
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const {presignedUrl, key} = await response.json();


      // upload file to s3
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentageCompleted = (event.loaded / event.total) * 100;
            setFileState((prev) => ({
              ...prev,
              progress: Math.round(percentageCompleted),
            }));
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            setFileState((prev) => ({
              ...prev,
              uploading: false,
              progress: 100,
              error: false,
              key,
            }));

            onUploadComplete?.(key);
            toast.success("File uploaded successfully");
            resolve(xhr.response);
          }  else {
            reject(xhr.response);
          }
        };
        xhr.onerror = () => {
          reject(xhr.response);
        };
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      })
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file");

      setFileState((prev) => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: true,
      }));
    } finally {
      setFileState((prev) => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: false,
      }));
    }
  }, [onUploadComplete]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      setFileState({
        file,
        uploading: true,
        progress: 0,
        objectUrl: URL.createObjectURL(file),
        error: false,
        id: uuidv4(),
        isDeleting: false,
        fileType: "image",
      });

      uploadFile(file);
    }
  }, [uploadFile]);

  function rejectefFiles(fileRejection: FileRejection[]) {
    if (fileRejection.length) {
      const tooManyFiles = fileRejection.find(
        (rejection) => rejection.errors[0].code === "too-many-files",
      );

      if (tooManyFiles) {
        toast.error("Too many files selected, max is 1");
      }

      const fileSizeTooBig = fileRejection.find(
        (rejection) => rejection.errors[0].code === "file-too-large",
      );

      if (fileSizeTooBig) {
        toast.error("File too big, max is 3MB");
      }
    }
  }

  function renderContent() {
    if (fileState.uploading) {
      return <RenderUploadingState progress={fileState.progress} />
    }

    if (fileState.error) {
      return <RenderErrorState />
    }

    if (fileState.objectUrl) {
      return <RenderImageState objectUrl={fileState.objectUrl} />
    }

    return <RenderEmptyState isDragActive={isDragActive} />
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    maxSize: 3 * 1024 * 1024, // 3mb
    onDropRejected: rejectefFiles,
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64",
        isDragActive
          ? "border-primary bg-primary/10 border-solid"
          : "border-border hover:border-primary",
      )}
    >
      <CardContent className="flex items-center justify-center h-full w-full">
        <input {...getInputProps()} />

        {renderContent()}
      </CardContent>
    </Card>
  );
}
