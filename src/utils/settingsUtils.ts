import { i18n } from "@/i18n";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";
import { usePostHog } from "@/usePostHog";
import { api } from "@/utils/medrunnerClient";

export function initializeSettingDarkMode() {
    const logicStore = useLogicStore();

    if (
        (window.matchMedia("(prefers-color-scheme: dark)").matches && localStorage.getItem("darkMode") == null) ||
        localStorage.getItem("darkMode") === "true"
    ) {
        document.documentElement.classList.add("dark");
        logicStore.darkMode = true;
    }
}

export function initializeSettingDiscordLinks() {
    const logicStore = useLogicStore();

    if (localStorage.getItem("isDiscordOpenWeb") === "true") {
        logicStore.isDiscordOpenWeb = true;
    }
}

export function initializeSettingDebugLogger() {
    const logicStore = useLogicStore();

    if (localStorage.getItem("isDebugLoggerEnabled") === "true") {
        logicStore.isDebugLoggerEnabled = true;
    }
}

export function initializeSettingNotifications() {
    const logicStore = useLogicStore();
    const userStore = useUserStore();

    if (userStore.isAuthenticated) {
        if ("Notification" in window && Notification.permission === "granted" && userStore.syncedSettings.globalNotifications !== false) {
            logicStore.isNotificationGranted = true;
        } else if (
            userStore.isAuthenticated &&
            "Notification" in window &&
            Notification.permission === "default" &&
            userStore.syncedSettings.globalNotifications
        )
            logicStore.showNotificationPermissionModal = true;
    }
}

export function initializeSettingLanguage(availableLocales: string[]): string {
    const userStore = useUserStore();
    let userLanguage: string | undefined;

    if (userStore.isAuthenticated) {
        userLanguage = userStore.syncedSettings.selectedLanguage ? userStore.syncedSettings.selectedLanguage : undefined;
    }

    const availableMainLocales = availableLocales.map((locale) => locale.split("-")[0]);

    if (userLanguage) {
        return userLanguage;
    } else if (availableLocales.includes(navigator.language)) {
        return navigator.language;
    } else if (availableMainLocales.includes(navigator.language.split("-")[0])) {
        const fallbackLocal = availableLocales.find((item) => item.indexOf(navigator.language.split("-")[0]) === 0);
        if (fallbackLocal) {
            return fallbackLocal;
        } else {
            return "en-US";
        }
    } else {
        return "en-US";
    }
}

export async function migrateSyncedSettings() {
    const userStore = useUserStore();

    if (
        userStore.isAuthenticated &&
        userStore.user.clientPortalPreferences &&
        Object.keys(userStore.user.clientPortalPreferences).length > 0 &&
        !userStore.user.clientPortalPreferencesBlob
    ) {
        try {
            await api.client.setUserSettings(JSON.stringify(userStore.user.clientPortalPreferences));
        } catch (_e) {
            return;
        }
    }
}

export function initializeAnalytics() {
    const userStore = useUserStore();
    const { locale } = i18n.global;
    const { posthog } = usePostHog();

    if (userStore.isAuthenticated && userStore.syncedSettings.globalAnalytics) {
        posthog.opt_in_capturing();

        posthog.identify(userStore.user.id, {
            discordId: userStore.user.discordId,
            rsiHandle: userStore.user.rsiHandle ?? "",
            personType: userStore.user.personType,
            active: userStore.user.active,
            language: locale.value,
            debugModeEnabled: localStorage.getItem("isDebugLoggerEnabled") === "true",
        });
    }
}

export async function initializeMedrunnerSettings() {
    const logicStore = useLogicStore();
    const userStore = useUserStore();

    if (userStore.isAuthenticated) {
        try {
            const response = await api.orgSettings.getPublicSettings();
            logicStore.medrunnerSettings = response.data;
        } catch (_e) {
            return;
        }
    }
}

export function initializeTabChecker() {
    const logicStore = useLogicStore();

    const tabChannel = new BroadcastChannel("tab-check");

    tabChannel.postMessage(`checkTab`);

    tabChannel.onmessage = (event) => {
        if (event.data === "checkTab") {
            tabChannel.postMessage("exists");
        } else if (event.data === "exists") {
            logicStore.isFirstInstance = false;
        }
    };
}
