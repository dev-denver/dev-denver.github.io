import { getPublishedPosts } from "@/lib/utils/publishedPosts";
import { plainify } from "@/lib/utils/textConverter";

/**
 * How much of each post body goes into the index. The whole body used to be
 * inlined into the search bundle, so every visitor downloaded every post
 * whether or not they searched. An excerpt keeps body matches working while
 * bounding the index as posts accumulate.
 */
const EXCERPT_LENGTH = 1000;

export async function GET() {
  const posts = await getPublishedPosts();

  const index = posts.map((post) => ({
    slug: `blog/${post.id}`,
    title: post.data.title,
    description: post.data.description ?? "",
    categories: post.data.categories ?? [],
    tags: post.data.tags ?? [],
    // plainify runs at build time now. The React version called it in the
    // browser on every keystroke, which pulled the markdown parser client-side.
    excerpt: plainify(post.body ?? "").slice(0, EXCERPT_LENGTH),
  }));

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json" },
  });
}
