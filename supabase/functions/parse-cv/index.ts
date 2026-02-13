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
    const { fileUrl, bucket, filePath, fileName: providedFileName } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let fileData: Blob;
    let fileName = providedFileName || "";

    if (bucket && filePath) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath);
      if (error) throw new Error(`Storage download error: ${error.message}`);
      fileData = data;
      if (!fileName) fileName = filePath.split("/").pop() || filePath;
    } else if (fileUrl) {
      const resp = await fetch(fileUrl);
      if (!resp.ok) throw new Error(`Failed to fetch file: ${resp.status}`);
      fileData = await resp.blob();
      if (!fileName) {
        try {
          const urlObj = new URL(fileUrl);
          // Remove query params and get last path segment
          fileName = decodeURIComponent(urlObj.pathname.split("/").pop() || "file");
        } catch {
          fileName = "file";
        }
      }
    } else {
      throw new Error("Either fileUrl or (bucket + filePath) is required");
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const lowerName = fileName.toLowerCase();

    console.log(`parse-cv: fileName="${fileName}", size=${bytes.length} bytes`);

    // Detect file type from content (magic bytes) if extension is ambiguous
    const isDocx = lowerName.endsWith(".docx") || (bytes[0] === 0x50 && bytes[1] === 0x4B); // PK zip header = docx
    const isPdf = lowerName.endsWith(".pdf") || (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46); // %PDF

    let extractedText = "";

    if (isPdf) {
      console.log("parse-cv: Detected PDF format");
      const pdfParse = (await import("npm:pdf-parse@1.1.1")).default;
      const result = await pdfParse(Buffer.from(arrayBuffer));
      extractedText = result.text;
    } else if (isDocx) {
      console.log("parse-cv: Detected DOCX format");
      const mammoth = await import("npm:mammoth@1.8.0");
      const result = await mammoth.default.extractRawText({ buffer: bytes });
      extractedText = result.value;
    } else if (lowerName.endsWith(".txt") || lowerName.endsWith(".text")) {
      extractedText = new TextDecoder().decode(bytes);
    } else {
      throw new Error(`Unsupported or undetectable file type: "${fileName}". Pass fileName parameter with .pdf, .docx, or .txt extension, or ensure the file has valid PDF/DOCX magic bytes.`);
    }

    console.log(`parse-cv: Extracted ${extractedText.length} characters`);

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
