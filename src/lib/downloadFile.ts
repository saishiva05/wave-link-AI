import { getPreviewUrl, getStorageObjectInfo, normalizeResumeFileName } from "./getPreviewUrl";
import { supabase } from "@/integrations/supabase/client";

/**
 * Download a file from a URL by fetching it as a blob first.
 * Resolves private storage URLs to short-lived signed URLs automatically.
 */
export async function downloadFile(url: string, fileName: string): Promise<void> {
  fileName = normalizeResumeFileName(fileName, "resume.pdf");
  const storageObject = getStorageObjectInfo(url);
  try {
    if (storageObject) {
      const { data, error } = await supabase.storage.from(storageObject.bucket).download(storageObject.path);
      if (error) throw error;
      triggerDownload(data, fileName);
      return;
    }

    const resolved = await getPreviewUrl(url).catch(() => url);
    const response = await fetch(resolved);
    if (!response.ok) throw new Error("Download request failed");
    const blob = await response.blob();
    triggerDownload(blob, fileName);
  } catch {
    const resolved = await getPreviewUrl(url).catch(() => url);
    window.open(resolved, "_blank");
  }
}

function triggerDownload(blob: Blob, fileName: string) {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

