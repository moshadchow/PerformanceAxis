Implementation Plan: Broker Setting UI

     Context

     PerformanceAxis needs a user-facing Broker Settings UI so users can manage broker mappings through the SPA instead of
     calling the in-memory store directly. The approved spec at .claude/specs/04-broker-setting-ui.md requires a Broker
     Settings page with broker list, add/edit/delete actions, active broker selection, validation error display, and empty
     state behavior.

     The current project already has the foundation, core types, and broker in-memory store. The UI should reuse
     src/store/brokerStore.ts as the source of truth and reuse existing broker/validation types. There is no router today, so      this feature should integrate the Broker Settings page directly into App.tsx rather than adding routing dependencies.

     Recommended Approach

     1. Create the Broker Settings page.
       - Create src/pages/BrokerSettings/BrokerSettingsPage.tsx.
       - Render a semantic page section with heading Broker Settings, brief explanatory copy, and BrokerManager.
       - Create src/pages/BrokerSettings/index.ts to export the page.
       - Remove src/pages/BrokerSettings/.gitkeep after real files exist.
     2. Create the BrokerManager component family.
       - Create src/components/BrokerManager/BrokerManager.tsx.
       - Create src/components/BrokerManager/BrokerForm.tsx.
       - Create src/components/BrokerManager/BrokerList.tsx.
       - Create src/components/BrokerManager/BrokerListItem.tsx.
       - Create src/components/BrokerManager/index.ts.
       - Remove src/components/BrokerManager/.gitkeep after real files exist.
     3. Use BrokerManager as the state coordinator for the UI.
       - Initialize local React state from getAllBrokers() and getActiveBroker().
       - Keep the broker store as the source of truth; local React state is only a render snapshot.
       - Add a local refreshBrokers() function that reads getAllBrokers() and getActiveBroker() after successful store
     mutations.
       - Track:
           - brokers: Broker[]
         - activeBroker: Broker | null
         - editingBroker: Broker | null
         - validationErrors: ValidationError[]
       - Do not mutate store during render or effects; only mutate in event handlers.
     4. Wire store-backed actions in BrokerManager.
       - Add broker: call addBroker(input).
       - Edit broker: preserve the original editingBroker.brokerId and call updateBroker(editingBroker.brokerId, input) so
     users can change Broker ID safely.
       - Delete broker: call deleteBroker(brokerId), cancel edit mode if the deleted broker was being edited, and refresh.
       - Activate broker: call activateBroker(brokerId) and refresh.
       - On success: clear validation errors, reset form/edit mode as appropriate, and refresh brokers.
       - On failure: render result.validation.errors without clearing valid user input.
     5. Implement BrokerForm as a controlled form.
       - Props should include mode ('add' | 'edit'), optional initial broker, validation errors, submit callback, and cancel
     callback.
       - Inputs:
           - Broker key
         - Broker ID
       - Use labels and accessible input names.
       - Do not use HTML required, because browser validation could block store validation messages from rendering.
       - Use useEffect to reset/populate fields when switching between add and edit modes.
       - Render field-level validation messages from ValidationError.message for field: 'key' and field: 'brokerId'.
     6. Implement BrokerList and BrokerListItem.
       - BrokerList renders an empty state when brokers.length === 0.
       - Render a semantic list of broker items using broker.brokerId as React key.
       - Each list item displays:
           - Broker key
         - Broker ID
         - visible Active broker marker when active
         - Edit button
         - Delete button
         - Make active button for inactive brokers
       - Use visible text rather than color-only active indicators.
     7. Integrate into App.tsx.
       - Keep the current PerformanceAxis shell and heading so the existing app smoke test remains meaningful.
       - Render BrokerSettingsPage below the existing shell content.
       - Do not add React Router or new dependencies.
     8. Add component tests.
       - Create src/components/BrokerManager/BrokerManager.test.tsx.
       - Use React Testing Library and userEvent.
       - Call resetBrokerStoreForTests() in beforeEach.
       - Use fake Broker IDs such as broker-alpha-id, not real IDs.
       - Cover:
           - Empty state and form render.
         - Add first broker and active marker.
         - Add second broker inactive by default.
         - Activate another broker and enforce one active marker.
         - Edit key and Broker ID.
         - Cancel edit.
         - Delete broker.
         - Delete active broker and verify deterministic active reassignment.
         - Required validation errors.
         - Duplicate key and duplicate Broker ID validation.
       - Update src/App.test.tsx only if needed to include Broker Settings render expectations.

     Critical Files To Modify

     - src/App.tsx
     - src/App.test.tsx if the app smoke test needs updated expectations
     - src/components/BrokerManager/.gitkeep — remove after component files exist
     - src/pages/BrokerSettings/.gitkeep — remove after page files exist

     Critical Files To Create

     - src/components/BrokerManager/BrokerManager.tsx
     - src/components/BrokerManager/BrokerForm.tsx
     - src/components/BrokerManager/BrokerList.tsx
     - src/components/BrokerManager/BrokerListItem.tsx
     - src/components/BrokerManager/index.ts
     - src/components/BrokerManager/BrokerManager.test.tsx
     - src/pages/BrokerSettings/BrokerSettingsPage.tsx
     - src/pages/BrokerSettings/index.ts

     Existing Code To Reuse

     - src/store/brokerStore.ts
       - getAllBrokers
       - getActiveBroker
       - addBroker
       - updateBroker
       - deleteBroker
       - activateBroker
       - resetBrokerStoreForTests
     - src/types/broker.ts
       - Broker
       - BrokerId
     - src/types/common.ts
       - ValidationError

     CLAUDE.md Constraints To Preserve

     - React functional components only.
     - Hooks only; no class components.
     - TypeScript strict typing; avoid any.
     - No API calls in this feature.
     - No services, custom hooks, Redux, or persistence.
     - Broker data stays in the existing in-memory broker store.
     - No hardcoded JWT tokens.
     - No real Broker IDs in source, placeholders, or tests.
     - Do not duplicate broker validation/business rules in UI; render store validation results instead.
     - No React Router dependency unless explicitly approved; direct App integration is sufficient for this feature.

     Verification

     After implementation, run:

     npm run lint
     npm run test -- --run
     npm run build

     Expected results:

     - Lint passes with no explicit any and no unused declarations.
     - Existing app and broker store tests still pass.
     - BrokerManager UI tests pass.
     - TypeScript strict build passes.
     - Broker Settings UI renders from App.tsx.
     - Users can add, edit, delete, and activate brokers through the UI.
     - Validation errors and empty state render in the UI.
     - No API calls, services, custom hooks, Redux, persistence, JWT tokens, or real Broker IDs are introduced.