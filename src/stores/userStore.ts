import type { ApiToken, ClientHistory, PaginatedResponse, Person } from "@medrunner-services/api-client";
import { defineStore } from "pinia";
import { computed, type Ref, ref } from "vue";

import { api } from "@/utils/medrunnerClient";

export const useUserStore = defineStore("user", () => {
    const user: Ref<Person> = ref({} as Person);
    const isAuthenticated = ref(false);
    const newlySubmittedEmergencies = ref(0);

    const totalNumberOfEmergencies = computed(() => {
        if (isAuthenticated.value === true) {
            return Object.values(user.value.clientStats.missions).reduce((acc, value) => acc + value, 0) + newlySubmittedEmergencies.value;
        } else {
            return 0;
        }
    });

    async function disconnectUser(): Promise<void> {
        try {
            await api.auth.signOut({ refreshToken: localStorage.getItem("refreshToken") ?? "" });
        } finally {
            localStorage.removeItem("refreshToken");
            isAuthenticated.value = false;
        }
    }

    async function linkUser(username: string): Promise<void> {
        const response = await api.client.linkClient(username);

        if (response.success && response.data) {
            user.value.rsiHandle = response.data?.rsiHandle;
        } else {
            throw response;
        }
    }

    async function fetchUser(): Promise<Person> {
        const response = await api.client.get();

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response;
        }
    }

    async function fetchUserEmergencyHistory(limit: number, paginationToken?: string): Promise<PaginatedResponse<ClientHistory>> {
        const response = await api.client.getHistory(limit, paginationToken);

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response;
        }
    }

    async function fetchUserApiTokens(): Promise<ApiToken[]> {
        const response = await api.auth.getApiTokens();

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response;
        }
    }

    async function createApiToken(name: string, expirationDate?: Date): Promise<string> {
        const response = await api.auth.createApiToken({ name, expirationDate });

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response;
        }
    }

    async function deleteApiToken(id: string): Promise<void> {
        const response = await api.auth.deleteApiToken(id);

        if (!response.success) {
            throw response;
        }
    }

    return {
        user,
        isAuthenticated,
        newlySubmittedEmergencies,
        totalNumberOfEmergencies,
        disconnectUser,
        linkUser,
        fetchUser,
        fetchUserEmergencyHistory,
        fetchUserApiTokens,
        createApiToken,
        deleteApiToken,
    };
});
