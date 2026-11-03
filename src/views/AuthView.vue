<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { LocalStorageItems } from "@/@types/types.ts";
import GlobalLoader from "@/components/utils/GlobalLoader.vue";
import { useUserStore } from "@/stores/userStore";
import { authDiagnosticState, authResponseFailure, authTokenGrant } from "@/utils/authDiagnostics";
import { runtimeFailure } from "@/utils/errorDiagnostics";
import { initializeApp } from "@/utils/initializeApp";
import { initializeApi, initializeWebsocket } from "@/utils/medrunnerClient";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

async function loginFailure(code: string, error: unknown) {
    await router.push({ name: "login", query: { error: code }, state: authDiagnosticState(error) });
}

onMounted(async () => {
    if (!route.query.code) {
        if (route.query.error)
            await loginFailure(`discord_${route.query.error as string}`, { failureKind: "frontend" });
        else
            await router.push("/login");
        return;
    }
    if (userStore.isAuthenticated || !["/auth", "/auth/register"].includes(route.path)) {
        await router.push("/login");
        return;
    }
    const registration = route.path === "/auth/register";
    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/auth/${registration ? "register" : "signin"}?code=${route.query.code as string}&redirectUri=${import.meta.env.VITE_CALLBACK_URL}${route.path}`,
            { credentials: "include" },
        );
        if (!response.ok) {
            const code = registration
                ? response.status === 409 ? "accountKnown" : response.status === 503 ? "registrationDisabled" : "generic"
                : response.status === 401 ? "accountUnknown" : "generic";
            await loginFailure(code, await authResponseFailure(response));
            return;
        }
        const grant = await authTokenGrant(response);
        localStorage.setItem(LocalStorageItems.ACCESS_TOKEN_EXPIRATION, grant.accessTokenExpiration);
        if (grant.refreshTokenExpiration === null)
            localStorage.removeItem(LocalStorageItems.REFRESH_TOKEN_EXPIRATION);
        else
            localStorage.setItem(LocalStorageItems.REFRESH_TOKEN_EXPIRATION, grant.refreshTokenExpiration);
        initializeApi();
        await initializeWebsocket();
        await initializeApp(true);
        if (!userStore.isAuthenticated) {
            await loginFailure("generic", runtimeFailure.value ?? { failureKind: "frontend" });
            return;
        }
        if (route.query.state && route.query.state !== "undefined")
            await router.push(decodeURIComponent(route.query.state as string));
        else
            await router.push(registration ? "/emergency" : "/");
    }
    catch (error) {
        await loginFailure("generic", error);
    }
});
</script>

<template>
    <div class="flex h-screen w-screen items-center justify-center">
        <GlobalLoader width="w-16" height="h-16" text-size="text-2xl" spacing="mb-10" />
    </div>
</template>
