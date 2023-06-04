import type { ClientHistory, PaginatedResponse, Person } from "@medrunner-services/api-client";
import { defineStore } from "pinia";
import { computed, type Ref, ref } from "vue";

import { api } from "@/utils/medrunnerClient";

export const useUserStore = defineStore("user", () => {
    const user: Ref<Person> = ref({} as Person);
    const isAuthenticated = ref(false);
    const newlySubmittedEmergencies = ref(0);

    const totalNumberOfEmergencies = computed(() => {
        return Object.values(user.value.clientStats.missions).reduce((acc, value) => acc + value, 0) + newlySubmittedEmergencies.value;
    });

    function disconnectUser(): void {
        localStorage.removeItem("refreshToken");
        user.value = {} as Person;
        isAuthenticated.value = false;
    }

    async function linkUser(username: string): Promise<void> {
        const response = await api.client.linkClient(username);

        if (response.success && response.data) {
            user.value.rsiHandle = response.data?.rsiHandle;
        } else {
            throw response.statusCode;
        }
    }

    async function fetchUser(): Promise<Person> {
        const response = await api.client.get();

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response.statusCode;
        }
    }

    async function fetchUserHistory(limit: number, paginationToken?: string): Promise<PaginatedResponse<ClientHistory>> {
        const response = await api.client.getHistory(limit, paginationToken);

        if (response.success && response.data) {
            return response.data;
        } else {
            throw response.statusCode;
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
        fetchUserHistory,
    };
});
