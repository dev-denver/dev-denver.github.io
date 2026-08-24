# 디자인 개선 백로그

이 파일은 블로그 디자인/기능 개선 작업의 **진행 상태 원본**이다. 세션이 끊기거나 사용량 한도로 중단되면, 다음 세션은 이 파일의 첫 미체크 항목부터 이어서 진행한다.

## 재개 방법

```
claude -c        # 직전 세션 이어받기
> 계속           # docs/backlog.md 를 읽고 다음 미체크 항목부터 진행
```

## 작업 규칙

작업 단위는 **PR 1개**이며, 각 항목마다 아래 루프를 그대로 따른다.

1. `git switch main && git pull` → 작업 브랜치 생성 (`feat/` `fix/` `style/` `chore/`)
2. Astro 관련 변경이면 **Astro docs MCP**로 해당 문서 확인 (`AGENTS.md` 강제)
3. 템플릿 구조·스타일·설정 변경이면 `.agents/skills/astro-template-guidance/references/` 확인 (`AGENTS.md` 강제)
4. 구현
5. 로컬 검증: `npm run format` → `npm run generate-json` → `npm run check` → `npm run build`
6. `gh pr create` — 제목은 Conventional Commits + 한국어 (기존 히스토리 컨벤션)
7. `gh pr checks --watch` — **PR Checks 통과가 머지 조건.** 저장소에 브랜치 보호 규칙이 없으므로 이 확인을 생략하지 않는다
8. `gh pr merge --squash --delete-branch`
9. 다음 항목으로

**이 파일의 체크박스는 해당 작업 PR 안에서 함께 갱신한다** — 별도 PR을 만들지 않는다. 즉 PR *N*의 커밋에는 PR *N-1* 항목의 체크가 함께 들어간다.

### 지켜야 할 제약

- `src/styles/generated-theme.css` 는 **직접 수정 금지** — `src/config/theme.json` → `scripts/themeGenerator.js` 로 생성된다
- `.json/search.json`, `llms.txt` 도 생성물이므로 직접 수정 금지
- `npx astro dev` 직접 실행 금지 — 테마/JSON 생성이 건너뛰어져 CSS 변수와 검색이 깨진다. 항상 `npm run dev`
- 패키지 매니저는 **npm** (템플릿 가이드 문서는 pnpm으로 쓰여 있으나 이 저장소는 npm)
- 하드코딩 hex 금지 — 테마 토큰 사용
- 한국어 콘텐츠/UI 유지 (`PRODUCT.md`)

## 디자인 방향

레퍼런스는 **가독성 우선의 담백한 기술 문서 톤**. 좌측 사이드바 레이아웃은 유지한다.

**팔레트는 무채색을 유지한다.** 액센트 색을 쓰지 않고 상태를 구분한다:

| 상태 | 처리 |
| --- | --- |
| 링크 | 밑줄 + 진한 글자색(`text_dark`), hover 시 밑줄 두께/오프셋 변화 |
| 활성 | 배경 칩 (라이트 `#f6f6f6` / 다크 `#222222`) + 굵기 |
| 포커스 | 2px 외곽선 + offset |
| 계층 | 회색 단계(`text` / `text_light` / `border`)와 여백 |

색이 없으므로 대비·굵기·여백이 유일한 신호다. 모든 상태에 WCAG AA 이상을 확보한다.

---

## Phase 0 — 실행 인프라

- [x] 이 백로그 파일 커밋
- [x] `.claude/settings.local.json` 권한 allowlist 추가 (git 추적 대상 아님)

## Phase 1 — 시각 디자인 기반

- [x] **PR 1 · 무채색 상태 체계** — #8
      사이드바 hover/활성 칩 + 굵기 + inset 레일, `aria-current`, 본문 링크 밑줄,
      전역 `:focus-visible` 외곽선, 다크모드 `text_light` 위계 분리(`#B4AFB6` → `#9A959F`).
      함께 고친 버그: 인라인 코드가 라이트 모드에서 흰 글자로 보이지 않던 문제, 검색 버튼 hover 무반응.
- [x] **PR 2 · 한국어 타이포그래피** — #10
      `word-break: keep-all`(한국어 줄바꿈), 본문 측정폭 46rem, 헤딩 크기를 rem 토큰에서
      em 기반으로 전환(모바일 루트가 0.8배라 rem 헤딩이 본문 크기로 수렴하던 문제),
      헤딩 여백·줄간격 조정, h2 하단 헤어라인, 인용구 톤다운, 포스트 메타 위계 정리.
- [x] **PR 3 · 죽은 코드 정리 + 문의 페이지 제거** — #11
      문의 페이지·콘텐츠·내비 항목·`contact` 컬렉션·`contact_form_action` 삭제.
      `navigation.css` 삭제(살아있는 `.navbar-brand`/`.theme-switcher`는 `components.css`로 이동),
      `safe.css`의 `#nav-toggle`·swiper 규칙, `useTheme.ts`·`bgImageMod.ts`·`types/index.d.ts`·`sortByWeight`,
      `[regular].astro` + `pages` 컬렉션(빈 컬렉션이라 매 빌드 경고를 냈다), `settings.sticky_header`.
      의존성은 `astro-swiper`·`prop-types`·`eslint` 제거 — **`@justinribeiro/lite-youtube`는 유지**
      (`src/layouts/shortcodes/Youtube.tsx`가 실제로 import 한다).

