import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";
import { MessageNotification } from "@/types";

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

export function initializeSettingNotifications() {
    const logicStore = useLogicStore();
    const userStore = useUserStore();

    if (userStore.isAuthenticated) {
        const defaultNotificationSetting =
            "globalNotifications" in userStore.user.clientPortalPreferences
                ? (userStore.user.clientPortalPreferences.globalNotifications as boolean)
                : null;

        if ("Notification" in window && Notification.permission === "granted" && defaultNotificationSetting !== false) {
            logicStore.isNotificationGranted = true;
        }

        logicStore.emergencyUpdateNotification =
            "emergencyUpdateNotification" in userStore.user.clientPortalPreferences
                ? (userStore.user.clientPortalPreferences.emergencyUpdateNotification as boolean)
                : true;
        logicStore.customSoundNotification =
            "customSoundNotification" in userStore.user.clientPortalPreferences
                ? (userStore.user.clientPortalPreferences.customSoundNotification as boolean)
                : true;
        logicStore.chatMessageNotification =
            "chatMessageNotification" in userStore.user.clientPortalPreferences
                ? (userStore.user.clientPortalPreferences.chatMessageNotification as MessageNotification)
                : MessageNotification.ALL;
    }
}

export function askNotificationPermission() {
    const logicStore = useLogicStore();
    const userStore = useUserStore();

    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                try {
                    userStore.setSettings({ globalNotifications: true }).then(() => {
                        logicStore.isNotificationGranted = true;
                    });
                } catch (e) {
                    logicStore.isNotificationGranted = false;
                }
            }
        });
    }
}

export function initializeSettingAnalytics() {
    const logicStore = useLogicStore();
    const userStore = useUserStore();

    if (userStore.isAuthenticated) {
        const defaultAnalyticsSetting =
            "globalAnalytics" in userStore.user.clientPortalPreferences ? (userStore.user.clientPortalPreferences.globalAnalytics as boolean) : true;

        if (!defaultAnalyticsSetting) {
            logicStore.isAnalyticsAllowed = false;
        }
    }
}

export function initializeSettingLanguage(availableLocales: string[]): string {
    const userStore = useUserStore();
    let userLanguage: string | undefined;

    if (userStore.isAuthenticated) {
        userLanguage =
            "selectedLanguage" in userStore.user.clientPortalPreferences
                ? (userStore.user.clientPortalPreferences.selectedLanguage as string)
                : undefined;
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
