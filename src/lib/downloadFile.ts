import { getPreviewUrl } from "./getPreviewUrl";

/**
 * Download a file from a URL by fetching it as a blob first.
 * Resolves private storage URLs to short-lived signed URLs automatically.
 */
export async function downloadFile(url: string, fileName: string): Promise<void> {
  if (!fileName.toLowerCase().endsWith(".pdf")) {
    fileName = fileName.replace(/\.[^.]+$/, "") + ".pdf";
    if (fileName === ".pdf") fileName = "document.pdf";
  }
  const resolved = await getPreviewUrl(url).catch(() => url);
  try {
    const response = await fetch(resolved);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(resolved, "_blank");
  }
}

