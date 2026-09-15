# Portal API Client Contract Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile every portal use of `@medrunner/api-client` beta.25 with the current request, response, nullability, and location-tree contracts.

**Architecture:** A pure `locationFunctions` module is the single source of truth for turning the public location tree into valid alert options and display paths. UI components consume those derived values rather than duplicating traversal rules. Response values are normalized at store/helper boundaries so components retain simple numeric and optional-token state.

**Tech Stack:** Vue 3, TypeScript, Pinia, Vite, Vitest, `@medrunner/api-client`, ASP.NET Core API tests.

**Spec:** `docs/superpowers/specs/2026-09-15-api-client-contract-migration-design.md`

## Global Constraints

- Preserve unrelated staged `.idea/.name` metadata and unrelated parent-repository changes.
- Keep the pre-existing beta.25 package update intact and commit it only as the isolated dependency commit.
- Use `apply_patch` for source, test, and documentation edits.
- Make every issue its own conventional commit with a one-sentence explanatory body.
- Run focused tests before each issue commit and run the complete portal checks before completion.

---

### Task 1: Commit the dependency boundary

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: the existing user-provided beta.25 dependency update.
- Produces: the exact installed client declarations used by all later tasks.

- [ ] **Step 1: Verify the lockfile resolves the declared package version.**

Run: `pnpm list @medrunner/api-client --depth 0`

Expected: one installed `@medrunner/api-client@0.7.0-beta.25`.

- [ ] **Step 2: Commit only the dependency files.**

Run:

```text
git add package.json pnpm-lock.yaml
git commit --only -m "chore(deps): update Medrunner API client" \
  -m "Adopt beta.25 declarations so portal call sites reconcile with the current public contract." \
  -- package.json pnpm-lock.yaml
```

### Task 2: Establish tests for pure contract utilities

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `src/utils/functions/__tests__/apiContractTestHarness.test.ts`

**Interfaces:**
- Consumes: `SpaceLocation[]` from `@medrunner/api-client`.
- Produces: a repeatable Vitest command for the contract utility tests.

- [ ] **Step 1: Add the test runner and script.**

Add `vitest` as a development dependency and add `"test": "vitest run"` to the scripts section.

- [ ] **Step 2: Add a passing runner smoke test.**

```ts
it("runs portal API contract tests", () => {
    expect(true).toBe(true);
});
```

- [ ] **Step 3: Verify the runner is green.**

Run: `pnpm test src/utils/functions/__tests__/apiContractTestHarness.test.ts`

Expected: one passing test.

- [ ] **Step 4: Commit the test harness.**

Run:

```text
git commit -m "test: add portal contract utility coverage" \
  -m "Provide an isolated Vitest entry point for red-green API contract utility tests."
```

### Task 3: Introduce the shared location-tree utility

**Files:**
- Create: `src/utils/functions/locationFunctions.ts`
- Modify: `src/utils/functions/__tests__/locationFunctions.test.ts`

**Interfaces:**
- Consumes: `SpaceLocation[]`, `SpaceLocation.id`, `children`, `enabled`, `visibleForAlertSubmissions`, and `alertLocation`.
- Produces: `getSelectableAlertLocations(locations): LocationOption[]` and `findLocationPath(locations, id): SpaceLocation[] | undefined`.

- [ ] **Step 1: Add failing selectable-location and historical-path tests.**

```ts
const locationFunctions = await import(new URL("../locationFunctions.ts", import.meta.url).href)
    .catch(() => undefined);

it("returns only enabled non-root locations that are visible and serviceable", () => {
    expect(locationFunctions?.getSelectableAlertLocations(locations)).toEqual([
        { id: "daymar", label: "Stanton › Crusader › Daymar" },
    ]);
});

it("finds an inactive historical location without applying submission filters", () => {
    expect(locationFunctions?.findLocationPath(locations, "retired-moon")?.map(location => location.name))
        .toEqual(["Stanton", "Crusader", "Retired Moon"]);
});
```

Include a disabled ancestor, a hidden child, and a non-alert child in the fixture so each server-side eligibility rule is represented.

- [ ] **Step 2: Verify the new behavior is red.**

Run: `pnpm test src/utils/functions/__tests__/locationFunctions.test.ts`

Expected: failing assertions because the dynamic module import resolves to `undefined` before the production module exists.

- [ ] **Step 3: Implement depth-aware traversal.**

Traverse recursively with the accumulated path.

Prune disabled branches for selectable options, require path depth of two or more, and select only nodes with all three serviceability flags.

Traverse all nodes for display-path lookup.

- [ ] **Step 4: Verify green and commit the utility.**

Run: `pnpm test src/utils/functions/__tests__/locationFunctions.test.ts`

Run:

