/**
 * Download a file from a URL by fetching it as a blob first.
 * This works for cross-origin URLs where the <a download> attribute is ignored.
 */
export async function downloadFile(url: string, fileName: string): Promise<void> {
  // Ensure the file always downloads with a .pdf extension
  if (!fileName.toLowerCase().endsWith(".pdf")) {
    fileName = fileName.replace(/\.[^.]+$/, "") + ".pdf";
    if (fileName === ".pdf") fileName = "document.pdf";
  }
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(blobUrl);
  } catch {
    // Fallback: open in new tab
    window.open(url, "_blank");
  }
}
