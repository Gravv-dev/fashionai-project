/**
 * FashionTech AI - Storage Setup
 *
 * Creates the required Supabase Storage buckets.
 * Call this function during application initialization or Supabase setup.
 *
 * Buckets created:
 * - garment-references: Tech pack garment reference images (private)
 * - flat-sketches: Flat sketch source images (private)
 * - line-sheet-assets: Line sheet product images (private)
 *
 * All buckets are private by default. Access is controlled via RLS policies
-- defined in supabase/migrations/002_storage_integration.sql.
 */

import { createClient } from "@/lib/supabase";

const REQUIRED_BUCKETS: BucketConfig[] = [
  { id: "garment-references", name: "garment-references", public: false },
  { id: "flat-sketches", name: "flat-sketches", public: false },
  { id: "line-sheet-assets", name: "line-sheet-assets", public: false },
];

interface BucketConfig {
  id: string;
  name: string;
  public: boolean;
}

/**
 * Creates all required storage buckets.
 * Skips buckets that already exist.
 * Returns an object with created and skipped bucket names.
 */
export async function createStorageBuckets(): Promise<{
  created: string[];
  skipped: string[];
  errors: Array<{ bucket: string; message: string }>;
}> {
  const supabase = createClient();
  if (!supabase) {
    return {
      created: [],
      skipped: [],
      errors: [
        {
          bucket: "all",
          message: "Supabase not configured",
        },
      ],
    };
  }

  const created: string[] = [];
  const skipped: string[] = [];
  const errors: Array<{ bucket: string; message: string }> = [];

  for (const bucket of REQUIRED_BUCKETS) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      });

      if (error) {
        // Bucket already exists - this is expected on re-runs
        if (error.message.includes("already exists") || error.status === 409) {
          skipped.push(bucket.name);
        } else {
          errors.push({ bucket: bucket.name, message: error.message });
        }
      } else {
        created.push(bucket.name);
      }
    } catch (err) {
      errors.push({
        bucket: bucket.name,
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return { created, skipped, errors };
}

/**
 * Returns the list of required bucket configurations.
 */
export function getRequiredBuckets(): BucketConfig[] {
  return REQUIRED_BUCKETS;
}
