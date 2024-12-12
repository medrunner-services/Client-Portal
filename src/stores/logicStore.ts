import { CancellationReason, CodeType, MissionStatus } from "@medrunner/api-client";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { i18n } from "@/i18n";

export const useLogicStore = defineStore("logic", () => {
    const { t, locale } = i18n.global;
    const isRouterLoading = ref(false);
    const isNotificationGranted = ref(false);
    const darkMode = ref(false);
    const isDiscordOpenWeb = ref(false);
    const isDebugLoggerEnabled = ref(false);

    const isLoginAnimationAllowed = ref(
        localStorage.getItem("loginAnimation")
            ? localStorage.getItem("loginAnimation") === "true"
            : !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    const loginAnimationSpeed = ref(parseInt(localStorage.getItem("loginAnimationSpeed") ?? "1"));
    const loginAnimationStarSize = ref(parseInt(localStorage.getItem("loginAnimationStarSize") ?? "2"));
    const loginAnimationGlowSize = ref(parseInt(localStorage.getItem("loginAnimationGlowSize") ?? "2"));

    const medrunnerLogoUrl = computed(() => {
        if (import.meta.env.MODE === "development" || import.meta.env.MODE === "staging") {
            return "/images/medrunner-logo-dev.svg";
        } else {
            return "/images/medrunner-logo-stable.svg";
        }
    });

    const userDevice = computed(() => {
        if (navigator.userAgent.includes("Android")) {
            return "android";
        } else if (navigator.userAgent.includes("iPhone")) {
            return "iphone";
        } else if (navigator.userAgent.includes("iPad")) {
            return "ipad";
        } else if (navigator.userAgent.includes("Windows")) {
            return "windows";
        } else if (navigator.userAgent.includes("Macintosh")) {
            return "macintosh";
        } else return "unknown";
    });

    const discordBaseUrl = computed(() => {
        if (!isDiscordOpenWeb.value) {
            if (userDevice.value === "android") {
                return "https://";
            } else {
                return "discord://";
            }
        } else return "https://";
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
            case "es-MX":
                return "Español (México)";
            case "da-DK":
                return "Dansk";
            case "zh-TW":
                return "繁体中文";
            case "nl-NL":
                return "Nederlands";
            case "pt-BR":
                return "Português (Brasil)";
            case "ru-RU":
                return "Русский";
            case "zh-CN":
                return "简体中文";
            case "no-NO":
                return "Norsk";
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

    function getCodeTypeString(type: CodeType): string {
        switch (type) {
            case CodeType.CitizenCon2954:
                return "CitizenCon 2954";

            default:
                return t("history_unknown");
        }
    }

    function timestampToHours(timestamp: number | string): string {
        const now = new Date();
        const date = new Date(timestamp);

        if (now.getFullYear() === date.getFullYear()) {
            if (now.getMonth() === date.getMonth() && now.getDate() === date.getDate()) {
                return date.toLocaleTimeString(locale.value, {
                    hour: "2-digit",
                    minute: "2-digit",
                });
            } else {
                return date
                    .toLocaleDateString(locale.value, {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    .replace(",", "");
            }
        } else {
            return date
                .toLocaleDateString(locale.value, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                })
                .replace(",", "");
        }
    }

    function timestampToDate(timestamp: number | string): string {
        return new Date(timestamp).toLocaleDateString(locale.value, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    }

    return {
        isRouterLoading,
        isNotificationGranted,
        darkMode,
        isDiscordOpenWeb,
        isDebugLoggerEnabled,
        isLoginAnimationAllowed,
        loginAnimationSpeed,
        loginAnimationStarSize,
        loginAnimationGlowSize,
        medrunnerLogoUrl,
        userDevice,
        discordBaseUrl,
        addTextToClipboard,
        getLanguageString,
        getThreatString,
        getRatingString,
        getCancelReasonString,
        getStatusString,
        getCodeTypeString,
        timestampToHours,
        timestampToDate,
    };
});
