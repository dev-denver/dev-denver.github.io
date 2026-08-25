---
name: blog-post
description: Use when the user wants to turn notes into a published blog post on this site — an intake markdown file brought over from another repository ("이 md 정리해서 글 올려줘", "이 내용으로 글 써줘"), a rough draft, or a topic to write up from scratch. Handles frontmatter, category/tag validation, slug naming, images, MDX shortcodes, and the verify-then-publish loop. Not for editing the site template, styles, or layout.
user-invocable: true
argument-hint: "[인테이크 md 경로 또는 주제]"
---

# 블로그 글 발행

인테이크 md(또는 자유 형식 노트)를 `src/content/blog/`의 게시글로 변환한다.

관련 문서: `docs/authoring/posting.md` (발행 가이드), `docs/authoring/capture-prompt.md`
(외부 레포용 캡처 프롬프트). 이 스킬은 그 규칙의 실행판이다.

## 절대 규칙

- **없는 사실을 지어내지 않는다.** 인테이크에 없는 내용을 채워 넣지 않는다. 특히 인테이크에
  없는 코드를 새로 작성해서 "이렇게 하면 됩니다"라고 쓰지 않는다.
- **코드와 에러 로그 원문은 변형 금지.** 줄바꿈, 변수명, 스택트레이스를 손대지 않는다.
  생략이 필요하면 `// ...` 로 명시적으로 표시한다.
- `> [확인필요]` 표시가 있으면 → 사용자에게 물어 해소하거나, 글에서 "아직 확인 못 한 부분"
  으로 정직하게 남긴다. **절대 확정된 사실인 것처럼 쓰지 않는다.**
- 톤은 `src/content/blog/building-this-blog.md`를 기준으로 맞춘다. 한국어, 담백한
  기술 문서체, 학습 기록 성격 (`PRODUCT.md`).
- 과정을 지운 결론만 남기지 않는다. 실패한 시도가 이 블로그의 핵심 가치다.

## 절차

### 1. 재료 읽기

인테이크 md를 읽는다. `kind`(`concept` / `problem` / `retro`)를 확인한다.
프론트매터가 없는 자유 형식이면 내용을 보고 `kind`를 추론한 뒤 사용자에게 확인받는다.

`kind`별 목차 뼈대는 `docs/authoring/posting.md` "글 유형" 참고.

### 2. 기존 태그 수집

```bash
grep -h "^tags:" src/content/blog/*.md src/content/blog/*.mdx
```

제안 태그와 의미가 같은 태그가 이미 있으면 **기존 것을 재사용한다**
(`nextjs` vs `next.js` 표기 분열 방지). 여기서 나온 목록이 실질적 source of truth이고,
`docs/authoring/posting.md`의 목록은 시드일 뿐이다.

소문자 ASCII, 2~4개. 한글 태그 금지 (슬러그가 깨진다).

### 3. 카테고리 검증 — 여기서 막지 못하면 아무도 못 막는다

`src/config/categories.json`을 읽고 `label`과 **정확히 일치**하는지 확인한다.
불일치하면 진행하지 말고 사용자에게 어느 카테고리인지 되묻는다.

`src/content.config.ts`의 zod 스키마는 카테고리를 자유 문자열로 받으므로, 오타가 나도
빌드는 통과하고 고아 카테고리 페이지가 조용히 생긴다. 이 단계가 유일한 방어선이다.

### 4. 슬러그 확정

파일명(확장자 제외)이 그대로 URL이 된다 (`/blog/<slug>`).

- 소문자 ASCII kebab-case, 한글 금지
- 내용이 드러나게 (`jwt-refresh-token-race`, not `post-3`)
- `ls src/content/blog/`로 중복 확인
- MDX 컴포넌트를 쓰면 `.mdx`, 아니면 `.md`

### 5. 본문 작성

인테이크의 재료를 블로그 글로 재구성한다. 순서를 독자 기준으로 다시 짜되, 재료에 있던
정보(코드, 경로, 에러 원문, 실패한 시도)는 버리지 않는다.

