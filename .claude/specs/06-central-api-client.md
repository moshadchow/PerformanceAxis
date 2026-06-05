# Spec: Central API Client

## Overview

Central API Client formalizes the shared request layer for all PerformanceAxis API communication. The feature exists so dashboard, broker summary, market trade info, comparison, cache, throttling, and future chart features can make network requests through one typed, authenticated, cancellable, and normalized API interface.

This provides user value by making broker and market data loading reliable, secure, and consistent across the SPA. It fits into the PerformanceAxis roadmap after JWT Token Management and before data-driven dashboard features that depend on protected XFL API requests.

---

## Depends On

```text
Project Setup
Core Type Definations
Broker In Memory Store
Broker Setting UI
JWT Token Management
```

---

## User Stories

* As a user I can rely on authenticated data requests using the active broker and session token.
* As a user I can see consistent error states when API requests fail.
* As a user I am protected from duplicate requests when filters or screens trigger the same API call repeatedly.
* As a user I do not trigger obsolete requests after changing inputs quickly.
* As a developer I can call a typed API client instead of using `fetch` directly.
* As a developer I can rely on centralized request headers, response parsing, error normalization, cancellation, throttling, and deduplication.

---

## API Changes

### Existing Endpoints Used

```http
POST /api/auth/login
GET /api/broker-summary/orders-execution
GET /api/indexes/{stockExchange}/market-trade-info
```

### New Endpoints Required

```text
No new endpoints
```

---

## State Changes

### New State

```typescript
interface PendingRequestState {
  requestKey: string;
  controller: AbortController;
  promise: Promise<unknown>;
  createdAt: number;
}

interface CacheEntry<TData> {
  data: TData;
  createdAt: number;
  expiresAt: number;
}
```

### Modified State

```text
src/api/client.ts will manage in-memory pending request and response cache state internally.
src/store/appStore.ts auth state will continue to provide JWT token state.
src/store/brokerStore.ts active broker state will continue to provide X-BrokerId header value.
```

---

## Data Models

```typescript
interface ApiClientRequestOptions
interface ApiClientResponse<TData>
interface ApiClientError
interface ApiRequestKey
interface CacheEntry<TData>
interface PendingRequestState
interface BrokerSummaryRequest
interface MarketTradeInfoRequest
```

---

## Components

### Create

```text
No new components
```

### Modify

```text
No component modifications
```

---

## Services

### Create

```text
src/services/cacheService.ts
```

### Modify

```text
src/services/authService.ts
```

---

## Files To Change

```text
src/api/client.ts
src/api/interceptors.ts
src/api/client.test.ts
src/types/api.ts
src/types/common.ts
src/services/authService.ts
```

---

## Files To Create

```text
src/api/brokerApi.ts
src/api/brokerApi.test.ts
src/api/marketApi.ts
src/api/marketApi.test.ts
src/services/cacheService.ts
src/services/cacheService.test.ts
```

---

## Validation Rules

### Request Validation

* API paths must be relative application API paths, not arbitrary external URLs.
* Authenticated requests must require a valid JWT unless explicitly configured as unauthenticated.
* Broker-specific requests must require an active broker unless explicitly configured otherwise.
* Callers must not manually override `Authorization` or `X-BrokerId` headers.
* JSON request bodies must be serializable.
* Query parameters with `undefined` values must be omitted.

### Date Validation

* `fromDate` must be in `YYYY-MM-DD` format for broker summary requests.
* `toDate` must be in `YYYY-MM-DD` format for broker summary requests.
* Dates cannot be greater than current date.
* `fromDate <= toDate`.
* Invalid date ranges must block API execution before network requests are sent.

### Broker Validation

* `X-BrokerId` must come from the active broker in `src/store/brokerStore.ts`.
* Broker-required requests must fail before network execution when no active broker exists.
* Broker IDs must not be passed manually from UI components.

### Cache Key Validation

* Cache and request deduplication keys must include endpoint identity.
* Broker-specific keys must include broker ID.
* Date-filtered keys must include `fromDate` and `toDate`.
* Market trade info keys must include `stockExchange`.

---

## Error Handling

* Missing token must return a typed auth error before request execution.
* Expired token must clear auth state and return a typed auth error before request execution.
* Missing active broker must return a typed client error before request execution.
* Invalid dates must return typed validation/client errors before request execution.
* 401 responses must clear auth state and surface a user-friendly session-expired error.
* 403, 404, 429, and 500 responses must normalize into typed API errors.
* Network failures must normalize into typed network errors.
* Cancelled requests must be distinguishable from failed requests.
* Empty successful responses must not crash JSON parsing.
* API errors must not log or expose JWT tokens, Authorization headers, or sensitive broker header values.

---

## Performance Considerations

* Deduplicate identical in-flight requests by request key.
* Cancel obsolete requests when a newer request supersedes the same request family.
* Cache successful GET responses in memory for a bounded TTL.
* Do not cache authentication failures or server errors.
* Do not issue automatic retries.
* Avoid duplicate network requests for identical broker ID, endpoint, and date range inputs.
* Keep header injection and cache lookup O(1) per request.
* Keep all cache and pending-request state in memory only.

---

## Security Requirements

* JWT must not be hardcoded.
* Authorization header required.
* X-BrokerId required when applicable.
* No sensitive logging.
* No token exposure in UI.
* Tokens must be read only from in-memory auth state.
* Broker IDs for request headers must be read from the active broker store state.
* API client must prevent manual override of `Authorization` and `X-BrokerId` headers.
* API base URL must use HTTPS.
* No request, cache, or error object may persist JWT tokens to browser storage.

---

## Rules For Implementation

* React functional components only.
* TypeScript strict typing.
* No direct API calls from UI components.
* All API calls through centralized API client.
* Business logic belongs in services.
* Charts must receive transformed data.
* Recharts only.
* In-memory storage only.
* No retry storms.
* No duplicated API requests.
* Do not add Axios or another request library unless explicitly approved.
* Do not add backend persistence, database persistence, or browser persistence.

---

## Definition Of Done

* `src/api/client.ts` exposes a typed centralized request function for all API calls.
* `src/api/interceptors.ts` injects `Authorization` and `X-BrokerId` headers from in-memory state.
* Callers cannot override sensitive auth or broker headers.
* Missing token blocks authenticated requests before `fetch` is called.
* Expired token clears auth state and blocks requests before `fetch` is called.
* Missing active broker blocks broker-required requests before `fetch` is called.
* 401 responses clear auth state and return a typed auth error.
* Network, server, client, cancelled, and validation failures normalize into typed API errors.
* `src/api/brokerApi.ts` wraps `GET /api/broker-summary/orders-execution`.
* `src/api/marketApi.ts` wraps `GET /api/indexes/{stockExchange}/market-trade-info`.
* Broker summary requests validate date format, future dates, and range order before network execution.
* Request deduplication reuses identical in-flight GET requests.
* Obsolete cancellable requests can be aborted with `AbortController`.
* Successful GET responses can be cached in memory with a bounded TTL.
* Failed responses and auth errors are not cached.
* No `fetch` calls exist in UI components or pages.
* No JWT token appears in source code or logs.
* No browser persistence APIs are introduced.
* Unit tests cover request building, header injection, auth failures, broker failures, response parsing, error normalization, cancellation, deduplication, and caching.
* Integration-style tests verify broker summary and market API wrappers use the centralized client.
* `npm run lint` passes.
* `npm run test -- --run` passes.
* `npm run build` passes.
