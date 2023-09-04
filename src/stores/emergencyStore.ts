import type {
    CancellationReason,
    ChatMessageRequest,
    CreateEmergencyRequest,
    Emergency,
    ResponseRating,
    TeamDetailsResponse,
} from "@medrunner-services/api-client";
import { defineStore } from "pinia";
import { type Ref, ref } from "vue";

import { api } from "@/utils/medrunnerClient";

export const useEmergencyStore = defineStore("emergency", () => {
    const trackedEmergency: Ref<Emergency> = ref({} as Emergency);
    const isTrackedEmergencyCanceled = ref(false);

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

    async function rateCompletedEmergency(id: string, rating: ResponseRating): Promise<void> {
        const response = await api.emergency.rateServices(id, rating);

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

    return {
        trackedEmergency,
        isTrackedEmergencyCanceled,
        fetchEmergency,
        fetchEmergencies,
        fetchEmergencyTeamDetail,
        createEmergency,
        cancelEmergency,
        rateCompletedEmergency,
        sendEmergencyMessage,
    };
});
