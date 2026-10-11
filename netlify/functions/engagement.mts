/**
 * Reader engagement API: emoji reactions and comments for blog posts, stored in Netlify Blobs.
 *
 *   GET    /api/engagement?slug=<post>         -> { reactions, comments }
 *   GET    /api/engagement?gif=<query>         -> PG-rated GIF search results from GIPHY
 *   GET    /api/engagement?img=<key>           -> an uploaded comment image
 *   POST   /api/engagement  { action: "react", slug, emoji }
 *   POST   /api/engagement  { action: "comment", slug, name, emoji, text, website, gif?, image? }
 *   GET    /api/engagement?admin=1             -> every post's comments   (x-admin-token header)
 *   DELETE /api/engagement  { slug, id }       -> remove one comment      (x-admin-token header)
 *
 * Comments publish instantly; spam is limited by a honeypot field, per-IP rate limits,
 * length and link limits. A comment can carry one GIF (GIPHY, PG rating) or one uploaded
 * image (JPEG/PNG/WebP/GIF, checked by file signature, max 2 MB).
 * Env vars: ENGAGEMENT_ADMIN_TOKEN (admin page), GIPHY_API_KEY (GIF search).
 */
import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

import { FilterXSS } from "xss";

import { AVATARS, COMMENT_ATTRS, COMMENT_MAX_CHARS, COMMENT_TAGS, REACTIONS } from "../../src/config/engagement";

type Media = { url: string; width: number; height: number };
type Comment = {
  id: string;
  name: string;
  emoji: string;
  text: string;
  html?: string;
  createdAt: string;
  gif?: Media;
  image?: Media & { key: string };
};

const SLUG = /^[a-z0-9][a-z0-9-]{0,120}$/;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const store = () => getStore({ name: "engagement", consistency: "strong" });
const images = () => getStore({ name: "engagement-images", consistency: "strong" });

async function readReactions(slug: string): Promise<Record<string, number>> {
  const saved = ((await store().get(`reactions/${slug}`, { type: "json" })) ?? {}) as Record<string, number>;
  return Object.fromEntries(REACTIONS.map((e) => [e, saved[e] ?? 0]));
}

async function readComments(slug: string): Promise<Comment[]> {
  return ((await store().get(`comments/${slug}`, { type: "json" })) ?? []) as Comment[];
}

