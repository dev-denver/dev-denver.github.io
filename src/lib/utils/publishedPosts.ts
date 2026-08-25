import { getCollection, type CollectionEntry } from "astro:content";

/**
 * Published blog entries, newest first.
 *
 * Mirrors the visibility rules of `getSinglePage` in `contentParser.astro` —
 * drafts, future-dated posts, and the `-index` list page must never reach a
 * feed or a search index. It is reimplemented here because `.ts` endpoints
 * cannot import an `.astro` module, and both `rss.xml.ts` and `search.json.ts`
 * need the same rules.
 */
export const getPublishedPosts = async (): Promise<
  CollectionEntry<"blog">[]
> => {
  const buildDrafts = process.argv.includes("--buildDrafts");
  const buildFuture = process.argv.includes("--buildFuture");
  const now = new Date();

  const posts = (await getCollection("blog")).filter(({ data, id }) => {
    if (id.startsWith("-")) return false;
    if (!buildDrafts && data.draft) return false;
    if (!buildFuture && data.date && new Date(data.date) > now) return false;
    return true;
  });

  return posts.sort(
    (a, b) =>
      new Date(b.data.date ?? 0).valueOf() -
      new Date(a.data.date ?? 0).valueOf(),
  );
};
