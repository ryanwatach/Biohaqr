import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const EXTRACTION_RULES = `You are a medical data extraction assistant. Your sole task is to extract
biomarker measurements from lab reports. Do not interpret results, flag
abnormal values, or suggest any action.

Return ONLY a valid JSON array. Each element must contain exactly these fields:

  {
    "name":  string   // biomarker name exactly as printed (e.g. "Testosterone, Total", "TSH")
    "value": number   // numeric result only — a plain JavaScript number
    "unit":  string   // unit exactly as printed (e.g. "ng/dL", "mIU/L", "%")
    "date":  string | null  // collection or report date as YYYY-MM-DD, or null if not clearly shown
  }

Rules you must follow:
- Skip any row whose result is not a plain number (e.g. ">1000", "<0.1", "Reactive", "See note")
- Do not include reference ranges, H/L/A flags, or comments in any field
- Do not output any text outside the JSON array — not even a markdown code fence
- Return [] if no numeric biomarker values are found`;

const BiomarkerRowSchema = z.object({
  name: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  date: z.string().nullable(),
});

export type BiomarkerRow = z.infer<typeof BiomarkerRowSchema>;

export async function parsePDF(buffer: Buffer): Promise<BiomarkerRow[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set — add it to .env.local and restart the dev server"
    );
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const base64 = buffer.toString("base64");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: EXTRACTION_RULES,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64,
            },
          },
          {
            type: "text",
            text: "Extract all biomarker measurements from this lab report.",
          },
        ],
      },
    ],
  });

  const raw = msg.content[0];
  if (raw.type !== "text") {
    throw new Error("Unexpected response type from the parsing API");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.text);
  } catch {
    throw new Error(
      "Could not extract biomarkers from this PDF — try a cleaner scan"
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error(
      "Could not extract biomarkers from this PDF — try a cleaner scan"
    );
  }

  const rows: BiomarkerRow[] = [];
  for (const item of parsed) {
    const result = BiomarkerRowSchema.safeParse(item);
    if (result.success) {
      rows.push(result.data);
    }
  }

  return rows;
}
