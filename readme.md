# denver.log

> 개발하면서 부딪힌 문제와 새로 배운 것을 정리해 두는 개인 개발 블로그입니다.

[![Deploy to GitHub Pages](https://github.com/dev-denver/dev-denver.github.io/actions/workflows/deploy-to-github-pages.yml/badge.svg)](https://github.com/dev-denver/dev-denver.github.io/actions/workflows/deploy-to-github-pages.yml)
[![Built with Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**🔗 사이트: [dev-denver.github.io](https://dev-denver.github.io)**

## 소개

완성된 결과물보다 배우는 과정을 정직하게 남기는 것을 목표로 하는 TIL(Today I Learned) 성격의
블로그입니다. 같은 주제로 헤매는 다른 개발자에게 참고가 되면 그것으로 성공입니다.

- Astro + Tailwind CSS 기반 정적 사이트, GitHub Pages에 자동 배포
- 무채색 팔레트를 유지하고, 상태 구분은 색이 아니라 밑줄·배경 칩·굵기·외곽선으로 표현
- 한국어 콘텐츠·UI를 기본으로 함

## 주요 기능

- 좌측 사이드바 내비게이션 (메뉴, 카테고리, 검색, 다크모드 전환, 이력서 링크)
- 읽기 보조: 목차(스크롤 스파이), 읽는 시간, 이전/다음 글, 헤딩 앵커, 코드블록 복사
- 글별 OG 이미지 빌드타임 생성, `BlogPosting` JSON-LD
- `/rss.xml` 구독 피드, `llms.txt` / `llms-full.txt` 생성
- [giscus](https://giscus.app) 기반 댓글 (GitHub Discussions 연동)

## 기술 스택

| 영역          | 사용 기술                                 |
| :------------ | :---------------------------------------- |
| 프레임워크    | [Astro](https://astro.build) 7            |
| 스타일        | [Tailwind CSS](https://tailwindcss.com) 4 |
| 콘텐츠        | Markdown / MDX                            |
| 인터랙티브 UI | React                                     |
| 배포          | GitHub Actions → GitHub Pages             |

## 시작하기

```bash
npm install
npm run dev      # localhost:4321
```

| 명령어                  | 설명                              |
| :---------------------- | :-------------------------------- |
| `npm install`           | 의존성 설치                       |
| `npm run dev`           | 로컬 개발 서버 실행 (`:4321`)     |
| `npm run build`         | 프로덕션 빌드 (`./dist/`)         |
| `npm run preview`       | 빌드 결과 로컬 미리보기           |
| `npm run format`        | Prettier로 코드 포맷팅            |
| `npm run format:check`  | 포맷 검사만 수행 (CI에서 사용)    |
| `npm run check`         | Astro 타입 체크                   |
| `npm run generate-llms` | `llms.txt` / `llms-full.txt` 생성 |

## 프로젝트 구조

```text
src/
├── config/     # 사이트 설정 (config, menu, social, theme, categories)
├── content/    # 블로그 글, 저자 정보 (Markdown/MDX)
├── layouts/    # 페이지 레이아웃과 컴포넌트
├── lib/        # 콘텐츠 파싱, OG 이미지 생성 등 빌드 유틸
├── pages/      # 라우트 (블로그, 태그, 카테고리, RSS 등)
└── styles/     # 전역 스타일

scripts/        # 빌드 전/중 실행되는 Node 스크립트 (테마·JSON·llms 생성 등)
```

## 글 작성하기

`src/content/blog/` 아래에 `.md` 또는 `.mdx` 파일을 추가합니다.

```md
---
title: "글 제목"
date: 2026-08-25T00:00:00Z
description: "한 줄 요약."
author: "denver"
categories: ["프론트엔드"]
tags: ["astro"]
draft: false
---

본문 내용을 작성합니다.
```

- `draft: true`로 두면 빌드에서 제외됩니다. 이때 `/blog/<슬러그>` 페이지 자체가 생성되지
  않아 `npm run dev`에서도 보이지 않으므로, 미리보기는 작업 브랜치에서 `draft: false`로
  두고 합니다.
- 사용 가능한 카테고리 목록은 `src/config/categories.json`에서 관리합니다.
- 파일명(확장자 제외)이 그대로 URL 슬러그가 됩니다. 소문자 ASCII kebab-case로 짓습니다.

다른 프로젝트에서 공부한 내용을 가져와 글로 만드는 흐름, 태그·이미지 규칙, MDX 컴포넌트
목록은 [`docs/authoring/posting.md`](docs/authoring/posting.md)에 정리되어 있습니다.
외부 레포에 붙여넣어 쓰는 캡처 프롬프트는
[`docs/authoring/capture-prompt.md`](docs/authoring/capture-prompt.md)에 있습니다.

## 사이트 설정

브랜딩, 태그라인, 내비게이션, 소셜 링크, 테마 색상은 코드가 아니라
`src/config/*.json`에서 관리합니다.

| 파일              | 내용                                                |
| :---------------- | :-------------------------------------------------- |
| `config.json`     | 사이트 제목/태그라인, giscus, 메타데이터, llms 설정 |
| `menu.json`       | 상단/푸터 내비게이션                                |
| `social.json`     | 소셜 링크                                           |
| `theme.json`      | 색상, 폰트                                          |
| `categories.json` | 사용 가능한 카테고리 목록                           |

## 배포

`main` 브랜치에 push하면 [`deploy-to-github-pages.yml`](.github/workflows/deploy-to-github-pages.yml)
워크플로가 실행되어 사이트를 빌드하고 GitHub Pages로 배포합니다
(Settings → Pages → Source: GitHub Actions).

## 라이선스

[MIT](./LICENSE). [Astroplate](https://github.com/zeon-studio/astroplate) 템플릿을 기반으로 합니다.
