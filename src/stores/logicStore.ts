import { CancellationReason, MissionStatus } from "@medrunner-services/api-client";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

export const useLogicStore = defineStore("logic", () => {
    const { locale, t } = useI18n();
    const isNotificationGranted = ref(
        "Notification" in window ? Notification.permission === "granted" && localStorage.getItem("notificationActivated") === "true" : false,
    );
    const darkMode = ref(localStorage.getItem("darkMode") === "true");
    const isAnalyticsAllowed = ref(localStorage.getItem("analyticsActivated") === "true" || localStorage.getItem("analyticsActivated") === null);

    const isLoginAnimationAllowed = ref(
        localStorage.getItem("loginAnimation")
            ? localStorage.getItem("loginAnimation") === "true"
            : !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    const loginAnimationSpeed = ref(parseInt(localStorage.getItem("loginAnimationSpeed") ?? "1"));
    const loginAnimationStarSize = ref(parseInt(localStorage.getItem("loginAnimationStarSize") ?? "2"));
    const loginAnimationGlowSize = ref(parseInt(localStorage.getItem("loginAnimationGlowSize") ?? "2"));

    const userDevice = computed(() => {
        if (navigator.userAgent.includes("Android")) {
            return "android";
        } else if (navigator.userAgent.includes("iPhone")) {
            return "iphone";
        } else if (navigator.userAgent.includes("iPad")) {
            return "ipad";
        } else if (navigator.userAgent.includes("Windows")) {
            return "windows";
        } else {
            return "";
        }
    });

    const userBrowser = computed(() => {
        if (navigator.userAgent.includes("Firefox")) {
            return "firefox";
        } else if (navigator.userAgent.includes("Chrome")) {
            return "chrome";
        } else if (navigator.userAgent.includes("Safari")) {
            return "safari";
        } else {
            return "";
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

    async function addTextToClipboard(text: string): Promise<boolean> {
        await navigator.clipboard.writeText(text);
        return true;
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
                return "Unknown";
        }
    }

    function getThreatString(id: number): string {
        switch (id) {
            case 0:
                return t("history_unknown");
            case 1:
                return t("history_low");
            case 2:
                return t("history_medium");
            case 3:
                return t("history_high");

            default:
                return t("history_unknown");
        }
    }

    function getRatingString(rating: number): string {
        switch (rating) {
            case 1:
                return t("history_good");
            case 2:
                return t("history_bad");

            default:
                return t("history_noRating");
        }
    }

    function getCancelReasonString(reason: CancellationReason): string {
        switch (reason) {
            case CancellationReason.RESCUED:
                return t("history_rescued");
            case CancellationReason.SUCCUMBED_TO_WOUNDS:
                return t("history_bledOut");
            case CancellationReason.SERVER_ERROR:
                return t("history_serverIssue");
            case CancellationReason.RESPAWNED:
                return t("history_respawned");
            case CancellationReason.OTHER:
                return t("history_other");

            default:
                return t("history_unknown");
        }
    }

    function getStatusString(id: MissionStatus): string {
        switch (id) {
            case MissionStatus.CREATED:
                return t("history_created");
            case MissionStatus.RECEIVED:
                return t("history_received");
            case MissionStatus.IN_PROGRESS:
                return t("history_inProgress");
            case MissionStatus.SUCCESS:
                return t("history_completed");
            case MissionStatus.FAILED:
                return t("history_failed");
            case MissionStatus.NO_CONTACT:
                return t("history_noContact");
            case MissionStatus.CANCELED:
                return t("history_canceled");
            case MissionStatus.REFUSED:
                return t("history_refused");
            case MissionStatus.ABORTED:
                return t("history_aborted");
            case MissionStatus.SERVER_ERROR:
                return t("history_serverError");
            default:
                return t("tracking_unknown");
        }
    }

    function timestampToHours(timestamp: number | string): string {
        return new Date(timestamp).toLocaleTimeString(locale.value, {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function timestampToDate(timestamp: number | string): string {
        return new Date(timestamp).toLocaleDateString(locale.value, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    }

    function resetAnimationSettings(): void {
        loginAnimationSpeed.value = 1;
        loginAnimationStarSize.value = 2;
        loginAnimationGlowSize.value = 2;

        localStorage.setItem("loginAnimationSpeed", "1");
        localStorage.setItem("loginAnimationStarSize", "2");
        localStorage.setItem("loginAnimationGlowSize", "2");
    }

    function updateLoginAnimation(): void {
        if (isLoginAnimationAllowed.value) {
            isLoginAnimationAllowed.value = false;
            localStorage.setItem("loginAnimation", "false");
        } else {
            isLoginAnimationAllowed.value = true;
            localStorage.setItem("loginAnimation", "true");
        }
    }

    function saveAnimationSetting(setting: string, value: number): void {
        localStorage.setItem(setting, value.toString());
    }

    return {
        isNotificationGranted,
        darkMode,
        isAnalyticsAllowed,
        isLoginAnimationAllowed,
        loginAnimationSpeed,
        loginAnimationStarSize,
        loginAnimationGlowSize,
        userDevice,
        userBrowser,
        discordBaseUrl,
        medrunnerLogoUrl,
        addTextToClipboard,
        getLanguageString,
        getThreatString,
        getRatingString,
        getCancelReasonString,
        getStatusString,
        timestampToHours,
        timestampToDate,
        resetAnimationSettings,
        updateLoginAnimation,
        saveAnimationSetting,
    };
});
