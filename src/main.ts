import "./assets/main.css";

import messages from "@intlify/unplugin-vue-i18n/messages";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import VueApexCharts from "vue3-apexcharts";

import { initializeApi, initializeWebsocket } from "@/utils/medrunnerClient";

import App from "./App.vue";
import router from "./router";

const i18n = createI18n({
    legacy: false,
    fallbackLocale: "en-US",
    messages,
});

const app = createApp(App);

(async () => {
    try {
        if (localStorage.getItem("refreshToken")) {
            await initializeApi(localStorage.getItem("refreshToken") ?? undefined);
            await initializeWebsocket();
        }
    } finally {
        app.use(createPinia());
        app.use(router);
        app.use(i18n);
        app.use(VueApexCharts);

        app.mount("#app");
    }
})();