```text
git commit -m "feat: add shared alert location resolver" \
  -m "Derive valid location IDs and historical display paths from the public location tree in one tested utility."
```

### Task 4: Migrate alert submission to the current request contract

**Files:**
- Modify: `src/components/Emergency/EmergencyReportForm.vue`

**Interfaces:**
- Consumes: `getSelectableAlertLocations`, `CreateEmergencyRequest`, and `ThreatLevel`.
- Produces: `{ locationId, threatLevel, rsiHandle }` requests with a required nullable RSI handle.

- [ ] **Step 1: Add a failing utility-level request expectation.**

Extend the location test with a selected option assertion proving the form input value is its stable ID rather than a location name.

- [ ] **Step 2: Verify the test remains green while the existing form type check is red.**

Run: `pnpm run type-check`

Expected: missing `Location` export and unsupported `location` payload-property errors from `EmergencyReportForm.vue`.

- [ ] **Step 3: Replace the three legacy selectors with one breadcrumb location selector.**

Use the shared options, bind the selected option's `id`, remove the legacy inline `Location` object, and create this exact payload:

```ts
const payload: CreateEmergencyRequest = {
    locationId: inputLocationId.value,
    threatLevel: Number.parseInt(inputThreatLevel.value),
    rsiHandle: inputRSIHandle.value || null,
};
```

- [ ] **Step 4: Verify the affected type errors are absent and commit.**

Run: `pnpm run type-check`

Run:

```text
git commit -m "fix: submit alert location IDs" \
  -m "Use the configured serviceable location ID and explicit nullable RSI handle required by the beta.25 emergency request contract."
```

### Task 5: Reconcile emergency location presentation and API validation

**Files:**
- Modify: `src/components/Emergency/EmergencyTracking.vue`
- Modify: `src/components/Dashboard/History/HistoryTableRow.vue`
- Modify: `D:/Git/github/medrunner-services/infra-aspire/ref/api/BusinessLogic/Repositories/EmergencyRepository.cs`
- Modify: `D:/Git/github/medrunner-services/infra-aspire/ref/api/BusinessLogicTest/Repositories/Emergency/CreateTests.cs`

**Interfaces:**
- Consumes: `Emergency.locationId`, `Emergency.system`, and `findLocationPath`.
- Produces: location breadcrumbs in portal views and API validation that rejects root IDs before extraction.

- [ ] **Step 1: Write a failing API repository test for a root location.**

```csharp
[Test]
public async Task CreateEmergency_RootLocation_ReturnsBadLocation()
{
    var (status, _) = await EmergencyRepository.CreateEmergency(ClientId, "Stanton", ThreatLevel.Unknown, null);

    Assert.That(status, Is.EqualTo(CreateEmergencyStatus.BadLocation));
}
```

- [ ] **Step 2: Run the focused API test and record the red result.**

Run: `dotnet test BusinessLogicTest --filter FullyQualifiedName~CreateEmergency_RootLocation_ReturnsBadLocation`

Expected: the current validation accepts the root location or reaches the extraction failure.

- [ ] **Step 3: Make validation depth-aware and migrate portal views.**

Pass the path depth through `ContainsEmergencyLocationId` and require at least two nodes before returning true.

Replace every `subsystem` and `tertiaryLocation` reference in the two portal views with a resolved breadcrumb and `system` fallback.

- [ ] **Step 4: Verify focused API test, portal type check, and commit each repository separately.**

Run: `dotnet test BusinessLogicTest --filter FullyQualifiedName~CreateEmergency_RootLocation_ReturnsBadLocation`

Run: `pnpm run type-check`

Portal commit:

```text
git commit -m "fix: resolve emergency locations from IDs" \
  -m "Render current emergency locations from the public tree instead of removed legacy response fields."
```

API commit:

```text
git commit -m "fix: reject root alert locations" \
  -m "Keep validation aligned with persistence requirements so a root selection cannot reach legacy subsystem extraction."
```

### Task 6: Normalize pagination values

**Files:**
- Create: `src/utils/functions/apiResponseFunctions.ts`
- Create: `src/utils/functions/__tests__/apiResponseFunctions.test.ts`
- Modify: `src/utils/functions/fetchFunctions.ts`
- Modify: `src/components/Dashboard/History/HistoryTable.vue`
- Modify: `src/components/Modals/ChatTranscriptModal.vue`

**Interfaces:**
- Consumes: `PaginatedResponse.paginationToken: string | null` and `totalCount: number | string`.
- Produces: optional internal tokens and validated numeric UI counts.

- [ ] **Step 1: Add failing response-normalization tests.**