- `##` 부터 시작한다 (`#`은 레이아웃이 title로 렌더링한다)
- 코드블록에 언어를 반드시 지정한다 — 헤더 바에 언어 라벨과 복사 버튼이 붙는다
- 파일 경로는 코드블록 위나 안에 주석으로 남긴다
- 도입부 1~2문단으로 "무엇을 왜 다루는지" 먼저 밝힌다 (검색 유입 독자 기준)

### 6. MDX 컴포넌트 (import 불필요, 자동 임포트됨)

과하게 쓰지 않는다. 아래에 해당할 때만.

| 상황                      | 컴포넌트                                        |
| :------------------------ | :---------------------------------------------- |
| 함정·주의사항             | `<Notice type="warning">`                       |
| 보충 설명                 | `<Notice type="info">` 또는 `type="tip"`        |
| 대안 비교 (언어별·버전별) | `<Tabs><Tab name="...">`                        |
| 긴 로그·전체 코드 접기    | `<Accordion title="...">`                       |
| AI와의 대화 기록          | `<Chat><Me>...</Me><Claude>...</Claude></Chat>` |

하나라도 쓰면 확장자는 `.mdx`.

### 7. 이미지

인테이크에 `<!-- IMAGE: 설명 | 원본경로 -->` 주석이 있으면 사용자에게 파일을 요청한다.

- `public/images/posts/<slug>/` 에 배치
- 본문에서 절대경로 참조: `![설명](/images/posts/<slug>/foo.png)`
- 커버 이미지는 프론트매터 `image:` (1200×500으로 렌더링)
- 이미지가 없으면 `image:` 항목 자체를 생략한다 (빈 문자열 두지 않기)

OG 이미지는 손대지 않는다 — 빌드 때 `/og/<slug>.png`로 자동 생성된다.

### 8. 프론트매터

```yaml
---
title: "글 제목"
description: "한두 문장 요약."
date: 2026-08-25T00:00:00Z
author: "denver"
categories: ["백엔드/인프라"]
tags: ["spring", "jpa"]
draft: false
---
```

- `description`은 **항상 쓴다.** 스키마상 optional이지만 SEO 메타·RSS·목록 카드·사이트
  검색이 전부 이 값을 쓴다.
- `date`는 발행일 기준 `YYYY-MM-DDT00:00:00Z`. 인테이크의 `date_studied`가 아니라
  발행 시점을 쓴다 (미래 날짜는 빌드에서 제외된다).
- `author`는 `"denver"`. 빠뜨리면 기본값 `"Admin"`으로 조용히 발행된다.
- `title`을 뺀 전부에 기본값이 있어 누락이 에러로 안 잡힌다. 직접 확인할 것.

### 9. draft 함정

`draft: true`인 글은 `getStaticPaths` 이전에 걸러져 `/blog/<slug>` 페이지가 아예 생성되지
않는다. `npm run dev`에서도 안 보인다.

→ **작업 브랜치에서 `draft: false`로 쓰고 `npm run dev`로 미리보기한다.**
`draft: true`는 사용자가 "한동안 묵혀두겠다"고 명시할 때만 쓴다.

### 10. 검증 후 발행

```bash
npm run format
npm run check     # 에러 0
npm run build
npm run dev       # /blog/<slug>
```

확인: 본문 렌더링 · 목차 · 코드 복사 버튼 · `/categories/<슬러그>`와 `/tags/<슬러그>`에
글이 잡히는지 · 관련글 · `dist/og/<slug>.png` 생성 여부.

사용자가 글 내용을 확인한 뒤에 커밋한다. 발행은 `docs/backlog.md`의 PR 루프를 따른다
(브랜치 → `gh pr create` → `gh pr checks --watch` → `gh pr merge --squash`).

## 하지 말 것

- `src/styles/generated-theme.css`, `search.json`, `llms.txt` 직접 수정 (생성물)
- `npx astro dev` 직접 실행 — 항상 `npm run dev`
- 발행된 글의 파일명 변경 (링크가 깨지고 giscus 댓글 스레드가 끊긴다)
- `-index.md` 수정 (목록 페이지 메타데이터이지 글이 아니다)
