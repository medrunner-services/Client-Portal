import type { SpaceLocation } from "@medrunner/api-client";

/** A stable location identifier and its human-readable tree path. */
export interface LocationOption {
    id: string;
    label: string;
}

/** Location data shared by API responses, live events, and older emergencies. */
export interface EmergencyLocation {
    locationId?: string | null;
    locationTreeNames?: string[] | null;
    system?: { name: string } | string | null;
}

/** Prefer the recorded cascade so historical locations survive settings changes. */
export function getEmergencyLocationNames(
    emergency: EmergencyLocation,
    locations: SpaceLocation[],
): string[] {
    const recordedNames = emergency.locationTreeNames
        ?.filter(name => typeof name === "string" && name.trim())
        .map(name => name.trim());

    if (recordedNames?.length) {
        return recordedNames;
    }

    const configuredPath = emergency.locationId
        ? findLocationPath(locations, emergency.locationId)
        : undefined;

    if (configuredPath?.length) {
        return configuredPath.map(location => location.name);
    }

    const systemName = typeof emergency.system === "string"
        ? emergency.system
        : emergency.system?.name;

    return systemName?.trim() ? [systemName.trim()] : [];
}

/**
 * Derives locations that the API can accept for a new alert.
 *
 * Disabled nodes prune their complete branch, and root nodes are excluded because
 * emergency persistence requires at least one location beneath the system root.
 */
export function getSelectableAlertLocations(locations: SpaceLocation[]): LocationOption[] {
    const options: LocationOption[] = [];

    const visit = (location: SpaceLocation, path: SpaceLocation[]): void => {
        if (!location.enabled) {
            return;
        }

        const currentPath = [...path, location];

        if (
            currentPath.length >= 2
            && location.visibleForAlertSubmissions
            && location.alertLocation
        ) {
            options.push({
                id: location.id,
                label: currentPath.map(pathLocation => pathLocation.name).join(" › "),
            });
        }

        location.children.forEach(child => visit(child, currentPath));
    };

    locations.forEach(location => visit(location, []));

    return options;
}

/** Finds a location's complete path without applying current submission filters. */
export function findLocationPath(
    locations: SpaceLocation[],
    id: string,
): SpaceLocation[] | undefined {
    const visit = (location: SpaceLocation, path: SpaceLocation[]): SpaceLocation[] | undefined => {
        const currentPath = [...path, location];

        if (location.id === id) {
            return currentPath;
        }

        for (const child of location.children) {
            const foundPath = visit(child, currentPath);

            if (foundPath) {
                return foundPath;
            }
        }

        return undefined;
    };

    for (const location of locations) {
        const foundPath = visit(location, []);

        if (foundPath) {
            return foundPath;
        }
    }

    return undefined;
}
