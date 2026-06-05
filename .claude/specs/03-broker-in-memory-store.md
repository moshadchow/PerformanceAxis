# Spec: Broker In Memory Store

## Overview

Broker In Memory Store establishes the application state layer for broker mappings used by PerformanceAxis. The feature exists so future Broker Settings, API client, dashboard, and comparison features can read and update broker records from one centralized in-memory store instead of duplicating broker state across components.

This provides user value by enabling future broker management workflows, active broker selection, and broker-specific API header injection. It fits into the PerformanceAxis roadmap after Project Setup and Core Type Definations, and before UI-based broker management and authenticated API integration.

## Depends On

```text
Project Setup
Core Type Definations
```

## User Stories

* As a user I can have broker mappings represented in application state.
* As a user I can have one active broker selected at a time.
* As a user I can add a broker mapping in memory.
* As a user I can update a broker mapping in memory.
* As a user I can delete a broker mapping in memory.
* As a user I can select a different active broker in memory.
* As a developer I can access broker state through a centralized store instead of duplicating it in components.

## API Changes

### Existing Endpoints Used

No existing endpoints used

### New Endpoints Required

No new endpoints

## State Changes

### New State

```typescript
brokers: Broker[]
activeBrokerId: BrokerId | null
```

### Modified State

```text
No existing store state modified
```

## Data Models

```typescript
interface Broker
interface ValidationResult
interface ValidationError
type BrokerId
type BrokerKey
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
src/store/.gitkeep
```

## Files To Create

```text
src/store/brokerStore.ts
src/store/brokerStore.test.ts
```

## Validation Rules

### Broker Validation

* Broker key is required.
* Broker ID is required.
* Broker key must be unique case-insensitively.
* Broker ID must be unique.
* Only one broker may be active at a time.
* Deleting the active broker must clear the active broker or activate another valid broker deterministically.
* Selecting an active broker must fail if the broker does not exist.
* Updating a broker must fail if the broker does not exist.
* Deleting a broker must fail if the broker does not exist.

### Date Validation

No date validation implemented in this feature

## Error Handling

* Broker validation failures must return typed validation errors.
* Duplicate broker keys must return a validation error before modifying store state.
* Duplicate broker IDs must return a validation error before modifying store state.
* Missing broker records must return a typed error or failed result before modifying store state.
* API failures are not applicable because this feature does not call APIs.
* Empty data is valid and represents no configured brokers.
* Unauthorized requests are not applicable because this feature does not perform authenticated API requests.

## Performance Considerations

* Store operations should be synchronous and in memory.
* Broker lookups should avoid unnecessary work for typical small broker lists.
* State updates should avoid mutating existing arrays directly.
* Request throttling is not applicable because this feature does not perform network requests.
* Request deduplication is not applicable because this feature does not perform network requests.
* Caching is not implemented in this feature beyond in-memory broker state.

## Security Requirements

* JWT must not be hardcoded.
* Authorization header required for future authenticated API requests.
* X-BrokerId required when applicable.
* No sensitive logging.
* No token exposure in UI.
* Broker data must remain in memory only.
* Do not persist broker mappings to localStorage, sessionStorage, IndexedDB, databases, or backend services.
* Do not include real Broker IDs as seed data or examples in source code.

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

* `src/store/brokerStore.ts` exists.
* Broker state is stored in memory only.
* Store exports typed read operations for all brokers and the active broker.
* Store exports typed write operations to add, update, delete, and activate brokers.
* Broker key validation enforces required and case-insensitive uniqueness rules.
* Broker ID validation enforces required and uniqueness rules.
* Only one broker can be active at a time.
* Store operations do not mutate existing arrays directly.
* Store operations return typed success or validation failure results.
* No APIs are called.
* No components are created or modified.
* No JWT tokens are hardcoded.
* No real Broker IDs are hardcoded.
* No browser persistence or backend persistence is introduced.
* Unit tests verify add, update, delete, activate, uniqueness, missing broker, and active broker behavior.
* `npm run lint` passes.
* `npm run test -- --run` passes.
* `npm run build` passes.
