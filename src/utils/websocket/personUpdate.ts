import { type Person } from "@medrunner/api-client";

import type { SyncedSettings } from "@/@types/types.ts";
import { useUserStore } from "@/stores/userStore";
import { restartWebsocket } from "@/utils/functions/handleWebsocket.ts";

export async function personUpdate(newUser: Person) {
    const userStore = useUserStore();

    if (!userStore.user.rsiHandle && newUser.rsiHandle) {
        await restartWebsocket();
    }

    userStore.user = newUser;
    if (userStore.user.clientPortalPreferencesBlob)
        userStore.syncedSettings = JSON.parse(userStore.user.clientPortalPreferencesBlob) as SyncedSettings;
}
