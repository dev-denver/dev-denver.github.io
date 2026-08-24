// Reading-time estimate for Korean-first technical posts.
//
// The previous version split on spaces and assumed 275 English words per
// minute, which badly under-counts Korean: one space-delimited 어절 carries
// far more than one English word. Hangul is counted by syllable instead, and
// code is counted per line since code is scanned rather than read.

const HANGUL_SYLLABLES_PER_MINUTE = 500;
const LATIN_WORDS_PER_MINUTE = 200;
const CODE_LINES_PER_MINUTE = 40;

const FENCED_CODE = /```[\s\S]*?```/g;
const HANGUL = /[가-힣]/g;
const LATIN_WORD = /[A-Za-z0-9][A-Za-z0-9'-]*/g;
const HTML_TAG = /<[^>]*>/g;
const MARKDOWN_NOISE = /^\s{0,3}(#{1,6}\s|>\s|[-*+]\s|\d+\.\s)/gm;

const countMatches = (text: string, pattern: RegExp): number =>
  text.match(pattern)?.length ?? 0;

/**
 * @param content raw markdown body of a post
 * @returns a Korean label such as "7분 읽기"
 */
const readingTime = (content: string): string => {
  const codeLines = (content.match(FENCED_CODE) ?? []).reduce(
    (total, block) => total + block.split("\n").length,
    0,
  );

  const prose = content
    .replace(FENCED_CODE, " ")
    .replace(HTML_TAG, " ")
    .replace(MARKDOWN_NOISE, " ");

  const minutes =
    countMatches(prose, HANGUL) / HANGUL_SYLLABLES_PER_MINUTE +
    countMatches(prose, LATIN_WORD) / LATIN_WORDS_PER_MINUTE +
    codeLines / CODE_LINES_PER_MINUTE;

  // Never claim "0분" — every post takes at least a moment.
  return `${Math.max(1, Math.ceil(minutes))}분 읽기`;
};

export default readingTime;
