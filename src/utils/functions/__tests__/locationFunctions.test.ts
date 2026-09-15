import { SpaceLocationType, type SpaceLocation } from "@medrunner/api-client";
import { expect, it } from "vitest";

const locationFunctions = await import(new URL("../locationFunctions.ts", import.meta.url).href)
    .catch(() => undefined);

const location = (
    id: string,
    name: string,
    children: SpaceLocation[] = [],
    overrides: Partial<SpaceLocation> = {},
): SpaceLocation => ({
    id,
    name,
    type: SpaceLocationType.MOON,
    children,
    enabled: true,
    visibleForAlertSubmissions: true,
    alertLocation: true,
    characteristics: [],
    ...overrides,
});

const locations: SpaceLocation[] = [
    location("stanton", "Stanton", [
        location("crusader", "Crusader", [
            location("daymar", "Daymar"),
            location("retired-moon", "Retired Moon", [], { enabled: false }),
            location("hidden-moon", "Hidden Moon", [], { visibleForAlertSubmissions: false }),
            location("non-alert-moon", "Non-alert Moon", [], { alertLocation: false }),
        ], {
            alertLocation: false,
            visibleForAlertSubmissions: false,
        }),
        location("disabled-planet", "Disabled Planet", [
            location("disabled-branch-moon", "Disabled Branch Moon"),
        ], { enabled: false }),
    ], { type: SpaceLocationType.SYSTEM }),
];

it("returns only enabled non-root locations that are visible and serviceable", () => {
    expect(locationFunctions?.getSelectableAlertLocations(locations)).toEqual([
        { id: "daymar", label: "Stanton › Crusader › Daymar" },
    ]);
});

it("finds an inactive historical location without applying submission filters", () => {
    expect(locationFunctions?.findLocationPath(locations, "retired-moon")?.map(location => location.name))
        .toEqual(["Stanton", "Crusader", "Retired Moon"]);
});