## Phase 2 — 읽기 경험

- [x] **PR 4 · 코드블록** — #12
      Shiki 듀얼 테마(`github-light`/`github-dark`), `wrap: false` + 가로 스크롤,
      빌드 타임 rehype 플러그인으로 언어 라벨 + 복사 버튼 헤더 생성.

      > **주의**: 마크다운 파이프라인(`astro.config.mjs`의 `processor`/`shikiConfig`,
      > rehype·remark 플러그인)을 바꾸면 로컬에서 `rm -rf .astro` 후 빌드해야 한다.
      > Astro가 렌더된 콘텐츠를 `.astro/`에 캐시해서, 캐시가 있으면 플러그인이
      > 아예 호출되지 않는다. CI는 매번 새로 체크아웃하므로 영향 없다.
- [x] **PR 5 · 목차(TOC)** — #13
      `render()`가 주는 headings로 빌드 타임 생성. xl 이상은 sticky 레일,
      그 아래는 article 안 접이식 `<details>`. IntersectionObserver 스크롤 스파이.
      컴포넌트 TOC가 대체하므로 `remark-toc`·`remark-collapse` 제거.
- [x] **PR 6 · 본문 부가 정보** — #14
      `readingTime.ts`를 한국어 기준으로 재작성(한글 음절/라틴 단어/코드 줄을 각각 계산) 후 연결,
      이전/다음 글 내비게이션, 헤딩 앵커 링크.

      > 헤딩 앵커는 rehype가 아니라 클라이언트 스크립트다. 사용자 rehype 플러그인은
      > Astro가 헤딩 `id`를 붙이기 **전에** 실행되어 빌드 타임에는 링크할 id가 없다.
- [x] **PR 7 · 헤딩 계층/접근성** — #15
      사이드바 `h5`(페이지 `h1`보다 먼저 나오던 것)를 `aria-labelledby` 라벨로 교체,
      내비게이션에 접근 가능한 이름 부여, `AuthorCard` `h4` → `h2`,
      포스트의 `태그 :`/`공유 :` `h5`를 인라인 라벨로 교체.
      `BlogCard`의 `h3`은 `PostGrid`의 sr-only `h2`와 "관련 글" `h2` 아래라 이미 올바르다.

## Phase 3 — 글 탐색

- [x] **PR 8 · 목록 카드** — #16
      3열 카드 그리드 → 단일 컬럼 구분선 리스트 (썸네일이 없어 그리드 셀이 대부분 비었다).
      `BlogCard`에 태그 칩·읽는 시간 노출, 발췌를 plainify 후 자르도록 수정,
      작성자 제거(1인 블로그), `pagination` 2 → 10.
      `.tag-chip`을 목록과 포스트 하단이 공유. 관련 글 섹션도 같은 리스트 형태로 통일.
      함께 고침: 날짜가 영문 `dd MMM, yyyy`였던 것을 `yyyy년 M월 d일`로,
      태그가 `humanize()`로 "github-pages" → "Github pages"로 잘못 대문자화되던 것을 원문 그대로.
- [x] **PR 9 · 목록 페이지 일관성** — #17
      공통 `PostListPage` 레이아웃(헤더·빈 상태·페이지네이션)으로 blog/태그/카테고리 통일,
      `AuthorPage` 레이아웃으로 작성자 페이지 분리. 태그/카테고리/작성자에 페이지네이션 라우트 추가,
      `src/lib/utils/paginate.ts`로 페이지 계산 공용화.
      함께 고침: 작성자 페이지의 글 목록이 정렬되지 않아 glob 순서로 나오던 버그.
- [ ] **PR 10 · 검색 UX**
      사이드바 검색 버튼에 `⌘K` 힌트 노출, `SearchModal` 한국어·접근성(포커스 트랩, `aria-*`) 보강.

## Phase 4 — 공유 · SEO

- [ ] **PR 11 · RSS**
      `@astrojs/rss`로 `/rss.xml` 생성, `<link rel="alternate">`, 사이드바/푸터 링크.
- [ ] **PR 12 · 메타데이터**
      `canonical` 기본 출력 (현재 어떤 페이지도 넘기지 않아 한 번도 렌더되지 않음),
      포스트에 `og:type=article` + `article:published_time`, `og:site_name`, `twitter:card`, `BlogPosting` JSON-LD.
- [ ] **PR 13 · OG 이미지 자동 생성**
      빌드 타임 생성(정적 호스팅 제약 충족), 글 제목·날짜·브랜드 반영.

## Phase 5 — 마무리

- [ ] **PR 14 · 홈/푸터**
      히어로에 사이트 성격 태그라인 (현재 `h1`이 사이드바 로고와 같은 "denver.log"를 반복),
      비어 있는 `menu.footer` 채우기, 404 개선.
- [ ] **PR 15 · 최종 점검**
      대비·포커스·랜드마크·Lighthouse 확인, `PRODUCT.md` 갱신.
