import { act, render, renderHook } from "@testing-library/react";
import { createElement, StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useIsStuck } from "@/hooks";

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  observed: Element[] = [];
  disconnected = false;

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly init: IntersectionObserverInit = {}
  ) {
    MockIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.observed.push(target);
  }

  unobserve() {}

  disconnect() {
    this.disconnected = true;
  }
}

const live = () =>
  MockIntersectionObserver.instances.filter((o) => !o.disconnected);

/** The root's box as the observer reports it, in pixels. */
const rootBounds = {
  top: 100,
  right: 900,
  bottom: 700,
  left: 100,
} as DOMRectReadOnly;

type Side = "top" | "bottom" | "left" | "right";

/** Where the sentinel is, as seen from a sticky element on `side`. */
const positions: Record<
  Side,
  { past: Partial<DOMRectReadOnly>; inside: Partial<DOMRectReadOnly> }
> = {
  top: { past: { top: 50, left: 300 }, inside: { top: 300, left: 300 } },
  bottom: { past: { top: 750, left: 300 }, inside: { top: 300, left: 300 } },
  left: { past: { top: 300, left: 50 }, inside: { top: 300, left: 300 } },
  right: { past: { top: 300, left: 950 }, inside: { top: 300, left: 300 } },
};

/** Reports the sentinel as scrolled past the root's edge, or still inside. */
const notify = (
  observer: MockIntersectionObserver,
  where: "past" | "inside",
  side: Side = "top",
  bounds: DOMRectReadOnly | null = rootBounds
) => {
  const entry = {
    target: observer.observed[0],
    isIntersecting: where === "inside",
    boundingClientRect: positions[side][where] as DOMRectReadOnly,
    rootBounds: bounds,
  } as unknown as IntersectionObserverEntry;
  act(() => {
    observer.callback([entry], observer as unknown as IntersectionObserver);
  });
};

/** A parent with the sticky element in the middle of two siblings. */
const makeTree = () => {
  const parent = document.createElement("div");
  const before = document.createElement("p");
  const el = document.createElement("div");
  const after = document.createElement("p");
  parent.append(before, el, after);
  return { parent, before, el, after };
};

