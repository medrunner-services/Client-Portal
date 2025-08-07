import type { Deployment } from "@medrunner/api-client";
import { HubConnectionState } from "@microsoft/signalr";

import { type SyncedSettings, WSState } from "@/@types/types.ts";
import { i18n } from "@/i18n";
import { useLogicStore } from "@/stores/logicStore.ts";
import { useUserStore } from "@/stores/userStore";
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

            if (userStore.user.clientPortalPreferencesBlob) {
                userStore.syncedSettings = JSON.parse(userStore.user.clientPortalPreferencesBlob) as SyncedSettings;
            }
        } catch (_e: any) {
            return;
        }

        try {
            const blockCheck = await userStore.fetchUserBlocklistStatus();
            if (blockCheck.blocked) userStore.isBlocked = true;
        } catch (error: any) {
            logicStore.errorInitializingApp = errorString(error.statusCode, t("error_appInitialization", { error: "[blockCheck]" }));
        }
    }

    locale.value = initializeSettingLanguage(availableLocales);

    if (apiConnected) {
        try {
            await initializeMedrunnerSettings();

            initializeSettingNotifications();
            initializeAnalytics();
        } catch (error: any) {
            logicStore.errorInitializingApp = errorString(error.statusCode, t("error_appInitialization", { error: "[initializeSettings]" }));
        }
    }

    if (ws && ws.state === HubConnectionState.Connected) {
        ws.on("PersonUpdate", async () => {
            await personUpdate();
        });

        ws.on("OrgSettingsUpdate", async () => {
            await orgSettingsUpdate();
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

        ws.onreconnecting((error) => {
            if (error) {
                logicStore.currentWSState = WSState.RECONNECTING;
            }
        });

        ws.onclose(() => {
            logicStore.currentWSState = WSState.DISCONNECTED;
        });
    } else if (ws && ws.state === HubConnectionState.Disconnected) {
        logicStore.currentWSState = WSState.DISCONNECTED;
    }
}
