import { type Person } from "@medrunner/api-client";
import { HubConnectionState } from "@microsoft/signalr";

import { useLogicStore } from "@/stores/logicStore.ts";
import { useUserStore } from "@/stores/userStore";
import type { SyncedSettings } from "@/types.ts";
import { LocalStorageItems, WSState } from "@/types.ts";
import { ws } from "@/utils/medrunnerClient.ts";

export async function personUpdate(newUser: Person) {
    const userStore = useUserStore();
    const logicStore = useLogicStore();

    if (!userStore.user.rsiHandle && newUser.rsiHandle) {
        await ws.stop();
        localStorage.removeItem(LocalStorageItems.ACCESS_TOKEN_EXPIRATION);
        await ws.start();
        if (ws.state === HubConnectionState.Connected) logicStore.currentWSState = WSState.HEALTHY;
    }

    userStore.user = newUser;
    if (userStore.user.clientPortalPreferencesBlob)
        userStore.syncedSettings = JSON.parse(userStore.user.clientPortalPreferencesBlob) as SyncedSettings;
}
