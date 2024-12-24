import type { OrgSettings, Person } from "@medrunner/api-client";
import { HubConnectionState } from "@microsoft/signalr";

import { i18n } from "@/i18n";
import { useLogicStore } from "@/stores/logicStore.ts";
import { useUserStore } from "@/stores/userStore";
import { type SyncedSettings, WSState } from "@/types.ts";
import { ws } from "@/utils/medrunnerClient";
import {
    initializeAnalytics,
    initializeMedrunnerSettings,
    initializeSettingDarkMode,
    initializeSettingDebugLogger,
    initializeSettingDiscordLinks,
    initializeSettingLanguage,
    initializeSettingNotifications,
    migrateSyncedSettings,
} from "@/utils/settingsUtils";
import { orgSettingsUpdate } from "@/utils/websocket/orgSettingsUpdate.ts";
import { personUpdate } from "@/utils/websocket/personUpdate.ts";

export async function initializeApp(apiConnected: boolean): Promise<void> {
    const userStore = useUserStore();
    const logicStore = useLogicStore();
    const { availableLocales, locale } = i18n.global;

    initializeSettingDarkMode();
    initializeSettingDiscordLinks();
    initializeSettingDebugLogger();

    if (apiConnected) {
        try {
            userStore.user = await userStore.fetchUser();
            userStore.isAuthenticated = true;
            if (userStore.user.clientPortalPreferencesBlob)
                userStore.syncedSettings = JSON.parse(userStore.user.clientPortalPreferencesBlob) as SyncedSettings;
        } catch (error: any) {
            if (error.statusCode === 403) localStorage.removeItem("refreshToken");
            else return;
        }

        try {
            const blockCheck = await userStore.fetchUserBlocklistStatus();
            if (blockCheck.blocked) userStore.isBlocked = true;
        } catch (_e) {
            return;
        }
    }

    if (apiConnected) {
        await migrateSyncedSettings();
        await initializeMedrunnerSettings();

        locale.value = initializeSettingLanguage(availableLocales);
        initializeSettingNotifications();
        initializeAnalytics();
    }

    if (ws && ws.state === HubConnectionState.Connected) {
        ws.on("PersonUpdate", (newUser: Person) => {
            personUpdate(newUser);
        });

        ws.on("OrgSettingsUpdate", (updatedOrgSettings: OrgSettings) => {
            orgSettingsUpdate(updatedOrgSettings);
        });

        ws.onreconnected(async () => {
            logicStore.currentWSState = WSState.HEALTHY;

            userStore.user = await userStore.fetchUser();
            if (userStore.user.clientPortalPreferencesBlob)
                userStore.syncedSettings = JSON.parse(userStore.user.clientPortalPreferencesBlob) as SyncedSettings;
        });

        ws.onreconnecting(() => {
            logicStore.currentWSState = WSState.RECONNECTING;
        });

        ws.onclose(() => {
            logicStore.currentWSState = WSState.DISCONNECTED;
        });
    }
}
