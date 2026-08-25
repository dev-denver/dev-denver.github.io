# 글 발행 가이드

## 전체 흐름

```
[외부 레포]  공부/문제해결
     ↓       capture-prompt.md 를 그쪽 AI에 붙여넣기
  <slug>.intake.md          ← 재료 (코드 원문·에러 로그·파일 경로 보존)
     ↓       이 레포로 파일을 가져와서 "이 md 정리해서 글 올려줘"
  blog-post 스킬            ← 카테고리 검증 · 태그 정리 · 본문 재구성
     ↓
src/content/blog/<slug>.md  → https://dev-denver.github.io/blog/<slug>
```

외부 레포용 프롬프트: [capture-prompt.md](./capture-prompt.md)

인테이크 규격을 안 거치고 그냥 자유 형식 md를 들고 와도 스킬은 동작한다.
다만 코드 원문·파일 경로가 빠져 있으면 그만큼 글이 얕아진다.

## 글 유형

`kind`는 목차 뼈대를 정하고, 카테고리는 분류를 정한다. 둘은 별개다.

| kind      | 언제                  | 뼈대                                              |
| :-------- | :-------------------- | :------------------------------------------------ |
| `concept` | 새 개념을 공부했을 때 | 개념 → 동작 원리 → 예제 → 헷갈렸던 지점           |
| `problem` | 막혔다가 뚫었을 때    | 증상 → 시도와 실패 → 원인 → 해결 → 재발 방지      |
| `retro`   | 뭔가 만들었을 때      | 만든 것 → 선택과 이유 → 막힌 지점 → 결과 → 다음엔 |

## 카테고리

`src/config/categories.json`의 `label`과 **정확히 일치**해야 한다. 현재 4종:

- `언어/CS 기초`
- `프론트엔드`
- `백엔드/인프라`
- `회고/TIL`

> 스키마(`src/content.config.ts`)는 카테고리를 자유 문자열로 받는다. 오타가 나도 빌드는
> 통과하고, 대신 humanize된 이름의 고아 카테고리 페이지가 조용히 생긴다.
> 검증은 blog-post 스킬이 하는 것뿐이므로 손으로 쓸 때는 직접 확인할 것.

카테고리를 늘리려면 `src/config/categories.json`에 `label`을 추가한다.

## 태그

소문자 ASCII 기술명. 글당 2~4개. **한글 태그 금지** — 슬러그가 깨진다
(`회고/TIL` → `회고til`).

권장 시드 목록(고정 목록이 아니라 출발점이다. 새 주제면 새 태그를 만들어도 된다):

`astro` `typescript` `javascript` `react` `css` `tailwind`
`spring` `java` `jpa` `node` `postgresql` `redis` `docker`
`github-actions` `github-pages` `nginx`
`algorithm` `network` `os` `database`
`til` `retrospective` `meta`

실질적인 source of truth는 **기존 글들이 이미 쓰고 있는 태그**다.
새 태그를 만들기 전에 `src/content/blog/`의 프론트매터를 확인해서
`nextjs` / `next.js` 같은 표기 분열을 만들지 않는다.

## 파일명 = URL

파일명(확장자 제외)이 그대로 URL 슬러그가 된다 → `/blog/<파일명>`.

- 소문자 ASCII kebab-case. **한글 금지** (URL 인코딩되어 지저분해진다)
- 검색 유입을 노려 내용이 드러나게: `jwt-refresh-token-race` (o) / `post-3` (x)
- 한 번 발행하면 바꾸지 않는다 (링크가 깨지고 giscus 댓글 스레드가 끊긴다)

MDX 컴포넌트를 쓰면 확장자를 `.mdx`로 한다. 안 쓰면 `.md`.

`-index.md`(하이픈으로 시작)는 목록 페이지 메타데이터이지 글이 아니다. 건드리지 않는다.

## 프론트매터

```yaml
---
title: "글 제목"
description: "한두 문장 요약."
date: 2026-08-25T00:00:00Z
author: "denver"
categories: ["백엔드/인프라"]
tags: ["spring", "jpa"]
draft: false
image: "" # 커버 이미지가 있을 때만. 없으면 생략
---
```

`description`은 스키마상 optional이지만 **항상 쓴다.** SEO 메타, RSS, 목록 카드, 사이트
검색이 전부 이 값을 쓴다. 비면 그 자리가 그냥 빈다.

`title`을 제외한 나머지는 기본값이 있다 — `author`는 `"Admin"`, `categories`/`tags`는
`["others"]`. 즉 빠뜨리면 에러가 아니라 **엉뚱한 값으로 조용히 발행된다.**

## 이미지

- 파일은 `public/images/posts/<slug>/` 아래에 둔다
- 본문에서는 절대경로로 참조: `![설명](/images/posts/<slug>/diagram.png)`
- 커버 이미지는 프론트매터 `image:` — 1200×500으로 렌더링된다
- OG 이미지는 손댈 필요 없다. 빌드 때 `/og/<slug>.png`로 자동 생성된다

## 사용 가능한 MDX 컴포넌트

import 없이 바로 쓴다 (`.mdx` 파일에서).

| 컴포넌트                                        | 용도                           |
| :---------------------------------------------- | :----------------------------- |
| `<Notice type="tip\|info\|warning\|note">`      | 주의사항, 함정, 보충 설명      |
| `<Tabs><Tab name="...">`                        | 대안 비교 (언어별·버전별 코드) |
| `<Accordion title="...">`                       | 긴 로그·전체 코드 접어두기     |
| `<Chat><Me>...</Me><Claude>...</Claude></Chat>` | AI와의 대화 기록               |
| `<Youtube id="..." title="..." />`              | 유튜브 임베드                  |
| `<Video src="foo.mp4" ... />`                   | `/videos/` 아래 영상           |
| `<Button label="..." link="..." />`             | 강조 링크                      |

코드블록은 언어를 반드시 지정한다 — 헤더 바에 언어 라벨과 복사 버튼이 붙는다.

## draft 함정

`draft: true`인 글은 `getStaticPaths` **이전에** 걸러진다. 목록에서만 숨는 게 아니라
`/blog/<slug>` 페이지 자체가 생성되지 않는다. `npm run dev`에서도 안 보인다.

→ **미리보기하려면 작업 브랜치에서 `draft: false`로 쓰고 `npm run dev`로 확인한다.**
`draft: true`는 "한동안 묵혀둘 미완성 글"에만 쓴다.

## 검증

```bash
npm run format
npm run check     # 에러 0
npm run build
npm run dev       # /blog/<slug> 확인
```

확인할 것:

- 본문 렌더링, 목차(TOC) 스크롤 스파이, 읽는 시간, 코드블록 복사 버튼
- `/categories/<슬러그>`, `/tags/<슬러그>` 목록에 글이 잡히는지
- 글 하단 관련글 / 이전·다음 글
- `dist/og/<slug>.png`가 생성됐는지 (공용 이미지로 fallback되지 않았는지)
- `dist/rss.xml`, `dist/search.json`에 글이 포함됐는지

`npx astro dev`를 직접 실행하지 않는다 — 테마 생성이 건너뛰어져 CSS 변수가 깨진다.
항상 `npm run dev`.

## 발행

`docs/backlog.md`의 PR 루프를 따른다 — 브랜치 → 검증 → `gh pr create` →
`gh pr checks --watch` → `gh pr merge --squash --delete-branch`.
`main`에 머지되면 GitHub Actions가 자동 배포한다.
