# dev-denver.github.io

Personal dev blog, built with [Astroplate](https://github.com/zeon-studio/astroplate) (Astro + Tailwind CSS), deployed to GitHub Pages.

## Commands

| Command              | Action                                     |
| :-------------------- | :------------------------------------------ |
| `npm install`          | Install dependencies                        |
| `npm run dev`          | Start local dev server at `localhost:4321`  |
| `npm run build`        | Build production site to `./dist/`          |
| `npm run preview`      | Preview the build locally                   |
| `npm run format`       | Format code with Prettier                   |
| `npm run check`        | Type-check with Astro                       |

## Writing a post

Add a `.md` or `.mdx` file under `src/content/blog/`. Minimal frontmatter:

```md
---
title: "Post title"
date: 2026-08-23T00:00:00Z
description: "One-line summary."
author: "denver"
categories: ["some-category"]
tags: ["some-tag"]
draft: false
---
```

Set `draft: true` to keep a post out of the build until it's ready.

## Site config

Branding, nav, and social links live in `src/config/*.json` (`config.json`,
`menu.json`, `social.json`, `theme.json`) rather than in code.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy-to-github-pages.yml`, which
builds the site and publishes it via GitHub Pages
(Settings → Pages → Source: GitHub Actions).
