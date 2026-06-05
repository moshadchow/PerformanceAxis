# Spec: Date Validation Service

## Overview

Date Validation Service standardizes date input validation across PerformanceAxis before dashboard, comparison, market, and chart features depend on date-filtered API requests. The feature exists so all date ranges are validated consistently before requests are sent through the centralized API client.

This provides user value by preventing invalid filters, future dates, reversed ranges, and malformed date values from triggering failed or misleading API calls. It fits into the roadmap after Central API Client because broker summary requests already require date validation, and future dashboard features will reuse the same validation behavior.

---

## Depends On

```text
Project Setup
Core Type Definations
Central API Client
```

---

## User Stories

* As a user I can enter a from date and to date using `YYYY-MM-DD` format.
* As a user I can see validation feedback when a date is malformed.
* As a user I can see validation feedback when a date is in the future.
* As a user I can see validation feedback when the from date is after the to date.
* As a user I am prevented from sending API requests with invalid date filters.
* As a developer I can reuse one date validation service across API wrappers, hooks, and future filter components.
* As a developer I can convert date validation failures into typed API/client errors.

---

## API Changes

### Existing Endpoints Used

```http
GET /api/broker-summary/orders-execution
```

### New Endpoints Required

```text
No new endpoints
```

---

## State Changes

### New State

```text
No new application state
```

### Modified State

```text
No state changes
```

---

## Data Models

```typescript
interface DateRange
interface ValidationError
interface ValidationResult
interface ApiError
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
No new services
```

### Modify

```text
src/services/validationService.ts
```

---

## Files To Change

```text
src/services/validationService.ts
src/services/validationService.test.ts
src/api/brokerApi.ts
src/api/brokerApi.test.ts
src/types/common.ts
src/types/api.ts
src/types/index.ts
```

---

## Files To Create

```text
No new files
```

---

## Validation Rules

### Date Validation

* Date values must be strings in `YYYY-MM-DD` format.
* Date values must represent real calendar dates.
* Invalid dates such as `2026-02-31` must fail validation.
* Dates cannot be greater than the current date.
* `fromDate <= toDate`.
* Empty date values must fail validation.
* Whitespace-only date values must fail validation.
* Invalid date ranges must block API execution before network requests are sent.
* Validation failures must return typed `ValidationError` entries with stable error codes.

### Broker Validation

```text
No broker validation changes
```

---

## Error Handling

* Date validation failures must return typed validation results.
* Date validation failures must be convertible into typed API errors.
* Invalid date ranges must fail before `fetch` is called.
* API failures are handled by the centralized API client.
* Empty data responses are not handled by this feature.
* Unauthorized requests are handled by JWT Token Management and the Central API Client.

---

## Performance Considerations

* Date validation must be synchronous and inexpensive.
* Date validation must not make network requests.
* Date validation must not trigger duplicate API requests.
* Validating a date range should be O(1).
* Memoization is not required for the validation service itself.

---

## Security Requirements

* JWT must not be hardcoded.
* Authorization header required.
* X-BrokerId required when applicable.
* No sensitive logging.
* No token exposure in UI.
* Date validation must not log request headers, tokens, broker IDs, or user credentials.
* Date validation must not persist user input to browser storage or backend storage.

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
* Date validation logic must remain in `src/services/validationService.ts` or a clearly reusable validation utility imported by that service.
* API wrappers must call date validation before invoking `apiRequest`.

---

## Definition Of Done

* `src/services/validationService.ts` validates date format, calendar correctness, future dates, and range order.
* Empty and whitespace-only date values fail validation.
* Validation errors include stable field names and error codes.
* Validation service returns the shared `ValidationResult` shape.
* Validation failures can be converted into a typed `ApiError`.
* `src/api/brokerApi.ts` blocks invalid date ranges before `fetch` is called.
* Unit tests cover valid dates, malformed dates, empty dates, whitespace dates, invalid calendar dates, future dates, and reversed ranges.
* Integration-style tests verify invalid broker summary date ranges do not call the centralized API client/fetch.
* No direct API calls are added to UI components.
* No JWT tokens or Broker IDs are hardcoded.
* No browser persistence APIs are introduced.
* `npm run lint` passes.
* `npm run test -- --run` passes.
* `npm run build` passes.
