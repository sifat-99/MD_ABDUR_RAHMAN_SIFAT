import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Image uploader route for portfolio assets
  imageUploader: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // In production, we can verify admin session here if needed
      return { uploadedBy: "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl || file.url, name: file.name, size: file.size };
    }),

  // Media library uploader allowing up to 10 images at once
  mediaLibraryUploader: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 10,
    },
  })
    .middleware(async () => {
      return { uploadedBy: "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl || file.url, name: file.name, size: file.size };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
