/**
 * Emoji used by the reader engagement section (src/components/blog/PostEngagement.astro)
 * and validated by the API (netlify/functions/engagement.mts). Edit here to change both.
 */
export const REACTIONS = ["👍", "💡", "🔥", "🤔", "👏"] as const;

/** Formatting allowed in comments. Used by the server sanitizer and the browser sanitizer. */
export const COMMENT_TAGS = [
  "p", "br", "strong", "em", "u", "s", "a", "h3",
  "ul", "ol", "li", "blockquote", "code", "pre", "hr",
];
export const COMMENT_ATTRS = ["href", "rel", "target"];
export const COMMENT_MAX_CHARS = 1000;
