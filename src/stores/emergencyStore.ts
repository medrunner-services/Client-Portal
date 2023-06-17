import type { CancellationReason, ChatMessageRequest, Emergency, ResponseRating } from "@medrunner-services/api-client";
import { defineStore } from "pinia";
import { type Ref, ref } from "vue";

import { useUserStore } from "@/stores/userStore";
import { api } from "@/utils/medrunnerClient";

interface CreatEmergencyForm {
    remarks?: string;
    system: string;
    subsystem: string;
    threatLevel: number;
}

export const useEmergencyStore = defineStore("emergency", () => {
    const userStore = useUserStore();
    const trackedEmergency: Ref<Emergency> = ref({} as Emergency);

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
        if (!userStore.user.rsiHandle) throw Error;
        if (!emergency.remarks) delete emergency.remarks;
        const response = await api.emergency.createEmergency({
            ...emergency,
            clientRsiHandle: userStore.user.rsiHandle,
            clientDiscordId: userStore.user.discordId,
        });

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
        fetchEmergency,
        fetchEmergencies,
        createEmergency,
        cancelEmergency,
        rateCompletedEmergency,
        sendEmergencyMessage,
    };
});
