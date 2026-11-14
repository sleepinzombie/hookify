<div align="center">
  <img src="docs-site/static/img/logo.svg" alt="Hookify logo" width="120" height="120" />

  <h1>Hookify</h1>

  <p><strong>A collection of framework-agnostic React hooks that just work.</strong></p>

  <p>
    <a href="https://www.npmjs.com/package/@altalyst/hookify"><img src="https://img.shields.io/npm/v/@altalyst/hookify.svg?color=3ECC5F" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/@altalyst/hookify"><img src="https://img.shields.io/npm/dm/@altalyst/hookify.svg?color=3ECC5F" alt="npm downloads" /></a>
    <a href="https://bundlephobia.com/package/@altalyst/hookify"><img src="https://img.shields.io/bundlephobia/minzip/@altalyst/hookify?color=3ECC5F" alt="bundle size" /></a>
    <a href="https://github.com/altalyst-solutions/hookify/actions/workflows/pr-check.yml"><img src="https://github.com/altalyst-solutions/hookify/actions/workflows/pr-check.yml/badge.svg" alt="PR Check status" /></a>
    <img src="https://img.shields.io/npm/types/@altalyst/hookify.svg?color=3178C6" alt="TypeScript" />
    <a href="https://github.com/altalyst-solutions/hookify/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/npm/l/@altalyst/hookify.svg?color=blue" alt="MIT license" /></a>
  </p>

  <p>
    <a href="https://altalyst-solutions.github.io/hookify/getting-started">Documentation</a> ·
    <a href="https://altalyst-solutions.github.io/hookify/hooks">Hook demos</a> ·
    <a href="https://altalyst-solutions.github.io/hookify/api">API reference</a> ·
    <a href="https://github.com/altalyst-solutions/hookify/discussions">Discussions</a>
  </p>
</div>

---

Hookify is a lightweight, dependency-free collection of React hooks for
everyday problems: debouncing, data fetching, toggling state, syncing state to
storage, detecting outside clicks, and more. Every hook is written in
TypeScript, fully typed, tree-shakeable, and documented with a live, editable
demo.

## Table of contents

