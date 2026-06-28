# Frontend Known Issues & TODOs

Tracked issues organized by severity specifically for the React frontend application. Updated as issues are resolved.

---

## 🔴 Critical — Fix Before Deploying

| # | Issue | Details | Status |
|---|---|---|---|
| Cri 1 | ~~**No Canvas Auto-Save Debouncing (Integration Blocker)**~~ | ~~The canvas `nodes` update continuously while dragging. Firing a `PUT` request on every pixel change will DDOS the backend. A proper debounce mechanism (e.g., 1000ms delay after interaction stops) is missing in `DiagramContext.tsx`.~~ | ✅ Resolved — Added `useDebounce` hook (1000ms delay) |

---

## 🟠 High — Serious Bugs / Security Gaps

| # | Issue | Details | Status |
|---|---|---|---|
| High 1 | ~~**Hardcoded `localhost` URLs**~~ | ~~`AuthContext.tsx` hardcodes `http://localhost:8080` for auth API calls. This will break in production where the API is hosted at `https://accounts.arqulat.com`.~~ | ✅ Resolved — Extracted API URLs to `.env` using `import.meta.env` |
| High 2 | ~~**Lack of Real-time Collaboration**~~ | ~~Saving is currently done via a debounced `PUT` request after the user stops interacting. This prevents multiplayer features and causes "Last Writer Wins" data loss if multiple users or tabs edit the same diagram simultaneously.~~ | ✅ Resolved — Migrated to WebSocket architecture (STOMP) with Action-Based Syncing and live cursors |
| High 3 | ~~**Brittle WebSocket Authentication**~~ | ~~`CollaborationContext` uses `SockJS` without explicitly sending credentials (`withCredentials`) or STOMP auth headers, which can fail cross-origin WebSocket handshakes.~~ | ✅ Resolved — Added `withCredentials: true` to SockJS options |
| High 4 | **Unsafe STOMP message parsing in client** | `CollaborationContext` parsed `message.body` with `JSON.parse` without validation or error handling. A malformed or oversized message could throw an exception and disrupt realtime processing. | ✅ Resolved — Added try/catch, size checks and schema validation in subscription handler |
| High 4 | ~~**`DiagramContext` auto-save skips empty state**~~ | ~~Auto-save skips when `debouncedNodes.length === 0`. If a user clears the canvas completely, that empty state is never persisted.~~ | ✅ Resolved — Removed empty state check to allow persisting cleared canvas |

---

## 🟡 Medium — Should Fix for Production Quality

| # | Issue | Details | Status |
|---|---|---|---|
| Med 1 | ~~**Guest mode has no API guard**~~ | ~~When `isGuest = true`, `DiagramContext` will still attempt `GET /api/projects` after integration, returning `401`. The context needs explicit logic to skip network requests when in guest mode.~~ | ✅ Resolved — Added `isGuest` guard to `DiagramContext` |
| Med 2 | ~~**Logout doesn't clear local state**~~ | ~~After logout + page reload, cached project data or context state from the previous user could leak. Need to clear localStorage and reset state on logout.~~ | ✅ Resolved — `AuthContext.logout()` clears local state and `localStorage` before redirecting |
| Med 3 | ~~**Over-aggressive `AuthContext.logout()`**~~ | ~~Calls `localStorage.clear()`, which wipes all browser storage for the origin, rather than just Loom-specific state.~~ | ✅ Resolved — Removed `localStorage.clear()` to prevent wiping unrelated origin data |
| Med 4 | ~~**Unvalidated `ImportModal` input**~~ | ~~Accepts arbitrary JSON arrays with only minimal validation. Malformed node payloads can enter the application state and cause runtime errors.~~ | ✅ Resolved — Added schema validation checks in `processImportData` |
| Med 5 | ~~**`switchProject` empty state bug**~~ | ~~`switchProject` can set `activeFileId` to `''` for projects with no files, creating a weak active-file state edge case in the UI.~~ | ✅ Resolved — Auto-creates a default file if the project is empty on switch |

---

## 🟢 Low — Best Practices / Nice to Have

| # | Issue | Details | Status |
|---|---|---|---|
| Low 1 | ~~**Missing loading skeletons**~~ | ~~While projects and diagrams are loading from the backend, the UI shows an abrupt empty state.~~ | ✅ Resolved — Added `Skeleton.tsx` and integrated it into the Dashboard |

---

## Resolution Log

| Date | Issue # | Action Taken |
|---|---|---|
| 2026-06-17 | Cri 1 | Added `useDebounce` hook to `DiagramContext` to prevent DDOSing the backend on canvas drag. |
| 2026-06-17 | High 1 | Replaced hardcoded `localhost:8080` and `localhost:8081` URLs with Vite `.env` variables using `import.meta.env`. |
| 2026-06-17 | Med 1 | Used `useAuth` hook in `DiagramContext` to inject `isGuest` API guard before saving. |
| 2026-06-17 | Med 2 | Cleared `localStorage` and React context states in `AuthContext.logout()` before redirecting. |
| 2026-06-17 | Low 1 | Created `Skeleton.tsx` and implemented `isLoadingProjects` in `DiagramContext` to show loading states on the Dashboard. |
| 2026-06-18 | High 2 | Implemented real-time collaboration using `@stomp/stompjs`. Created `CollaborationContext` to broadcast granular node edits and throttled live cursor movements (`RemoteCursors.tsx`). |
| 2026-06-18 | High 3 | Added `withCredentials: true` to `SockJS` options in `CollaborationContext` to fix cross-origin WebSocket authentication. |
| 2026-06-18 | High 4 | Removed `debouncedNodes.length === 0` check in `DiagramContext` auto-save to ensure an empty canvas state is persisted. |
| 2026-06-18 | Med 3 | Removed `localStorage.clear()` from `AuthContext.logout()` to avoid wiping all origin browser storage. |
| 2026-06-18 | Med 4 | Added schema validation checks to `ImportModal` to prevent malformed node structures from breaking application state. |
| 2026-06-18 | Med 5 | Updated `switchProject` in `DiagramContext` to auto-create and assign a default file when switching to a project that has no files. |
