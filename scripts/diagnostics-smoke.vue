<script setup lang="ts">
import type { ApiResponse } from "@medrunner/api-client";
import type { ErrorPresentation } from "@/utils/errorDiagnostics";
import { ApiEndpoint, DefaultApiConfig, TokenManager } from "@medrunner/api-client";
import { computed, ref } from "vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import { configureFrontendDiagnostics, frontendDiagnosticRecords, presentFailure, showBootstrapFailure } from "@/utils/errorDiagnostics";
import { errorPresentation } from "@/utils/functions/stringFunctions";

const parameters = new URLSearchParams(location.search);
const origin = parameters.get("api") ?? "http://127.0.0.1:5289";
const legacy = parameters.get("legacy") === "true";
configureFrontendDiagnostics({ portal: "diagnostic-smoke", version: __APP_VERSION__, canReport: () => false });
class Endpoint extends ApiEndpoint {
    public constructor() {
        const config = new DefaultApiConfig({ baseUrl: `${origin}${legacy ? "/legacy" : ""}`, accessTokenProvider: { getAccessToken: async () => "fixture-token", invalidate() {} } });
        super(config, new TokenManager(config));
    }

    protected endpoint() { return "test"; }
    public call(path: string) { return this.getRequest(path); }
}
const endpoint = new Endpoint();
const error = ref<ErrorPresentation>("");
const response = ref<ApiResponse>();
const pasted = ref("");
const records = computed(() => {
    void error.value;
    return frontendDiagnosticRecords();
});

async function fail(retry = false) {
    error.value = "";
    response.value = await endpoint.call(retry ? `/retry?attempt=${crypto.randomUUID()}` : "/failure");
    error.value = errorPresentation(response.value, "The operation could not be completed");
}

function frontend() {
    error.value = presentFailure(new Error("fixture frontend exception"), "A frontend operation failed");
}

function denyClipboard() {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => {
        throw new Error("fixture denial");
    } } });
}

function bootstrap() {
    showBootstrapFailure(new Error("fixture bootstrap failure"), "Application initialization failed", {
        request: "Request ID",
        frontend: "Frontend diagnostic ID",
        copy: "Copy ID",
        copied: "Copied",
        failed: "Could not copy",
    });
}
</script>

<template>
    <main class="mx-auto max-w-3xl space-y-6 p-8">
        <h1 class="text-2xl font-semibold">Error diagnostics smoke check</h1>
        <p>This local fixture uses the real SDK, portal normalization, and error controls.</p>
        <div class="flex flex-wrap gap-3">
            <button class="rounded border p-2" @click="fail()">API failure</button>
            <button class="rounded border p-2" @click="fail(true)">Authentication recovery</button>
            <button class="rounded border p-2" @click="frontend">Frontend failure</button>
            <button class="rounded border p-2" @click="error = 'Name is required'">Local validation</button>
            <button class="rounded border p-2" @click="error = ''">Clear error</button>
            <button class="rounded border p-2" @click="denyClipboard">Deny clipboard</button>
            <button class="rounded border p-2" @click="bootstrap">Bootstrap fallback</button>
        </div>
        <GlobalErrorText v-if="error" :text="error" :icon="false" />
        <label class="block">Paste copied ID here <input v-model="pasted" aria-label="Paste copied ID here" class="w-full rounded border p-2"></label>
        <details><summary>Diagnostic test records</summary><pre class="overflow-auto whitespace-pre-wrap">{{ { response, records } }}</pre></details>
    </main>
</template>
