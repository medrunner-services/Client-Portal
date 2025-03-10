import type {
    CancellationReason,
    ChatMessage,
    ChatMessageRequest,
    CreateEmergencyRequest,
    Emergency,
    PaginatedResponse,
    ResponseRating,
    TeamDetailsResponse,
} from "@medrunner/api-client";
import { defineStore } from "pinia";
import { ref } from "vue";

import { api } from "@/utils/medrunnerClient";

export const useEmergencyStore = defineStore("emergency", () => {
    const trackedEmergency = ref<Emergency>();
    const trackedEmergencyMessages = ref<ChatMessage[]>([]);
    const trackedEmergencyTeamDetails = ref<TeamDetailsResponse>();
    const isTrackedEmergencyCanceled = ref(false);

    function resetTrackedEmergency(): void {
        trackedEmergency.value = undefined;
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

    async function updateEmergencyMessage(id: string, contents: string): Promise<void> {
        const response = await api.chatMessage.updateMessage(id, contents);

        if (!response.success) {
            throw response;
        }
    }

    async function deleteEmergencyMessage(id: string): Promise<void> {
        const response = await api.chatMessage.deleteMessage(id);

        if (!response.success) {
            throw response;
        }
    }

    async function fetchChatHistory(id: string, token?: string): Promise<PaginatedResponse<ChatMessage>> {
        const response = await api.chatMessage.getMessageHistory(id, 50, token);

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response;
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
        updateEmergencyMessage,
        deleteEmergencyMessage,
        fetchChatHistory,
    };
});
