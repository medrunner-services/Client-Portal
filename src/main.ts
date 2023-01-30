import "./assets/base.css";

import { createPinia } from "pinia";
import { createApp, markRaw } from "vue";
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
pinia.use(({ store }) => {
    store.router = markRaw(router);
});

app.use(pinia);
app.use(router);

app.mount("#app");
