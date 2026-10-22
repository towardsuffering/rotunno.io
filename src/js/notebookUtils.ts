import type { MarkdownHeading } from "astro";
import { marked, type Tokens } from "marked";

// a notebook's headings live inside its .ipynb, so the post's own MDX headings miss them.
// this pulls them out with the same slugs Notebook.astro puts on the rendered headings,
// so the table of contents can link to them.

type Cell = { cell_type: string; source: string | string[] };

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

export function notebookHeadings(source: string): MarkdownHeading[] {
  const cells = JSON.parse(source).cells as Cell[];
  return cells
    .filter((c) => c.cell_type === "markdown")
    .flatMap((c) => marked.lexer(stripTitle(text(c.source))))
    .filter((t): t is Tokens.Heading => t.type === "heading")
    .map((t) => ({ depth: t.depth, slug: slugify(t.text), text: plainHeading(t.text) }));
}

// every notebook beside a post, loaded only when that post is built
const notebooks = import.meta.glob<string>("/src/data/blog/**/*.ipynb", { query: "?raw", import: "default" });

// headings of the notebook in a post's folder, or none if the post has no notebook
export async function postNotebookHeadings(filePath: string | undefined): Promise<MarkdownHeading[]> {
  if (!filePath) return [];
  const folder = "/" + filePath.replace(/^\.?\//, "").replace(/[^/]+$/, "");
  const match = Object.keys(notebooks).find((path) => path.startsWith(folder) && !path.slice(folder.length).includes("/"));
  return match ? notebookHeadings(await notebooks[match]()) : [];
}
