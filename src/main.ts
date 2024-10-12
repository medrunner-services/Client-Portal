import "./assets/main.css";

import { createPinia } from "pinia";
import { createApp } from "vue";
import VueApexCharts from "vue3-apexcharts";

import { i18n } from "@/i18n";
import { initializeApp } from "@/utils/initializeApp";
import { initializeApi, initializeWebsocket } from "@/utils/medrunnerClient";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const loader = document.getElementById("loader");

(async () => {
    let apiInitialized = false;

    try {
        if (localStorage.getItem("refreshToken")) {
            await initializeApi(localStorage.getItem("refreshToken") ?? undefined);
            await initializeWebsocket();

            apiInitialized = true;
        }
    } finally {
        app.use(createPinia());

        await initializeApp(apiInitialized);

        app.use(router);
        app.use(i18n);
        app.use(VueApexCharts);

        app.mount("#app");

        if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }
})();
