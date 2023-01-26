import axios from "axios";
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
    state: () => {
        return {
            username: "",
            isLoggedIn: false,
            accessToken: "",
        };
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
            this.accessToken = "";
            this.username = "";
            this.isLoggedIn = false;
            localStorage.removeItem("refreshToken");
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

                this.username = username;
                this.router.push("/");
            } catch (e) {
                if (e.response.status === 401) {
                    this.router.push("/login?error=true");
                } else {
                    return "error";
                }
            }
        },

        async getUser(): Promise<void> {
            try {
                const response = await axios.get(
                    "http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/client/",
                    {
                        headers: {
                            Authorization: `Bearer ${await this.getToken()}`,
                        },
                    },
                );

                if (response.data.rsiHandle) {
                    this.username = response.data.rsiHandle;
                    this.isLoggedIn = true;
                } else {
                    this.router.push("/login/link");
                }
            } catch (error) {
                this.router.push("/login");
            }
        },
    },
});
