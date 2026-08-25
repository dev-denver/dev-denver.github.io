/**
 * Fetches a Noto Sans KR subset containing only the characters a card needs.
 *
 * The full Korean face is ~10 MB — too heavy to vendor and too slow to pull on
 * every build. Google Fonts' `text=` parameter returns a subset instead, which
 * is ~50 KB for a post title. The legacy User-Agent matters: with a modern one
 * the API serves woff2, which satori cannot read. An old UA gets TrueType.
 */

const LEGACY_UA = "Mozilla/4.0";

/**
 * Above this many distinct characters the `text=` query string gets unwieldy
 * (each Hangul syllable costs 9 bytes once URL-encoded), so priming backs off
 * and each card falls back to fetching its own smaller subset.
 */
const MAX_PRIMED_CHARACTERS = 700;

const cache = new Map<string, ArrayBuffer>();

/**
 * Subsets that cover every character the build will draw, one per weight.
 * Populated by `primeKoreanSubsets`. Resolves to `null` if the request failed,
 * never rejects — nothing awaits these until a card is rendered, and a stored
 * rejected promise would surface as an unhandled rejection and kill the build.
 */
const primed = new Map<number, Promise<ArrayBuffer | null>>();

const distinctCharacters = (text: string) => [...new Set(text)].sort().join("");

async function fetchSubset(
  characters: string,
  weight: 400 | 700,
): Promise<ArrayBuffer> {
  const cssUrl =
    `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}` +
    `&text=${encodeURIComponent(characters)}`;

  const css = await fetch(cssUrl, {
    headers: { "User-Agent": LEGACY_UA },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Google Fonts CSS request failed: ${response.status}`);
    }
    return response.text();
  });

  const fontUrl = css.match(/src:\s*url\((https:\/\/[^)]+)\)/)?.[1];
  if (!fontUrl) {
    throw new Error("No font URL in the Google Fonts response");
  }

  return fetch(fontUrl).then((response) => {
    if (!response.ok) {
      throw new Error(`Font download failed: ${response.status}`);
    }
    return response.arrayBuffer();
  });
}

/**
 * Loads one subset per weight covering `text`, so the whole build makes two
 * font requests instead of two per card.
 *
 * The per-card cache alone never helped: its key includes the characters, and
 * every post title has a different set, so each card missed and refetched.
 */
export function primeKoreanSubsets(text: string): void {
  const characters = distinctCharacters(text);
  if (!characters || characters.length > MAX_PRIMED_CHARACTERS) return;

  for (const weight of [400, 700] as const) {
    if (primed.has(weight)) continue;
    primed.set(
      weight,
      fetchSubset(characters, weight).catch(() => null),
    );
  }
}

export async function loadKoreanSubset(
  text: string,
  weight: 400 | 700,
): Promise<ArrayBuffer> {
  // A primed subset was built from every character in the build, so it covers
  // this card by construction. `null` means that request failed — fall through
  // to a per-card request, which may still succeed.
  const primedSubset = await primed.get(weight);
  if (primedSubset) return primedSubset;

  // Only the distinct characters matter, and sorting them makes the cache key
  // stable across posts that share glyphs.
  const characters = distinctCharacters(text);
  const key = `${weight}:${characters}`;

  const cached = cache.get(key);
  if (cached) return cached;

  const data = await fetchSubset(characters, weight);
  cache.set(key, data);
  return data;
}
