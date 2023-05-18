import "./assets/base.css";

import messages from "@intlify/unplugin-vue-i18n/messages";
import { MedrunnerApiClient } from "@medrunner-services/api-client";
import { createPinia } from "pinia";
import { createApp, markRaw } from "vue";
import { createI18n } from "vue-i18n";
import type { Router } from "vue-router";

import { getJwtFromAccessToken } from "@/utils/jwt";

import App from "./App.vue";
import router from "./router";
import { useUserStore } from "./stores/userStore";

const app = createApp(App);

declare module "pinia" {
    export interface PiniaCustomProperties {
        router: Router;
    }
}
const pinia = createPinia();

const i18n = createI18n({
    legacy: false,
    fallbackLocale: "en-US",
    messages,
});

pinia.use(({ store }) => {
    store.router = markRaw(router);
});

app.use(pinia);
app.use(router);
app.use(i18n);

const userStore = useUserStore();

const apiConfig = {
    baseUrl: import.meta.env.VITE_API_URL,
    token: async () => {
        if (userStore.accessToken) {
            const exp = getJwtFromAccessToken(userStore.accessToken).exp;
            if (exp > Date.now() / 1000) return userStore.accessToken;
        }

        const localStorageRefreshToken = localStorage.getItem("refreshToken") ?? "";

        const tokens = await userStore.fetchToken(localStorageRefreshToken);
        userStore.setTokens(tokens);

        return userStore.accessToken;
    },
};

export const medrunnerClient = MedrunnerApiClient.buildClient(apiConfig);

app.mount("#app");
