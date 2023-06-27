import type { CancellationReason, ChatMessageRequest, Emergency, ResponseRating } from "@medrunner-services/api-client";
import { defineStore } from "pinia";
import { type Ref, ref } from "vue";

import { api } from "@/utils/medrunnerClient";

interface CreatEmergencyForm {
    remarks?: string;
    system: string;
    subsystem: string;
    threatLevel: number;
}

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

    async function createEmergency(emergency: CreatEmergencyForm): Promise<Emergency> {
        const emergencyBody = {
            remarks: emergency.remarks,
            location: {
                system: emergency.system,
                subsystem: emergency.subsystem,
            },
            threatLevel: emergency.threatLevel,
        };

        if (emergency.remarks === "") delete emergencyBody.remarks;

        const response = await api.emergency.createEmergency(emergencyBody);

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
        createEmergency,
        cancelEmergency,
        rateCompletedEmergency,
        sendEmergencyMessage,
    };
});
