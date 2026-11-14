/**
 * FashionTech AI - Storage Service
 *
 * Handles all Supabase Storage operations:
 * - File upload with validation
 * - Signed URL generation for private file access
 * - File deletion
 * - File listing
 * - File validation (type, size, extension)
 *
 * All buckets are private. Files are accessed via signed URLs.
 * Users can only access files in their own user_id/ folder (enforced by RLS).
 */

import { createClient } from "@/lib/supabase";
import type { ServiceError } from "@/lib/services/base";

// -------------------------------------------------------------------
// Configuration
// -------------------------------------------------------------------

const BUCKETS = {
  GARMENT_REFERENCES: "garment-references",
  FLAT_SKETCHES: "flat-sketches",
  LINE_SHEET_ASSETS: "line-sheet-assets",
} as const;

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface UploadResult {
  path: string;
  url: string; // Signed URL
  bucket: string;
  size: number;
  mimeType: string;
}

// -------------------------------------------------------------------
// File Validation
// -------------------------------------------------------------------

/**
 * Validates a file before upload.
 * Checks MIME type, file extension, and file size.
 */
export function validateFile(file: File): ValidationResult {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP.`,
    };
  }

  // Check file extension
  const fileNameLower = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
    fileNameLower.endsWith(ext)
  );
  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}.`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File too large: ${sizeMB} MB. Maximum: ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Returns the maximum allowed file size in MB.
 */
export function getMaxFileSizeMB(): number {
  return MAX_FILE_SIZE_MB;
}

/**
 * Returns the list of allowed MIME types.
 */
export function getAllowedMimeTypes(): string[] {
  return [...ALLOWED_MIME_TYPES];
}

// -------------------------------------------------------------------
// Storage Path Helpers
// -------------------------------------------------------------------

/**
 * Generates a storage path following the pattern:
 * {user_id}/{project_id}/{filename}
 */
export function generateStoragePath(
  userId: string,
  projectId: string,
  fileName: string
): string {
  // Sanitize filename: remove special characters, keep alphanumeric, dots, dashes, underscores
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  return `${userId}/${projectId}/${timestamp}_${sanitizedName}`;
}

/**
 * Extracts the user_id from a storage path.
 */
export function extractUserIdFromPath(path: string): string | null {
  const parts = path.split("/");
  return parts.length >= 1 ? parts[0] : null;
}

// -------------------------------------------------------------------
// Storage Service Functions
// -------------------------------------------------------------------

type SupabaseClient = ReturnType<typeof createClient>;

async function getClient(): Promise<SupabaseClient | null> {
  return createClient();
}

function errorResult(message: string, code?: string, details?: unknown) {
  return {
    data: null,
    error: { message, code, details },
    success: false,
  } as const;
}

function successResult<T>(data: T) {
  return { data, error: null, success: true } as const;
}

/**
 * Uploads a file to Supabase Storage.
 *
 * @param bucket - Storage bucket ID
 * @param file - File to upload
 * @param userId - Authenticated user ID (for path prefix and RLS)
 * @param projectId - Project ID (for path prefix)
 * @returns Upload result with storage path and signed URL
 */
export async function uploadFile(
  bucket: string,
  file: File,
  userId: string,
  projectId: string
) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  // Validate file before upload
  const validation = validateFile(file);
  if (!validation.valid) {
    return errorResult(validation.error || "Invalid file", "validation_error");
  }

  const path = generateStoragePath(userId, projectId, file.name);

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      return errorResult(
        error instanceof Error ? error.message : "Upload failed",
        "supabase_error",
        error
      );
    }

    const uploadPath = data.path;
    if (!uploadPath) {
      return errorResult(
        "Upload returned no path",
        "supabase_error",
        data
      );
    }

    // Generate a signed URL for private access (1 hour expiry)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(uploadPath, 3600);

    if (urlError) {
      return errorResult(
        urlError instanceof Error ? urlError.message : "Failed to generate file URL",
        "supabase_error",
        urlError
      );
    }

    return successResult<UploadResult>({
      path: data.path,
      url: urlData.signedUrl,
      bucket,
      size: file.size,
      mimeType: file.type,
    });
  } catch (err) {
    return errorResult(
      err instanceof Error ? err.message : "Unexpected upload error",
      "unexpected_error",
      err
    );
  }
}

/**
 * Generates a signed URL for private file access.
 * URL expires after the specified number of seconds (default: 1 hour).
 *
 * @param bucket - Storage bucket ID
 * @param path - Storage path (from upload result)
 * @param expiresIn - URL expiry in seconds (default: 3600)
 * @returns Signed URL string
 */
export async function getSignedFileUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      return errorResult(
        error instanceof Error ? error.message : "Failed to generate signed URL",
        "supabase_error",
        error
      );
    }

    return successResult({ url: data.signedUrl, path });
  } catch (err) {
    return errorResult(
      err instanceof Error ? err.message : "Unexpected error",
      "unexpected_error",
      err
    );
  }
}

/**
 * Deletes a file from Supabase Storage.
 *
 * @param bucket - Storage bucket ID
 * @param path - Storage path to delete
 */
export async function deleteFile(bucket: string, path: string) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      return errorResult(
        error instanceof Error ? error.message : "Failed to delete file",
        "supabase_error",
        error
      );
    }

    return successResult({ path, bucket, deleted: true });
  } catch (err) {
    return errorResult(
      err instanceof Error ? err.message : "Unexpected delete error",
      "unexpected_error",
      err
    );
  }
}

/**
 * Lists files in a storage folder.
 *
 * @param bucket - Storage bucket ID
 * @param pathPrefix - Folder path prefix (e.g., "user_id/project_id/")
 * @returns List of file objects with name, path, size, etc.
 */
export async function listFiles(
  bucket: string,
  pathPrefix: string = ""
) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(pathPrefix, {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      return errorResult(
        error instanceof Error ? error.message : "Failed to list files",
        "supabase_error",
        error
      );
    }

    return successResult({
      files: data?.map((f) => ({
        name: f.name,
        path: `${pathPrefix}${f.name}`.replace(/\/+/g, "/"),
        size: f.metadata?.size ?? 0,
        mimeType: f.metadata?.mimetype ?? "",
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      })) ?? [],
      bucket,
    });
  } catch (err) {
    return errorResult(
      err instanceof Error ? err.message : "Unexpected list error",
      "unexpected_error",
      err
    );
  }
}

/**
 * Returns bucket configuration for the storage service.
 */
export function getBucketConfig() {
  return BUCKETS;
}

/**
 * Maps a feature type to its storage bucket.
 */
export function getBucketForFeature(
  feature: "tech_pack" | "flat_sketch" | "line_sheet"
): string {
  switch (feature) {
    case "tech_pack":
      return BUCKETS.GARMENT_REFERENCES;
    case "flat_sketch":
      return BUCKETS.FLAT_SKETCHES;
    case "line_sheet":
      return BUCKETS.LINE_SHEET_ASSETS;
    default:
      return BUCKETS.GARMENT_REFERENCES;
  }
}
