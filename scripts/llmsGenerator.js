import { glob } from "glob";
import { parse } from "node-html-parser";
import fs from "node:fs";
import path from "node:path";
import TurndownService from "turndown";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, "../src/config/config.json");
const LANGUAGE_PATH = path.join(__dirname, "../src/config/language.json");

// ─── Default patterns to always skip ────────────────────────────────────────
const DEFAULT_EXCLUDES = [
  "node_modules",
  "_astro",
  "404",
  "404.html",
  "**/*.xml",
  "**/*.txt",
];

// ─── URL path prefixes that are API / system routes ──────────────────────────
const API_ROUTE_PREFIXES = ["/api/", "/_", "/cdn-cgi/"];

function isApiRoute(urlPath) {
  return API_ROUTE_PREFIXES.some((prefix) => urlPath.startsWith(prefix));
}

// ─── Config ──────────────────────────────────────────────────────────────────
function getConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error("config.json not found");
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

  if (!config.llms) {
    throw new Error("llms configuration not found in config.json");
  }

  return config;
}

function getLanguageFallback() {
  let languages = [];
  let defaultLanguage = "";
  let defaultLanguageInSubdir = false;

  try {
    if (fs.existsSync(LANGUAGE_PATH)) {
      const languagesJSON = JSON.parse(fs.readFileSync(LANGUAGE_PATH, "utf8"));
      languages = languagesJSON.map((l) => l.languageCode).filter(Boolean);
    }
  } catch {
    // ignore missing or malformed language.json
  }

  try {
    const config = getConfig();
    defaultLanguage = config.settings?.default_language || "";
    defaultLanguageInSubdir =
      config.settings?.default_language_in_subdir === true;
  } catch {
    // ignore
  }

  return { languages, defaultLanguage, defaultLanguageInSubdir };
}

function isDefaultLanguagePath(
  urlPath,
  languages,
  defaultLanguage,
  defaultInSubdir,
) {
  if (!languages.length || !defaultLanguage) return true;

  const parts = urlPath.split("/").filter(Boolean);
  const firstPart = parts[0];

  const isLangPrefixed = languages.includes(firstPart);

  if (defaultInSubdir) {
    // Only keep paths explicitly prefixed with the default language
    return firstPart === defaultLanguage;
  }

  // defaultInSubdir is false: default language lives at root.
  // Keep only non-prefixed paths.
  return !isLangPrefixed;
}

// ─── Path helpers ─────────────────────────────────────────────────────────────

function normalizePattern(baseDir, pattern) {
  const cleanPattern = pattern.replace(/^\/+/, "");
  const fullPath = path.join(baseDir, cleanPattern);

  try {
    if (fs.statSync(fullPath).isDirectory()) {
      return path.join(fullPath, "**/*.html");
    }
  } catch {
    // treat as glob pattern
  }

  return fullPath;
}

async function discoverHtmlFiles(distFolder, excludePatterns, includePatterns) {
  const patterns =
    includePatterns?.length > 0
      ? includePatterns.map((p) => normalizePattern(distFolder, p))
      : [path.join(distFolder, "**/*.html")];

  const userExcludes = (excludePatterns || []).map((p) =>
    normalizePattern(distFolder, p),
  );

  const ignore = [
    ...DEFAULT_EXCLUDES.map((p) => path.join(distFolder, p)),
    ...userExcludes,
  ];

  let files = await glob(patterns, { ignore, absolute: true });

  files = files.filter((f) => fs.statSync(f).isFile() && f.endsWith(".html"));

  return files.sort();
}

function fileToUrlPath(filePath, distFolder) {
  const relativePath = filePath.replace(path.resolve(distFolder), "");
  let urlPath = relativePath.replace(/\\/g, "/").replace(/^\//, "");

  urlPath = urlPath.replace(/\.html$/, "");

  if (urlPath.endsWith("/index") || urlPath === "index") {
    urlPath = urlPath.replace(/\/index$/, "").replace(/^index$/, "");
  }

  return "/" + urlPath;
}

// ─── HTML parsing helpers ─────────────────────────────────────────────────────

function getTitle(root, titleSelector) {
  let el;
  if (titleSelector) el = root.querySelector(titleSelector);
  if (!el) el = root.querySelector("h1");
  if (!el) el = root.querySelector("h2");
  if (!el) el = root.querySelector("h3");
  if (!el) el = root.querySelector("title");
  return el?.text?.trim() || "";
}

function getContentElement(root, contentSelector) {
  let el;
  if (contentSelector) el = root.querySelector(contentSelector);
  if (!el) el = root.querySelector("main");
  if (!el) el = root.querySelector("body");
  if (!el) el = root.querySelector("html");
  return el;
}

async function processHtml(html, llmsConfig) {
  const root = parse(html);

  const title = getTitle(root, llmsConfig?.title_selector);

  const metaDescription = root.querySelector('meta[name="description"]');
  const description = metaDescription?.getAttribute("content") || "";

  const contentElement = getContentElement(root, llmsConfig?.content_selector);
  let content = "";

  if (contentElement) {
    contentElement
      .querySelectorAll("script, style, noscript, iframe, svg")
      .forEach((el) => el.remove());

    const turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
    });

    turndownService.addRule("removeChrome", {
      filter: ["nav", "footer", "header", "aside"],
      replacement: () => "",
    });

    content = turndownService.turndown(contentElement.innerHTML);
  }

  return { title, description, content };
}