describe("useIsStuck", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const setup = (options?: Parameters<typeof useIsStuck>[0]) => {
    const tree = makeTree();
    const hook = renderHook(
      (props: { options?: Parameters<typeof useIsStuck>[0] }) =>
        useIsStuck(props.options),
      { initialProps: { options } }
    );
    act(() => hook.result.current.ref(tree.el));
    return { ...hook, ...tree };
  };

  it("starts as not stuck and does not observe until an element is attached", () => {
    const { result, rerender } = renderHook(() => useIsStuck());
    const ref = result.current.ref;

    expect(result.current.isStuck).toBe(false);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
    rerender();
    expect(result.current.ref).toBe(ref);
  });

  it("observes a sentinel placed before the element, in the browser viewport", () => {
    const { parent, before, el } = setup();
    const sentinel = el.previousElementSibling as HTMLElement;

    expect(Array.from(parent.children)).toHaveLength(4);
    expect(sentinel).not.toBe(before);
    expect(sentinel.getAttribute("aria-hidden")).toBe("true");
    expect(sentinel.style.width).toBe("0px");
    expect(sentinel.style.height).toBe("0px");
    expect(live()).toHaveLength(1);
    expect(live()[0].observed).toEqual([sentinel]);
    expect(live()[0].init).toEqual({
      root: null,
      rootMargin: "0px 0px 0px 0px",
    });
  });

  it("is stuck while the sentinel is past the top edge", () => {
    const { result } = setup();

    notify(live()[0], "past");
    expect(result.current.isStuck).toBe(true);

    notify(live()[0], "inside");
    expect(result.current.isStuck).toBe(false);
  });

  it("is not stuck while the sentinel is below the root, not yet scrolled in", () => {
    const { result } = setup();
    const entry = {
      isIntersecting: false,
      boundingClientRect: { top: 800, left: 300 },
      rootBounds,
    } as unknown as IntersectionObserverEntry;

    act(() => {
      live()[0].callback([entry], live()[0] as unknown as IntersectionObserver);
    });

    expect(result.current.isStuck).toBe(false);
  });

  it.each([
    ["top", "-5px 0px 0px 0px", true],
    ["right", "0px -5px 0px 0px", false],
    ["bottom", "0px 0px -5px 0px", false],
    ["left", "0px 0px 0px -5px", true],
  ] as const)(
    "supports the %s side",
    (side, rootMargin, sentinelComesFirst) => {
      const { result, el } = setup({ side, offset: 5 });
      const sentinel = (
        sentinelComesFirst ? el.previousElementSibling : el.nextElementSibling
      ) as HTMLElement;

      expect(live()[0].init.rootMargin).toBe(rootMargin);
      expect(live()[0].observed).toEqual([sentinel]);
      expect(sentinel.tagName).toBe("DIV");

      notify(live()[0], "past", side);
      expect(result.current.isStuck).toBe(true);

      notify(live()[0], "inside", side);
      expect(result.current.isStuck).toBe(false);
    }
  );

  it("moves the root edge inwards by the offset", () => {
    setup({ side: "bottom", offset: 64 });

    expect(live()[0].init.rootMargin).toBe("0px 0px -64px 0px");
  });

  it.each([-10, NaN, Infinity])("treats an offset of %s as 0", (offset) => {
    setup({ offset });

    expect(live()[0].init.rootMargin).toBe("0px 0px 0px 0px");
  });

  it("passes the root to the observer and re-observes when it changes", () => {
    const first = document.createElement("div");
    const second = document.createElement("div");
    const { rerender } = setup({ root: first });

    expect(live()[0].init.root).toBe(first);

    rerender({ options: { root: second } });

    expect(MockIntersectionObserver.instances).toHaveLength(2);
    expect(live()).toHaveLength(1);
    expect(live()[0].init.root).toBe(second);
  });

  it("re-observes when the side or offset changes, with a single sentinel", () => {
    const { rerender, parent } = setup();

    rerender({ options: { side: "bottom" } });
    expect(live()[0].init.rootMargin).toBe("0px 0px 0px 0px");

    rerender({ options: { side: "bottom", offset: 10 } });
    expect(live()[0].init.rootMargin).toBe("0px 0px -10px 0px");
    expect(live()).toHaveLength(1);
    expect(parent.children).toHaveLength(4);
  });

  it("does not re-observe when rerendered with the same options", () => {
    const { rerender } = setup({ side: "top", offset: 8 });

    rerender({ options: { side: "top", offset: 8 } });

    expect(MockIntersectionObserver.instances).toHaveLength(1);
  });

  it("ignores a notification without a measurable root", () => {
    const { result } = setup();

    notify(live()[0], "past", "top", null);

    expect(result.current.isStuck).toBe(false);
  });

  it("does not re-render when the stuck state is unchanged", () => {
    let renders = 0;
    const { el } = makeTree();
    const { result } = renderHook(() => {
      renders += 1;
      return useIsStuck();
    });
    act(() => result.current.ref(el));
    notify(live()[0], "past");
    const before = renders;

    notify(live()[0], "past");
    notify(live()[0], "past");

    expect(result.current.isStuck).toBe(true);
    expect(renders).toBe(before);
  });

  it("does not observe and is not stuck while disabled", () => {
    const { result, rerender, parent } = setup({ enabled: false });

    expect(MockIntersectionObserver.instances).toHaveLength(0);
    expect(parent.children).toHaveLength(3);
    expect(result.current.isStuck).toBe(false);

    rerender({ options: { enabled: true } });
    expect(live()).toHaveLength(1);

    notify(live()[0], "past");
    expect(result.current.isStuck).toBe(true);
  });

  it("disconnects, removes the sentinel and reports not stuck when disabled", () => {
    const { result, rerender, parent } = setup();
    notify(live()[0], "past");
    expect(result.current.isStuck).toBe(true);

    rerender({ options: { enabled: false } });

    expect(live()).toHaveLength(0);
    expect(parent.children).toHaveLength(3);
    expect(result.current.isStuck).toBe(false);
  });

  it("starts over when the element is swapped for another one", () => {
    const { result, parent } = setup();
    notify(live()[0], "past");
    expect(result.current.isStuck).toBe(true);

    const next = makeTree();
    act(() => result.current.ref(next.el));

    expect(result.current.isStuck).toBe(false);
    expect(live()).toHaveLength(1);
    expect(live()[0].observed).toEqual([next.el.previousElementSibling]);
    expect(parent.children).toHaveLength(3);
  });

  it("goes back to not stuck and cleans up when the element is detached", () => {
    const { result, parent } = setup();
    notify(live()[0], "past");

    act(() => result.current.ref(null));

    expect(result.current.isStuck).toBe(false);
    expect(live()).toHaveLength(0);
    expect(parent.children).toHaveLength(3);
  });

  it("disconnects the observer and removes the sentinel on unmount", () => {
    const { unmount, parent } = setup();

    unmount();

    expect(live()).toHaveLength(0);
    expect(parent.children).toHaveLength(3);
  });

  it("does not observe an element that has no parent", () => {
    const { result } = renderHook(() => useIsStuck());

    act(() => result.current.ref(document.createElement("div")));

    expect(MockIntersectionObserver.instances).toHaveLength(0);
    expect(result.current.isStuck).toBe(false);
  });

  it("does nothing where IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);

    const { result, parent } = setup();

    expect(result.current.isStuck).toBe(false);
    expect(parent.children).toHaveLength(3);
  });

  it("works under StrictMode and leaves one live observer and sentinel", () => {
    const { parent, el } = makeTree();
    const { result } = renderHook(() => useIsStuck(), {
      wrapper: StrictMode,
    });
    act(() => result.current.ref(el));

    expect(live()).toHaveLength(1);
    expect(parent.children).toHaveLength(4);

    notify(live()[0], "past");
    expect(result.current.isStuck).toBe(true);
  });

  it("tracks a sticky element rendered by a component", () => {
    const Header = () => {
      const { ref, isStuck } = useIsStuck<HTMLElement>();
      return createElement("header", { ref }, isStuck ? "stuck" : "normal");
    };

    const { container } = render(createElement(Header));
    expect(container.textContent).toBe("normal");

    notify(live()[0], "past");
    expect(container.textContent).toBe("stuck");
  });

  it("renders as not stuck on the server", () => {
    const Header = () => {
      const { ref, isStuck } = useIsStuck<HTMLElement>();
      return createElement("header", { ref }, String(isStuck));
    };

    expect(renderToString(createElement(Header))).toContain("false");
  });
});
