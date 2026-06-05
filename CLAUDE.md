# CLAUDE.md

## Project Overview

PerformanceAxis is a ReactJS-based Single Page Application (SPA) designed to measure and visualize XFL broker trading performance against market-wide trading statistics.

The application retrieves data from XFL APIs, compares broker activity against DSE market activity, and presents the results through:

* Comparison tables
* Time-series charts
* Broker management interface
* Performance analytics dashboard

The application supports multiple brokers through configurable `X-BrokerId` mappings and uses authenticated API requests.

---

# Architecture

```text
performance-axis/
├── src/
│
├── api/
│   ├── client.ts
│   ├── brokerApi.ts
│   ├── marketApi.ts
│   └── interceptors.ts
│
├── components/
│   ├── DateRangeFilter/
│   ├── ComparisonTable/
│   ├── PerformanceChart/
│   ├── BrokerManager/
│   ├── LoadingState/
│   ├── ErrorState/
│   ├── EmptyState/
│   └── Shared/
│
├── pages/
│   ├── Dashboard/
│   └── BrokerSettings/
│
├── hooks/
│   ├── useBrokerSummary.ts
│   ├── useMarketTradeInfo.ts
│   ├── useComparisonData.ts
│   ├── useCache.ts
│   └── useThrottle.ts
│
├── services/
│   ├── comparisonService.ts
│   ├── brokerService.ts
│   ├── cacheService.ts
│   └── validationService.ts
│
├── store/
│   ├── brokerStore.ts
│   └── appStore.ts
│
├── types/
│   ├── api.ts
│   ├── broker.ts
│   ├── comparison.ts
│   └── chart.ts
│
├── utils/
│   ├── dateUtils.ts
│   ├── calculations.ts
│   ├── constants.ts
│   └── formatters.ts
│
├── App.tsx
├── main.tsx
└── routes.tsx

public/
package.json
vite.config.ts
README.md
```

---

# Where Things Belong

### API Communication

* API requests → `src/api/`
* Request interceptors → `src/api/interceptors.ts`
* Authentication header injection → `src/api/client.ts`

### Business Logic

* Data aggregation → `src/services/comparisonService.ts`
* Broker CRUD logic → `src/services/brokerService.ts`
* Validation logic → `src/services/validationService.ts`

### UI Components

* Tables → `src/components/ComparisonTable`
* Charts → `src/components/PerformanceChart`
* Filters → `src/components/DateRangeFilter`

### State Management

* Broker state → `src/store/brokerStore.ts`
* Application state → `src/store/appStore.ts`

Never place business calculations inside UI components.

Never place API requests directly inside chart or table components.

---

# Code Style

## React

* Functional components only.
* Hooks only.
* No class components.
* Keep components focused on a single responsibility.

## TypeScript

* Strict typing enabled.
* Avoid `any`.
* Use interfaces for API contracts.
* Use enums/constants where appropriate.

## Naming

### Components

```text
ComparisonTable.tsx
PerformanceChart.tsx
BrokerManager.tsx
```

### Hooks

```text
useBrokerSummary.ts
useMarketTradeInfo.ts
```

### Services

```text
comparisonService.ts
cacheService.ts
```

---

# Technology Constraints

## Required

* ReactJS
* TypeScript
* Recharts
* Vite

## Storage

* In-Memory Store Only

## Not Allowed

* Backend persistence
* Database servers
* Redux unless explicitly approved
* Chart libraries other than Recharts
* Direct API calls from UI components

---

# API Configuration

## Base URL

```text
https://uat.xfltrade.com:20121
```

---

# Authentication Requirements

Every API request must include:

```http
Authorization: Bearer <JWT_TOKEN>
X-BrokerId: <BROKER_ID>
```

## Required Headers

| Header        | Required | Description                |
| ------------- | -------- | -------------------------- |
| Authorization | Yes      | JWT Authentication Token   |
| X-BrokerId    | Yes      | Selected Broker Identifier |

## Example

```http
GET /api/broker-summary/orders-execution?fromDate=2025-01-01&toDate=2025-01-31

Authorization: Bearer eyJhbGciOi...
X-BrokerId: 681caf2dc0024a529d5a0ffe
```

---

# API Endpoints

## Broker Summary Endpoint

```http
GET /api/broker-summary/orders-execution
```

### Query Parameters

```text
fromDate=YYYY-MM-DD
toDate=YYYY-MM-DD
```

### Response Fields

```json
{
  "totalExecutionReport": 0,
  "totalTrade": 0,
  "buyTrade": 0,
  "sellTrade": 0,
  "totalValue": 0,
  "buyValue": 0,
  "sellValue": 0
}
```

### Required Metrics

* totalTrade
* totalValue
* buyTrade
* sellTrade

---

## Market Trade Info Endpoint

```http
GET /api/indexes/{stockExchange}/market-trade-info
```

### Response Fields

```json
{
  "volume": 356564,
  "trade": 4571,
  "value": 3.269,
  "gainer": 134,
  "loser": 148,
  "unchanged": 105
}
```

### Required Metrics

* volume
* trade
* value

---

# Broker Management Requirements

Create a dedicated Broker Settings page.

## Broker Structure

```typescript
interface Broker {
  key: string;
  brokerId: string;
  isActive: boolean;
}
```

## Example

