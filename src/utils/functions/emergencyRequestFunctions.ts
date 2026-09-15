import type { CreateEmergencyRequest, SpaceLocation } from "@medrunner/api-client";

import { getSelectableAlertLocations } from "@/utils/functions/locationFunctions.ts";

/** Raw form values used to construct a current emergency request. */
export interface EmergencyRequestInput {
    locationId: string;
    threatLevel: string;
    rsiHandle: string;
}

/**
 * Submits the exact public request contract through the caller-provided API action.
 *
 * The current location tree is accepted at this boundary so submission eligibility
 * can be decided from the latest settings rather than from rendered option state.
 */
export async function submitEmergencyRequest<T>(
    locations: SpaceLocation[],
    input: EmergencyRequestInput,
    createEmergency: (request: CreateEmergencyRequest) => Promise<T>,
): Promise<T | undefined> {
    const isLocationCurrentlySelectable = getSelectableAlertLocations(locations)
        .some(option => option.id === input.locationId);

    if (!isLocationCurrentlySelectable) {
        return undefined;
    }

    const payload: CreateEmergencyRequest = {
        locationId: input.locationId,
        threatLevel: Number.parseInt(input.threatLevel),
        rsiHandle: input.rsiHandle || null,
    };

    return createEmergency(payload);
}
