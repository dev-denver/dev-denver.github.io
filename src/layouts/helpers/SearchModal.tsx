import escapeRegExp from "@/lib/utils/escapeRegExp";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import searchData from "../../../.json/search.json";
import SearchResult, { type ISearchItem } from "./SearchResult";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

const SearchModal = () => {
  const [searchString, setSearchString] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Where focus was before the dialog opened, so it can be handed back.
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const searchResult = useMemo(() => {
    if (searchString === "") return [] as ISearchItem[];

    const regex = new RegExp(escapeRegExp(searchString), "i");
    return (searchData as ISearchItem[]).filter((item) => {
      const haystack = [
        item.frontmatter.title,
        item.frontmatter.description ?? "",
        item.frontmatter.categories?.join(" ") ?? "",
        item.frontmatter.tags?.join(" ") ?? "",
        item.content,
      ].join(" ");
      return regex.test(haystack);
    });
  }, [searchString]);

  const close = useCallback(() => {
    setIsOpen(false);
    lastFocusedRef.current?.focus();
  }, []);

  const open = useCallback(() => {
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    setIsOpen(true);
  }, []);

  // Trigger buttons and the global ⌘K / Ctrl+K shortcut. Bound once — the
  // previous version re-bound these on every keystroke and never removed them.
  useEffect(() => {
    const triggers = document.querySelectorAll<HTMLElement>(
      "[data-search-trigger]",
    );
    triggers.forEach((trigger) => trigger.addEventListener("click", open));

    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        open();
      }
    };
    document.addEventListener("keydown", onShortcut);

    return () => {
      triggers.forEach((trigger) => trigger.removeEventListener("click", open));
      document.removeEventListener("keydown", onShortcut);
    };
  }, [open]);

  // A new query invalidates the old highlight position.
  useEffect(() => setSelectedIndex(-1), [searchString]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }

      // Arrow handling is scoped to the open dialog. It used to run on every
      // keydown in the document, so preventDefault() blocked arrow-key page
      // scrolling site-wide even with the dialog closed.
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (searchResult.length === 0) return;
        setSelectedIndex((current) => {
          const next = event.key === "ArrowDown" ? current + 1 : current - 1;
          return Math.min(Math.max(next, 0), searchResult.length - 1);
        });
        return;
      }

      if (event.key === "Enter" && selectedIndex >= 0) {
        const item = searchResult[selectedIndex];
        if (item) {
          event.preventDefault();
          window.location.href = `/${item.slug}`;
        }
        return;
      }

      // Focus trap: keep Tab inside the dialog while it is modal.
      if (event.key === "Tab" && wrapperRef.current) {
        const focusable = Array.from(
          wrapperRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        ).filter((element) => element.offsetParent !== null);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, searchResult, selectedIndex, close]);

  // Keep the highlighted result in view.
  useEffect(() => {
    if (selectedIndex < 0) return;
    wrapperRef.current
      ?.querySelector(`[data-search-index="${selectedIndex}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedIndex]);

  return (
    <div
      id="searchModal"
      className={`search-modal${isOpen ? " show" : ""}`}
      aria-hidden={!isOpen}
    >
      <div
        id="searchModalOverlay"
        className="search-modal-overlay"
        onClick={close}
      />
      <div
        className="search-wrapper"
        ref={wrapperRef}
        role="dialog"
        aria-modal="true"
        aria-label="사이트 검색"
      >
        <div className="search-wrapper-header">
          <label
            htmlFor="searchInput"
            className="absolute top-[calc(50%-7px)] left-7"
          >
            {searchString ? (
              <button
                type="button"
                onClick={() => setSearchString("")}
                className="-m-2.5 cursor-pointer p-2.5"
                aria-label="검색어 지우기"
              >
                <svg
                  viewBox="0 0 512 512"
                  height="18"
                  width="18"
                  aria-hidden="true"
                >
                  <path
                    fill="currentcolor"
                    d="M256 512A256 256 0 10256 0a256 256 0 100 512zM175 175c9.4-9.4 24.6-9.4 33.9.0l47 47 47-47c9.4-9.4 24.6-9.4 33.9.0s9.4 24.6.0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6.0 33.9s-24.6 9.4-33.9.0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9.0s-9.4-24.6.0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6.0-33.9z"
                  />
                </svg>
              </button>
            ) : (
              <>
                <span className="sr-only">검색</span>
                <svg
                  viewBox="0 0 512 512"
                  height="18"
                  width="18"
                  className="-mt-0.5"
                  aria-hidden="true"
                >
                  <path
                    fill="currentcolor"
                    d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8.0 45.3s-32.8 12.5-45.3.0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9.0 208S93.1.0 208 0 416 93.1 416 208zM208 352a144 144 0 100-288 144 144 0 100 288z"
                  />
                </svg>
              </>
            )}
          </label>
          <input
            id="searchInput"
            ref={inputRef}
            placeholder="검색어를 입력하세요..."
            className="search-wrapper-header-input"
            type="search"
            name="search"
            value={searchString}
            onChange={(event) => setSearchString(event.currentTarget.value)}
            autoComplete="off"
            aria-describedby="searchResultCount"
          />
        </div>

        <SearchResult
          searchResult={searchResult}
          searchString={searchString}
          selectedIndex={selectedIndex}
        />

        <div className="search-wrapper-footer">
          <span className="flex items-center">
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            이동
          </span>
          <span className="flex items-center">
            <kbd>Enter</kbd>
            선택
          </span>
          <span id="searchResultCount" role="status">
            {searchString && `결과 ${searchResult.length}개`}
          </span>
          <span>
            <kbd>ESC</kbd> 닫기
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
