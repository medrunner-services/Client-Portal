# Portal API Client Contract Migration Design

## Goal

Migrate the client portal from `@medrunner/api-client` 0.7.0-beta.19 to beta.25 without retaining obsolete request or response assumptions.

## Scope

The portal must submit an alert using the current `CreateEmergencyRequest` shape, render an emergency from `locationId`, accept the current nullable and union response values, and build fully typed optimistic chat messages.

The API must reject a root-level location selection while its persisted emergency model still requires a subsystem, so configuration cannot pass validation and subsequently fail during location extraction.

## Design

### Location Tree

Add a pure portal location utility with two responsibilities.

`getSelectableAlertLocations` traverses `SpaceLocation[]`, prunes disabled branches, and emits a location option only when that node is enabled, visible for alert submissions, and marked as an alert location.

Each option contains the location ID and a breadcrumb label built from the full path.

`findLocationPath` traverses the complete tree without filtering current visibility or enablement, allowing historical emergencies to remain readable after configuration changes.

The alert form presents the selectable options in one location selector and submits the selected option's ID.

Tracking and history resolve `Emergency.locationId` through the same utility and fall back to `Emergency.system` when the ID is absent or no longer exists.

### Alert Requests

The form will send:

```ts
{
    locationId: selectedLocationId,
    threatLevel,
    rsiHandle: inputRSIHandle || null,
}
```

This removes the discontinued inline `Location` type and ensures anonymous alerts satisfy the required-nullable client contract.

### API Root Location Safety

The current API validation accepts a root location when it has the three alert flags, while `ParseLocationId` unconditionally reads the second path segment to populate the legacy required `Subsystem` database field.

Until the emergency persistence model is fully refactored around a location path, the API will treat only locations below the root as valid alert selections.

The portal utility will apply the same depth rule, avoiding a client/server mismatch and preventing a runtime exception.

### Response Normalization

Portal boundaries normalize `paginationToken: string | null` to the existing optional-token convention and parse `totalCount: number | string` to a finite non-negative number before the value reaches UI state.

The optimistic client chat message includes the current user's nullable RSI handle and `Class.NONE`, matching the API's client-message representation.

Text inputs use an empty string for nullable RSI handles, while display and mention code treats a missing handle as absent rather than rendering the word `null`.

## Commit Boundaries

1. `chore(deps)` commits the existing API-client package and lockfile update without unrelated staged IDE metadata.
2. `test` and `feat` commits introduce the tested location-tree utility and alert request migration.
3. `fix` commits migrate location display, API root validation, pagination normalization, and nullable optimistic-message handling independently.

## Verification

Each pure utility behavior is covered by a red-green unit test.

Each commit runs its focused test plus the TypeScript check.

The final verification runs the portal test suite, `pnpm run type-check`, `pnpm run build`, and a complete search for removed API members and unhandled current-contract unions.