```text
Key      : SNM
BrokerId : 681caf2dc0024a529d5a0ffe
```

---

## Supported Operations

### Add Broker

Create new broker mapping.

### Update Broker

Edit broker key or broker identifier.

### Delete Broker

Remove broker mapping.

### Select Active Broker

Only one broker may be active at a time.

---

## Validation Rules

### Broker Key

* Required
* Unique
* Case-insensitive uniqueness

### Broker ID

* Required
* Unique

### Active Broker

* Exactly one active broker recommended

---

## Storage Rules

Use in-memory storage only.

No database persistence.

---

# Dashboard Requirements

## Filters

| Parameter | Type |
| --------- | ---- |
| From Date | Date |
| To Date   | Date |

---

## Comparison Table

Generate comparison data containing:

| Column     |
| ---------- |
| Date       |
| DSE Volume |
| XFL Volume |
| Volume %   |
| DSE Trade  |
| XFL Trade  |

---

## Calculation Rules

### Volume Percentage

```text
(XFL Volume / DSE Volume) * 100
```

### Division By Zero

```text
If DSE Volume = 0
Volume Percentage = 0
```

Never display Infinity or NaN.

---

# Chart Requirements

Create a date-wise Recharts Line Chart.

## Series

* DSE Volume
* XFL Volume
* DSE Trade
* XFL Trade

---

## Features

### Required

* ResponsiveContainer
* Tooltip
* Legend
* Grid
* Date X-Axis
* Numeric Y-Axis

### Behavior

* Handle empty datasets
* Handle null values
* Support dynamic resizing

---

# Date Validation Rules

Validate before every API request.

## Format Validation

```text
YYYY-MM-DD
```

---

## Future Date Validation

Dates cannot be greater than current date.

---

## Range Validation

```text
fromDate <= toDate
```

Invalid ranges must block API execution.

---

# API Client Rules

All API requests must go through a centralized API client.

Responsibilities:

* Base URL configuration
* Authorization injection
* X-BrokerId injection
* Error handling
* Request cancellation
* Request throttling
* Response normalization

---

## Never

* Create fetch calls inside components
* Duplicate endpoint URLs
* Manually inject headers in components

---

# Caching Requirements

Implement in-memory caching.

## Cache Key

```text
brokerId
fromDate
toDate
endpoint
```

Example:

```text
681caf2dc0024a529d5a0ffe
2025-01-01
2025-01-31
broker-summary
```

---

## Cache Rules

* Reuse cached data when available
* Expire stale entries
* Prevent duplicate requests

---

# Request Throttling

Avoid excessive API requests.

## Requirements

* Debounce filter changes
* Throttle repeated requests
* Cancel obsolete requests
* Deduplicate identical requests

---

## Request Deduplication

When the following values are identical:

```text
brokerId
fromDate
toDate
endpoint
```

Reuse:

* Existing request
  OR
* Cached response

Never issue duplicate network calls.

---

# Error Handling

Handle:

## Client Errors

* Invalid dates
* Missing broker
* Missing token

## Network Errors

* Connection failures
* DNS failures
* Timeouts

## Server Errors

* 400
* 401
* 403
* 404
* 429
* 500

---

## Error UI

Every page must support:

* Loading State
* Empty State
* Error State

---

# Security Rules

## Authentication

Never hardcode JWT tokens.

Always inject tokens from authentication state.

---

## Headers

Never expose tokens in logs.

Never display sensitive headers in UI.

---

## API Protection

Avoid retry storms.

Maximum:

```text
0 automatic retries
```

Retries must be user initiated.

---

# Performance Requirements

## Rendering

* Memoize expensive calculations.
* Memoize chart datasets.
* Avoid unnecessary re-renders.

## Data Processing

Transform API responses once.

Never recalculate inside chart rendering.

---

# Testing Requirements

Verify:

* Date validation
* Percentage calculations
* Broker CRUD
* Cache behavior
* API integration
* Error handling
* Chart rendering

---

# Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build production bundle
npm run build

# Run tests
npm run test

# Run linting
npm run lint

# Preview build
npm run preview
```

---

# Feature Status

| Feature                | Status   |
| ---------------------- | -------- |
| Dashboard              | Required |
| Date Range Filter      | Required |
| Broker Management      | Required |
| Broker CRUD            | Required |
| JWT Authentication     | Required |
| X-BrokerId Support     | Required |
| API Integration        | Required |
| Comparison Table       | Required |
| Recharts Visualization | Required |
| Request Throttling     | Required |
| Request Deduplication  | Required |
| Response Caching       | Required |
| Validation Layer       | Required |
| Error Handling         | Required |
| Loading States         | Required |
| Empty States           | Required |

---

# Warnings And Things To Avoid

* Never call APIs directly from UI components.
* Never bypass validation.
* Never use hardcoded JWT tokens.
* Never use hardcoded Broker IDs.
* Never create duplicate requests.
* Never create retry storms.
* Never calculate percentages inside JSX.
* Never render charts using raw API responses.
* Never assume API success.
* Never ignore API error responses.
* Never store broker data outside the broker store.
* Never expose Authorization headers.
* Never expose X-BrokerId values in logs.
* Never display NaN, Infinity, or undefined values in the UI.
* Always validate dates before requesting data.
* Always verify required headers exist before sending requests.
* Always handle loading, empty, and error states.

```
```