import axios from "axios";
import { defineStore } from "pinia";

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
        async getToken(): Promise<string | void> {
            const jwtExp = () => {
                const base64Url = this.accessToken.split(".")[1];
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                const jsonPayload = JSON.parse(
                    decodeURIComponent(
                        window
                            .atob(base64)
                            .split("")
                            .map(function (c) {
                                return (
                                    "%" +
                                    ("00" + c.charCodeAt(0).toString(16)).slice(
                                        -2,
                                    )
                                );
                            })
                            .join(""),
                    ),
                );

                return jsonPayload.exp;
            };

            if (this.accessToken) {
                const exp = jwtExp();
                if (exp > Date.now() / 1000) return this.accessToken;
            }

            if (localStorage.getItem("refreshToken")) {
                const response = await axios.post(
                    "http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/auth/exchange",
                    { refreshToken: localStorage.getItem("refreshToken") },
                );
                this.accessToken = response.data.accessToken;
                localStorage.setItem(
                    "refreshToken",
                    response.data.refreshToken,
                );
                return this.accessToken;
            } else {
                this.router.push("/login");
            }
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

        async fetchUser(): Promise<void> {
            try {
                const response = await axios.get(
                    "http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/client/",
                    {
                        headers: {
                            Authorization: `Bearer ${await this.getToken()}`,
                        },
                    },
                );

                if (!response.data.active) {
                    this.router.push("/login");
                }
                if (response.data.rsiHandle) {
                    this.user = response.data;
                    this.isAuthenticated = true;
                } else {
                    this.router.push("/login/link");
                }
            } catch (error) {
                this.router.push("/login");
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
