# Frontend Known Issues & TODOs

Tracked issues organized by severity specifically for the React frontend application. Updated as issues are resolved.

---

## 🔴 Critical — Fix Before Deploying

| # | Issue | Details | Status |
|---|---|---|---|
| 1 | ~~**No Canvas Auto-Save Debouncing (Integration Blocker)**~~ | ~~The canvas `nodes` update continuously while dragging. Firing a `PUT` request on every pixel change will DDOS the backend. A proper debounce mechanism (e.g., 1000ms delay after interaction stops) is missing in `DiagramContext.tsx`.~~ | ✅ Resolved — Added `useDebounce` hook (1000ms delay) |

---

## 🟠 High — Serious Bugs / Security Gaps

| # | Issue | Details | Status |
|---|---|---|---|
| 2 | ~~**Hardcoded `localhost` URLs**~~ | ~~`AuthContext.tsx` hardcodes `http://localhost:8080` for auth API calls. This will break in production where the API is hosted at `https://accounts.arqulat.com`.~~ | ✅ Resolved — Extracted API URLs to `.env` using `import.meta.env` |
| 6 | **Lack of Real-time Collaboration** | Saving is currently done via a debounced `PUT` request after the user stops interacting. This prevents multiplayer features and causes "Last Writer Wins" data loss if multiple users or tabs edit the same diagram simultaneously. | ⏳ TODO — Migrate to WebSocket architecture with CRDTs (e.g., Yjs) or Operational Transformation |

---

## 🟡 Medium — Should Fix for Production Quality

| # | Issue | Details | Status |
|---|---|---|---|
| 3 | ~~**Guest mode has no API guard**~~ | ~~When `isGuest = true`, `DiagramContext` will still attempt `GET /api/projects` after integration, returning `401`. The context needs explicit logic to skip network requests when in guest mode.~~ | ✅ Resolved — Added `isGuest` guard to `DiagramContext` |
| 4 | ~~**Logout doesn't clear local state**~~ | ~~After logout + page reload, cached project data or context state from the previous user could leak. Need to clear localStorage and reset state on logout.~~ | ✅ Resolved — `AuthContext.logout()` clears local state and `localStorage` before redirecting |

---

## 🟢 Low — Best Practices / Nice to Have

| # | Issue | Details | Status |
|---|---|---|---|
| 5 | ~~**Missing loading skeletons**~~ | ~~While projects and diagrams are loading from the backend, the UI shows an abrupt empty state.~~ | ✅ Resolved — Added `Skeleton.tsx` and integrated it into the Dashboard |

---

## Resolution Log

| Date | Issue # | Action Taken |
|---|---|---|
| 2026-06-17 | 1 | Added `useDebounce` hook to `DiagramContext` to prevent DDOSing the backend on canvas drag. |
| 2026-06-17 | 2 | Replaced hardcoded `localhost:8080` and `localhost:8081` URLs with Vite `.env` variables using `import.meta.env`. |
| 2026-06-17 | 3 | Used `useAuth` hook in `DiagramContext` to inject `isGuest` API guard before saving. |
| 2026-06-17 | 4 | Cleared `localStorage` and React context states in `AuthContext.logout()` before redirecting. |
| 2026-06-17 | 5 | Created `Skeleton.tsx` and implemented `isLoadingProjects` in `DiagramContext` to show loading states on the Dashboard. |
