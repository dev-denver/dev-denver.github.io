/**
 * Fetches a Noto Sans KR subset containing only the characters a card needs.
 *
 * The full Korean face is ~10 MB — too heavy to vendor and too slow to pull on
 * every build. Google Fonts' `text=` parameter returns a subset instead, which
 * is ~50 KB for a post title. The legacy User-Agent matters: with a modern one
 * the API serves woff2, which satori cannot read. An old UA gets TrueType.
 */

const LEGACY_UA = "Mozilla/4.0";

const cache = new Map<string, ArrayBuffer>();

export async function loadKoreanSubset(
  text: string,
  weight: 400 | 700,
): Promise<ArrayBuffer> {
  // Only the distinct characters matter, and sorting them makes the cache key
  // stable across posts that share glyphs.
  const characters = [...new Set(text)].sort().join("");
  const key = `${weight}:${characters}`;

  const cached = cache.get(key);
  if (cached) return cached;

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

  const data = await fetch(fontUrl).then((response) => {
    if (!response.ok) {
      throw new Error(`Font download failed: ${response.status}`);
    }
    return response.arrayBuffer();
  });

  cache.set(key, data);
  return data;
}
