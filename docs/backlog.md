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
5. 로컬 검증: `npm run format` → `npm run check` → `npm run build`
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

## Phase 6 — 후속 정리

- [x] **PR 16 · 빈 카테고리 페이지 제거 + 폰트 로딩 최적화** — #24
      0건 카테고리는 사이드바에서도 `/categories`에서도 링크되지 않는 고아 페이지였다.
      생성을 중단해 사이트맵 13 → 10.
      `IBM Plex Sans KR 500`은 사용처가 죽은 코드뿐이라 제거 (폰트 CSS 308KB → 249KB).
      Google Fonts 스타일시트를 논블로킹으로 전환.

      > Lighthouse 실측 (headless chromium, `astro preview`): **성능 95~99 / 접근성 100 /
      > 모범사례 100 / SEO 100**. 폰트 논블로킹 전환으로 성능 96 → 98, FCP 2.1s → 1.4s,
      > CLS는 0.065로 변동 없음.
      > 주의: Google Fonts를 실제로 받아오므로 측정 편차가 크다. 같은 빌드에서 96/96/90이
      > 나온 적이 있다 — 한 번 측정으로 판단하지 말 것.

- [x] **PR 17 · 발췌문 블록 경계 수정** — #25
      실제 브라우저 스크린샷(라이트/다크 × 데스크톱/모바일 8장)으로 육안 확인.
      다크모드 감지·목차 레일·코드블록·한국어 줄바꿈 모두 정상.
      확인 중 발견한 버그: `plainify`가 블록 태그를 구분자 없이 제거해
      홈 발췌문이 "정리해본다. **스택Astro** — 정적 사이트..."로 붙어 나왔다.
      블록 종료 태그를 공백으로 치환하도록 수정 (인라인 태그는 그대로 제거해 단어가 쪼개지지 않게).

- [x] **PR 18 · 사이드바 하단 링크 블록 재구성**
      하단 블록의 시각적 무게가 정보 위계와 반대였다 — `.social-icons`의 36px 솔리드
      `bg-primary` 사각형 두 개가 사이드바에서 가장 강한 요소라, 주요 메뉴·카테고리보다
      GitHub/Instagram이 세게 보였다. 무채색 팔레트에서는 대비가 유일한 신호이므로
      가장 안 중요한 것이 가장 진한 상태였던 셈이다.
      같은 성격의 목적지 링크 3개가 세 형태(솔리드 칩 2 + 외곽선 버튼 1)로 흩어져 있었고,
      이력서(콘텐츠 목적지)가 테마 토글(UI 환경설정)과 한 행에 묶여 동급으로 읽혔다.
      → 이력서·GitHub·Instagram을 `.sidebar-outlink` 한 목록으로 통합(카테고리 행과 같은
      모양·같은 hover 칩), 테마 전환은 헤어라인 아래 별도 설정 행으로 분리.
      외부 링크 표시는 인라인 SVG 화살표 — 이력서엔 대응 브랜드 아이콘이 없어 세 행이
      어긋나므로 브랜드 마크는 쓰지 않았다.

      > 이력서는 `social.json`이 아니라 `config.navigation_button`에 그대로 두고
      > 사이드바에서 합성한다. `social.json`은 푸터·저자 카드에도 먹이므로 거기 넣으면
      > 이력서가 세 곳으로 새어 나간다 (`.impeccable/critique/...:60`가 이미 뺐던 항목).

      함께 고침: `social.main`이 사이드바와 푸터 양쪽에서 같은 검정 칩으로 렌더돼 한
      페이지에 같은 아이콘 쌍이 두 번 나오던 중복 — 푸터는 기존 푸터 메뉴와 같은 밑줄
      텍스트 링크로 낮췄다. `ThemeSwitcher`의 `class="theme-switcher undefined"`
      (`${className}` 보간).
      `ThemeSwitcher`에 `labelledby` prop 추가 — 보이는 "테마 전환" 라벨이 생겨
      `sr-only` 스팬이 중복되므로, 전달되면 스팬을 빼고 `aria-labelledby`로 이름을 받는다
      (WCAG 2.5.3, 접근 이름 = 보이는 라벨).
      `.sidebar-section-label`은 카테고리 라벨의 유틸리티 문자열을 뽑은 것으로 두 라벨이
      공유한다.

      > 검증: headless chromium 스크린샷 (라이트/다크 × 데스크톱/모바일 드로어),
      > CDP 접근성 트리로 `navigation "링크"` · `checkbox "테마 전환"` 단일 이름 확인,
      > `forcePseudoState`로 hover 칩과 `:focus-visible` 외곽선 확인.
      > 사이드바에 페이지 `h1`보다 앞서는 헤딩이 새로 생기지 않았다(`aria-labelledby` 유지).

