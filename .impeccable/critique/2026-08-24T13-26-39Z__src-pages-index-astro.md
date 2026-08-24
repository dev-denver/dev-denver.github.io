---
target: homepage
total_score: 18
max_score: 36
na_heuristics: 10
p0_count: 2
p1_count: 2
timestamp: 2026-08-24T13-26-39Z
slug: src-pages-index-astro
---
Method: dual-agent (A: design-review sub-agent · B: detector-evidence sub-agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2/4 | Active sidebar-link color shift (#121212 vs #040404) is barely perceptible |
| 2 | Match Between System & Real World | 1/4 | English chrome copy (`read more`, nav labels, `Categories`) inside an otherwise Korean product |
| 3 | User Control and Freedom | 3/4 | Mobile drawer works well; no major control gaps |
| 4 | Consistency and Standards | 2/4 | Two parallel taxonomies — categories rendered everywhere, tags collected but never shown |
| 5 | Error Prevention | 1/4 | 3 of 4 sidebar categories link to guaranteed-empty pages; contact form posts to `action="#"` |
| 6 | Recognition Rather Than Recall | 3/4 | Category counts, icon+label pairing, sr-only labels are solid |
| 7 | Flexibility and Efficiency of Use | 2/4 | Real ⌘K/Ctrl+K search exists but has zero visible affordance |
| 8 | Aesthetic and Minimalist Design | 2/4 | Clean language, but reads sparse/unfinished against the actual 1-post reality |
| 9 | Help Recognize/Diagnose/Recover from Errors | 2/4 | Good localized empty state; contact form gives zero failure feedback |
| 10 | Help and Documentation | n/a | Not applicable to a static blog homepage |

**Total: 18/36** (9 heuristics scored, #10 n/a) — **Acceptable** (borderline; significant improvements needed)

## Design Specificity Verdict

**LLM assessment**: This is a stock Astroplate template with Korean strings dropped into the content layer while the chrome underneath stays largely un-adapted. `Sidebar.astro:93` hardcodes an English `Categories` heading between Korean nav items; `BlogCard.astro:56` hardcodes `read more`; `contact.astro` ships template-default English form labels/placeholders; `menu.json`'s entire primary nav (Home/Blog/Tags/Contact) is English against a site whose other strings were clearly translated. Nothing about the composition — a generic centered hero banner, a generic 3-column card grid, a generic sidebar-with-categories layout — is grounded in "a personal Korean-language study log with one real post today." A generic template site could ship this unchanged.

**Deterministic scan**: The detector ran against homepage source files with 0 findings, but that result is **not a clean bill of health** — the run reported `DEGRADED: HTML parser modules unavailable, falling back to regex matching`, and a sanity test with deliberately bad CSS (low-contrast text, tiny font, non-semantic click handler) also produced 0 findings under this mode. A second run against the actual rendered HTML did surface 4 findings, all of which are false positives for the homepage specifically: 3 are Tailwind's own unused `animate-bounce` utility boilerplate (confirmed zero usages anywhere in `src/`), and 1 (`border-left-width: 10px`, a `side-tab` finding) is a blockquote style meant for blog-post content (`components.css:165`) that the homepage never renders (zero `<blockquote>` elements on `/`). Manual inspection of the rendered HTML surfaced one real, detector-independent issue: a genuine heading-hierarchy irregularity — DOM order is `<h5>Categories</h5>` (sidebar) → `<h1>denver.log</h1>` (hero) → `<h4>` (post title), skipping `<h2>`/`<h3>` entirely and placing an `<h5>` before the page's own `<h1>`.

**Visual overlays**: Not available — no browser automation tool is exposed in this environment, so no screenshot or live overlay evidence exists for this run. Evidence above comes from source code and the rendered HTML fetched directly from the dev server.

## Overall Impression

Solid technical foundation — real search shortcut, a CSS-only mobile drawer that survives pre-hydration, a genuinely localized empty state — but the product hasn't been adapted from its Astroplate starting point to its actual identity. English strings remain in the chrome despite the Korean-first constraint, `<html lang="en">` breaks Korean screen-reader pronunciation for every visible text node, and the layout is built for a mature multi-post archive rather than today's one-post reality. The biggest opportunity: right now the sidebar's career-signaling cluster (resume ×2, GitHub, Instagram, Contact) outweighs the one blog post itself — this reads more like a job-hunting landing page than the "honest learning-log, not a portfolio pitch" identity from PRODUCT.md.

## What's Working

- **Localized empty state** (`아직 글이 없습니다.`, `index.astro:24`) — a deliberate, human, Korean fallback rather than a generic template default.
- **⌘K/Ctrl+K search** (`SearchModal.tsx:90-91`) — a real efficiency accelerator matching developer-audience muscle memory (GitHub/docs-style), correctly implemented.
- **CSS-only mobile drawer** (`Sidebar.astro`'s checkbox-toggle pattern) — resilient, and the one place progressive disclosure is actually applied correctly (defers nav/categories/socials behind a hamburger on mobile, unlike the desktop sidebar which shows everything at once).

## Priority Issues

**[P0] Chrome copy breaks the Korean-first constraint.** `menu.json`'s entire primary nav (Home/Blog/Tags/Contact), `BlogCard.astro:56`'s `read more` button, and `Sidebar.astro:93`'s `Categories` heading are untranslated English sitting directly on the homepage, contradicting PRODUCT.md's explicit "Korean-language content/UI is the default and must stay."
**Why it matters**: Inconsistent language mid-interface reads as unfinished and undermines the product's own stated identity for its target Korean-developer audience.
**Fix**: Translate `menu.json` nav labels, the `read more` string, and the `Categories` sidebar heading to Korean.
**Suggested command**: `/impeccable clarify`

**[P0] `<html lang="en">` mismatches the site's actual language.** `Base.astro:45` declares `lang="en"` while nearly all visible text — headings, post titles/summaries, nav neighbors, UI strings — is Korean.
**Why it matters**: Screen readers apply English phoneme rules to Korean text, mispronouncing essentially every text node on the page for accessibility-dependent users.
**Fix**: Set `lang="ko"` (or set it dynamically if English pages are ever added).
**Suggested command**: `/impeccable harden`

**[P1] Duplicate resume CTA crowds an already-packed control cluster.** `social.json`'s "resume" icon and `config.json`'s `navigation_button` ("이력서 보기") link to the identical URL and sit adjacent in the sidebar's bottom zone, which already packs 6 controls (search, theme switcher, resume button, 3 social icons) into one spot — a cognitive-load "minimal choices" violation (>4 controls at one decision point).
**Why it matters**: Two links to the same destination is pure redundancy that adds visual noise without adding value, and the crowding pushes the actual blog content further down in priority.
**Fix**: Remove the resume entry from `social.json`; keep only the dedicated resume button.
**Suggested command**: `/impeccable distill`

**[P1] Homepage layout is designed for an archive that doesn't exist yet.** With exactly one non-draft post, the 3-column grid (`lg:col-4`, `index.astro`) leaves roughly two-thirds of the row empty, and 3 of 4 sidebar categories show a `(0)` count while remaining clickable dead ends. Combined, a first-time visitor sees more visible emptiness than content, which works against PRODUCT.md's own success metric ("another developer finds a useful writeup").
**Why it matters**: The emotional peak of a blog homepage should be the content; right now arrival produces a dip instead.
**Fix**: Use a single-column/centered layout below a post-count threshold, and hide or disable zero-count category links until they're populated.
**Suggested command**: `/impeccable layout`

**[P2] Heading hierarchy skips levels and orders out of sequence.** Rendered DOM order is `<h5>Categories</h5>` (sidebar) before the page's own `<h1>denver.log</h1>` (hero), then straight to `<h4>` for the post title — no `<h2>` or `<h3>` exists anywhere on the page.
**Why it matters**: Screen-reader users navigating by heading level get a structurally incoherent outline of the page, and it signals unaddressed technical debt in an otherwise clean template.
**Fix**: Reorder so `<h1>` leads the DOM, and use sequential heading levels (e.g. `<h2>` for sidebar section labels, `<h2>`/`<h3>` for post titles) instead of jumping to `<h4>`/`<h5>`.
**Suggested command**: `/impeccable audit`

## Persona Red Flags

**Jordan (confused first-timer)**
- The hero `<h1>` just repeats "denver.log," identical to the sidebar logo already on screen — nothing tells Jordan this is a personal TIL/study log rather than a portfolio or company blog.
- Resume button + resume social icon + GitHub + Instagram all sit in the same rail as the one blog post, reading more like a job-hunting landing page than a learning log.
- Categories show `(0)` counts but remain clickable — clicking "프론트엔드" out of curiosity lands on a blank page seconds after arriving.

**Sam (screen reader / keyboard-only)**
- `<html lang="en">` mispronounces every Korean text node — the single largest accessibility defect on the page (see P0 above).
- No skip-to-content link exists in `Base.astro`; the sidebar (logo → 4 nav → 4 categories → search → theme switcher → resume, ~11 stops) renders before `<main>`, so a keyboard user must tab through the entire sidebar before reaching the one post link.
- `.sidebar-link`/`.sidebar-category-link` define no custom `:focus-visible` treatment, compounding the weak active-state contrast noted above.

**Casey (distracted mobile user)**
- The mobile drawer surfaces one long scrollable stack (4 nav + 4 categories, 3 dead + 3 socials + search + theme + resume) before Casey gets back to content.
- Even without opening the drawer, Casey scrolls past the full gradient hero plus a breadcrumb before reaching the single post card — a lot of dead scroll distance for one piece of content on a small viewport.

## Minor Observations

- `config.json`'s `meta_description` ("Denver's dev blog") is English — affects the search-result/share-preview snippet, the actual first impression before landing.
- Author byline auto-capitalizes to "Denver" (`humanize()` in `BlogCard.astro`) while the brand elsewhere is lowercase "denver.log"/"denver" — inconsistent casing.
- Post `tags` (e.g. `["astro", "github-pages"]`) are collected in frontmatter but never rendered anywhere, despite "Tags" being one of only 4 primary nav destinations.
- `.sidebar-link.active` contrast is weak (`#121212` vs default `#040404`) — pair the active state with a background tint or left border, not just a hue nudge.
- Contact form posts to `action="#"` with no success/error feedback — submitting silently discards input.
- `src/content/blog/hello-world.md` is a `draft: true` frontmatter-reference placeholder left in the content folder — harmless for builds, a small tell of unfinished scaffolding.
- `Announcement.tsx` is fully wired and Korean-capable but `enable: false` — dormant, not broken.

## Questions to Consider

1. If the homepage's only job is helping a developer decide whether to read a post, why does the sidebar give more visual weight to career-signaling (resume ×2, Contact, socials) than to the post itself?
2. What should this homepage look like at exactly one post — its actual state today — versus the 6-post grid it's currently designed for?
3. What's the one sentence a first-time Korean-speaking developer should read in the first three seconds to understand "this is an honest TIL log, not a portfolio pitch"?