// simple fixed-window rate limit keyed by a salted hash of the visitor's IP
async function rateLimited(ip: string, kind: string, max: number, windowMs: number) {
  const data = new TextEncoder().encode(`rotunno-engagement:${ip}`);
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

// rich-text comments: strict allowlist; js-xss also drops javascript:/data: URLs and event handlers
const richFilter = new FilterXSS({
  whiteList: Object.fromEntries(COMMENT_TAGS.map((t) => [t, t === "a" ? ["href"] : []])),
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style", "iframe", "object", "embed", "noscript"],
});
const textFilter = new FilterXSS({ whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: ["script", "style"] });

function cleanHtml(raw: unknown) {
  const normalized = String(raw ?? "")
    .slice(0, 12000)
    .replace(/<(\/?)h[1-6](\s[^>]*)?>/gi, "<$1h3>"); // any heading level becomes h3
  return richFilter
    .process(normalized)
    .replace(/<a href="(?!https?:|mailto:)[^"]*"/gi, "<a") // only web and mail links keep their href
    .replace(/<a /gi, '<a rel="nofollow ugc noopener" target="_blank" ')
    .trim();
}
const htmlToText = (html: string) =>
  textFilter
    .process(html.replace(/<\/(p|li|h3|blockquote|pre)>|<br\s*\/?>/g, "$&\n"))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const clean = (s: unknown, max: number) =>
  String(s ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);

function isAdmin(req: Request) {
  const token = Netlify.env.get("ENGAGEMENT_ADMIN_TOKEN");
  return Boolean(token) && req.headers.get("x-admin-token") === token;
}

// identify an image by its first bytes, never by the name or type the browser claims
function sniffImage(bytes: Uint8Array): string | null {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (starts(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (starts(0x89, 0x50, 0x4e, 0x47)) return "image/png";
  if (starts(0x47, 0x49, 0x46, 0x38)) return "image/gif";
  if (starts(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50)
    return "image/webp";
  return null;
}

// only accept GIF links that point at GIPHY's media servers
function cleanGif(g: unknown): Media | undefined {
  if (!g || typeof g !== "object") return undefined;
  const { url, width, height } = g as Record<string, unknown>;
  try {
    const u = new URL(String(url));
    if (u.protocol !== "https:" || !/^media\d*\.giphy\.com$|^i\.giphy\.com$/.test(u.hostname)) return undefined;
    return { url: u.href, width: Math.min(Number(width) || 0, 2000), height: Math.min(Number(height) || 0, 2000) };
  } catch {
    return undefined;
  }
}

async function searchGifs(q: string) {
  const key = Netlify.env.get("GIPHY_API_KEY");
  if (!key) return json({ error: "GIF search is not configured" }, 503);
  const endpoint = q ? "search" : "trending";
  const api = new URL(`https://api.giphy.com/v1/gifs/${endpoint}`);
  api.search = new URLSearchParams({ api_key: key, q, limit: "24", rating: "pg", lang: "en", bundle: "messaging_non_clips" }).toString();
  const r = await fetch(api);
  if (!r.ok) return json({ error: "GIF search failed" }, 502);
  const d = (await r.json()) as { data: { id: string; title: string; images: Record<string, { url: string; width: string; height: string }> }[] };
  return json({
    results: d.data.map((g) => ({
      id: g.id,
      title: g.title,
      preview: g.images.fixed_width_small?.url ?? g.images.fixed_width.url,
      url: g.images.fixed_width.url,
      width: Number(g.images.fixed_width.width),
      height: Number(g.images.fixed_width.height),
    })),
  });
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const ip = context.ip ?? "unknown";

  if (req.method === "GET") {
    const imgKey = url.searchParams.get("img");
    if (imgKey) {
      if (!/^[a-z0-9-]+\/[0-9a-f-]{36}$/.test(imgKey)) return new Response("Not found", { status: 404 });
      const found = await images().getWithMetadata(imgKey, { type: "arrayBuffer" });
      if (!found) return new Response("Not found", { status: 404 });
      return new Response(found.data, {
        headers: {
          "content-type": String(found.metadata.type),
          "cache-control": "public, max-age=31536000, immutable",
          "x-content-type-options": "nosniff",
          "content-security-policy": "default-src 'none'",
        },
      });
    }

    if (url.searchParams.has("gif")) {
      if (await rateLimited(ip, "gif", 60, 10 * 60 * 1000)) return json({ error: "Slow down a little" }, 429);
      return searchGifs(clean(url.searchParams.get("gif"), 50));
    }

    if (url.searchParams.get("admin")) {
      if (!isAdmin(req)) return json({ error: "Unauthorized" }, 401);
      const { blobs } = await store().list({ prefix: "comments/" });
      const posts = await Promise.all(
        blobs.map(async (b) => {
          const slug = b.key.slice("comments/".length);
          return { slug, comments: await readComments(slug) };
        }),
      );
      return json({ posts: posts.filter((p) => p.comments.length) });
    }

    const slug = url.searchParams.get("slug") ?? "";
    if (!SLUG.test(slug)) return json({ error: "Invalid post" }, 400);
    const [reactions, comments] = await Promise.all([readReactions(slug), readComments(slug)]);
    return json({ reactions, comments: [...comments].reverse() });
  }

  if (req.method === "DELETE") {
    if (!isAdmin(req)) return json({ error: "Unauthorized" }, 401);
    const { slug, id } = (await req.json().catch(() => ({}))) as { slug?: string; id?: string };
    if (!slug || !SLUG.test(slug) || !id) return json({ error: "Invalid request" }, 400);
    const all = await readComments(slug);
    const target = all.find((c) => c.id === id);
    if (target?.image) await images().delete(target.image.key);
    await store().setJSON(`comments/${slug}`, all.filter((c) => c.id !== id));
    return json({ ok: true });
  }

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const slug = String(body.slug ?? "");
  if (!SLUG.test(slug)) return json({ error: "Invalid post" }, 400);

  if (body.action === "react") {
    const emoji = String(body.emoji ?? "");
    if (!(REACTIONS as readonly string[]).includes(emoji)) return json({ error: "Unknown reaction" }, 400);
    if (await rateLimited(ip, "react", 40, 10 * 60 * 1000)) return json({ error: "Slow down a little" }, 429);
    const reactions = await readReactions(slug);
    reactions[emoji] += 1;
    await store().setJSON(`reactions/${slug}`, reactions);
    return json({ reactions });
  }

  if (body.action === "comment") {
    // bots fill every field; real readers never see this one
    if (clean(body.website, 200)) return json({ ok: true });

    const name = clean(body.name, 40);
    const html = body.html ? cleanHtml(body.html) : "";
    const text = html ? htmlToText(html) : clean(body.text, COMMENT_MAX_CHARS);
    const emoji = String(body.emoji ?? "");
    const gif = cleanGif(body.gif);
    const upload = body.image as { data?: string; width?: number; height?: number } | undefined;
    const hasMedia = Boolean(gif || upload?.data);

    if (body.gif && !gif) return json({ error: "That GIF can't be used." }, 400);
    if (name.length < 1) return json({ error: "Please add your name." }, 400);
    if (text.length < 2 && !hasMedia) return json({ error: "Write a comment or add a GIF or image." }, 400);
    if (emoji && !(AVATARS as readonly string[]).includes(emoji)) return json({ error: "Unknown emoji." }, 400);
    if (text.length > COMMENT_MAX_CHARS) return json({ error: `Comments are limited to ${COMMENT_MAX_CHARS} characters.` }, 400);
    const linkCount = Math.max((html.match(/<a\s/gi) ?? []).length, (text.match(/https?:\/\//gi) ?? []).length);
    if (linkCount > 2) return json({ error: "Too many links in one comment." }, 400);

    let image: Comment["image"];
    let bytes: Uint8Array | undefined;
    let type: string | null = null;
    if (upload?.data) {
      try {
        bytes = Uint8Array.from(atob(String(upload.data)), (c) => c.charCodeAt(0));
      } catch {
        return json({ error: "That image couldn't be read." }, 400);
      }
      if (bytes.byteLength > MAX_IMAGE_BYTES) return json({ error: "Images must be under 2 MB." }, 400);
      type = sniffImage(bytes);
      if (!type) return json({ error: "Use a JPG, PNG, WebP, or GIF image." }, 400);
    }

    if (await rateLimited(ip, "comment", 5, 10 * 60 * 1000))
      return json({ error: "You're commenting quickly. Try again in a few minutes." }, 429);

    const id = crypto.randomUUID();
    if (bytes && type) {
      const key = `${slug}/${id}`;
      await images().set(key, bytes, { metadata: { type } });
      image = {
        key,
        url: `/api/engagement?img=${encodeURIComponent(key)}`,
        width: Math.min(Number(upload?.width) || 0, 4000),
        height: Math.min(Number(upload?.height) || 0, 4000),
      };
    }

    const comment: Comment = { id, name, emoji, text, ...(html ? { html } : {}), createdAt: new Date().toISOString(), ...(gif && !image ? { gif } : {}), ...(image ? { image } : {}) };
    const comments = await readComments(slug);
    comments.push(comment);
    await store().setJSON(`comments/${slug}`, comments.slice(-500));
    return json({ comment });
  }

  return json({ error: "Unknown action" }, 400);
};

export const config: Config = { path: "/api/engagement" };
