import { useEffect, useState } from "react";

/** The edge of the scroll area a sticky element sticks to. */
export type UseIsStuckSide = "top" | "bottom" | "left" | "right";

/** Options for {@link useIsStuck}. */
export interface UseIsStuckOptions {
  /**
   * The edge of the root the element sticks to, matching the CSS property you
   * gave it (`top`, `bottom`, `left` or `right`). Default is `"top"`.
   */
  side?: UseIsStuckSide;
  /**
   * The distance in pixels between the root's edge and the element while it
   * is stuck, which is the value of its CSS `top` (or `bottom`, `left`,
   * `right`). A negative or non-finite value is treated as `0`. Default is
   * `0`.
   */
  offset?: number;
  /**
   * The scroll container the element sticks inside. Pass a scrollable element
   * when the sticky element is not stuck to the browser viewport. Passing a
   * new element re-observes. Default is the browser viewport (`null`).
   */
  root?: Element | Document | null;
  /**
   * Set to `false` to stop observing. `isStuck` is `false` while disabled, and
   * observing starts again when it is `true`. Default is `true`.
   */
  enabled?: boolean;
}

/** The object returned by {@link useIsStuck}. */
export interface UseIsStuckResult<T extends Element> {
  /** Attach this to the `position: sticky` element, as its `ref`. */
  ref: (element: T | null) => void;
  /** Whether the element is currently pinned at its sticky edge. */
  isStuck: boolean;
}

/**
 * Builds the `rootMargin` that moves the root's `side` edge inwards by
 * `offset` pixels, which is where the element pins.
 *
 * @param side - The edge the element sticks to.
 * @param offset - The sticky distance from that edge, in pixels.
 * @returns A `rootMargin` string in CSS margin syntax (top right bottom left).
 */
const getRootMargin = (side: UseIsStuckSide, offset: number) => {
  const inset = `${-offset}px`;
  switch (side) {
    case "top":
      return `${inset} 0px 0px 0px`;
    case "right":
      return `0px ${inset} 0px 0px`;
    case "bottom":
      return `0px 0px ${inset} 0px`;
    case "left":
      return `0px 0px 0px ${inset}`;
  }
};

/**
 * Creates the zero-size marker that sits where the element would be without
 * `position: sticky`. It is in normal flow, so it scrolls with the content
 * like the element's own slot does, but it has no size, so it takes no space.
 * It is hidden from assistive technology.
 *
 * @returns The element to insert next to the sticky element.
 */
const createSentinel = () => {
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText =
    "display:block;width:0;height:0;margin:0;padding:0;border:0;" +
    "overflow:hidden;pointer-events:none;";
  return sentinel;
};

/**
 * Tells whether the sentinel has moved past the root's `side` edge, which means
 * the element has been pushed from its natural position and is pinned.
 *
 * @param entry - The latest observer entry for the sentinel.
 * @param side - The edge the element sticks to.
 * @returns `true` if the sentinel is beyond that edge of the root.
 */
const isPastEdge = (entry: IntersectionObserverEntry, side: UseIsStuckSide) => {
  const { boundingClientRect: rect, rootBounds: bounds } = entry;
  // `rootBounds` is `null` for a cross-origin root, so nothing can be told.
  if (entry.isIntersecting || !bounds) return false;
  switch (side) {
    case "top":
      return rect.top < bounds.top;
    case "right":
      return rect.left > bounds.right;
    case "bottom":
      return rect.top > bounds.bottom;
    case "left":
      return rect.left < bounds.left;
  }
};

