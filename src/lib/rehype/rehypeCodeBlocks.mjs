/**
 * Wraps each Shiki `<pre class="astro-code">` in a container with a header bar
 * carrying the language label and a copy button.
 *
 * Done at build time rather than from a client script for two reasons:
 * the header never flashes in after load, and it sits outside the `<pre>`'s
 * own `overflow-x: auto` box — an absolutely positioned button inside the
 * `<pre>` would scroll away with long lines.
 *
 * The walk is hand-written to avoid pulling in `unist-util-visit` for one use.
 */

const COPY_LABEL = "복사";

const classNames = (node) => [].concat(node?.properties?.className ?? []);

const isCodePre = (node) =>
  node?.type === "element" &&
  node.tagName === "pre" &&
  node.children?.some(
    (child) => child?.type === "element" && child.tagName === "code",
  );

/**
 * This plugin runs before Astro's syntax highlighting, so the tree still holds
 * the plain `<pre><code class="language-yaml">` shape rather than Shiki's
 * `<pre class="astro-code" data-language="yaml">`. Read the language from
 * whichever form is present — Shiki replaces the `<pre>` in place, so the
 * wrapper this adds survives highlighting.
 */
const languageOf = (pre) => {
  const fromShiki = pre.properties?.dataLanguage;
  if (fromShiki) return fromShiki;

  const code = pre.children.find(
    (child) => child?.type === "element" && child.tagName === "code",
  );
  const languageClass = classNames(code).find((name) =>
    String(name).startsWith("language-"),
  );
  return languageClass ? String(languageClass).slice("language-".length) : "";
};

const element = (tagName, properties, children = []) => ({
  type: "element",
  tagName,
  properties,
  children,
});

function wrap(pre) {
  const language = languageOf(pre);

  return element("div", { className: ["code-block"] }, [
    element("div", { className: ["code-block-header"] }, [
      element(
        "span",
        { className: ["code-block-lang"], "aria-hidden": "true" },
        [{ type: "text", value: language }],
      ),
      element(
        "button",
        {
          type: "button",
          className: ["code-block-copy"],
          dataCodeCopy: "",
          "aria-label": `${language ? `${language} ` : ""}코드 복사`,
        },
        [{ type: "text", value: COPY_LABEL }],
      ),
    ]),
    pre,
  ]);
}

const isWrapper = (node) =>
  node?.type === "element" && classNames(node).includes("code-block");

function walk(node) {
  if (!Array.isArray(node?.children)) return;

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    // Already wrapped — don't nest a second header around it.
    if (isWrapper(child)) continue;

    if (isCodePre(child)) {
      node.children[i] = wrap(child);
    } else {
      walk(child);
    }
  }
}

export default function rehypeCodeBlocks() {
  return (tree) => walk(tree);
}
