// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { AxiosError } from "axios";
import { defineStore } from "pinia";
import { type Ref, ref } from "vue";
import { useRouter } from "vue-router";

import { getJwtFromAccessToken } from "@/utils/jwt";

export interface User {
    id: string;
    created: Date;
    updated: Date;
    discordId: string;
    rsiHandle: string;
    roles: number;
    active: boolean;
    deactivationReason: number;
    clientStats: {
        missions: {
            success: number;
            failed: number;
            noContact: number;
            refused: number;
            aborted: number;
            serverError: number;
            canceled: number;
        };
    };
    activeEmergency: string;
    plan: { nextBillOn: Date; planType: number; price: number; amountDue: number };
    delinquent: boolean;
    grace: boolean;
    overdue: boolean;
    personType: number;
    accountCredit: number;
    payments: { amount: number; time: Date; source: number; destination: number }[];
}

export interface PaginatedResponse<T> {
    data: T[];
    paginationToken: string;
}

export interface History {
    id: string;
    created: Date;
    emergencyId: string;
    clientId: string;
    emergencyCreationTimestamp: Date;
}

export interface Emergency {
    id: string;
    created: Date;
    updated: Date;
    system: string;
    subsystem: string;
    threatLevel: number;
    remarks: string;
    clientRsiHandle: string;
    clientDiscordId: string;
    clientId: string;
    subscriptionTier: string;
    status: number;
    statusDescription: string;
    alertMessage: { id: string; channelId: string };
    clientMessage: { id: string; channelId: string };
    coordinationThread: { id: string; channelId: string };
    interactionMessageId: string;
    respondingTeam: {
        maxMembers: number;
        staff: {
            discordId: string;
            discordHandle: string;
            id: string;
            rsiHandle: string;
        }[];
    };
    creationTimestamp: number;
    acceptedTimestamp: number;
    completionTimestamp: number;
    rating: number;
    test: boolean;
    origin: number;
    clientData: {
        rsiHandle: string;
        rsiProfileLink: string;
        gotClientData: boolean;
        redactedOrgOnProfile: boolean;
        reported: boolean;
        individualReport: string;
        orgReport: string;
    };
    isComplete: boolean;
    afterActionReport: { status: number; remarks: string };
}

export interface NewEmergency {
    system: string;
    subsystem: string;
    threatLevel: number;
    remarks: string;
}

interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export const useUserStore = defineStore("user", () => {
    const user: Ref<User> = ref({} as User);
    const isAuthenticated = ref(false);
    const accessToken = ref("");

    const router = useRouter();

    function setupStore() {
        user.value = {} as User;
        isAuthenticated.value = false;
        accessToken.value = "";
    }

    function redirectToDiscordLogin(): void {
        window.location.replace(
            `https://discord.com/oauth2/authorize?client_id=1050206397972873227&scope=identify&response_type=code&redirect_uri=${
                import.meta.env.VITE_CALLBACK_URL
            }/auth`,
        );
    }

    function redirectToDiscordRegister(): void {
        window.location.replace(
            `https://discord.com/oauth2/authorize?client_id=1050206397972873227&scope=identify&response_type=code&redirect_uri=${
                import.meta.env.VITE_CALLBACK_URL
            }/auth/register`,
        );
    }

    function disconnectUser(): void {
        localStorage.removeItem("refreshToken");
        setupStore();
        router.push("/login");
    }

    async function fetchToken(refreshToken: string) {
        try {
            const result = await axios.post(`${import.meta.env.VITE_API_URL}/auth/exchange`, {
                refreshToken,
            });

            return result.data;
        } catch (error: AxiosError | any) {
            throw Error(error.response.status);
        }
    }

    function setTokens(tokens: Tokens): void {
        accessToken.value = tokens.accessToken;
        localStorage.setItem("refreshToken", tokens.refreshToken);
    }

    async function getToken(): Promise<string> {
        if (accessToken.value) {
            const exp = getJwtFromAccessToken(accessToken.value).exp;
            if (exp > Date.now() / 1000) return accessToken.value;
        }

        const localStorageRefreshToken = localStorage.getItem("refreshToken") ?? "";

        const tokens = await fetchToken(localStorageRefreshToken);
        setTokens(tokens);

        return accessToken.value;
    }

    async function linkUser(username: string): Promise<string | void> {
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/client/link`,
                { rsiHandle: username },
                {
                    headers: {
                        Authorization: `Bearer ${await getToken()}`,
                    },
                },
            );

            user.value.rsiHandle = username;
            return "success";
        } catch (error: AxiosError | any) {
            throw Error(error.response.status);
        }
    }

    async function fetchUser(): Promise<User> {
        try {
            const result = await axios.get(`${import.meta.env.VITE_API_URL}/client/`, {
                headers: {
                    Authorization: `Bearer ${await getToken()}`,
                },
            });

            return result.data;
        } catch (error: AxiosError | any) {
            throw Error(error.response.status);
        }
    }

    async function fetchUserHistory(
        limit: number,
        paginationToken?: string,
    ): Promise<PaginatedResponse<History>> {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/client/history`, {
                headers: {
                    Authorization: `Bearer ${await getToken()}`,
                },
                params: {
                    limit: limit,
                    paginationToken: paginationToken,
                },
            });
            return response.data;
        } catch (error: AxiosError | any) {
            throw Error(error.response.status);
        }
    }

    async function fetchEmergency(id: string): Promise<Emergency> {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/emergency/${id}`, {
                headers: {
                    Authorization: `Bearer ${await getToken()}`,
                },
            });

            return response.data;
        } catch (error: AxiosError | any) {
            throw Error(error.response.status);
        }
    }

    async function fetchEmergencies(...id: string[]): Promise<Emergency[]> {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/emergency/bulk?id=${id.join("&id=")}`,
                {
                    headers: {
                        Authorization: `Bearer ${await getToken()}`,
                    },
                },
            );

            return response.data;
        } catch (error: AxiosError | any) {
            throw Error(error.response.status);
        }
    }

    async function createEmergency(emergency: NewEmergency): Promise<string | void> {
        try {
            const data = {
                system: emergency.system,
                subsystem: emergency.subsystem,
                threatLevel: emergency.threatLevel,
                clientRsiHandle: user.value.rsiHandle,
                clientDiscordId: user.value.discordId,
                ...(emergency.remarks ? { remarks: emergency.remarks } : {}),
            };
            await axios.post(`${import.meta.env.VITE_API_URL}/emergency/`, data, {
                headers: {
                    Authorization: `Bearer ${await getToken()}`,
                },
            });
        } catch (error: AxiosError | any) {
            throw Error(error.response.status);
        }
    }

    return {
        redirectToDiscordLogin,
        redirectToDiscordRegister,
        disconnectUser,
        linkUser,
        fetchUser,
        fetchUserHistory,
        fetchEmergency,
        fetchEmergencies,
        createEmergency,
        user,
        isAuthenticated,
        setTokens,
    };
});
