import { type Person } from "@medrunner/api-client";

import { useUserStore } from "@/stores/userStore";
import type { SyncedSettings } from "@/types.ts";

export function personUpdate(newUser: Person) {
    const userStore = useUserStore();

    userStore.user = newUser;
    if (userStore.user.clientPortalPreferencesBlob)
        userStore.syncedSettings = JSON.parse(userStore.user.clientPortalPreferencesBlob) as SyncedSettings;
}
