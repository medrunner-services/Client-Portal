import { ApmVuePlugin } from "@elastic/apm-rum-vue";

import { createPinia } from "pinia";
import { createApp } from "vue";
import { LocalStorageItems } from "@/@types/types.ts";

import { i18n } from "@/i18n";
import { useUserStore } from "@/stores/userStore.ts";
import { initializeApp } from "@/utils/initializeApp";
import { initializeApi, initializeWebsocket } from "@/utils/medrunnerClient";
import App from "./App.vue";

import router from "./router";
import "./assets/main.css";

const app = createApp(App);
const loader = document.getElementById("loader");
const appVersion = __APP_VERSION__;

await (async () => {
	let apiInitialized = false;
	const refreshTokenExpiration = localStorage.getItem(LocalStorageItems.REFRESH_TOKEN_EXPIRATION) ?? undefined;

	if (refreshTokenExpiration && new Date(refreshTokenExpiration).getTime() > new Date().getTime()) {
		try {
			initializeApi();
			apiInitialized = true;
		}
		catch (_e) {
			return;
		}

		try {
			await initializeWebsocket();
		}
		catch (_e) {}
	}

	app.use(createPinia());

	await initializeApp(apiInitialized);

	const userStore = useUserStore();
	const isApmEnabled = import.meta.env.VITE_ENABLE_APM === "true" && userStore.isAuthenticated && userStore.syncedSettings.globalAnalytics;

	app.use(router);
	app.use(i18n);
	app.use(ApmVuePlugin, {
		router,
		config: {
			serviceName: "client-portal",
			serverUrl: import.meta.env.VITE_APM_SERVER_URL,
			serverUrlPrefix: "/",
			serviceVersion: appVersion,
			active: isApmEnabled,
		},
	});

	app.mount("#app");

	if (loader && loader.parentNode) {
		loader.parentNode.removeChild(loader);
	}
})();
