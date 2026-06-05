# PerformanceAxis

PerformanceAxis is a ReactJS-based single page application for measuring and visualizing XFL broker trading performance against DSE market trading statistics.

## Tech Stack

- ReactJS
- TypeScript
- Vite
- Recharts

## Commands

```bash
npm install
npm run dev
npm run build
npm run test
npm run lint
npm run preview
```

## Architecture

```text
src/
├── api/
├── components/
│   ├── DateRangeFilter/
│   ├── ComparisonTable/
│   ├── PerformanceChart/
│   ├── BrokerManager/
│   ├── LoadingState/
│   ├── ErrorState/
│   ├── EmptyState/
│   └── Shared/
├── hooks/
├── pages/
│   ├── Dashboard/
│   └── BrokerSettings/
├── services/
├── store/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

## Current Scope

This foundation sets up the application shell and folder structure only. API integration, JWT handling, broker storage, validation, caching, dashboard features, and charts will be implemented in later features.

## Security

Do not hardcode JWT tokens, Broker IDs, or sensitive headers in source files. Future API requests must use the centralized API client and inject authentication from application state.
