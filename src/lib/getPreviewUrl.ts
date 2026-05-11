import { supabase } from "@/integrations/supabase/client";

export interface StorageObjectInfo {
  bucket: string;
  path: string;
}

/**
 * Resolve a preview-friendly URL for a CV file.
 * Files in the private `cvs-bucket` are converted to a 1-hour signed URL so
 * that the Google Docs viewer (and direct downloads) can actually fetch them.
 * Public URLs are returned as-is.
 */
const SIGNED_URL_BUCKETS = ["cvs-bucket", "Update cv's"];

export function getStorageObjectInfo(fileUrl: string): StorageObjectInfo | null {
  if (!fileUrl) return null;

  let pathname = fileUrl;
  try {
    pathname = new URL(fileUrl).pathname;
  } catch {
    /* support already-relative storage paths */
  }

  const marker = "/storage/v1/object/";
  const markerIndex = pathname.indexOf(marker);
  if (markerIndex === -1) return null;

  const objectPath = pathname.slice(markerIndex + marker.length);
  const segments = objectPath.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const visibilitySegment = segments[0];
  const hasVisibilityPrefix = visibilitySegment === "public" || visibilitySegment === "sign";
  const bucketIndex = hasVisibilityPrefix ? 1 : 0;
  const pathIndex = bucketIndex + 1;
  if (segments.length <= pathIndex) return null;

  const bucket = decodeURIComponent(segments[bucketIndex]);
  const path = segments.slice(pathIndex).map((segment) => decodeURIComponent(segment)).join("/");
  return bucket && path ? { bucket, path } : null;
}

export async function getPreviewUrl(fileUrl: string): Promise<string> {
  if (!fileUrl) return "";
  const storageObject = getStorageObjectInfo(fileUrl);
  if (storageObject && SIGNED_URL_BUCKETS.includes(storageObject.bucket)) {
    try {
      const { data } = await supabase.storage.from(storageObject.bucket).createSignedUrl(storageObject.path, 3600);
      if (data?.signedUrl) return data.signedUrl;
    } catch {
      /* fall through */
    }
  }
  return fileUrl;
}

/** Build the Google Docs viewer URL for a (publicly accessible) file URL. */
export function googleViewerUrl(url: string) {
  return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
}
