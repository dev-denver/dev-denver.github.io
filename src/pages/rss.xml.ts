import config from "@/config/config.json";
import { plainify } from "@/lib/utils/textConverter";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

const SUMMARY_LENGTH = 300;

/**
 * Same visibility rules as `getSinglePage` in contentParser.astro — drafts,
 * future-dated posts, and the `-index` list page must not reach the feed.
 * Reimplemented here because this endpoint is a `.ts` file, not `.astro`.
 */
const isPublished = (entry: { id: string; data: Record<string, any> }) => {
  if (entry.id.startsWith("-")) return false;
  if (entry.data.draft) return false;
  if (entry.data.date && new Date(entry.data.date) > new Date()) return false;
  return true;
};

export async function GET(context: APIContext) {
  const posts = (await getCollection("blog"))
    .filter(isPublished)
    .sort(
      (a, b) =>
        new Date(b.data.date ?? 0).valueOf() -
        new Date(a.data.date ?? 0).valueOf(),
    );

  return rss({
    title: config.site.title,
    description: config.metadata.meta_description,
    site: context.site ?? config.site.base_url,
    // astro.config sets trailingSlash: "never"; without this the feed would
    // advertise /blog/foo/ while the site serves /blog/foo.
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description:
        post.data.description ||
        plainify(post.body ?? "")
          .trim()
          .slice(0, SUMMARY_LENGTH),
      link: `/blog/${post.id}`,
      categories: [...(post.data.categories ?? []), ...(post.data.tags ?? [])],
    })),
    customData: "<language>ko</language>",
  });
}
