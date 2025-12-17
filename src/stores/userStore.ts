import type {
    ApiToken,
    BlockedStatus,
    ClientHistory,
    PaginatedResponse,
    Person,
    PromotionalCode,
} from "@medrunner/api-client";
import type { SyncedSettings } from "@/@types/types.ts";
import { defineStore } from "pinia";

import { computed, ref } from "vue";
import { DateFormatingSetting, LocalStorageItems, MessageNotification } from "@/@types/types.ts";
import { stopWebsocket } from "@/utils/functions/handleWebsocket.ts";
import { api } from "@/utils/medrunnerClient";

export const useUserStore = defineStore("user", () => {
    const user = ref<Person>({} as Person);
    const isAuthenticated = ref(false);
    const isBlocked = ref(false);
    const syncedSettings = ref<SyncedSettings>({
        hideEmergencyRulesModal: false,
        globalNotifications: true,
        emergencyUpdateNotification: true,
        customSoundNotification: false,
        chatMessageNotification: MessageNotification.ALL,
        globalAnalytics: true,
        selectedLanguage: "",
        lastConfirmedWarningId: "",
        dateFormatingPreference: DateFormatingSetting.AUTO,
    });
    const redeemedCodes = ref<PromotionalCode[]>([]);

    const totalNumberOfEmergencies = computed(() => {
        if (isAuthenticated.value === true) {
            return Object.values(user.value.clientStats.missions).reduce((acc, value) => acc + value, 0);
        }
        else {
            return 0;
        }
    });

    async function disconnectUser(): Promise<void> {
        try {
            await api.auth.signOut();
            // We do not want to wait for the socket to stop
            void stopWebsocket();
            localStorage.removeItem(LocalStorageItems.ACCESS_TOKEN_EXPIRATION);
            localStorage.removeItem(LocalStorageItems.REFRESH_TOKEN_EXPIRATION);
        }
        finally {
            isAuthenticated.value = false;
        }
    }

    async function linkUser(username: string): Promise<Person> {
        let linkUsername = username;
        if (username.includes("https://robertsspaceindustries.com/citizens/")) {
            linkUsername = username.replace(/.*\/citizens\/([^/]+).*/, "$1");
        }

        const response = await api.client.linkClient(linkUsername);

        if (response.success && response.data) {
            return response.data;
        }
        else {
            throw response;
        }
    }

    async function fetchUser(): Promise<Person> {
        const response = await api.client.get();

        if (response.success && response.data) {
            return response.data;
        }
        else {
            throw response;
        }
    }

    async function fetchUserBlocklistStatus(): Promise<BlockedStatus> {
        const response = await api.client.getBlockedStatus();

        if (response.success && response.data) {
            return response.data;
        }
        else {
            throw response;
        }
    }

    async function fetchUserEmergencyHistory(limit: number, paginationToken?: string): Promise<PaginatedResponse<ClientHistory>> {
        const response = await api.client.getHistory(limit, paginationToken);

        if (response.success && response.data) {
            return response.data;
        }
        else {
            throw response;
        }
    }

    async function fetchUserApiTokens(): Promise<ApiToken[]> {
        const response = await api.auth.getApiTokens();

        if (response.success && response.data) {
            return response.data;
        }
        else {
            throw response;
        }
    }

    async function createApiToken(name: string, expirationDate?: Date): Promise<string> {
        const response = await api.auth.createApiToken({ name, expirationDate });

        if (response.success && response.data) {
            return response.data;
        }
        else {
            throw response;
        }
    }

    async function deleteApiToken(id: string): Promise<void> {
        const response = await api.auth.deleteApiToken(id);

        if (!response.success) {
            throw response;
        }
    }

    async function setSettings(settings: Record<string, unknown>): Promise<void> {
        const mergedSettings: Record<string, unknown> = { ...syncedSettings.value, ...settings };

        for (const key in mergedSettings) {
            if (mergedSettings[key] === null) {
                delete mergedSettings[key];
            }
        }

        const response = await api.client.setUserSettings(JSON.stringify(mergedSettings));

        if (!response.success) {
            throw response;
        }
    }

    async function deleteAccount(): Promise<void> {
        const response = await api.client.deactivate();

        if (!response.success) {
            throw response;
        }
    }

    async function redeemCode(code: string): Promise<void> {
        const response = await api.code.redeem(code);

        if (!response.success) {
            throw response;
        }
    }

    async function fetchUserRedeemedCodes(limit: number, paginationToken?: string): Promise<PaginatedResponse<PromotionalCode>> {
        const response = await api.code.getRedeemedCodes(limit, paginationToken);

        if (response.success && response.data) {
            return response.data;
        }
        else {
            throw response;
        }
    }

    return {
        user,
        isAuthenticated,
        isBlocked,
        syncedSettings,
        totalNumberOfEmergencies,
        redeemedCodes,
        disconnectUser,
        linkUser,
        fetchUser,
        fetchUserBlocklistStatus,
        fetchUserEmergencyHistory,
        fetchUserApiTokens,
        createApiToken,
        deleteApiToken,
        setSettings,
        deleteAccount,
        redeemCode,
        fetchUserRedeemedCodes,
    };
});
