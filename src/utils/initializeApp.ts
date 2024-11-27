import type { Person } from "@medrunner/api-client";
import { HubConnectionState } from "@microsoft/signalr";

import { i18n } from "@/i18n";
import { useUserStore } from "@/stores/userStore";
import { ws } from "@/utils/medrunnerClient";
import {
    askNotificationPermission,
    initializeSettingAnalytics,
    initializeSettingDarkMode,
    initializeSettingDebugLogger,
    initializeSettingDiscordLinks,
    initializeSettingLanguage,
    initializeSettingNotifications,
} from "@/utils/settingsUtils";
import { personUpdate } from "@/utils/websocket/personUpdate.ts";

export async function initializeApp(apiConnected: boolean): Promise<void> {
    const userStore = useUserStore();
    const { availableLocales, locale } = i18n.global;

    initializeSettingDarkMode();
    initializeSettingDiscordLinks();
    initializeSettingDebugLogger();

    if (apiConnected) {
        try {
            userStore.user = await userStore.fetchUser();
            userStore.isAuthenticated = true;
        } catch (error: any) {
            if (error.statusCode === 403) localStorage.removeItem("refreshToken");
            else return;
        }
    }

    locale.value = initializeSettingLanguage(availableLocales);
    initializeSettingNotifications();
    initializeSettingAnalytics();

    askNotificationPermission();

    if (ws && ws.state === HubConnectionState.Connected) {
        ws.on("PersonUpdate", (newUser: Person) => {
            personUpdate(newUser);
        });

        ws.onreconnected(async () => {
            userStore.user = await userStore.fetchUser();
        });
    }
}
