import type { Person } from "@medrunner/api-client";
import { HubConnectionState } from "@microsoft/signalr";

import { i18n } from "@/i18n";
import { useUserStore } from "@/stores/userStore";
import { ws } from "@/utils/medrunnerClient";
import {
    initializeSettingAnalytics,
    initializeSettingDarkMode,
    initializeSettingDiscordLinks,
    initializeSettingLanguage,
    initializeSettingNotifications,
} from "@/utils/settingsUtils";

export async function initializeApp(): Promise<void> {
    const userStore = useUserStore();
    const { availableLocales, locale } = i18n.global;

    initializeSettingDarkMode();
    initializeSettingDiscordLinks();
    await initializeSettingNotifications();
    initializeSettingAnalytics();
    locale.value = initializeSettingLanguage(availableLocales);

    if (ws && ws.state === HubConnectionState.Connected) {
        ws.on("PersonUpdate", (newUser: Person) => {
            userStore.user = newUser;
        });

        ws.onreconnected(async () => {
            userStore.user = await userStore.fetchUser();
        });
    }
}
