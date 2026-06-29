import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";

// --- CONSTANTS ---
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAIN_IMAGE_OPTIONS = {
  maxSizeMB: 0.2,
  maxWidthOrHeight: 1200,
  fileType: "image/webp",
  useWebWorker: true,
};
const THUMBNAIL_OPTIONS = {
  maxSizeMB: 0.05,
  maxWidthOrHeight: 400,
  fileType: "image/webp",
  useWebWorker: true,
};

// --- UTILITIES ---

function getFormattedDate() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
}

const generateId = () => 
  crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).substring(2)}`;

function validateFiles(files) {
  if (!files || files.length === 0) {
    throw new Error("No files provided for upload.");
  }
  const validFiles = Array.from(files);
  for (const file of validFiles) {
    if (!(file instanceof File)) {
      throw new Error(`Provided item is not a valid File object.`);
    }
    if (!file.type.startsWith("image/")) {
      throw new Error(`File ${file.name} is not an image.`);
    }
    if (file.size === 0) {
      throw new Error(`File ${file.name} is empty (0 bytes).`);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File ${file.name} exceeds the 20MB limit.`);
    }
  }
  return validFiles;
}

/**
 * Uploads a file safely. Instead of mutating a shared state array during execution,
 * it returns the ref upon success so the parent can track it reliably.
 */
async function uploadSingleFile(file, path) {
  const storageRef = ref(storage, path);
  
  // Pass explicit metadata to guarantee proper content-type tracking in Firebase
  const metadata = { contentType: "image/webp" };
  
  await uploadBytes(storageRef, file, metadata);
  const url = await getDownloadURL(storageRef);
  
  return { url, storageRef };
}

async function rollbackUploads(uploadedRefs) {
  if (!uploadedRefs || uploadedRefs.length === 0) return;
  
  const results = await Promise.allSettled(
    uploadedRefs.map((storageRef) => deleteObject(storageRef))
  );
  
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Failed to delete orphaned file: ${uploadedRefs[index].fullPath}`, result.reason);
    }
  });
}

// --- MAIN EXPORTS ---

/**
 * Compresses and uploads multiple product images and a thumbnail in parallel.
 * Implements a fail-fast Promise.all upload with strict rollback mechanisms.
 * @param {File[]} files - Array of image files
 * @param {string} userId - The ID of the uploading user
 * @returns {Promise<{ imageUrls: string[], thumbnailUrl: string }>} 
 */
export async function uploadImages(files, userId) {
  if (!userId) throw new Error("User ID is required.");
  
  const validFiles = validateFiles(files);
  if (validFiles.length > 6) {
    throw new Error("Maximum 6 images are allowed.");
  }
  
  const dateStr = getFormattedDate();
  let uploadedRefs = []; 
  
  if (import.meta.env.DEV) console.time("ImageUploadProcess");
  
  try {
    const imageCompression = (await import("browser-image-compression")).default;

    // 1. Parallel Compression
    const compressPromises = validFiles.map((file) => imageCompression(file, MAIN_IMAGE_OPTIONS));
    const thumbPromise = imageCompression(validFiles[0], THUMBNAIL_OPTIONS);
    
    const compressionResults = await Promise.allSettled([...compressPromises, thumbPromise]);

    const compressedFiles = [];
    let compressedThumb = null;
    const failedCompressions = [];

    compressionResults.forEach((result, index) => {
      const isThumbnail = index === compressionResults.length - 1;
      if (result.status === "fulfilled") {
        if (isThumbnail) compressedThumb = result.value;
        else compressedFiles.push(result.value);
      } else {
        const failedFileName = isThumbnail ? `${validFiles[0].name} (Thumb)` : validFiles[index].name;
        const errorMsg = result.reason?.message || result.reason;
        failedCompressions.push(`${failedFileName}: ${errorMsg}`);
      }
    });

    if (failedCompressions.length > 0) {
      throw new Error(`Compression failed: ${failedCompressions.join(" | ")}`);
    }

    // 2. Parallel Uploads via Promise.allSettled to eliminate race conditions during rollbacks
    const uploadTasks = compressedFiles.map((file) => {
      const path = `productImages/${userId}/${dateStr}/${generateId()}.webp`;
      return uploadSingleFile(file, path);
    });

    const thumbPath = `productThumbnails/${userId}/${dateStr}/${generateId()}-thumb.webp`;
    uploadTasks.push(uploadSingleFile(compressedThumb, thumbPath));

    const uploadResults = await Promise.allSettled(uploadTasks);

    const successfulUploads = [];
    const failedUploads = [];

    uploadResults.forEach((result) => {
      if (result.status === "fulfilled") {
        successfulUploads.push(result.value);
      } else {
        failedUploads.push(result.reason?.message || result.reason);
      }
    });

    // Extract the storage references safely for tracking
    uploadedRefs = successfulUploads.map(item => item.storageRef);

    // If any uploads failed, trigger a complete rollback of successful transfers
    if (failedUploads.length > 0) {
      throw new Error(`Upload failed: ${failedUploads.join(" | ")}`);
    }

    // 3. Data Extraction
    const thumbnailResult = successfulUploads.at(-1);
    const imageUrls = successfulUploads.slice(0, -1).map(res => res.url);
    const thumbnailUrl = thumbnailResult.url;

    if (import.meta.env.DEV) console.timeEnd("ImageUploadProcess");

    return { imageUrls, thumbnailUrl };
    
  } catch (error) {
    console.error("Upload process failed, initiating rollback...", error);
    
    // Will clean up exactly what succeeded up to the point of failure
    await rollbackUploads(uploadedRefs);
    
    if (import.meta.env.DEV) console.timeEnd("ImageUploadProcess"); 
    throw error; 
  }
}

/**
 * Deletes product images and thumbnail from Firebase Storage.
 *
 * @param {string[]} imageUrls
 * @param {string|null} thumbnailUrl
 */
export async function deleteImages(imageUrls = [], thumbnailUrl = null) {
  const deleteTasks = [];

  // Delete all main images
  if (Array.isArray(imageUrls)) {
    imageUrls.forEach((url) => {
      try {
        deleteTasks.push(deleteObject(ref(storage, url)));
      } catch (err) {
        console.warn("Invalid image URL:", url);
      }
    });
  }

  // Delete thumbnail
  if (thumbnailUrl) {
    try {
      deleteTasks.push(deleteObject(ref(storage, thumbnailUrl)));
    } catch (err) {
      console.warn("Invalid thumbnail URL:", thumbnailUrl);
    }
  }

  // Delete everything in parallel
  const results = await Promise.allSettled(deleteTasks);

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.warn(
        `Failed deleting file ${index + 1}:`,
        result.reason
      );
    }
  });
}