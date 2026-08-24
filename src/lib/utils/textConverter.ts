import { slug } from "github-slugger";
import { marked } from "marked";

// slugify
export const slugify = (content: string) => {
  return slug(content);
};

// markdownify
export const markdownify = (content: string, div?: boolean) => {
  return div ? marked.parse(content) : marked.parseInline(content);
};

// humanize
export const humanize = (content: string) => {
  return content
    .replace(/^[\s_]+|[\s_]+$/g, "")
    .replace(/[_\s]+/g, " ")
    .replace(/[-\s]+/g, " ")
    .replace(/^[a-z]/, function (m) {
      return m.toUpperCase();
    });
};

// titleify
export const titleify = (content: string) => {
  const humanized = humanize(content);
  return humanized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Tags that end a line of prose. Stripping them without a separator glued
// neighbouring blocks together — a post excerpt read "정리해본다. 스택Astro — ..."
// because </h2> sat directly against the next list item.
const BLOCK_END =
  /<\/(p|h[1-6]|li|ul|ol|blockquote|pre|div|section|article|tr|td|th|figcaption)>|<br\s*\/?>/gi;

// plainify
export const plainify = (content: string) => {
  const parseMarkdown: any = marked.parse(content);
  const withBoundaries = parseMarkdown.replace(BLOCK_END, " ");
  // Inline tags (<em>, <code>, <a>) are dropped without a separator so words
  // are not split apart.
  const filterBrackets = withBoundaries.replace(/<\/?[^>]+(>|$)/gm, "");
  const stripHTML = htmlEntityDecoder(filterBrackets);
  // marked always appends a newline, and the substitutions above leave runs of
  // whitespace. Left in, they ended up inside <title>, og:title, and JSON-LD.
  return stripHTML.replace(/\s+/g, " ").trim();
};

// strip entities for plainify
const htmlEntityDecoder = (htmlWithEntities: string) => {
  let entityList: { [key: string]: string } = {
    "&nbsp;": " ",
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
  };
  let htmlWithoutEntities: string = htmlWithEntities.replace(
    /(&amp;|&lt;|&gt;|&quot;|&#39;)/g,
    (entity: string): string => {
      return entityList[entity];
    },
  );
  return htmlWithoutEntities;
};
