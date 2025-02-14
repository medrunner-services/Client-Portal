import { CancellationReason, CodeType, MissionStatus, ResponseRating, ThreatLevel } from "@medrunner/api-client";

import { i18n } from "@/i18n.ts";

export function getLanguageString(languageLocal: string): string {
    const { t } = i18n.global;
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
            return t("history_unknown");
    }
}

export function getThreatString(level: ThreatLevel): string {
    const { t } = i18n.global;
    switch (level) {
        case ThreatLevel.LOW:
            return t("history_low");
        case ThreatLevel.MEDIUM:
            return t("history_medium");
        case ThreatLevel.HIGH:
            return t("history_high");

        default:
            return t("history_unknown");
    }
}

export function getRatingString(rating: ResponseRating): string {
    const { t } = i18n.global;
    switch (rating) {
        case ResponseRating.GOOD:
            return t("history_good");
        case ResponseRating.BAD:
            return t("history_bad");

        default:
            return t("history_noRating");
    }
}

export function getCancelReasonString(reason: CancellationReason): string {
    const { t } = i18n.global;
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

export function getStatusString(id: MissionStatus): string {
    const { t } = i18n.global;
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

export function getCodeTypeString(type: CodeType): string {
    const { t } = i18n.global;
    switch (type) {
        case CodeType.CitizenCon2954:
            return "CitizenCon 2954";

        default:
            return t("history_unknown");
    }
}
