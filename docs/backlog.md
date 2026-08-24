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
- [x] **PR 10 · 검색 UX** — #18
      사이드바 검색을 라벨 + 단축키 힌트가 있는 버튼으로 교체(플랫폼별 `⌘K`/`Ctrl K`),
      `SearchModal`을 React 상태 기반으로 재작성.
      고친 버그: 키 입력마다 document 리스너가 쌓이던 누수, 모달이 닫혀 있어도
      화살표 키를 `preventDefault()` 해 사이트 전체 스크롤을 막던 문제,
      검색어를 이스케이프 없이 정규식에 넣어 `(` 입력 시 터지던 문제,
      결과 항목이 모두 `id="searchItem"`으로 중복되던 문제.
      추가: `role="dialog"`/`aria-modal`, 포커스 트랩, 닫을 때 포커스 복원.

## Phase 4 — 공유 · SEO

- [x] **PR 11 · RSS** — #19
      `@astrojs/rss`로 `/rss.xml` 생성, `<link rel="alternate">` 자동 검색, 푸터 링크.

      > `astro.config`가 `trailingSlash: "never"`이므로 `rss()`에도 `trailingSlash: false`를
      > 넘겨야 한다. 기본값은 슬래시를 붙여서 피드 링크가 실제 URL과 어긋난다.
      > 엔드포인트가 `.ts`라 `contentParser.astro`의 초안/미래글 필터를 쓸 수 없어 같은 규칙을 재구현했다.
- [x] **PR 12 · 메타데이터** — #20
      `canonical` 기본 출력(기존엔 한 번도 렌더되지 않았다), 포스트에 `og:type=article` +
      `article:published_time`/`author`/`tag`, `og:site_name`/`og:locale`,
      `BlogPosting`/`WebSite` JSON-LD, 404는 `noindex` + canonical 생략.
      함께 고침: `plainify`가 남기던 개행이 `<title>`·og·JSON-LD에 들어가던 문제,
      `item-prop` 오타, `og:url`의 취약한 문자열 조합.
- [x] **PR 13 · OG 이미지 자동 생성** — #21
      satori + resvg로 빌드 타임에 `/og/<post-id>.png` 생성. 제목·카테고리·날짜·브랜드.

      > 한글 폰트가 관건이었다. Noto Sans KR 전체는 10.4MB라 커밋도 매 빌드 다운로드도 부담이다.
      > Google Fonts의 `text=` 서브셋 파라미터로 그 글에 쓰인 글자만 받으면 ~48KB다.
      > **User-Agent가 중요하다** — 최신 UA는 woff2를 주는데 satori가 못 읽는다. 구형 UA로 요청해야 TTF가 온다.
      > 폰트 요청이 실패하면 기존 정적 이미지로 대체해 빌드가 깨지지 않게 했다.

## Phase 5 — 마무리

- [x] **PR 14 · 홈/푸터** — #22
      `config.site.tagline` 추가 후 홈 히어로에 노출(기존엔 `h1`이 사이드바 로고와
      같은 "denver.log"만 반복했다), `menu.footer` 채우기, 404에 글 목록 링크 추가.
      함께 고침: 브레드크럼이 영문 "Home"이었고, 홈에서 자기 자신을 가리키는 항목 하나만
      렌더했으며, `aria-current` 대신 `aria-label="page"`를 써서 접근 이름에 "page"가 들어갔다.
- [x] **PR 15 · 최종 점검** — #23
      빌드 산출물 감사: 중복 id 0, alt 없는 이미지 0, 사이트맵에 OG PNG·404 미포함 확인.
      고침: `.tag-chip`/`.code-block-lang`의 12px 글씨가 `bg-light` 위에서 4.51:1로
      여유가 없어 `text-text`(8.4:1)로 상향, 사이드바 `<aside>`에 접근 이름 부여,
      TOC 레일의 `<aside>`를 `div`로 (이름 없는 complementary 랜드마크 중복 제거).
      `PRODUCT.md`를 현재 상태로 갱신.

      > Lighthouse 실측은 하지 못했다 — 이 환경에 브라우저가 없다. 정적 감사와
      > 대비 계산으로 대체했으므로, 실제 점수는 사용자가 확인해야 한다.

---

## 남은 것 / 다음에 볼 만한 것

- 빈 카테고리 3개(`언어/CS 기초`, `프론트엔드`, `백엔드/인프라`)가 사이트맵에 들어간다.
  글이 쌓이면 자연히 해소되지만, 그전까지는 얇은 페이지다.
- 숏코드(`Accordion`/`Button`/`Notice`/`Tab`/`Video`/`Youtube`)는 아직 어떤 글에서도 쓰이지 않는다.
- `astro check`가 `markdown.remarkPlugins ... deprecated` 경고를 낸다. 설정은 이미
  `unified({...})`로 넘기고 있어 오탐으로 보이나 확인 필요.
- Lighthouse 실측, 실제 브라우저에서 라이트/다크 × 데스크톱/모바일 육안 확인.
