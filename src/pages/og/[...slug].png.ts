import config from "@/config/config.json";
import { getSinglePage } from "@/lib/contentParser.astro";
import { renderOgImage } from "@/lib/og/card";
import { primeKoreanSubsets } from "@/lib/og/font";
import dateFormat from "@/lib/utils/dateFormat";
import { humanize } from "@/lib/utils/textConverter";
import type { APIContext } from "astro";
import fs from "node:fs/promises";
import path from "node:path";

/** The meta row under the title: first category and the publication date. */
const metaLine = (data: any) =>
  [
    data.categories?.length ? humanize(data.categories[0]) : null,
    data.date ? dateFormat(data.date) : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

export async function getStaticPaths() {
  const posts = await getSinglePage("blog");

  // One font request per weight for the whole build instead of one per card.
  // Every character any card can draw is known here, so the primed subset
  // covers all of them.
  primeKoreanSubsets(
    posts.map((post) => post.data.title + metaLine(post.data)).join("") +
      config.site.title,
  );

  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

export async function GET({ props }: APIContext) {
  const { post } = props as { post: any };
  const { title } = post.data;
  const meta = metaLine(post.data);

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
