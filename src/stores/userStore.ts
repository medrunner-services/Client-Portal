import axios, { AxiosError } from "axios";
import { defineStore } from "pinia";

import { getJwtFromAccessToken } from "@/utils/jwt";

export interface User {
    active: boolean;
    created: string;
    deactivationReason: number;
    discordId: string;
    id: string;
    personType: number;
    roles: number;
    rsiHandle: string;
    rsiHandleQuery: string;
    rsiId: string;
    updated: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    paginationToken: string;
}

export interface History {
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

interface Tokens {
    accessToken: string;
    refreshToken: string;
}
export const useUserStore = defineStore("user", {
    state: () => {
        return {
            user: {} as User,
            isAuthenticated: false,
            accessToken: "",
        };
    },

    getters: {},

    actions: {
        redirectToDiscordLogin(): void {
            window.location.replace(
                "https://discord.com/oauth2/authorize?client_id=1050206397972873227&scope=identify&response_type=code&redirect_uri=http://localhost:5173/auth",
            );
        },

        redirectToDiscordRegister(): void {
            window.location.replace(
                "https://discord.com/oauth2/authorize?client_id=1050206397972873227&scope=identify&response_type=code&redirect_uri=http://localhost:5173/auth/register",
            );
        },

        disconnectUser(): void {
            localStorage.removeItem("refreshToken");
            this.$reset();
            this.router.push("/login");
        },

        async fetchToken(refreshToken: string) {
            try {
                const result = await axios.post(
                    "http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/auth/exchange",
                    { refreshToken },
                );

                return result.data;
            } catch (error: AxiosError | any) {
                throw Error(error.response.status);
            }
        },

        setTokens(tokens: Tokens): void {
            this.accessToken = tokens.accessToken;
            localStorage.setItem("refreshToken", tokens.refreshToken);
        },

        async getToken(): Promise<string> {
            if (this.accessToken) {
                const exp = getJwtFromAccessToken(this.accessToken).exp;
                if (exp > Date.now() / 1000) return this.accessToken;
            }

            const localStorageRefreshToken = localStorage.getItem("refreshToken") ?? "";

            const tokens = await this.fetchToken(localStorageRefreshToken);
            this.setTokens(tokens);

            return this.accessToken;
        },

        async linkUser(username: string): Promise<string | void> {
            try {
                await axios.post(
                    "http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/client/link",
                    { rsiHandle: username },
                    {
                        headers: {
                            Authorization: `Bearer ${await this.getToken()}`,
                        },
                    },
                );

                return "success";
            } catch (error: AxiosError | any) {
                throw Error(error.response.status);
            }
        },

        async fetchUser(token: string): Promise<User> {
            try {
                const result = await axios.get(
                    "http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/client/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                return result.data;
            } catch (error: AxiosError | any) {
                throw Error(error.response.status);
            }
        },

        async fetchUserHistory(
            limit: number,
            paginationToken?: string,
        ): Promise<PaginatedResponse<History>> {
            try {
                const response = await axios.get(
                    `http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/client/history`,
                    {
                        headers: {
                            Authorization: `Bearer ${await this.getToken()}`,
                        },
                        params: {
                            limit: limit,
                            paginationToken: paginationToken,
                        },
                    },
                );
                return response.data;
            } catch (error: AxiosError | any) {
                throw Error(error.response.status);
            }
        },

        async fetchEmergency(id: string): Promise<Emergency> {
            try {
                const response = await axios.get(
                    `http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/emergency/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${await this.getToken()}`,
                        },
                    },
                );

                return response.data;
            } catch (error: AxiosError | any) {
                throw Error(error.response.status);
            }
        },
    },
});
