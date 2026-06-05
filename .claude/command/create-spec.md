---

description: Create a specification document and feature branch for the next PerformanceAxis feature
argument-hint: "Feature number and feature name e.g. 03 broker-management"
allowed-tools: Read, Write, Glob, Bash(git:*)
---------------------------------------------

You are a senior software engineer creating the next feature specification for the PerformanceAxis application.

Always follow the rules defined in CLAUDE.md.

User input: $ARGUMENTS

# Step 1 — Verify Working Directory Is Clean

Run:

```bash
git status
```

Check for:

* Uncommitted changes
* Untracked files
* Staged but uncommitted files

If any exist:

STOP immediately.

Tell the user:

```text
Working directory is not clean.
Please commit, stash, or remove pending changes before creating a new feature specification.
```

Do not continue until the working directory is clean.

---

# Step 2 — Parse Arguments

From `$ARGUMENTS` extract:

## 1. feature_number

Zero padded.

Examples:

```text
1  → 01
2  → 02
10 → 10
```

---

## 2. feature_title

Human-readable title in Title Case.

Examples:

```text
Broker Management
Dashboard Layout
Comparison Table
Performance Chart
```

---

## 3. feature_slug

Requirements:

* lowercase
* kebab-case
* max length 50 characters
* only:

```text
a-z
0-9
-
```

Examples:

```text
broker-management
comparison-table
performance-chart
```

---

## 4. branch_name

Format:

```text
feature/<feature_slug>
```

Examples:

```text
feature/broker-management
feature/comparison-table
```

If any value cannot be confidently inferred from `$ARGUMENTS`, ask the user for clarification before continuing.

---

# Step 3 — Ensure Branch Name Is Available

Run:

```bash
git branch
```

If branch already exists:

Append incremental suffix:

```text
feature/broker-management-01
feature/broker-management-02
feature/broker-management-03
```

Use first available branch name.

---

# Step 4 — Update Main Branch

Run:

```bash
git checkout main
git pull origin main
```

If pull fails:

Stop and report the error.

---

# Step 5 — Create Feature Branch

Run:

```bash
git checkout -b <branch_name>
```

---

# Step 6 — Research Existing Project

Before writing any specification, read:

## Required

```text
CLAUDE.md
package.json
README.md
```

## Architecture

Read:

```text
src/api/**
src/services/**
src/store/**
src/types/**
```

---

## Existing Specs

Read all files under:

```text
.claude/specs/
```

to prevent:

* duplicate features
* overlapping requirements
* conflicting implementation plans

---

## Roadmap Validation

Check CLAUDE.md.

Confirm requested feature is not already marked:

```text
Implemented
Completed
Done
```

If already completed:

Stop and warn the user.

---

# Step 7 — Create Specification

Generate a specification document using the EXACT structure below.

---

# Spec: <feature_title>

## Overview

Describe:

* Business purpose
* User value
* Why the feature exists
* How it fits into the PerformanceAxis roadmap

---

## Depends On

List prerequisite features.

Examples:

```text
Broker Store
API Client
Date Validation
```

If none:

```text
No dependencies
```

---

## User Stories

List all user-facing behavior.

Example:

* As a user I can add a broker.
* As a user I can select an active broker.
* As a user I can delete a broker.

---

## API Changes

List:

### Existing Endpoints Used

```http
GET /api/...
```

### New Endpoints Required

If none:

```text
No new endpoints
```

---

## State Changes

List:

### New State

Example:

```typescript
activeBroker
brokerList
selectedDateRange
```

### Modified State

Existing stores impacted.

If none:

```text
No state changes
```

---

## Data Models

List interfaces and types.

Example:

```typescript
interface Broker
interface ComparisonRow
```

If none:

```text
No new data models
```

---

## Components

### Create

New components.

Example:

```text
BrokerManager
BrokerForm
```

### Modify

Existing components impacted.

If none:

```text
No component modifications
```

---

## Services

### Create

New services.

### Modify

Existing services.

If none:

```text
No service changes
```

---

## Files To Change

List every existing file that must be modified.

---

## Files To Create

List every new file.

---

## Validation Rules

Include all business validations.

Examples:

### Date Validation

* YYYY-MM-DD
* No future dates
* From Date <= To Date

### Broker Validation

* Unique key
* Unique brokerId

---

## Error Handling

Describe:

* API failures
* Validation failures
* Empty data
* Unauthorized requests

---

## Performance Considerations

Consider:

* Request throttling
* Request deduplication
* Memoization
* Caching

If none apply:

```text
No special performance requirements
```

---

## Security Requirements

Always include:

* JWT must not be hardcoded
* Authorization header required
* X-BrokerId required when applicable
* No sensitive logging
* No token exposure in UI

---

## Rules For Implementation

Always include:

* React functional components only
* TypeScript strict typing
* No direct API calls from UI components
* All API calls through centralized API client
* Business logic belongs in services
* Charts must receive transformed data
* Recharts only
* In-memory storage only
* No retry storms
* No duplicated API requests

---

## Definition Of Done

Provide a testable checklist.

Every item must be verifiable.

Example:

* Broker can be added.
* Broker can be edited.
* Broker can be deleted.
* Active broker is reflected in API headers.
* Validation messages display correctly.
* No duplicate API requests occur.

---

# Step 8 — Save Specification

Save as:

```text
.claude/specs/<feature_number>-<feature_slug>.md
```

Examples:

```text
.claude/specs/01-project-foundation.md
.claude/specs/03-broker-management.md
.claude/specs/10-performance-chart.md
```

---

# Step 9 — Report Result

Print:

```text
Branch:    <branch_name>
Spec file: .claude/specs/<feature_number>-<feature_slug>.md
Title:     <feature_title>
```

Then display:

```text
Review the specification at:

.claude/specs/<feature_number>-<feature_slug>.md

After approval, enter Plan Mode and begin implementation according to CLAUDE.md.
```

Do not print the entire specification in chat unless explicitly requested.
