# Spec: Core Type Definations

## Overview

Core Type Definations establishes the shared TypeScript contracts for PerformanceAxis before API, store, service, dashboard, broker management, comparison table, and chart features are implemented. The feature exists to create a strict, reusable type layer that keeps API responses, broker records, comparison rows, chart datasets, application state, loading states, error states, and validation results consistent across the application.

This provides user value indirectly by reducing implementation errors in later features and ensuring the dashboard, broker settings, API integration, and visualization layers all use the same domain model. It fits into the PerformanceAxis roadmap as the type foundation that future API clients, services, hooks, stores, and UI components will depend on.

## Depends On

```text
Project Setup
```

## User Stories

* As a developer I can import shared API response types from a central location.
* As a developer I can use a consistent Broker interface across broker settings, stores, services, and API headers.
* As a developer I can use shared comparison row types for tables and chart transformations.
* As a developer I can use shared chart data types for Recharts-compatible datasets.
* As a developer I can represent loading, empty, success, and error states consistently.
* As a developer I can type validation results without using `any`.

## API Changes

### Existing Endpoints Used

No existing endpoints used

### New Endpoints Required

No new endpoints

## State Changes

### New State

No runtime state created

### Modified State

No state changes

## Data Models

```typescript
interface Broker
interface BrokerSummaryResponse
interface MarketTradeInfoResponse
interface DateRange
interface ApiError
interface ApiRequestState
interface ComparisonRow
interface ChartDataPoint
interface ValidationResult
interface ValidationError
```

## Components

### Create

No new components

### Modify

No component modifications

## Services

### Create

No new services

### Modify

No service changes

## Files To Change

```text
src/types/.gitkeep
```

## Files To Create

```text
src/types/api.ts
src/types/broker.ts
src/types/comparison.ts
src/types/chart.ts
src/types/common.ts
src/types/index.ts
```

## Validation Rules

### Type Definition Validation

* Types must compile under strict TypeScript settings.
* Types must avoid `any`.
* API contracts must use interfaces.
* Shared status values must use literal unions or constants where appropriate.
* Models must not include hardcoded JWT tokens.
* Models must not include hardcoded Broker IDs.
* Type exports must be reusable by future API, service, hook, store, and component features.

### Date Validation

* Date values must be represented using `YYYY-MM-DD` strings.
* Date validation behavior is not implemented in this feature.
* Future validation logic must enforce no future dates.
* Future validation logic must enforce From Date <= To Date.

### Broker Validation

* Broker key must be represented as required.
* Broker ID must be represented as required.
* Active broker state must be represented with a boolean.
* Uniqueness and active broker validation behavior is not implemented in this feature.

## Error Handling

* API error types must support client, network, and server error categories.
* API error types must support HTTP statuses including 400, 401, 403, 404, 429, and 500.
* Request state types must support loading, success, empty, and error states.
* Validation result types must support valid and invalid outcomes.
* No API failures are handled at runtime in this feature because no API requests are made.
* No validation failures are displayed in this feature because no UI or validation service is implemented.
* Unauthorized requests are not executed in this feature.

## Performance Considerations

* Types should support future request deduplication by representing endpoint, brokerId, fromDate, and toDate cache key inputs.
* Types should support future memoized comparison rows and chart datasets.
* Types should avoid unnecessary runtime objects unless constants are required.
* Request throttling is not implemented in this feature.
* Request deduplication is not implemented in this feature.
* Caching is not implemented in this feature.

## Security Requirements

* JWT must not be hardcoded.
* Authorization header required for future authenticated API requests.
* X-BrokerId required when applicable.
* No sensitive logging.
* No token exposure in UI.
* Types must not include example secrets or real Broker IDs.
* Types must not encourage storing tokens in persistent browser storage.

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

## Definition Of Done

* `src/types/api.ts` defines API response, API error, request state, and endpoint-related types.
* `src/types/broker.ts` defines the shared `Broker` interface.
* `src/types/comparison.ts` defines comparison row and comparison metric types.
* `src/types/chart.ts` defines Recharts-compatible chart data types.
* `src/types/common.ts` defines shared date range, validation, status, and utility types.
* `src/types/index.ts` exports the public type surface.
* Type definitions compile under strict TypeScript.
* No `any` types are introduced.
* No API calls are implemented.
* No components, stores, services, hooks, or business logic are implemented.
* No JWT tokens or Broker IDs are hardcoded.
* `npm run lint` passes.
* `npm run test -- --run` passes.
* `npm run build` passes.