## Phase 7 — 정리·최적화

- [x] **PR 19 · 죽은 코드·미사용 의존성 정리 + 이미지 재인코딩** — #28
      `Share.astro`(공유 버튼 제거의 잔재), `Announcement.tsx` + `config.announcement`
      (`enable: false`인데 `client:only`라 페이지마다 하이드레이션 루트를 하나 더 만들고
      있었다), `scripts/removeDarkmode.js`, `styles/utilities.css` 전체
      (`form-input`/`form-label`/`bg-gradient` 모두 사용처 0), `.btn-sm`, `.modal*`.
      의존성은 `@digi4care/astro-google-tagmanager`(플레이스홀더 상태),
      `prettier-plugin-tailwindcss`(`.prettierrc`에 등록조차 안 돼 무동작), `vite`(중복 선언).
      `Logo.astro`의 이미지 로고 분기는 `site.logo`가 늘 빈 값이고 override 호출부도 없어
      한 번도 렌더되지 않았다 — 텍스트 전용으로 줄이고 죽은 config 키 4개 제거.
      파비콘 70KB → 7.2KB(128색 팔레트), 아바타 700KB → 145KB.

      > 오탐 주의: **`tailwind-bootstrap-grid`는 살아 있다.** 출력 CSS에서 `.col-*`가
      > 안 보이는 건 전부 `.lg\:col-8` 처럼 이스케이프된 반응형 변형이기 때문이며,
      > 레이아웃 17곳의 `container`와 10곳의 `row`가 여기 의존한다. 제거하면 깨진다.

- [x] **PR 20 · 검색 바닐라 포팅 + 인덱스 엔드포인트화** — #29
      검색 모달 하나 때문에 전 페이지가 React 런타임을 받고 있었다.
      **페이지당 JS 85,543 → 9,225 bytes (gzip), 89% 감소.** `client:` 지시자 0개.
      `.json/search.json`을 `import` 해서 **모든 글의 본문 전체**가 JS 번들에 인라인되던
      것을 `/search.json` 엔드포인트 + 첫 오픈 시 `fetch`로 전환, 본문 대신 빌드 타임
      `plainify` 발췌 1000자. `scripts/jsonGenerator.js`·`gray-matter`·`.json/` 폴더 제거.
      초안/미래 글 필터를 `lib/utils/publishedPosts.ts`로 합쳐 RSS와 공유
      (RSS가 놓치던 `--buildDrafts`/`--buildFuture`도 이제 동작한다).

      > **`ClientRouter` 주의**: document 레벨 리스너는 모듈 스코프에서 한 번만 등록하고
      > 페이지마다 새로 생기는 다이얼로그는 `controller` 참조로 갈아끼운다.
      > `astro:page-load`마다 다시 붙이면 탐색할 때마다 쌓인다 (PR 10에서 고쳤던 종류의 누수).

      > 검증: 빌드된 스크립트를 빌드된 HTML 위에서 jsdom으로 구동해 41개 항목 통과.
      > **실제 브라우저 외형 확인은 못 했다** — 이 환경에서 headless chrome 다운로드가 막힌다.

