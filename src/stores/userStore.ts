import axios, { AxiosError } from "axios";
import { defineStore } from "pinia";

import { getJwtFromAccessToken } from "@/utils/jwt";

export interface User {
    active: boolean;
    created: string;
    deactivationReason: number;
    discordId: string;
    emergencyHistory: { created: string; id: string }[];
    id: string;
    personType: number;
    roles: number;
    rsiHandle: string;
    rsiHandleQuery: string;
    rsiId: string;
    updated: string;
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

    getters: {
        getLastOrderedEmergencyHistory(): Array<object> {
            return this.user.emergencyHistory.sort().reverse().slice(0, 5);
        },
    },

    actions: {
        async fetchToken(
            refreshToken: string,
            successCallback: (tokens: Tokens) => void,
            errorCallback: (error: AxiosError) => void,
        ) {
            try {
                const result = await axios.post(
                    "http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/auth/exchange",
                    { refreshToken },
                );
                successCallback(result.data);
            } catch (error: AxiosError | any) {
                errorCallback(error);
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

            await this.fetchToken(
                localStorageRefreshToken,
                tokens => this.setTokens(tokens),
                () => undefined,
            );

            return this.accessToken;
        },

        loginUser(): void {
            window.location.replace(
                "https://discord.com/oauth2/authorize?client_id=1050206397972873227&scope=identify&response_type=code&redirect_uri=http://localhost:5173/auth",
            );
        },

        registerUser(): void {
            window.location.replace(
                "https://discord.com/oauth2/authorize?client_id=1050206397972873227&scope=identify&response_type=code&redirect_uri=http://localhost:5173/auth/register",
            );
        },

        disconnectUser(): void {
            localStorage.removeItem("refreshToken");
            this.$reset();
            this.router.push("/login");
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

                this.router.push("/");
            } catch (e: any) {
                if (e.response.status === 401) {
                    this.router.push("/login?error=true");
                } else {
                    return "error";
                }
            }
        },

        async fetchUser(
            token: string,
            successCallback: (user: User) => any,
            errorCallback: (error: AxiosError) => any,
        ): Promise<void> {
            try {
                const result = await axios.get(
                    "http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/client/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );
                successCallback(result.data);
            } catch (error: AxiosError | any) {
                errorCallback(error);
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
            } catch (error) {
                throw Error;
            }
        },
    },
});