- [Features](#features)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Available hooks](#available-hooks)
- [Documentation](#documentation)
- [Local development](#local-development)
- [Contributing](#contributing)
- [Community](#community)
- [License](#license)

## Features

- 🪝 **A growing collection of focused hooks** covering the most common React
  state, effect, and side-effect patterns.
- 📦 **Tiny and tree-shakeable** — import only what you use; no runtime
  dependencies beyond React. Ships ESM and CommonJS builds.
- 🔒 **Fully typed** — written in TypeScript with generated `.d.ts` files
  included.
- ⚡ **Zero config** — works out of the box with any React 18 or 19 project (CRA,
  Vite, Next.js, Remix, etc.).
- 📚 **Live docs** — every hook has a runnable, editable demo and full API
  reference generated straight from the source.

## Installation

Hookify has `react` and `react-dom` as peer dependencies (v18+).

```bash
npm install @altalyst/hookify
```

```bash
yarn add @altalyst/hookify
```

```bash
pnpm add @altalyst/hookify
```

## Quick start

Import any hook directly from the package root:

```tsx
import { useToggleState } from "@altalyst/hookify";

export const Example = () => {
  const [isVisible, toggleVisibility] = useToggleState(false);

  return (
    <div>
      <button onClick={toggleVisibility}>
        {isVisible ? "Hide" : "Show"} content
      </button>
      {isVisible && <p>This is some toggleable content!</p>}
    </div>
  );
};
```

## Available hooks

| Hook                                                                                                           | Description                                                                                        |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [`useApi`](https://altalyst-solutions.github.io/hookify/hooks/use-api)                                         | Declarative hook for making HTTP requests with built-in loading, error, and data state.            |
| [`useAsync`](https://altalyst-solutions.github.io/hookify/hooks/use-async)                                     | Run any async function with typed arguments and track its status, data and error; latest run wins. |
| [`useAutofillSubmit`](https://altalyst-solutions.github.io/hookify/hooks/use-autofill-submit)                  | Submit a form as soon as a password manager fills it, with typed, extensible options.              |
| [`useClipboard`](https://altalyst-solutions.github.io/hookify/hooks/use-clipboard)                             | Copy text to the clipboard with a temporary `copied` state, error handling, and callbacks.         |
| [`useControlledState`](https://altalyst-solutions.github.io/hookify/hooks/use-controlled-state)                | Manage a value that works in both controlled and uncontrolled modes, like native inputs.           |
| [`useCooldown`](https://altalyst-solutions.github.io/hookify/hooks/use-cooldown)                               | Whole-second countdown with start, restart and reset controls for resend and retry buttons.        |
| [`useDebouncedCallback`](https://altalyst-solutions.github.io/hookify/hooks/use-debounced-callback)            | Stable debounced callback with cancel, flush, isPending and leading/trailing options.              |
| [`useDebouncedValue`](https://altalyst-solutions.github.io/hookify/hooks/use-debounced-value)                  | Debounce a value so it only updates once it stops changing for a delay.                            |
| [`useDocVisible`](https://altalyst-solutions.github.io/hookify/hooks/use-doc-visible)                          | Track whether the current document/tab is visible via the Page Visibility API.                     |
| [`useEffectAfterMount`](https://altalyst-solutions.github.io/hookify/hooks/use-effect-after-mount)             | Run an effect only after the initial mount, skipping the first render.                             |
| [`useElementSize`](https://altalyst-solutions.github.io/hookify/hooks/use-element-size)                        | Track an element's width and height with a `ResizeObserver`, with box and callback options.        |
| [`useEventListener`](https://altalyst-solutions.github.io/hookify/hooks/use-event-listener)                    | Attach a typed, auto-cleaned event listener to window, document, an element, or a ref.             |
| [`useImpression`](https://altalyst-solutions.github.io/hookify/hooks/use-impression)                           | Call a callback once an element was visible long enough, for analytics and "mark as read".         |
| [`useIntersectionObserver`](https://altalyst-solutions.github.io/hookify/hooks/use-intersection-observer)      | Track an element's visibility with an `IntersectionObserver`, with a once option.                  |
| [`useInterval`](https://altalyst-solutions.github.io/hookify/hooks/use-interval)                               | Declarative `setInterval` that can be paused with `null` and always calls the latest callback.     |
| [`useIsStuck`](https://altalyst-solutions.github.io/hookify/hooks/use-is-stuck)                                | Tell when a `position: sticky` element is stuck, with no scroll listener.                          |
| [`useIsomorphicLayoutEffect`](https://altalyst-solutions.github.io/hookify/hooks/use-isomorphic-layout-effect) | Drop-in `useLayoutEffect` that falls back to `useEffect` on the server, without SSR warnings.      |
| [`useLatest`](https://altalyst-solutions.github.io/hookify/hooks/use-latest)                                   | Keep a stable ref to the latest value or callback to avoid stale closures.                         |
| [`useMediaQuery`](https://altalyst-solutions.github.io/hookify/hooks/use-media-query)                          | Subscribe to a CSS media query and get a hydration-safe boolean that tracks whether it matches.    |
| [`useMounted`](https://altalyst-solutions.github.io/hookify/hooks/use-mounted)                                 | Track whether a component is currently mounted to guard async state updates.                       |
| [`useNow`](https://altalyst-solutions.github.io/hookify/hooks/use-now)                                         | Current time that re-renders at an interval, with one shared timer that pauses in hidden tabs.     |
| [`useOutsideClick`](https://altalyst-solutions.github.io/hookify/hooks/use-outside-click)                      | Fire a callback when a click or touch happens outside a given element.                             |
| [`usePersistedState`](https://altalyst-solutions.github.io/hookify/hooks/use-persisted-state)                  | Persist state to `localStorage` and sync it across browser tabs.                                   |
| [`usePrevious`](https://altalyst-solutions.github.io/hookify/hooks/use-previous)                               | Get the value from the previous render, with an optional initial value.                            |
| [`useRateLimitedCallback`](https://altalyst-solutions.github.io/hookify/hooks/use-rate-limited-callback)       | Limit a callback to N calls per time window with a token bucket, dropping or queuing the rest.     |
| [`useResizeObserver`](https://altalyst-solutions.github.io/hookify/hooks/use-resize-observer)                  | Run a callback with the raw `ResizeObserverEntry` when an element resizes, without re-renders.     |
| [`useSequentialRequest`](https://altalyst-solutions.github.io/hookify/hooks/use-sequential-request)            | Ensure only the latest of several in-flight async requests resolves; stale ones are ignored.       |
| [`useStableCallback`](https://altalyst-solutions.github.io/hookify/hooks/use-stable-callback)                  | Stable function identity that always calls the latest callback, with optional-callback support.    |
| [`useTabLeader`](https://altalyst-solutions.github.io/hookify/hooks/use-tab-leader)                            | Elect one tab as leader so polling or a websocket runs once, with callbacks and tab messaging.     |
| [`useThrottledValue`](https://altalyst-solutions.github.io/hookify/hooks/use-throttled-value)                  | Throttle a value so it updates at most once per interval, with leading/trailing options.           |
| [`useTimeout`](https://altalyst-solutions.github.io/hookify/hooks/use-timeout)                                 | Declarative `setTimeout` that pauses on `null`, with start, cancel and isPending controls.         |
| [`useToggleState`](https://altalyst-solutions.github.io/hookify/hooks/use-toggle-state)                        | Toggle a boolean state, with a stable toggle and an explicit setter.                               |
| [`useWebLock`](https://altalyst-solutions.github.io/hookify/hooks/use-web-lock)                                | Run async work under a Web Lock so only one tab at a time does it, with abort and fallback.        |

`useDebounce` and `useThrottle` are deprecated aliases of `useDebouncedCallback`
and `useThrottledValue`, kept for compatibility and due to be removed in a future
release.

Browse the [hooks documentation](https://altalyst-solutions.github.io/hookify/hooks)
for live, editable demos and the full API of each hook.

## Documentation

Full guides, live demos, and the generated API reference live at
**[altalyst-solutions.github.io/hookify](https://altalyst-solutions.github.io/hookify/getting-started)**.
They match the latest release on npm. To see what's coming in the next
release, browse the
[unreleased docs](https://altalyst-solutions.github.io/hookify/next/getting-started),
built from `main`; the version menu in the top right switches between the two.

## Local development

```bash
# Install library dependencies
npm run setup

# Run the test suite
npm test

# Lint and format
npm run lint
npm run format

# Build the library
npm run build
```

To preview documentation changes locally (including new hooks) without
waiting for a deploy:

```bash
npm run docs:install   # first time only
npm run docs:dev       # starts Docusaurus with hot reload at localhost:3000
```

Live demos run the published npm release, so new or changed hooks only show up
in them after a release. To see unreleased changes in the demos, use
`npm run docs:dev:local` (and `npm run watch` in a second terminal to rebuild
the library as you edit). See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Contributing

Contributions, issues, and feature requests are welcome! See
[CONTRIBUTING.md](./CONTRIBUTING.md) for local setup, how to add a new hook,
and our commit/versioning conventions. Please also read our
[Code of Conduct](./CODE_OF_CONDUCT.md). See [CHANGELOG.md](./CHANGELOG.md)
for release history.

## Community

- 💬 [GitHub Discussions](https://github.com/altalyst-solutions/hookify/discussions) — ask questions, share ideas.
- 🐛 [Issues](https://github.com/altalyst-solutions/hookify/issues) — report bugs or request features.
- 🔒 [Security policy](./SECURITY.md) — how to report a vulnerability.
- 📦 [npm](https://www.npmjs.com/package/@altalyst/hookify) — package page and version history.

## License

MIT © [Altalyst Solutions](https://github.com/altalyst-solutions). See
[LICENSE](./LICENSE) for details.

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/altalyst-solutions">Altalyst Solutions</a>
</div>
