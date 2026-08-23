---
title: "이 블로그를 Astro + GitHub Pages로 만든 과정"
description: "Astroplate 테마와 GitHub Actions로 개인 개발 블로그를 세팅한 기록."
date: 2026-08-23T00:00:00Z
author: "denver"
categories: ["회고/TIL"]
tags: ["astro", "github-pages"]
draft: false
---

첫 글이라 블로그 자체를 어떻게 만들었는지 정리해본다.

## 스택

- **Astro** — 정적 사이트 생성기. 블로그처럼 콘텐츠 중심 사이트에 잘 맞고, 빌드하면 순수 정적 HTML이 나와서 배포가 단순하다.
- **[Astroplate](https://github.com/zeon-studio/astroplate)** — Astro + Tailwind 기반 테마. 다크모드, 태그/카테고리, 검색 기능이 기본으로 들어 있어서 처음부터 다 만들 필요가 없었다.
- **GitHub Pages** — 저장소 이름을 `dev-denver.github.io`로 만들면 별도 설정 없이 루트 도메인으로 서빙된다.

## 배포는 GitHub Actions로

`main`에 푸시하면 워크플로우가 돌면서 빌드하고 GitHub Pages로 올라간다.

```yaml
on:
  push:
    branches: [main]
```

저장소 설정에서 **Settings → Pages → Source: GitHub Actions**로 바꿔줘야 하는데, 이건 `gh api`로 한 번에 처리했다.

```bash
gh api -X PUT repos/OWNER/REPO/pages -f build_type=workflow
```

## 테마를 그대로 쓰지 않은 것들

Astroplate는 원래 자기 자신을 홍보하는 템플릿이라, 그대로 배포하면 안 되는 것들이 꽤 있었다.

- 홈 배너, CTA, 테스티모니얼 — 전부 "Astroplate 써보세요" 문구였어서 지우거나 껐다.
- 가짜 저자 3명, 로렘입숨 예시 글 — 삭제.
- og-image — 템플릿 마케팅 페이지 스크린샷이 박혀 있어서, 파비콘과 톤을 맞춘 이미지로 새로 만들었다.
- 로고 — 실제 로고 파일이 없어서 이미지 대신 텍스트 워드마크로 대체.

## 글 쓰는 법

`src/content/blog/`에 마크다운 파일 하나 추가하면 끝이다.

```md
---
title: "제목"
date: 2026-08-23T00:00:00Z
description: "한 줄 요약"
tags: ["태그"]
draft: false
---
```

`draft: true`로 두면 빌드에서 제외되니까, 초안은 편하게 커밋해두고 준비되면 `false`로만 바꾸면 된다.
