import type { Deployment, OrgSettings, Person } from "@medrunner/api-client";
import { HubConnectionState } from "@microsoft/signalr";

import { i18n } from "@/i18n";
import { useLogicStore } from "@/stores/logicStore.ts";
import { useUserStore } from "@/stores/userStore";
import { type SyncedSettings, WSState } from "@/types.ts";
import { errorString } from "@/utils/functions/stringFunctions.ts";
import { ws } from "@/utils/medrunnerClient";
import {
    initializeAnalytics,
    initializeMedrunnerSettings,
    initializeSettingDarkMode,
    initializeSettingDebugLogger,
    initializeSettingDiscordLinks,
    initializeSettingLanguage,
    initializeSettingNotifications,
    initializeTabChecker,
    migrateSyncedSettings,
} from "@/utils/settingsUtils";
import { deploymentCreate } from "@/utils/websocket/deploymentCreate.ts";
import { orgSettingsUpdate } from "@/utils/websocket/orgSettingsUpdate.ts";
import { personUpdate } from "@/utils/websocket/personUpdate.ts";

export async function initializeApp(apiConnected: boolean): Promise<void> {
    const userStore = useUserStore();
    const logicStore = useLogicStore();
    const { availableLocales, locale, t } = i18n.global;

    initializeTabChecker();
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
            logicStore.errorInitializingApp = errorString(error.statusCode, t("error_appInitialization", { error: "[fetchUser]" }));
            return;
        }

        try {
            const blockCheck = await userStore.fetchUserBlocklistStatus();
            if (blockCheck.blocked) userStore.isBlocked = true;
        } catch (error: any) {
            logicStore.errorInitializingApp = errorString(error.statusCode, t("error_appInitialization", { error: "[blockCheck]" }));
        }
    }

    if (apiConnected) {
        try {
            await migrateSyncedSettings();
            await initializeMedrunnerSettings();

            locale.value = initializeSettingLanguage(availableLocales);
            initializeSettingNotifications();
            initializeAnalytics();
        } catch (error: any) {
            logicStore.errorInitializingApp = errorString(error.statusCode, t("error_appInitialization", { error: "[initializeSettings]" }));
        }
    }

    if (ws && ws.state === HubConnectionState.Connected) {
        ws.on("PersonUpdate", (newUser: Person) => {
            personUpdate(newUser);
        });

        ws.on("OrgSettingsUpdate", (updatedOrgSettings: OrgSettings) => {
            orgSettingsUpdate(updatedOrgSettings);
        });

        ws.on("DeploymentCreate", (newDeployment: Deployment) => {
            deploymentCreate(newDeployment);
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
