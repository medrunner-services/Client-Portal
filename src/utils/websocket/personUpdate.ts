import { type Person } from "@medrunner/api-client";

import { useUserStore } from "@/stores/userStore";
import type { SyncedSettings } from "@/types.ts";
import { restartWebsocket } from "@/utils/functions/restartWebsocket.ts";

export async function personUpdate(newUser: Person) {
    const userStore = useUserStore();

    if (!userStore.user.rsiHandle && newUser.rsiHandle) {
        await restartWebsocket();
    }

    userStore.user = newUser;
    if (userStore.user.clientPortalPreferencesBlob)
        userStore.syncedSettings = JSON.parse(userStore.user.clientPortalPreferencesBlob) as SyncedSettings;
}
