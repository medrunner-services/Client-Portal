import type {
    CancellationReason,
    ChatMessage,
    ChatMessageRequest,
    CreateEmergencyRequest,
    Emergency,
    LocationDetail,
    ResponseRating,
    TeamDetailsResponse,
} from "@medrunner-services/api-client";
import { defineStore } from "pinia";
import { type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import { api } from "@/utils/medrunnerClient";

export const useEmergencyStore = defineStore("emergency", () => {
    const { t } = useI18n();
    const trackedEmergency: Ref<Emergency> = ref({} as Emergency);
    const trackedEmergencyMessages: Ref<ChatMessage[]> = ref([]);
    const trackedEmergencyTeamDetails: Ref<TeamDetailsResponse> = ref({} as TeamDetailsResponse);
    const isTrackedEmergencyCanceled = ref(false);

    function resetTrackedEmergency(): void {
        trackedEmergency.value.id = "";
        trackedEmergencyMessages.value = [];
        isTrackedEmergencyCanceled.value = false;
    }

    async function fetchEmergency(id: string): Promise<Emergency> {
        const response = await api.emergency.getEmergency(id);

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response;
        }
    }

    async function fetchEmergencies(ids: string[]): Promise<Emergency[]> {
        const response = await api.emergency.getEmergencies(ids);

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response;
        }
    }

    async function fetchEmergencyTeamDetail(id: string): Promise<TeamDetailsResponse> {
        const response = await api.emergency.teamDetails(id);

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response;
        }
    }

    async function createEmergency(emergency: CreateEmergencyRequest): Promise<Emergency> {
        const response = await api.emergency.createEmergency(emergency);

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response;
        }
    }

    async function cancelEmergency(id: string, reason: CancellationReason): Promise<void> {
        const response = await api.emergency.cancelEmergencyWithReason(id, reason);

        if (!response.success) {
            throw response;
        }
    }

    async function rateCompletedEmergency(id: string, rating: ResponseRating, remarks?: string): Promise<void> {
        const response = await api.emergency.rateServices(id, rating, remarks);

        if (!response.success) {
            throw response;
        }
    }

    async function sendEmergencyMessage(chatMessageRequest: ChatMessageRequest): Promise<void> {
        const response = await api.chatMessage.sendMessage(chatMessageRequest);

        if (!response.success) {
            throw response;
        }
    }

    async function fetchChatHistory(id: string): Promise<ChatMessage[]> {
        const response = await api.chatMessage.getHistory(id, 50);

        if (response.success && response.data) {
            return response.data.data;
        } else {
            throw response;
        }
    }

    async function fetchMetaLocations(): Promise<LocationDetail[]> {
        const response = await api.emergency.emergencyLocations();

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response;
        }
    }

    function getEmergencyStatusTitle(status: number): string {
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

    function getEmergencyStatusSubtitle(status: number): string {
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

    return {
        trackedEmergency,
        isTrackedEmergencyCanceled,
        trackedEmergencyMessages,
        trackedEmergencyTeamDetails,
        resetTrackedEmergency,
        fetchEmergency,
        fetchEmergencies,
        fetchEmergencyTeamDetail,
        createEmergency,
        cancelEmergency,
        rateCompletedEmergency,
        sendEmergencyMessage,
        fetchChatHistory,
        fetchMetaLocations,
        getEmergencyStatusTitle,
        getEmergencyStatusSubtitle,
    };
});
