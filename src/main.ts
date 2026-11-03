import { apm } from "@elastic/apm-rum";
import { ApmVuePlugin } from "@elastic/apm-rum-vue";
import { createPinia } from "pinia";

import { createApp } from "vue";
import { LocalStorageItems } from "@/@types/types.ts";
import { i18n } from "@/i18n";

import { useUserStore } from "@/stores/userStore.ts";
import { configureFrontendDiagnostics, installDiagnosticHandling, showBootstrapFailure } from "@/utils/errorDiagnostics";
import { initializeApp } from "@/utils/initializeApp";
import { initializeApi, initializeWebsocket } from "@/utils/medrunnerClient";
import App from "./App.vue";

import router from "./router";
import "./assets/main.css";

configureFrontendDiagnostics({
    portal: "client-portal",
    version: __APP_VERSION__,
    canReport: () => {
        const user = useUserStore();
        return import.meta.env.VITE_ENABLE_APM === "true" && user.isAuthenticated && user.syncedSettings.globalAnalytics && apm.isActive();
    },
    report: (record) => {
        apm.captureError(new Error(`Frontend ${record.classification} failure`), {
            labels: { frontend_diagnostic_id: record.id, portal: record.portal, portal_version: record.version, classification: record.classification, occurred_at: record.timestamp },
        });
    },
});

function bootstrapFailure(error: unknown) {
    const { t } = i18n.global;
    showBootstrapFailure(error, t("error_generic"), {
        request: t("diagnostics_requestId"),
        frontend: t("diagnostics_frontendId"),
        copy: t("diagnostics_copy"),
        copied: t("diagnostics_copied"),
        failed: t("diagnostics_copyFailed"),
    });
}

const app = createApp(App);
installDiagnosticHandling(app, () => i18n.global.t("error_generic"), bootstrapFailure);
const loader = document.getElementById("loader");
const appVersion = __APP_VERSION__;

await (async () => {
    let apiInitialized = false;
    const refreshTokenExpiration = localStorage.getItem(LocalStorageItems.REFRESH_TOKEN_EXPIRATION) ?? undefined;

    if (refreshTokenExpiration && new Date(refreshTokenExpiration).getTime() > Date.now()) {
        try {
            initializeApi();
            apiInitialized = true;
        }
        catch (error) {
            bootstrapFailure(error);
            return;
        }

        try {
            await initializeWebsocket();
        }
        catch (error) {
            const { presentFailure, runtimeFailure } = await import("@/utils/errorDiagnostics");
            const failure = presentFailure(error, i18n.global.t("error_generic"));
            if (failure && typeof failure !== "string")
                runtimeFailure.value = failure;
        }
    }

    app.use(createPinia());

    await initializeApp(apiInitialized);

    const userStore = useUserStore();
    const isApmEnabled = import.meta.env.VITE_ENABLE_APM === "true" && userStore.isAuthenticated && userStore.syncedSettings.globalAnalytics;

    app.use(router);
    app.use(i18n);
    app.use(ApmVuePlugin, {
        router,
        captureErrors: false,
        config: {
            serviceName: "client-portal",
            serverUrl: import.meta.env.VITE_APM_SERVER_URL,
            serverUrlPrefix: "/",
            serviceVersion: appVersion,
            active: isApmEnabled,
            disableInstrumentations: ["error"],
        },
    });

    app.mount("#app");

    if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
    }
})().catch(bootstrapFailure);