/**
 * Tells whether a `position: sticky` element is currently stuck, so you can
 * give sticky headers, toolbars and action bars a shadow, a border or a
 * different background only while they are pinned.
 *
 * It uses an `IntersectionObserver` and no scroll listener, so it does no work
 * on scroll events. CSS cannot tell you where a sticky element would be
 * without sticking, so the hook inserts a hidden zero-size marker (a sentinel) next
 * to the element at that natural position and watches it leave the scroll
 * area. The marker has no size, so it takes no space in a normal block layout.
 *
 * - **Usage:** attach the returned `ref` to the element that has
 *   `position: sticky`. It is a callback ref, so it also works when the
 *   element mounts later, is rendered conditionally, or is swapped for another
 *   one.
 * - **Sides:** `side` picks the edge (`top`, `bottom`, `left` or `right`) and
 *   `offset` is the sticky distance from it, for example `offset: 64` for
 *   `top: 64px`.
 * - **Scroll containers:** pass the scrollable element as `root` when the
 *   element sticks inside it rather than to the page.
 * - **Efficient:** it re-renders only when `isStuck` changes, not while you
 *   scroll.
 * - **Pause:** `enabled: false` disconnects the observer and `isStuck` is
 *   `false` until it is turned back on.
 * - **SSR-safe:** `isStuck` is `false` on the server, on the first render, and
 *   wherever `IntersectionObserver` is unavailable.
 * - **Cleanup:** the observer is disconnected and the marker is removed on
 *   unmount, when the element or an option changes, and when `enabled`
 *   becomes `false`.
 *
 * Because the marker is a real child of the element's parent, a flex or grid
 * parent treats it as one more item, which a `gap` or an explicit grid
 * placement can notice. For `left` and `right` the element should be in a
 * flex row, where the marker sits right next to it.
 *
 * @typeParam T - The type of the sticky element. Defaults to `HTMLElement`.
 * @param options - Optional `side`, `offset`, `root` and `enabled` settings. See {@link UseIsStuckOptions | UseIsStuckOptions}.
 * @returns Whether the element `isStuck`, and the `ref` to attach to it.
 *
 * @example
 * ```tsx
 * // Add a shadow to a sticky header while it is pinned to the top
 * const { ref, isStuck } = useIsStuck<HTMLElement>();
 *
 * return (
 *   <header
 *     ref={ref}
 *     style={{
 *       position: "sticky",
 *       top: 0,
 *       boxShadow: isStuck ? "0 2px 8px rgba(0, 0, 0, 0.2)" : "none",
 *     }}
 *   >
 *     Title
 *   </header>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // A bottom action bar, and a header that sticks 64px from the top
 * const bar = useIsStuck<HTMLDivElement>({ side: "bottom" });
 * const header = useIsStuck<HTMLDivElement>({ offset: 64 });
 * ```
 *
 * @example
 * ```tsx
 * // A sticky table header inside a scrollable container
 * const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
 * const { ref, isStuck } = useIsStuck<HTMLTableRowElement>({ root: scroller });
 * ```
 *
 * For a live, editable example, see the [useIsStuck docs page](https://altalyst-solutions.github.io/hookify/hooks/use-is-stuck).
 *
 * @see [position: sticky](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky)
 * @see [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver)
 */
export const useIsStuck = <T extends Element = HTMLElement>(
  options?: UseIsStuckOptions
): UseIsStuckResult<T> => {
  /** The edge the element sticks to. */
  const side = options?.side ?? "top";
  /** The raw sticky distance as passed, before it is validated. */
  const rawOffset = options?.offset ?? 0;
  /** The sticky distance in pixels. Never negative or non-finite. */
  const offset = Number.isFinite(rawOffset) && rawOffset > 0 ? rawOffset : 0;
  /** The scroll container used as the viewport, `null` for the browser's. */
  const root = options?.root ?? null;
  /** Whether observing is on. */
  const enabled = options?.enabled ?? true;

  /** The sticky element. Set by the returned callback ref. */
  const [element, setElement] = useState<T | null>(null);

  /** The latest result, with the element it was measured for. */
  const [result, setResult] = useState<{ target: Element; stuck: boolean }>();

  /** Ignore a result that belongs to a previous element or a paused hook. */
  const isStuck =
    enabled && element !== null && result?.target === element && result.stuck;

  useEffect(() => {
    const parent = element?.parentNode;
    if (
      !enabled ||
      !element ||
      !parent ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    /** The marker at the element's natural position. */
    const sentinel = createSentinel();
    // The marker goes after the element on the far sides and before it on the
    // near ones, so it sits on the element's natural edge on `side`.
    parent.insertBefore(
      sentinel,
      side === "top" || side === "left" ? element : element.nextSibling
    );

    /** The last value reported by this observer, to skip unchanged ones. */
    let last: boolean | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        const stuck = isPastEdge(entry, side);
        if (stuck === last) return;
        last = stuck;
        setResult({ target: element, stuck });
      },
      { root, rootMargin: getRootMargin(side, offset) }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, [element, enabled, offset, root, side]);

  return { ref: setElement, isStuck };
};
