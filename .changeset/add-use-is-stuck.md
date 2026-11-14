---
"@altalyst/hookify": minor
---

Add `useIsStuck` hook, which tells whether a `position: sticky` element is currently stuck, so sticky headers, toolbars and action bars can gain a shadow or border only while pinned. It uses an `IntersectionObserver` on a hidden zero-size marker instead of a scroll listener. It supports all four sides (`top`, `bottom`, `left`, `right`), an `offset` for the sticky distance, a custom scroll container as `root` and `enabled`, re-renders only when the stuck state changes, and reports `false` on the server and where `IntersectionObserver` is unavailable.
