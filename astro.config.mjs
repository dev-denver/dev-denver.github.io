import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "astro-auto-import";
import { defineConfig } from "astro/config";
import sharp from "sharp";
import config from "./src/config/config.json";
import rehypeCodeBlocks from "./src/lib/rehype/rehypeCodeBlocks.mjs";

// https://astro.build/config
export default defineConfig({
  site: config.site.base_url ? config.site.base_url : "http://examplesite.com",
  base: config.site.base_path ? config.site.base_path : "/",
  trailingSlash: config.site.trailing_slash ? "always" : "never",
  image: { service: sharp() },
  vite: { plugins: [tailwindcss()] },

  integrations: [
    react(),
    sitemap(),
    AutoImport({
      imports: [
        "@/shortcodes/Button",
        "@/shortcodes/Accordion",
        "@/shortcodes/Notice",
        "@/shortcodes/Video",
        "@/shortcodes/Youtube",
        "@/shortcodes/Tabs",
        "@/shortcodes/Tab",
        "@/shortcodes/Chat",
        "@/shortcodes/Me",
        "@/shortcodes/Claude",
      ],
    }),
    mdx(),
  ],

  markdown: {
    processor: unified({
      rehypePlugins: [rehypeCodeBlocks],
    }),
    // Dual themes so code blocks follow the site theme. one-dark-pro was a
    // dark theme rendered on a white page. `wrap: false` keeps long lines on
    // one line and scrolls them, which preserves code alignment.
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      wrap: false,
    },
  },
});
