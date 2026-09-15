import type { CreateEmergencyRequest, SpaceLocation } from "@medrunner/api-client";
import { SpaceLocationType, ThreatLevel } from "@medrunner/api-client";
import { expect, it, vi } from "vitest";

import { getSelectableAlertLocations } from "@/utils/functions/locationFunctions.ts";

const emergencyRequestFunctions = await import(new URL("../emergencyRequestFunctions.ts", import.meta.url).href)
    .catch(() => undefined);

function location(
    id: string,
    name: string,
    children: SpaceLocation[] = [],
    overrides: Partial<SpaceLocation> = {},
): SpaceLocation {
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

function configuredLocations(daymarOverrides: Partial<SpaceLocation> = {}): SpaceLocation[] {
    return [
        location("stanton", "Stanton", [
            location("crusader", "Crusader", [
                location("daymar", "Daymar", [], daymarOverrides),
            ], {
                alertLocation: false,
                visibleForAlertSubmissions: false,
            }),
        ], { type: SpaceLocationType.SYSTEM }),
    ];
}

it("exports the emergency request submission boundary", () => {
    expect(emergencyRequestFunctions).toBeDefined();
});

it("submits the exact request when the selected ID remains eligible", async () => {
    const createEmergency = vi.fn(async (request: CreateEmergencyRequest) => request);

    await emergencyRequestFunctions?.submitEmergencyRequest(
        configuredLocations(),
        {
            locationId: "daymar",
            threatLevel: ThreatLevel.MEDIUM.toString(),
            rsiHandle: "",
        },
        createEmergency,
    );

    expect(createEmergency).toHaveBeenCalledExactlyOnceWith({
        locationId: "daymar",
        threatLevel: ThreatLevel.MEDIUM,
        rsiHandle: null,
    });
});

it("does not submit without the required location selection", async () => {
    const createEmergency = vi.fn(async (request: CreateEmergencyRequest) => request);

    const result = await emergencyRequestFunctions?.submitEmergencyRequest(
        configuredLocations(),
        {
            locationId: "",
            threatLevel: ThreatLevel.LOW.toString(),
            rsiHandle: "RescueMe",
        },
        createEmergency,
    );

    expect(result).toBeUndefined();
    expect(createEmergency).not.toHaveBeenCalled();
});

it("does not submit an ID removed by a settings refresh after selection", async () => {
    const [selectedOption] = getSelectableAlertLocations(configuredLocations());
    const refreshedLocations = configuredLocations({ visibleForAlertSubmissions: false });
    const createEmergency = vi.fn(async (request: CreateEmergencyRequest) => request);

    const result = await emergencyRequestFunctions?.submitEmergencyRequest(
        refreshedLocations,
        {
            locationId: selectedOption.id,
            threatLevel: ThreatLevel.UNKNOWN.toString(),
            rsiHandle: "",
        },
        createEmergency,
    );

    expect(result).toBeUndefined();
    expect(createEmergency).not.toHaveBeenCalled();
});
