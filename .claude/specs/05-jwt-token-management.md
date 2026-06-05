# Spec: JWT Token Management

## Overview

- **Business purpose**: Securely manage JSON Web Tokens (JWT) for authenticated API requests throughout the PerformanceAxis application.
- **User value**: Enables users to log in, maintain a session, and access protected broker data without manually handling authentication headers.
- **Why the feature exists**: The application communicates with XFL APIs that require a valid `Authorization: Bearer <JWT>` header and an `X-BrokerId` header. Centralizing token handling ensures compliance with security rules and prevents hard‑coded tokens.
- **Roadmap fit**: Follows the foundational setup (feature 01‑04) and precedes dashboard and chart features that depend on authenticated data.

---

## Depends On

- API Client (`src/api/client.ts`)
- Request Interceptors (`src/api/interceptors.ts`)
- In‑memory Store (`src/store/appStore.ts`)

---

## User Stories

- As a user I can log in with credentials and receive a JWT token.
- As a user I can log out, which clears the stored JWT.
- As a user I can see an error when my token is missing or expired.
- As a developer I can rely on the API client to automatically include the `Authorization` and `X‑BrokerId` headers on every request.

---

## API Changes

### Existing Endpoints Used

- `POST /api/auth/login` – returns `{ token: string, expiresAt: string }` (if it does not exist, it will be added as part of this feature).
- All existing broker and market endpoints will now require the `Authorization` header.

### New Endpoints Required

- No additional endpoints beyond the login endpoint are required for token management.

---

## State Changes

### New State

```typescript
interface AuthState {
  token: string | null;
  expiresAt: string | null; // ISO timestamp
  isAuthenticated: boolean;
}
```

- Added to `src/store/appStore.ts` as `auth` slice.

### Modified State

- `brokerStore` will now read the active broker ID from `auth` when constructing request headers.

---

## Data Models

```typescript
// src/types/auth.ts
export interface LoginResponse {
  token: string;
  expiresAt: string; // ISO 8601
}
```

---

## Components

### Create

- `LoginForm` (optional UI for manual login) – placed under `src/components/Auth/` if a UI is needed.

### Modify

- No existing UI components require modification for token handling; they will rely on the centralized API client.

---

## Services

### Create

- `src/services/authService.ts`
  - `login(credentials): Promise<void>` – stores token in `appStore`.
  - `logout(): void` – clears token.
  - `isTokenValid(): boolean` – checks expiration.

### Modify

- `src/api/client.ts`
  - Add request interceptor to attach `Authorization: Bearer <token>` and `X-BrokerId` from store.
  - Throw a custom `AuthError` when token is missing or expired.

---

## Files To Change

- `src/api/client.ts` – add interceptor logic.
- `src/store/appStore.ts` – add `auth` slice and reducers.
- `src/types/api.ts` – add `LoginResponse` type.
- `src/services/authService.ts` – new file (creation counted separately).
- Any existing service that makes API calls may need to import the updated client.

---

## Files To Create

- `src/services/authService.ts`
- `src/types/auth.ts`
- (Optional) `src/components/Auth/LoginForm.tsx`

---

## Validation Rules

- **Token Presence**: All API calls must have a non‑empty `Authorization` header.
- **Token Format**: Must match JWT regex `/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/`.
- **Expiration**: Before each request, verify `expiresAt` is in the future; otherwise, trigger logout and prompt re‑login.
- **Broker ID**: `X-BrokerId` header still required and must be present.

---

## Error Handling

- **401 Unauthorized**: Treat as expired/invalid token – auto‑logout and notify user.
- **Missing Token**: Throw `AuthError` before request is sent.
- **Network Errors**: Propagate to UI error states.
- **Validation Failures**: Show user‑friendly messages (e.g., “Session expired, please log in again”).

---

## Performance Considerations

- Token is stored in‑memory; no additional network requests are made beyond the initial login.
- Header injection is O(1) per request via interceptor – negligible overhead.
- No duplicate token fetches; token is cached in `appStore` until expiration or logout.

---

## Security Requirements

- **Never hardcode** JWT tokens or secrets.
- **Never log** the token or expose it in UI components.
- **Always inject** the token via the centralized API client.
- **Clear token** from memory on logout or expiration.
- **Use HTTPS** for all API calls (base URL already https).

---

## Rules For Implementation

- React functional components only.
- TypeScript strict typing; avoid `any`.
- No direct API calls in UI components – all go through `src/api/client.ts`.
- Business logic lives in services (`authService`).
- In‑memory storage only – no persistence to localStorage or external DB.
- No retry storms; token refresh (if added later) must be user‑initiated.
- Use Recharts only for charts (unchanged).

---

## Definition Of Done

- [ ] `auth` slice added to `appStore` with appropriate reducers.
- [ ] `authService.login` stores token and expiration in store.
- [ ] `authService.logout` clears token and updates `isAuthenticated`.
- [ ] API client automatically adds `Authorization` and `X-BrokerId` headers.
- [ ] All existing services use the updated client without breaking.
- [ ] Unit tests cover login, logout, token validation, and header injection.
- [ ] Integration tests verify that a protected endpoint receives the correct headers.
- [ ] No JWT token appears in source code or logs.
- [ ] Linting and TypeScript compilation pass.

---
