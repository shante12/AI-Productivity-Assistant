import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "google/gemini-3.7-flash";

const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

const inputSchema = z.object({
  system: z.string().optional(),
  messages: z.array(messageSchema).min(1),
});

export type AiMessage = z.infer<typeof messageSchema>;

export type AiResult = { ok: true; text: string } | { ok: false; error: string };

/**
 * Structured prompt scaffold shared by every EventFlow AI surface.
 * Role / Context / Objective / Constraints / Format.
 */
export function buildSystemPrompt(opts: {
  role: string;
  objective: string;
  context?: string;
  constraints?: string[];
  format?: string;
}): string {
  const constraints = [
    "Be practical and specific; help the user make progress on their next step.",
    "Never fabricate vendor names, reviews, credentials, prices, statistics, or sources.",
    "When a figure is an estimate, label it clearly as an estimate.",
    "Clearly separate AI suggestions from user-provided information.",
    "Do not present output as legal, financial, safety, or other professional advice.",
    ...(opts.constraints ?? []),
  ];
  return [
    `Role:\n${opts.role}`,
    `Context:\n${opts.context?.trim() || "No event details provided yet — ask for what you need or state your assumptions."}`,
    `Objective:\n${opts.objective}`,
    `Constraints:\n- ${constraints.join("\n- ")}`,
    `Output format:\n${opts.format ?? "Clean markdown with short headings, bullet lists and bold labels. No preamble."}`,
  ].join("\n\n");
}

export const runAi = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<AiResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { ok: false, error: "The AI service isn't configured yet. Please try again later." };
    }

    let res: Response;
    try {
      res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            ...(data.system ? [{ role: "system", content: data.system }] : []),
            ...data.messages,
          ],
        }),
      });
    } catch {
      return { ok: false, error: "We couldn't reach the AI service. Check your connection and try again." };
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      let message = "";
      try {
        message = JSON.parse(body)?.error?.message ?? "";
      } catch {
        message = "";
      }
      if (res.status === 429) {
        return { ok: false, error: "Too many requests right now. Please wait a moment and try again." };
      }
      if (res.status === 402) {
        return {
          ok: false,
          error: message || "AI credits are exhausted for this workspace. Add credits to keep generating.",
        };
      }
      if (res.status === 403) {
        return { ok: false, error: message || "AI features are currently blocked for this workspace." };
      }
      return { ok: false, error: message || "The AI service returned an error. Please try again." };
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return { ok: false, error: "The assistant returned an empty response. Try rephrasing your request." };
    }
    return { ok: true, text };
  });
