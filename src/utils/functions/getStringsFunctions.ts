import {
    CancellationReason,
    CodeType,
    MissionStatus,
    ResponseRating,
    ThreatLevel,
    TokenScope,
} from "@medrunner/api-client";

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
        case CodeType.CITIZEN_CON_2954:
            return "CitizenCon 2954";

        default:
            return t("history_unknown");
    }
}

export function getEmergencyStatusTitle(status: number): string {
    const { t } = i18n.global;
    switch (status) {
        case 1:
            return t("tracking_messageReceived");
        case 2:
            return t("tracking_helpOnTheWay");
        case 3:
            return t("tracking_operationSuccessful");
        case 4:
            return t("tracking_operationFailed");
        case 5:
            return t("tracking_operationNoContact");
        case 6:
            return t("tracking_operationCanceled");
        case 7:
            return t("tracking_operationRefused");
        case 8:
            return t("tracking_operationAborted");
        case 9:
            return t("tracking_serverError");
        default:
            return "Unknown";
    }
}

export function getEmergencyStatusSubtitle(status: number): string {
    const { t } = i18n.global;
    switch (status) {
        case 1:
            return t("tracking_statusTextReceived");
        case 2:
            return t("tracking_statusTextOnTheirWay");
        case 3:
            return t("tracking_statusTextSuccess");
        case 4:
            return t("tracking_statusTextFailed");
        case 5:
            return t("tracking_statusTextNoContact");
        case 6:
            return t("tracking_statusTextConfirmedCanceled");
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

export function getTokenScopeString(scope: TokenScope): string {
    const { t } = i18n.global;
    switch (scope) {
        case TokenScope.CLIENT_READ:
            return "Client Read";
        case TokenScope.CLIENT_WRITE:
            return "Client Write";
        case TokenScope.CLIENT_PROFILE_READ:
            return "Client Profile Read";
        case TokenScope.CLIENT_PROFILE_WRITE:
            return "Client Profile Write";
        case TokenScope.CLIENT_ORGSETTINGS_READ:
            return "Public Organization Settings Read";
        case TokenScope.STAFF_READ:
            return "Staff Read";
        case TokenScope.STAFF_WRITE:
            return "Staff Write";
        case TokenScope.STAFF_PROFILE_READ:
            return "Staff Profile Read";
        case TokenScope.STAFF_PROFILE_WRITE:
            return "Staff Profile Write";
        case TokenScope.STAFF_ORGSETTINGS_READ:
            return "Staff Organization Settings And Statistics Read";

        default:
            return t("history_unknown");
    }
}
