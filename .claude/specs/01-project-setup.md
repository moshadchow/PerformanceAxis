# Spec: Project Setup

## Overview

Project Setup establishes the initial ReactJS, TypeScript, and Vite application foundation for PerformanceAxis. The feature exists so future roadmap items can be implemented on a consistent SPA structure with centralized folders for API communication, services, stores, types, utilities, pages, and reusable components.

This setup provides user value by enabling the application shell that will later host the dashboard, broker settings, comparison table, and performance chart. It fits into the PerformanceAxis roadmap as the prerequisite foundation for authenticated API integration, broker management, market comparison, validation, caching, and visualization features.

## Depends On

No dependencies

## User Stories

* As a user I can open the PerformanceAxis application in a browser.
* As a user I can see an initial application shell for the PerformanceAxis SPA.
* As a developer I can run the development server for local feature work.
* As a developer I can build the production bundle.
* As a developer I can use the established folder structure required by CLAUDE.md.
* As a developer I can add future features without placing API calls or business logic in UI components.

## API Changes

### Existing Endpoints Used

No existing endpoints used

### New Endpoints Required

No new endpoints

## State Changes

### New State

No new state

### Modified State

No state changes

## Data Models

No new data models

## Components

### Create

```text
App
```

### Modify

No component modifications

## Services

### Create

No new services

### Modify

No service changes

## Files To Change

```text
No existing application files to modify
```

## Files To Create

```text
package.json
vite.config.ts
tsconfig.json
tsconfig.node.json
index.html
README.md
src/main.tsx
src/App.tsx
src/api/.gitkeep
src/components/.gitkeep
src/components/DateRangeFilter/.gitkeep
src/components/ComparisonTable/.gitkeep
src/components/PerformanceChart/.gitkeep
src/components/BrokerManager/.gitkeep
src/components/LoadingState/.gitkeep
src/components/ErrorState/.gitkeep
src/components/EmptyState/.gitkeep
src/components/Shared/.gitkeep
src/hooks/.gitkeep
src/pages/.gitkeep
src/pages/Dashboard/.gitkeep
src/pages/BrokerSettings/.gitkeep
src/services/.gitkeep
src/store/.gitkeep
src/types/.gitkeep
src/utils/.gitkeep
```

## Validation Rules

### Project Setup Validation

* The application must use ReactJS.
* The application must use TypeScript.
* The application must use Vite.
* TypeScript strict mode must be enabled.
* The folder structure must align with CLAUDE.md.
* The application must build without TypeScript errors.

### Date Validation

No date validation implemented in this feature

### Broker Validation

No broker validation implemented in this feature

## Error Handling

* Build-time TypeScript errors must fail the production build.
* Missing dependencies must be resolved through package installation.
* Runtime application startup should render a clear initial shell rather than a blank page.
* API failures are not applicable because this feature does not call APIs.
* Validation failures are not applicable because this feature does not include user-entered business data.
* Empty data handling is not applicable because this feature does not fetch or render datasets.
* Unauthorized requests are not applicable because this feature does not perform authenticated API requests.

## Performance Considerations

* Use Vite for fast development startup and optimized production builds.
* Keep the initial application shell lightweight.
* Avoid unnecessary dependencies beyond the required React, TypeScript, Vite, and Recharts foundation.
* Request throttling is not applicable because this feature does not perform network requests.
* Request deduplication is not applicable because this feature does not perform network requests.
* Caching is not applicable because this feature does not fetch data.

## Security Requirements

* JWT must not be hardcoded.
* Authorization header required for future authenticated API requests.
* X-BrokerId required when applicable for future broker-specific API requests.
* No sensitive logging.
* No token exposure in UI.
* Do not introduce backend persistence.
* Do not store secrets in source files.

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

* `package.json` exists with scripts for `dev`, `build`, `test`, `lint`, and `preview`.
* React, TypeScript, Vite, and Recharts are configured as project dependencies.
* TypeScript strict mode is enabled.
* Vite config exists and supports React.
* `index.html` mounts the React application.
* `src/main.tsx` renders the application root.
* `src/App.tsx` renders an initial PerformanceAxis application shell.
* Required architecture directories from CLAUDE.md exist.
* No API calls are made by the initial application shell.
* No JWT tokens or Broker IDs are hardcoded.
* The production build completes successfully.
* README documents the basic project purpose and available commands.
