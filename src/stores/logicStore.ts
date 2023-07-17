import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

export const useLogicStore = defineStore("logic", () => {
    const { t } = useI18n();
    const isRouterLoading = ref(false);
    const isNotificationGranted = ref(
        "Notification" in window ? Notification.permission === "granted" && localStorage.getItem("notificationActivated") === "true" : false,
    );
    const darkMode = ref(localStorage.getItem("darkMode") === "true");
    const isAnalyticsAllowed = ref(localStorage.getItem("analyticsActivated") === "true" || localStorage.getItem("analyticsActivated") === null);

    const userDevice = computed(() => {
        if (navigator.userAgent.includes("Android")) {
            return "android";
        } else if (navigator.userAgent.includes("iPhone")) {
            return "iphone";
        } else if (navigator.userAgent.includes("iPad")) {
            return "ipad";
        } else if (navigator.userAgent.includes("Windows")) {
            return "windows";
        }
    });

    const userBrowser = computed(() => {
        if (navigator.userAgent.includes("Firefox")) {
            return "firefox";
        } else if (navigator.userAgent.includes("Chrome")) {
            return "chrome";
        } else if (navigator.userAgent.includes("Safari")) {
            return "safari";
        }
    });

    const discordBaseUrl = computed(() => {
        if (navigator.userAgent.includes("Android")) {
            return "https://";
        } else {
            return "discord://";
        }
    });

    const medrunnerLogoUrl = computed(() => {
        if (import.meta.env.MODE === "development" || import.meta.env.MODE === "staging") {
            return "/images/medrunner-logo-dev.webp";
        } else {
            return "/images/medrunner-logo-beta.webp";
        }
    });

    function getEmergencyStatusTitle(status: number): string {
        switch (status) {
            case 1:
                return "📡 " + t("tracking_messageReceived");
            case 2:
            case 10:
                return "🚑 " + t("tracking_helpOnTheWay");
            case 3:
                return "✅ " + t("tracking_operationSuccessful");
            case 4:
                return "❌ " + t("tracking_operationFailed");
            case 5:
                return "🚫 " + t("tracking_operationNoContact");
            case 6:
                return "🚫 " + t("tracking_operationCanceled");
            case 7:
                return "⛔ " + t("tracking_operationRefused");
            case 8:
                return "↩️ " + t("tracking_operationAborted");
            case 9:
                return "🖥️ " + t("tracking_serverError");
            default:
                return "Unknown";
        }
    }

    function getEmergencyStatusSubtitle(status: number): string {
        switch (status) {
            case 1:
                return t("tracking_statusTextReceived");
            case 2:
            case 10:
                return t("tracking_statusTextOnTheirWay");
            case 3:
                return t("tracking_statusTextSuccess");
            case 4:
                return t("tracking_statusTextFailed");
            case 5:
                return t("tracking_statusTextNoContact");
            case 6:
                return t("tracking_statusTextCanceled");
            case 7:
                return t("tracking_statusTextRefused");
            case 8:
                return t("tracking_statusTextAborted");
            case 9:
                return t("tracking_statusTextServerError");
            default:
                return "Unknown";
        }
    }

    function getLanguageString(languageLocal: string): string {
        switch (languageLocal) {
            case "en-US":
                return "English";
            case "fr-FR":
                return "Français";
            case "de-DE":
                return "Deutsch";
            case "it-IT":
                return "Italiano";
            case "da-DK":
                return "Dansk";
            case "zh-TW":
                return "台湾普通话";
            default:
                return "English";
        }
    }

    return {
        isRouterLoading,
        isNotificationGranted,
        darkMode,
        isAnalyticsAllowed,
        userDevice,
        userBrowser,
        discordBaseUrl,
        medrunnerLogoUrl,
        getEmergencyStatusTitle,
        getEmergencyStatusSubtitle,
        getLanguageString,
    };
});