- [x] **PR 21 · OG 폰트 서브셋 1회 요청** — #30
      `loadKoreanSubset`의 캐시 키에 글자 집합이 들어가 글마다 달라져 **한 번도 적중하지
      않았다.** `primeKoreanSubsets()`로 전체 글의 문자 합집합을 무게별 1회만 받는다.
      카드 3장 기준 폰트 요청 12회 → **4회(상수)**.

      > 함정: 프라임된 promise를 rejected 상태로 저장하면 아무도 즉시 await 하지 않아
      > Node가 `UnhandledPromiseRejection`으로 빌드를 죽인다. 실패 시 `null`로 resolve.
      > 폰트 실패 → 정적 이미지 폴백은 `fetch` 강제 실패로 검증했다.

- [x] **PR 22 · llms 생성기 죽은 SSR 경로 제거** — #31
      859 → 488줄, **산출물 12개 파일 바이트 일치.** `output: "static"`이라 실행될 수 없는
      코드였다: `astro.config.mjs`를 정규식으로 재작성해 임시 `.mjs`를 쓰고 `import()`
      하던 `getAstroI18nConfig()`(i18n이 없어 늘 `null` 반환), `dist/server/entry.mjs`를
      `spawn` 하는 임시 서버 일체, `discoverSsrPageRoutes`, `getClientDir`.

      > llms 생성기 자체는 **정상 동작한다**. 로컬 `dist`가 비어 보였던 건 `npm run build`가
      > 아니라 `astro build`만 돌렸기 때문이었다.

## 결정된 것 (다시 논의하지 말 것)

- **MDX와 숏코드는 유지한다.** `astro check`의 `markdown.remarkPlugins ... deprecated`
  경고는 우리 설정이 아니라 `@astrojs/mdx`가 유발한다 — `mdx()`를 빼면 사라지고,
  우리 rehype 플러그인을 빼도 그대로다. 즉 우리 쪽에서 고칠 수 없는 업스트림 경고이며
  빌드 로그에만 나오고 동작에는 영향이 없다.
  숏코드(`Accordion`/`Button`/`Notice`/`Tab`/`Video`/`Youtube`)가 아직 안 쓰이더라도,
  나중에 글에서 쓰려면 MDX가 필요하므로 남겨 둔다.
- **폰트는 두 서체를 유지한다.** 본문 Noto Sans KR, 헤딩 IBM Plex Sans KR.
  Noto 하나로 통일하면 폰트 CSS가 249KB → 약 125KB로 줄지만 헤딩의 서체 구분이 사라진다.
  이미 논블로킹 로딩으로 FCP 1.4s / 성능 98을 확보해 성능상 급하지 않다.

## 남은 것 / 다음에 볼 만한 것

- 사이드바가 0건 카테고리 3개를 비활성 상태로 계속 보여준다. 예정 주제를 드러내는
  효과는 있지만 "0"이 셋 나열되는 인상도 있다 — 글이 쌓이면 자연히 해소된다.
- Lighthouse 재측정 시 주의: Google Fonts를 실제로 받아오므로 편차가 크다.
  같은 빌드로 3회 이상 돌려 중앙값을 볼 것. React 제거 후 재측정할 만하다.
- **검색 모달 외형을 실제 브라우저에서 한 번 볼 것** (#29). 클래스명은 전부 유지했고
  jsdom으로 동작은 41개 항목 검증했지만 CSS/레이아웃은 확인하지 못했다.
- `@tailwindcss/forms`는 남겨 뒀다. `form-input`/`form-label`을 지운 뒤에도 검색
  입력창 기본 리셋에 영향을 줄 수 있어, 육안 확인 뒤에 제거 여부를 정하는 게 안전하다.
- Astro가 `@astrojs/react` 때문에 react-dom 청크(약 191KB)를 여전히 `dist/_astro/`에
  내보낸다. 어떤 HTML도 참조하지 않아 사용자는 받지 않지만 배포 산출물에는 남는다.
  숏코드가 `.tsx`인 한 통합을 뺄 수 없다 — 숏코드를 `.astro`로 옮기면 정리된다.
