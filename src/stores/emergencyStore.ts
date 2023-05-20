import type { CreateEmergencyRequest, Emergency } from "@medrunner-services/api-client";
import { defineStore } from "pinia";
import { type Ref, ref } from "vue";

import { api } from "@/utils/medrunnerClient";

export const useEmergencyStore = defineStore("emergency", () => {
    const trackedEmergency: Ref<Emergency> = ref({} as Emergency);

    async function fetchEmergency(id: string): Promise<Emergency | void> {
        const response = await api.emergency.getEmergency(id);

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response.statusCode;
        }
    }

    async function fetchEmergencies(...id: string[]): Promise<Emergency[] | void> {
        const response = await api.emergency.getEmergencies(id);

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response.statusCode;
        }
    }

    async function createEmergency(emergency: CreateEmergencyRequest): Promise<void> {
        const response = await api.emergency.createEmergency(emergency);

        if (!response.success) {
            throw response.statusCode;
        }
    }

    async function cancelEmergency(id: string): Promise<void> {
        const response = await api.emergency.cancelEmergency(id);

        if (!response.success) {
            throw response.statusCode;
        }
    }

    async function rateCompletedEmergency(id: string, rating: string): Promise<void> {
        const response = await api.emergency.rateServices(id, rating);

        if (!response.success) {
            throw response.statusCode;
        }
    }

    async function justifyCanceledEmergency(id: string, reason: string): Promise<string | void> {
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
