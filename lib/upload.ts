import { uploadFiles } from "./uploadthing";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface UploadResult {
  url: string;
  source: "uploadthing" | "firebase" | "local";
  fileName?: string;
  size?: number;
}

/**
 * Universal image uploader:
 * 1. UploadThing (Fastest CDN, active via UPLOADTHING_TOKEN in .env.local)
 * 2. Firebase Storage (if bucket active)
 * 3. Local API route (/api/upload -> public/uploads)
 * Automatically records uploaded assets to the Media Library.
 */
export async function uploadImage(
  file: File,
  folder = "portfolio",
  onProgress?: UploadProgressCallback
): Promise<string> {
  let uploadedUrl = "";
  let uploadSource: "uploadthing" | "firebase" | "local" = "local";

  // Strategy 1: UploadThing (Primary Global CDN)
  try {
    if (onProgress) onProgress(20);
    const res = await uploadFiles("imageUploader", {
      files: [file],
      onUploadProgress: ({ progress }) => {
        if (onProgress) onProgress(Math.min(90, Math.round(progress)));
      },
    });

    if (res && res.length > 0 && (res[0].ufsUrl || res[0].url)) {
      uploadedUrl = res[0].ufsUrl || res[0].url;
      uploadSource = "uploadthing";
    }
  } catch (utErr) {
    console.warn("[Upload] UploadThing direct attempt failed, trying fallback:", utErr);
  }

  // Strategy 2: Firebase Storage (if available and UploadThing failed)
  if (!uploadedUrl && storage) {
    try {
      if (onProgress) onProgress(30);
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${folder}/${Date.now()}_${cleanName}`;
      const fileRef = storageRef(storage, fileName);

      uploadedUrl = await new Promise<string>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(fileRef, file, {
          contentType: file.type || "image/png",
        });

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(Math.round(prog));
          },
          (error) => reject(error),
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          }
        );
      });
      uploadSource = "firebase";
    } catch (fbErr) {
      console.warn("[Upload] Firebase Storage attempt failed, falling back to local /api/upload:", fbErr);
    }
  }

  // Strategy 3: Server API Route (/api/upload -> /public/uploads/...)
  if (!uploadedUrl) {
    if (onProgress) onProgress(50);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to upload image.");
    }

    const data = await res.json();
    uploadedUrl = data.url;
    uploadSource = "local";
  }

  if (onProgress) onProgress(100);

  // Register in Media Library in background
  try {
    fetch("/api/studio/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: uploadedUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        folder,
        source: uploadSource,
      }),
    }).catch(() => {});
  } catch {
    // Ignore background registration error
  }

  return uploadedUrl;
}
