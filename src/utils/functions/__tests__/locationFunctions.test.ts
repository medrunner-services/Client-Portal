import type { SpaceLocation } from "@medrunner/api-client";
import { SpaceLocationType } from "@medrunner/api-client";
import { expect, it } from "vitest";
import { findLocationPath, getEmergencyLocationNames, getSelectableAlertLocations } from "../locationFunctions.ts";

function location(id: string, name: string, children: SpaceLocation[] = [], overrides: Partial<SpaceLocation> = {}): SpaceLocation {
    return {
        id,
        name,
        type: SpaceLocationType.MOON,
        children,
        enabled: true,
        visibleForAlertSubmissions: true,
        alertLocation: true,
        characteristics: [],
        ...overrides,
    };
}

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
    expect(getSelectableAlertLocations(locations)).toEqual([
        { id: "daymar", label: "Stanton › Crusader › Daymar" },
    ]);
});

it("provides the selected option's stable ID for an emergency request", () => {
    const [selectedOption] = getSelectableAlertLocations(locations);

    expect(selectedOption?.label).toContain("Daymar");
    expect(selectedOption?.id).toBe("daymar");
    expect(selectedOption?.id).not.toBe("Daymar");
});

it("finds an inactive historical location without applying submission filters", () => {
    expect(findLocationPath(locations, "retired-moon")?.map(location => location.name))
        .toEqual(["Stanton", "Crusader", "Retired Moon"]);
});

it("uses the API cascade even when settings are unavailable or have changed", () => {
    const emergency = {
        locationId: "daymar",
        locationTreeNames: ["Stanton", "Crusader", "Yela"],
        system: { name: "Stanton" },
    };

    expect(getEmergencyLocationNames(emergency, [])).toEqual(["Stanton", "Crusader", "Yela"]);
    expect(getEmergencyLocationNames(emergency, locations)).toEqual(["Stanton", "Crusader", "Yela"]);
});

it("resolves older emergencies from settings, including disabled historical locations", () => {
    expect(getEmergencyLocationNames({ locationId: "retired-moon", locationTreeNames: [] }, locations))
        .toEqual(["Stanton", "Crusader", "Retired Moon"]);
});

it("renders only the system name when an ID is missing or no longer configured", () => {
    expect(getEmergencyLocationNames({ locationId: "removed", system: { name: "Stanton" } }, locations))
        .toEqual(["Stanton"]);
    expect(getEmergencyLocationNames({ system: "Pyro" }, [])).toEqual(["Pyro"]);
});

it("ignores blank recorded names and returns no label for unavailable location data", () => {
    expect(getEmergencyLocationNames({ locationTreeNames: [" ", " Stanton ", "", "Yela"] }, []))
        .toEqual(["Stanton", "Yela"]);
    expect(getEmergencyLocationNames({ locationTreeNames: [""], system: null }, [])).toEqual([]);
    expect(getEmergencyLocationNames({ system: { name: " " } }, [])).toEqual([]);
    expect(getEmergencyLocationNames({}, [])).toEqual([]);
});
