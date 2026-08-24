import config from "@/config/config.json";
import { getSinglePage } from "@/lib/contentParser.astro";
import { renderOgImage } from "@/lib/og/card";
import dateFormat from "@/lib/utils/dateFormat";
import { humanize } from "@/lib/utils/textConverter";
import type { APIContext } from "astro";
import fs from "node:fs/promises";
import path from "node:path";

export async function getStaticPaths() {
  const posts = await getSinglePage("blog");
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

export async function GET({ props }: APIContext) {
  const { post } = props as { post: any };
  const { title, date, categories } = post.data;

  const meta = [
    categories?.length ? humanize(categories[0]) : null,
    date ? dateFormat(date) : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

  try {
    const png = await renderOgImage({ title, meta });
    return new Response(new Uint8Array(png), {
      headers: { "Content-Type": "image/png" },
    });
  } catch (error) {
    // The card needs a Korean font subset from Google Fonts. If that request
    // fails the build should still finish — fall back to the shared image
    // rather than breaking the deploy over a share preview.
    console.warn(
      `[og] ${post.id}: falling back to the static image — ${
        error instanceof Error ? error.message : error
      }`,
    );
    const fallback = await fs.readFile(
      path.join(process.cwd(), "public", config.metadata.meta_image),
    );
    return new Response(new Uint8Array(fallback), {
      headers: { "Content-Type": "image/png" },
    });
  }
}
