import { supabase } from "@/integrations/supabase/client";

/**
 * Resolve a preview-friendly URL for a CV file.
 * Files in the private `cvs-bucket` are converted to a 1-hour signed URL so
 * that the Google Docs viewer (and direct downloads) can actually fetch them.
 * Public URLs are returned as-is.
 */
export async function getPreviewUrl(fileUrl: string): Promise<string> {
  if (!fileUrl) return "";
  const parts = fileUrl.split("/cvs-bucket/");
  if (parts[1]) {
    try {
      const path = decodeURIComponent(parts[1]);
      const { data } = await supabase.storage.from("cvs-bucket").createSignedUrl(path, 3600);
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
