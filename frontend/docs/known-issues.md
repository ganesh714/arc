# Frontend Known Issues & TODOs

Tracked issues organized by severity specifically for the React frontend application. Updated as issues are resolved.

---

## 🔴 Critical — Fix Before Deploying

| # | Issue | Details | Status |
|---|---|---|---|
| 1 | **No Canvas Auto-Save Debouncing (Integration Blocker)** | The canvas `nodes` update continuously while dragging. Firing a `PUT` request on every pixel change will DDOS the backend. A proper debounce mechanism (e.g., 1000ms delay after interaction stops) is missing in `DiagramContext.tsx`. | ⏳ TODO — Implement debounced API calls for canvas state |

---

## 🟠 High — Serious Bugs / Security Gaps

| # | Issue | Details | Status |
|---|---|---|---|
| 2 | **Hardcoded `localhost` URLs** | `AuthContext.tsx` hardcodes `http://localhost:8080` for auth API calls. This will break in production where the API is hosted at `https://accounts.arqulat.com`. | ⏳ TODO — Use Vite environment variables (`import.meta.env.VITE_AUTH_URL`) |

---

## 🟡 Medium — Should Fix for Production Quality

| # | Issue | Details | Status |
|---|---|---|---|
| 3 | **Guest mode has no API guard** | When `isGuest = true`, `DiagramContext` will still attempt `GET /api/projects` after integration, returning `401`. The context needs explicit logic to skip network requests when in guest mode. | ⏳ TODO — Check `isGuest` from `AuthContext` before making `fetch()` calls |
| 4 | **Logout doesn't clear local state** | After logout + page reload, cached project data or context state from the previous user could leak. Need to clear localStorage and reset state on logout. | ⏳ TODO — Clear cached state before redirecting in `AuthContext.logout()` |

---

## 🟢 Low — Best Practices / Nice to Have

| # | Issue | Details | Status |
|---|---|---|---|
| 5 | **Missing loading skeletons** | While projects and diagrams are loading from the backend, the UI shows an abrupt empty state. | ⏳ TODO — Add loading spinners or skeleton UI components |

---

## Resolution Log

| Date | Issue # | Action Taken |
|---|---|---|
| | | |
