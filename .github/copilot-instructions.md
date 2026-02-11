# HPL 2026 AI Instructions

You are working on the Hostel Premier League (HPL) 2026 Cricket Tournament system. The project is a monorepo-style structure with separate `backend` and `frontend` folders.

## Architecture Overview

### Backend (`/backend`)
- **Stack**: Node.js, Express, MongoDB (Mongoose), Redis (Adapter), Socket.IO.
- **Entry Point**: `src/server.js` initializes Express and Socket.IO.
- **Real-time**: Uses `Socket.IO` with two namespaces:
  - `/public`: Public, read-only live score updates.
  - `/admin`: Protected (JWT), for score updates and admin actions.
- **Core Logic**: `src/services/cricketEngine.js` encapsulates all T20 cricket rules and state management.
- **Data Flow**: Controllers -> Services -> Models. Do not put business logic in controllers.

### Frontend (`/frontend`)
- **Stack**: React (Vite), TailwindCSS + DaisyUI, TanStack Query, Recharts.
- **Entry Points**: `src/main.jsx` (App root), `src/routes.jsx` (if applicable) or `App.jsx`.
- **API & Sockets**:
  - `src/services/api/apiBase.js`: Custom `fetch` wrapper with auth token handling (`hpl_admin_token`).
  - `src/services/socket/socketService.js`: Singleton-like service managing connections. Supports `VITE_USE_MOCK_SOCKET` for dev.

## Critical Developer Workflows

- **Run Dev**: 
  - Backend: `npm run dev` (Node --watch).
  - Frontend: `npm run dev` (Vite).
- **Seeding**: `npm run seed` in backend populates teams and admin users.
- **Mock Mode**: Frontend can simulate socket events without backend by setting `VITE_USE_MOCK_SOCKET=true`.

## Conventions & Patterns

### Backend
- **Response Format**: Use standard response structure via `src/config/response.js` (inference) or consistent JSON structure `{ success: true, data: ... }`.
- **Error Handling**: Use `ApiError` (`src/utils/apiError.js`) for operational errors.
- **Service Layer**: 
  - `matchService.js`: Handles DB operations for matches.
  - `scoringService.js`: Connects Socket events/updates to `CricketEngine`.
  - `liveScoreCache.js`: Manages Redis caching for high-frequency updates.
- **Models**: Mongoose models in `src/models`. Always use `lean()` for read-only queries when possible.

### Frontend
- **State Management**: Use `TanStack Query` for server state. Use `React Context` or local state for UI state.
- **Styling**: `TailwindCSS` utility classes. Use `DaisyUI` components (e.g., `btn`, `card`) where applicable.
- **Live Data**: Subscribe to socket events in components using `useEffect` calling `socketService.on()`. Always clean up listeners.
  - **Pattern**: `useLiveScore` hook fetches initial state via REST API first, then joins match room via socket to receive deltas.
- **Components**:
  - `components/common`: Generic, reusable UI (Card, Badge).
  - Domain folder (e.g., `components/match`): Business-specific components (Scorecard).

## Integration Points
- **Auth**: JWT stored in `localStorage` (`hpl_admin_token`). Sent via `Authorization: Bearer` header.
- **Socket Auth**: Admin namespace requires `auth: { token: ... }` in handshake.