async function processHtmlFile(filePath, llmsConfig) {
  const html = fs.readFileSync(filePath, "utf8");
  return processHtml(html, llmsConfig);
}

// ─── Output generators ────────────────────────────────────────────────────────

function generateMarkdownFile(page, siteUrl) {
  const url = `${siteUrl}${page.urlPath}`.replace(/(?<=.)\/$/, "");

  let md = "---\n";
  md += `title: "${page.title.replace(/"/g, '\\"')}"\n`;
  md += `url: "${url}"\n`;
  if (page.description) {
    md += `description: "${page.description.replace(/"/g, '\\"')}"\n`;
  }
  md += "---\n\n";
  md += page.content;

  return md;
}

function generateLlmsTxtContent(
  pages,
  siteUrl,
  siteName,
  siteDescription,
  generateIndividualMd,
) {
  let content = `# ${siteName}\n\n`;

  if (siteDescription) {
    content += `> ${siteDescription}\n\n`;
  }

  content +=
    "This file helps language models discover the most useful content on this site.\n\n";

  const grouped = {};
  pages.forEach((page) => {
    const parts = page.urlPath.split("/").filter(Boolean);
    const group = parts.length === 0 ? "Home" : parts[0];

    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(page);
  });

  const sortedGroups = Object.keys(grouped).sort((a, b) => {
    if (a === "Home") return -1;
    if (b === "Home") return 1;
    return a.localeCompare(b);
  });

  sortedGroups.forEach((group) => {
    const groupName = group.charAt(0).toUpperCase() + group.slice(1);
    content += `## ${groupName}\n\n`;

    grouped[group].forEach((page) => {
      let linkUrl;
      if (generateIndividualMd) {
        const mdPath =
          page.urlPath === "/" ? "/index.md" : `${page.urlPath}.md`;
        linkUrl = `${siteUrl}${mdPath}`.replace(/([^:])\/\//g, "$1/");
      } else {
        linkUrl = `${siteUrl}${page.urlPath}`.replace(/(?<=.)\/$/, "");
      }
      const linkText = page.title || page.urlPath;

      if (page.description) {
        content += `- [${linkText}](${linkUrl}): ${page.description}\n`;
      } else {
        content += `- [${linkText}](${linkUrl})\n`;
      }
    });

    content += "\n";
  });

  return content;
}

function generateLlmsFullTxtContent(pages, siteUrl, siteName) {
  let content = `# ${siteName}\n\n`;
  content += `URL: ${siteUrl}\n\n`;

  pages.forEach((page, index) => {
    const url = `${siteUrl}${page.urlPath}`.replace(/(?<=.)\/$/, "");
    content += `## ${page.title}\n\n`;
    content += `URL: ${url}\n\n`;

    if (page.description) {
      content += `${page.description}\n\n`;
    }

    content += page.content;

    if (index < pages.length - 1) {
      content += "\n\n---\n\n";
    }
  });

  return content;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function generateLlmsFiles() {
  const config = getConfig();
  const llms = config.llms;

  const { languages, defaultLanguage, defaultLanguageInSubdir } =
    getLanguageFallback();

  const distFolder = path.join(__dirname, "../dist");

  if (!fs.existsSync(distFolder)) {
    console.error("❌ dist/ folder does not exist. Run 'astro build' first.");
    process.exit(1);
  }

  const siteUrl = config.site.base_url.replace(/\/$/, "");
  const siteName = config.site.title;
  const siteDescription = config.metadata?.meta_description || "";

  // ── Discover pre-rendered HTML files ────────────────────────────────────
  console.log("\n🔍 Discovering pre-rendered HTML files...");
  const htmlFiles = await discoverHtmlFiles(
    distFolder,
    llms.exclude,
    llms.include,
  );
  console.log(`   Found ${htmlFiles.length} pre-rendered HTML files`);

  const pages = [];
  const seenPaths = new Set();

  for (const file of htmlFiles) {
    try {
      const urlPath = fileToUrlPath(file, distFolder);

      if (isApiRoute(urlPath)) {
        console.log(`   ⤷ Skipping API route: ${urlPath}`);
        continue;
      }

      if (
        !isDefaultLanguagePath(
          urlPath,
          languages,
          defaultLanguage,
          defaultLanguageInSubdir,
        )
      ) {
        console.log(`   ⤷ Skipping non-default language: ${urlPath}`);
        continue;
      }

      if (seenPaths.has(urlPath)) continue;
      seenPaths.add(urlPath);

      const pageData = await processHtmlFile(file, llms);

      if (!pageData.title) {
        console.log(`   ⚠️  No title found for ${urlPath}, skipping`);
        continue;
      }

      pages.push({
        urlPath,
        filePath: file,
        ...pageData,
      });
      console.log(`   ✓ [static] ${urlPath}: "${pageData.title}"`);
    } catch (error) {
      console.error(`   ✗ Error processing ${file}: ${error.message}`);
    }
  }

  // Sort pages: home first, then alphabetically
  pages.sort((a, b) => {
    if (a.urlPath === "/") return -1;
    if (b.urlPath === "/") return 1;
    return a.urlPath.localeCompare(b.urlPath);
  });

  console.log(`\n   ✅ Total pages processed: ${pages.length}\n`);

  // ── Step 3: Generate individual .md files ──────────────────────────────
  if (llms.generate_individual_md) {
    console.log("📝 Generating individual .md files...");

    // Remove stale .md files from previous runs (e.g. non-default languages)
    function deleteStaleMdFiles(dir) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          deleteStaleMdFiles(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          fs.unlinkSync(fullPath);
        }
      }
    }
    deleteStaleMdFiles(distFolder);

    for (const page of pages) {
      // Home → index.md, everything else → <url-path>.md
      const mdRelative =
        page.urlPath === "/" ? "index" : page.urlPath.replace(/^\//, "");
      const mdPath = path.join(distFolder, mdRelative + ".md");

      const mdContent = generateMarkdownFile(page, siteUrl);

      const mdDir = path.dirname(mdPath);
      if (!fs.existsSync(mdDir)) {
        fs.mkdirSync(mdDir, { recursive: true });
      }

      fs.writeFileSync(mdPath, mdContent, "utf8");
      console.log(`   ✓ ${path.relative(distFolder, mdPath)}`);
    }

    console.log(`   Created ${pages.length} .md files\n`);
  }

  // ── Step 4: Generate llms.txt ──────────────────────────────────────────
  if (llms.generate_llms_txt) {
    console.log("📋 Generating llms.txt...");

    const llmsTxtContent = generateLlmsTxtContent(
      pages,
      siteUrl,
      siteName,
      siteDescription,
      llms.generate_individual_md,
    );
    const llmsTxtPath = path.join(distFolder, "llms.txt");

    fs.writeFileSync(llmsTxtPath, llmsTxtContent, "utf8");
    console.log(`   ✓ ${path.relative(distFolder, llmsTxtPath)}\n`);
  }

  // ── Step 5: Generate llms-full.txt ────────────────────────────────────
  if (llms.generate_llms_full_txt) {
    console.log("📚 Generating llms-full.txt...");

    const llmsFullContent = generateLlmsFullTxtContent(
      pages,
      siteUrl,
      siteName,
    );
    const llmsFullPath = path.join(distFolder, "llms-full.txt");

    fs.writeFileSync(llmsFullPath, llmsFullContent, "utf8");
    console.log(`   ✓ ${path.relative(distFolder, llmsFullPath)}\n`);
  }

  // ── Summary ────────────────────────────────────────────────────────────
  console.log("✅ LLMS generation complete!\n");
  console.log("Summary:");
  console.log(`  Pages processed : ${pages.length}`);
  if (llms.generate_individual_md) {
    console.log(`  .md files       : ${pages.length} (in dist/)`);
  }
  if (llms.generate_llms_txt) {
    console.log(`  llms.txt        : llms.txt`);
  }
  if (llms.generate_llms_full_txt) {
    console.log(`  llms-full.txt   : llms-full.txt`);
  }
}

generateLlmsFiles().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
