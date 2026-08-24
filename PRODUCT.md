# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

다른 개발자. 개발 학습 과정에서 부딪힌 문제, 새로 배운 개념, 정리한 지식을 찾아 읽으러 온다.

## Product Purpose

denver 개인의 개발 학습 기록(TIL 성격)을 정리하고 공유하는 블로그. 무엇을 배웠고 어떻게 이해했는지를 남기는 것이 목적이며, 다른 개발자가 같은 주제를 찾아볼 때 참고가 되는 것이 성공이다.

## Positioning

특정 기술 스택 홍보나 프로젝트 포트폴리오가 아니라, 학습/공부 기록이라는 성격이 핵심이다. 완성된 결론보다 배우는 과정과 정리를 솔직하게 담는다.

## Operating Context

- Astro + Tailwind CSS 기반 정적 사이트, GitHub Pages에 배포 (`main` 브랜치 push 시 자동 빌드).
- 글은 `src/content/blog/`에 Markdown/MDX로 작성.
- 브랜딩, 내비게이션, 소셜 링크는 `src/config/*.json`에서 관리.
- giscus(GitHub Discussions 기반) 댓글 사용, 언어는 한국어(`lang: "ko"`).
- 홈 히어로에 이력서 링크("이력서 보기")와 GitHub/Instagram 소셜 링크 노출.

## Capabilities and Constraints

- 한국어 콘텐츠/UI 유지가 기본이다.
- GitHub Pages 정적 호스팅이라는 제약이 있다 (서버사이드 로직 불가, 빌드 타임 생성만 가능).
- 이 외 추가로 지켜야 할 제약은 아직 명시된 바 없음 — 필요 시 사용자에게 재확인.

## Product Principles

- 학습 기록으로서의 정직함을 우선한다 — 완성된 성과가 아니라 배우는 과정을 보여준다.
- 다른 개발자가 검색/열람했을 때 실질적으로 도움이 되는 정리를 지향한다.
- 한국어 사용자를 위한 가독성과 자연스러움을 유지한다.
- 정적 사이트의 제약 안에서 동작하는 현실적인 설계를 한다.
