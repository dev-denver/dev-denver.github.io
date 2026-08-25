import config from "@/config/config.json";

const PAGE_SIZE: number = config.settings.pagination;

/** Total pages for a list. Always at least 1, so an empty list still has page 1. */
export const totalPageCount = (itemCount: number): number =>
  Math.max(1, Math.ceil(itemCount / PAGE_SIZE));

/** The slice of `items` shown on `page` (1-based). */
export const pageSlice = <T>(items: T[], page: number): T[] =>
  items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

/**
 * Page numbers that need their own route, as strings for `getStaticPaths`.
 * Page 1 lives at the section root, so this starts at "2" and is empty when
 * everything fits on one page.
 */
export const extraPageParams = (itemCount: number): string[] =>
  Array.from({ length: totalPageCount(itemCount) - 1 }, (_, index) =>
    String(index + 2),
  );

/** Reads a `[slug]` route param as a page number, falling back to 1. */
export const pageFromParam = (slug: string | undefined): number => {
  const parsed = Number(slug);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};
