import "./assets/base.css";

import messages from "@intlify/unplugin-vue-i18n/messages";
import { createPinia } from "pinia";
import { createApp, markRaw } from "vue";
import { createI18n } from "vue-i18n";
import type { Router } from "vue-router";

import App from "./App.vue";
import router from "./router";

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

app.mount("#app");
