import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, bucket, filePath } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let fileData: Blob;
    let fileName = "";

    if (bucket && filePath) {
      // Download from Supabase storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath);
      if (error) throw new Error(`Storage download error: ${error.message}`);
      fileData = data;
      fileName = filePath.split("/").pop() || filePath;
    } else if (fileUrl) {
      // Download from external URL (e.g. updated CV URLs, signed URLs)
      const resp = await fetch(fileUrl);
      if (!resp.ok) throw new Error(`Failed to fetch file: ${resp.status}`);
      fileData = await resp.blob();
      // Try to extract filename from URL
      try {
        const urlObj = new URL(fileUrl);
        fileName = decodeURIComponent(urlObj.pathname.split("/").pop() || "file");
      } catch {
        fileName = "file";
      }
    } else {
      throw new Error("Either fileUrl or (bucket + filePath) is required");
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const lowerName = fileName.toLowerCase();

    let extractedText = "";

    if (lowerName.endsWith(".docx")) {
      // Parse DOCX using mammoth
      const mammoth = await import("npm:mammoth@1.8.0");
      const result = await mammoth.default.extractRawText({
        buffer: bytes,
      });
      extractedText = result.value;
    } else if (lowerName.endsWith(".pdf")) {
      // Parse PDF using pdf-parse
      const pdfParse = (await import("npm:pdf-parse@1.1.1")).default;
      const result = await pdfParse(Buffer.from(arrayBuffer));
      extractedText = result.text;
    } else if (lowerName.endsWith(".txt") || lowerName.endsWith(".text")) {
      extractedText = new TextDecoder().decode(bytes);
    } else {
      // Fallback: try as text
      try {
        extractedText = new TextDecoder().decode(bytes);
      } catch {
        throw new Error(`Unsupported file type: ${fileName}. Supported: .pdf, .docx, .txt`);
      }
    }

    return new Response(
      JSON.stringify({ text: extractedText, fileName }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    console.error("parse-cv error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
