/**
 * Posts to the n8n "update cv" webhook with retries, timeout, and a properly
 * encoded URL. Returns the parsed JSON response.
 */
const WEBHOOK_URL = "https://n8n.srv1340079.hstgr.cloud/webhook/update%20cv";

export interface UpdateCvWebhookOptions {
  timeoutMs?: number;
  retries?: number;
  signal?: AbortSignal;
}

export async function callUpdateCvWebhook(
  payload: Record<string, any>,
  opts: UpdateCvWebhookOptions = {},
): Promise<any> {
  const { timeoutMs = 90_000, retries = 1 } = opts;
  let lastErr: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    if (opts.signal) opts.signal.addEventListener("abort", () => controller.abort());

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.status >= 500 || res.status === 408 || res.status === 429) {
        throw new Error(`AI service returned ${res.status}, retrying...`);
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`AI service rejected the request (${res.status}). ${txt.slice(0, 200)}`);
      }
      return await res.json();
    } catch (err: any) {
      clearTimeout(timer);
      lastErr = err;
      const aborted = err?.name === "AbortError";
      const isLast = attempt === retries;
      if (isLast) {
        if (aborted) {
          throw new Error("The AI service took too long to respond (over 90s). Please try again.");
        }
        throw err;
      }
      // backoff before next try
      await new Promise((r) => setTimeout(r, 2500));
    }
  }
  throw lastErr || new Error("Update CV failed");
}
