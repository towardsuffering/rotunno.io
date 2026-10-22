import type { MarkdownHeading } from "astro";
import { marked, type Tokens } from "marked";

import { countWords } from "@/js/blogUtils";

// a notebook post's prose and headings live inside its .ipynb, so anything built from the post's
// own MDX (table of contents, reading time) misses them. these helpers read the notebook beside a post.

type Output = { output_type: string; data?: Record<string, unknown> };
type Cell = { cell_type: string; source: string | string[]; outputs?: Output[] };

const text = (s: string | string[] | undefined) => (Array.isArray(s) ? s.join("") : (s ?? ""));

// the post already has a title, so the notebook's own h1 is dropped
export const stripTitle = (src: string) => src.replace(/^# .*\n+/m, "");

// heading text without markdown marks like `code` or *emphasis*
export const plainHeading = (raw: string) => raw.replace(/[`*_]/g, "").trim();

export function slugify(raw: string) {
  return plainHeading(raw)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// headings with the same slugs Notebook.astro puts on the rendered headings, so the table of contents can link to them
export function notebookHeadings(source: string): MarkdownHeading[] {
  const cells = JSON.parse(source).cells as Cell[];
  return cells
    .filter((c) => c.cell_type === "markdown")
    .flatMap((c) => marked.lexer(stripTitle(text(c.source))))
    .filter((t): t is Tokens.Heading => t.type === "heading")
    .map((t) => ({ depth: t.depth, slug: slugify(t.text), text: plainHeading(t.text) }));
}

// seconds a reader spends on each chart or table
const SECONDS_PER_FIGURE = 25;

// the notebook's prose at the site's reading pace, plus time to take in each chart and table
export function notebookReadingMinutes(source: string): number {
  const cells = JSON.parse(source).cells as Cell[];
  const words = countWords(cells.filter((c) => c.cell_type === "markdown").map((c) => text(c.source)).join("\n"));
  const figures = cells
    .flatMap((c) => c.outputs ?? [])
    .filter((o) => o.data && ("application/vnd.plotly.v1+json" in o.data || "image/png" in o.data || (o.output_type === "execute_result" && "text/html" in o.data))).length;
  return words / 230 + (figures * SECONDS_PER_FIGURE) / 60;
}

// every notebook beside a post (there are few, and they are only read at build time)
const notebooks = import.meta.glob<string>("/src/data/blog/**/*.ipynb", { query: "?raw", import: "default", eager: true });

// the notebook in a post's folder, if it has one
function postNotebook(filePath: string | undefined): string | undefined {
  if (!filePath) return undefined;
  const folder = "/" + filePath.replace(/^\.?\//, "").replace(/[^/]+$/, "");
  const match = Object.keys(notebooks).find((path) => path.startsWith(folder) && !path.slice(folder.length).includes("/"));
  return match ? notebooks[match] : undefined;
}

export function postNotebookHeadings(filePath: string | undefined): MarkdownHeading[] {
  const source = postNotebook(filePath);
  return source ? notebookHeadings(source) : [];
}

export function postNotebookMinutes(filePath: string | undefined): number {
  const source = postNotebook(filePath);
  return source ? notebookReadingMinutes(source) : 0;
}
