import config from "@/config/config.json";
import { getPublishedPosts } from "@/lib/utils/publishedPosts";
import { plainify } from "@/lib/utils/textConverter";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";

const SUMMARY_LENGTH = 300;

export async function GET(context: APIContext) {
  // Visibility rules and ordering are shared with search.json.ts.
  const posts = await getPublishedPosts();

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
