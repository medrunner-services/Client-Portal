import type { OrgSettings } from "@medrunner/api-client";

import { useLogicStore } from "@/stores/logicStore.ts";

export async function orgSettingsUpdate(updatedOrgSettings: OrgSettings) {
    const logicStore = useLogicStore();

    logicStore.medrunnerSettings = updatedOrgSettings.public;
}
