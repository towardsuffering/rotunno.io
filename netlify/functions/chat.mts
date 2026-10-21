/**
 * "Ask about Chris" assistant API. Relays to a llama-server (OpenAI-compatible) running on
 * Chris's PC behind Tailscale Funnel, so the model's address and key never reach the browser.
 *
 *   GET  /api/chat                          -> { online } (is the PC reachable?)
 *   POST /api/chat  { messages: [{ role, content }] }  -> streamed text of the reply
 *   POST /api/chat  { mode: "followups", messages }    -> { followups: string[] } (next questions to suggest)
 *
 * The system prompt lives in src/config/assistant.ts. Visitors are rate limited per IP.
 * Env vars: LLM_URL (Funnel origin, e.g. https://chris-pc.taild7c8aa.ts.net), LLM_API_KEY (llama-server --api-key),
 * LLM_MODEL (optional, sent as the model name).
 */
import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

import { ASSISTANT_FOLLOWUP_PROMPT, ASSISTANT_MAX_CHARS, ASSISTANT_MAX_TURNS, ASSISTANT_SYSTEM_PROMPT } from "../../src/config/assistant";

type Message = { role: "user" | "assistant"; content: string };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const store = () => getStore({ name: "assistant", consistency: "strong" });

// simple fixed-window rate limit keyed by a salted hash of the visitor's IP
async function rateLimited(ip: string, kind: string, max: number, windowMs: number) {
  const data = new TextEncoder().encode(`rotunno-assistant:${ip}`);
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", data)))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const key = `ratelimit/${kind}/${hash}`;
  const now = Date.now();
  const entry = ((await store().get(key, { type: "json" })) ?? { start: now, count: 0 }) as {
    start: number;
    count: number;
  };
  const current = now - entry.start > windowMs ? { start: now, count: 0 } : entry;
  if (current.count >= max) return true;
  await store().setJSON(key, { ...current, count: current.count + 1 });
  return false;
}

const clean = (s: unknown, max: number) =>
  String(s ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);

function upstream() {
  const base = Netlify.env.get("LLM_URL")?.replace(/\/+$/, "");
  const key = Netlify.env.get("LLM_API_KEY");
  return base ? { base, headers: { "content-type": "application/json", ...(key ? { authorization: `Bearer ${key}` } : {}) } } : null;
}

async function isOnline() {
  const llm = upstream();
  if (!llm) return false;
  try {
    const r = await fetch(`${llm.base}/health`, { headers: llm.headers, signal: AbortSignal.timeout(3000) });
    return r.ok;
  } catch {
    return false;
  }
}

// turn llama-server's SSE stream into plain text chunks for the widget
function relayText(body: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const data = line.trim();
          if (!data.startsWith("data:") || data === "data: [DONE]") continue;
          try {
            const delta = JSON.parse(data.slice(5)).choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {
            // partial or non-JSON line; skip it
          }
        }
      },
    }),
  );
}

// three short questions to offer after a reply; empty when the model can't help
async function followups(llm: NonNullable<ReturnType<typeof upstream>>, messages: Message[]) {
  try {
    const r = await fetch(`${llm.base}/v1/chat/completions`, {
      method: "POST",
      headers: llm.headers,
      body: JSON.stringify({
        model: Netlify.env.get("LLM_MODEL") ?? "minicpm-v",
        messages: [{ role: "system", content: ASSISTANT_SYSTEM_PROMPT }, ...messages, { role: "user", content: ASSISTANT_FOLLOWUP_PROMPT }],
        max_tokens: 80,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok) return [];
    const text = String((await r.json()).choices?.[0]?.message?.content ?? "");
    return text
      .split("\n")
      .map((l) => l.replace(/^\s*(?:[-*\u2022]|\d+[.)])\s*/, "").replace(/\*/g, "").trim())
      .filter((l) => l.length >= 8 && l.length <= 80 && l.endsWith("?"))
      .slice(0, 3);
  } catch {
    return [];
  }
}

export default async (req: Request, context: Context) => {
  if (req.method === "GET") return json({ online: await isOnline() });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const llm = upstream();
  if (!llm) return json({ error: "The assistant isn't set up yet." }, 503);

  const body = (await req.json().catch(() => ({}))) as { messages?: unknown; mode?: unknown };
  if (!Array.isArray(body.messages) || body.messages.length === 0) return json({ error: "Ask a question first." }, 400);
  const messages: Message[] = body.messages.slice(-ASSISTANT_MAX_TURNS).map((m) => ({
    role: (m as Message)?.role === "assistant" ? "assistant" : "user",
    content: clean((m as Message)?.content, (m as Message)?.role === "assistant" ? 4000 : ASSISTANT_MAX_CHARS),
  }));
  const ip = context.ip ?? "unknown";

  if (body.mode === "followups") {
    if (messages.at(-1)?.role !== "assistant") return json({ followups: [] });
    if (await rateLimited(ip, "followups", 30, 10 * 60 * 1000)) return json({ followups: [] });
    return json({ followups: await followups(llm, messages) });
  }

  if (messages.at(-1)?.role !== "user" || messages.at(-1)!.content.length < 2) return json({ error: "Ask a question first." }, 400);
  if (await rateLimited(ip, "chat", 20, 10 * 60 * 1000))
    return json({ error: "You're asking quickly. Try again in a few minutes." }, 429);

  // fail fast when the PC is off; once the reply starts streaming the timer is cleared
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 20000);
  let r: Response;
  try {
    r = await fetch(`${llm.base}/v1/chat/completions`, {
      method: "POST",
      headers: llm.headers,
      body: JSON.stringify({
        model: Netlify.env.get("LLM_MODEL") ?? "minicpm-v",
        messages: [{ role: "system", content: ASSISTANT_SYSTEM_PROMPT }, ...messages],
        stream: true,
        max_tokens: 400,
        temperature: 0.6,
      }),
      signal: abort.signal,
    });
  } catch {
    return json({ error: "The assistant is offline right now." }, 503);
  } finally {
    clearTimeout(timer);
  }
  if (!r.ok || !r.body) return json({ error: r.status === 503 ? "The assistant is busy. Try again in a moment." : "The assistant is offline right now." }, 503);

  return new Response(relayText(r.body), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });
};

export const config: Config = { path: "/api/chat" };
