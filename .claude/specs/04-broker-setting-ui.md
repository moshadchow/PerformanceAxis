# Spec: Broker Setting UI

## Overview

Broker Setting UI creates the first user-facing broker management interface for PerformanceAxis. The feature exists so users can add, edit, delete, view, and activate broker mappings through the SPA instead of relying on direct store calls.

This provides user value by making broker configuration accessible in the browser and preparing the active broker selection that future authenticated API calls will use for `X-BrokerId` header injection. It fits into the PerformanceAxis roadmap after Project Setup, Core Type Definations, and Broker In Memory Store, and before API client integration and dashboard data loading.

## Depends On

```text
Project Setup
Core Type Definations
Broker In Memory Store
```

## User Stories

* As a user I can open a Broker Settings page.
* As a user I can view all configured broker mappings.
* As a user I can add a broker with a key and broker ID.
* As a user I can edit an existing broker key or broker ID.
* As a user I can delete an existing broker.
* As a user I can select exactly one active broker.
* As a user I can see which broker is currently active.
* As a user I can see validation errors when broker input is invalid.
* As a user I can see an empty state when no brokers are configured.

## API Changes

### Existing Endpoints Used

No existing endpoints used

### New Endpoints Required

No new endpoints

## State Changes

### New State

```typescript
brokerFormMode: 'create' | 'edit'
selectedBrokerId: BrokerId | null
brokerKeyInput: string
brokerIdInput: string
validationErrors: ValidationError[]
```

### Modified State

```text
src/store/brokerStore.ts broker list and active broker state are read and modified through existing store operations
```

## Data Models

```typescript
interface Broker
interface ValidationError
interface ValidationResult
type BrokerId
type BrokerKey
interface BrokerInput
interface BrokerStoreResult
```

## Components

### Create

```text
BrokerManager
BrokerForm
BrokerList
BrokerListItem
BrokerSettingsPage
```

### Modify

```text
App
```

## Services

### Create

No new services

### Modify

No service changes

## Files To Change

```text
src/App.tsx
src/components/BrokerManager/.gitkeep
src/pages/BrokerSettings/.gitkeep
```

## Files To Create

```text
src/components/BrokerManager/BrokerManager.tsx
src/components/BrokerManager/BrokerForm.tsx
src/components/BrokerManager/BrokerList.tsx
src/components/BrokerManager/BrokerListItem.tsx
src/components/BrokerManager/index.ts
src/components/BrokerManager/BrokerManager.test.tsx
src/pages/BrokerSettings/BrokerSettingsPage.tsx
src/pages/BrokerSettings/index.ts
```

## Validation Rules

### Broker Validation

* Broker key is required.
* Broker ID is required.
* Broker key must be unique case-insensitively.
* Broker ID must be unique.
* Only one broker may be active at a time.
* Selecting an active broker must fail if the broker does not exist.
* Updating a broker must fail if the broker does not exist.
* Deleting a broker must fail if the broker does not exist.
* Validation messages from the broker store must be displayed in the UI.

### Date Validation

No date validation implemented in this feature

## Error Handling

* Broker validation failures must display user-readable messages.
* Missing broker operations must display user-readable messages.
* Empty broker lists must show an empty state instead of a blank page.
* Store operation failures must not clear valid form input unless the user cancels or succeeds.
* API failures are not applicable because this feature does not call APIs.
* Unauthorized requests are not applicable because this feature does not perform authenticated API requests.

## Performance Considerations

* Broker list rendering should use stable broker IDs as React keys.
* Form submit handlers should avoid unnecessary state updates.
* Derived active broker display should be calculated from store snapshots and component state, not by duplicating broker state in multiple places.
* Request throttling is not applicable because this feature does not perform network requests.
* Request deduplication is not applicable because this feature does not perform network requests.
* Caching is not applicable beyond the existing in-memory broker store.

## Security Requirements

* JWT must not be hardcoded.
* Authorization header required for future authenticated API requests.
* X-BrokerId required when applicable.
* No sensitive logging.
* No token exposure in UI.
* Do not include real Broker IDs as seed data, examples, placeholders, or tests.
* Do not persist broker mappings to localStorage, sessionStorage, IndexedDB, databases, or backend services.
* Do not expose Authorization headers or tokens in UI.

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

* Broker Settings page renders from `src/pages/BrokerSettings/BrokerSettingsPage.tsx`.
* `App.tsx` exposes the Broker Settings UI in the SPA.
* Broker list displays all in-memory brokers.
* Empty state displays when no brokers exist.
* Users can add a broker through the UI.
* Users can edit an existing broker through the UI.
* Users can delete an existing broker through the UI.
* Users can activate exactly one broker through the UI.
* Active broker is visibly marked in the broker list.
* Broker key required validation displays in the UI.
* Broker ID required validation displays in the UI.
* Duplicate broker key validation displays in the UI.
* Duplicate broker ID validation displays in the UI.
* UI uses `src/store/brokerStore.ts` for broker state changes.
* No API calls are implemented.
* No JWT tokens are hardcoded.
* No real Broker IDs are hardcoded.
* No browser persistence or backend persistence is introduced.
* Unit tests verify render, empty state, add, edit, delete, activate, and validation error behavior.
* `npm run lint` passes.
* `npm run test -- --run` passes.
* `npm run build` passes.
