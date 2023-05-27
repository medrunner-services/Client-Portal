import type { ResponseRating, Emergency } from "@medrunner-services/api-client";
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
            throw response.statusCode;
        }
    }

    async function fetchEmergencies(ids: string[]): Promise<Emergency[]> {
        const response = await api.emergency.getEmergencies(ids);

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response.statusCode;
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
            throw response.statusCode;
        }
    }

    async function cancelEmergency(id: string): Promise<void> {
        const response = await api.emergency.cancelEmergency(id);

        if (!response.success) {
            throw response.statusCode;
        }
    }

    async function rateCompletedEmergency(id: string, rating: ResponseRating): Promise<void> {
        const response = await api.emergency.rateServices(id, rating);

        if (!response.success) {
            throw response.statusCode;
        }
    }

    async function justifyCanceledEmergency(id: string, reason: string): Promise<void> {
        const response = await api.emergency.setStatusDescriptionForEmergency(id, reason);

        if (!response.success) {
            throw response.statusCode;
        }
    }

    return {
        trackedEmergency,
        fetchEmergency,
        fetchEmergencies,
        createEmergency,
        cancelEmergency,
        rateCompletedEmergency,
        justifyCanceledEmergency,
    };
});
