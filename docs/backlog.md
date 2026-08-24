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
- [ ] **PR 2 · 한국어 타이포그래피**
      본문 `line-height`/`letter-spacing`/측정폭(65~75자) 조정, `--text-h1`~`h6` 스케일 재조정,
      `src/styles/components.css`의 `.content` prose 규칙(150~171행) 정리.
- [ ] **PR 3 · 죽은 코드 정리 + 문의 페이지 제거**
      `src/pages/contact.astro`·`src/content/contact/`·`menu.json` 문의 항목 삭제 (`action="#"`로 조용히 실패하던 폼).
      `navigation.css`의 삭제된 헤더 잔재, `safe.css`의 `#nav-toggle`,
      미사용 `src/hooks/useTheme.ts`·`src/lib/utils/bgImageMod.ts`·`src/types/index.d.ts`·`src/pages/[regular].astro`,
      미사용 의존성(`astro-swiper`, `@justinribeiro/lite-youtube`, `prop-types`, 설정 없는 `eslint`), `settings.sticky_header`.

## Phase 2 — 읽기 경험

- [ ] **PR 4 · 코드블록**
      Shiki 라이트/다크 듀얼 테마, 복사 버튼, 언어 라벨, 가로 스크롤 처리.
- [ ] **PR 5 · 목차(TOC)**
      포스트 헤딩에서 빌드 타임 목차 생성 + 데스크톱 고정/모바일 접이식, 스크롤 스파이.
- [ ] **PR 6 · 본문 부가 정보**
      미사용 `src/lib/utils/readingTime.ts` 한국어화 후 연결("N분 읽기"), 이전/다음 글 내비게이션, 헤딩 앵커 링크.
- [ ] **PR 7 · 헤딩 계층/접근성**
      사이드바 `h5` → 페이지 `h1` 역전 해소, 포스트 카드 제목 레벨 정리.

## Phase 3 — 글 탐색

- [ ] **PR 8 · 목록 카드**
      `BlogCard`에 태그 노출 (태그가 내비 항목인데 카드엔 없음), 카드 여백·구분선·hover 정리,
      `config.settings.pagination` 2 → 10.
- [ ] **PR 9 · 목록 페이지 일관성**
      태그/카테고리/작성자 페이지 페이지네이션 추가, 빈 카테고리 처리, 목록 헤더 통일.
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
