import "./assets/base.css";

import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import messages from "@intlify/unplugin-vue-i18n/messages";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";

import { initializeApi } from "@/utils/medrunnerClient";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

const i18n = createI18n({
    legacy: false,
    fallbackLocale: "en-US",
    messages,
});

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(autoAnimatePlugin);

app.mount("#app");

initializeApi(localStorage.getItem("refreshToken") ?? undefined);