```ts
const apiResponseFunctions = await import(new URL("../apiResponseFunctions.ts", import.meta.url).href)
    .catch(() => undefined);

it("exports API response normalizers", () => {
    expect(apiResponseFunctions).toBeDefined();
});

it("converts a numeric total-count string to a finite number", () => {
    expect(apiResponseFunctions?.normalizeTotalCount("42")).toBe(42);
});

it("maps a null pagination token to undefined", () => {
    expect(apiResponseFunctions?.normalizePaginationToken(null)).toBeUndefined();
});

it("throws the API response when required data is absent", () => {
    expect(() => apiResponseFunctions?.requireResponseData({ success: false, statusCode: 503 })).toThrow();
});
```

- [ ] **Step 2: Verify red, implement boundary normalization, then verify green.**

Run: `pnpm test src/utils/functions/__tests__/apiResponseFunctions.test.ts`

Expected before implementation: failed dynamic module assertions because `apiResponseFunctions` does not exist.

Run after implementation: the focused test passes.

- [ ] **Step 3: Implement the pure response adapter and replace the component assignments.**

`normalizeTotalCount` accepts only finite non-negative integer-equivalent values and throws for malformed API data.

`normalizePaginationToken` maps `null` to `undefined`.

`requireResponseData` returns successful data and throws the original response otherwise.

- [ ] **Step 4: Verify focused tests and the type check, then commit.**

Run:

```text
git commit -m "fix: normalize paginated API responses" \
  -m "Convert nullable continuation tokens and numeric-string totals before they reach portal pagination state."
```

### Task 7: Complete nullable chat and account consumers

**Files:**
- Create: `src/utils/functions/chatMessageFunctions.ts`
- Create: `src/utils/functions/__tests__/chatMessageFunctions.test.ts`
- Modify: `src/components/Emergency/EmergencyChatBox.vue`
- Modify: `src/components/Profile/UserAccount.vue`
- Modify: `src/components/Emergency/ChatMessagesContainer.vue`
- Modify: `src/utils/functions/stringFunctions.ts`

**Interfaces:**
- Consumes: nullable `Person.rsiHandle` and required `ChatMessage.senderRsiHandle` and `senderClass`.
- Produces: a complete optimistic-client-message factory and null-safe account and mention display behavior.

- [ ] **Step 1: Add a failing optimistic-message test.**

```ts
const chatMessageFunctions = await import(new URL("../chatMessageFunctions.ts", import.meta.url).href)
    .catch(() => undefined);

it("preserves nullable sender metadata for a client optimistic message", () => {
    expect(chatMessageFunctions?.createOptimisticClientMessage({
        emergencyId: "emergency",
        senderId: "client",
        senderRsiHandle: null,
        contents: "help",
        timestamp: "2026-09-15T10:00:00.000Z",
    })).toMatchObject({
        senderRsiHandle: null,
        senderClass: Class.NONE,
        local: true,
        error: false,
    });
});
```

- [ ] **Step 2: Verify the focused test is red.**

Run: `pnpm test src/utils/functions/__tests__/chatMessageFunctions.test.ts`

Expected: a failed dynamic module assertion because the factory does not exist.

- [ ] **Step 3: Implement and use the exact client defaults.**

```ts
senderRsiHandle: userStore.user.rsiHandle,
senderClass: Class.NONE,
```

Use `userStore.user.rsiHandle ?? ""` for editable account input, and do not form RSI mention patterns when the handle is null.

- [ ] **Step 4: Verify focused tests and the type check, then commit.**

Run: `pnpm run type-check`

Run:

```text
git commit -m "fix: handle nullable client message metadata" \
  -m "Complete optimistic chat messages and prevent nullable RSI handles from reaching text inputs or mention rendering."
```

### Task 8: Harden settings response handling and complete the audit

**Files:**
- Modify: `src/utils/settingsUtils.ts`
- Modify: `src/utils/websocket/orgSettingsUpdate.ts`

**Interfaces:**
- Consumes: `ApiResponse<PublicOrgSettings>`.
- Produces: only successful, populated settings responses enter the portal state.

- [ ] **Step 1: Record the API response boundary.**

Search: `rg -n '\\bapi\\.' src`

Expected: every direct API call either checks `success` and `data` or is covered by this task.

- [ ] **Step 2: Reuse `requireResponseData` to reject unsuccessful or empty public-settings responses before assignment.**

Use the tested response adapter:

```ts
logicStore.medrunnerSettings = requireResponseData(response);
```

- [ ] **Step 3: Run final verification and commit.**

Run: `pnpm test`

Run: `pnpm run type-check`

Run: `pnpm run build`

Run: `rg -n --glob '!node_modules/**' -e '\\b(Location|subsystem|tertiaryLocation)\\b' src`

Run:

```text
git commit -m "fix: validate public settings responses" \
  -m "Prevent failed API responses without settings data from silently replacing portal configuration."
```
