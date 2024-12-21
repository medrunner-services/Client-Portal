<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import GlobalLoader from "@/components/utils/GlobalLoader.vue";
import { useUserStore } from "@/stores/userStore";
import { initializeApp } from "@/utils/initializeApp";
import { initializeApi, initializeWebsocket } from "@/utils/medrunnerClient";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
    if (!route.query.code) {
        if (route.query.error) {
            await router.push({ name: "login", query: { error: `discord_${route.query.error}` } });
        } else {
            await router.push("/login");
        }
    }

    if (route.path === "/auth" && !userStore.isAuthenticated) {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/signin?code=${route.query.code}&redirectUri=${import.meta.env.VITE_CALLBACK_URL}/auth`,
            );
            if (response.ok) {
                let apiInitialized = false;
                const responseBody = await response.json();

                try {
                    await initializeApi(responseBody.refreshToken);
                    await initializeWebsocket();

                    apiInitialized = true;
                } catch (_e) {
                    await router.push("/login?error=generic");
                }

                try {
                    await initializeApp(apiInitialized);
                } catch (_e) {
                    await router.push("/login?error=generic");
                }

                if (!userStore.isAuthenticated) {
                    localStorage.removeItem("refreshToken");
                    await router.push("/login?error=generic");
                }

                if (route.query.state && route.query.state !== "undefined") await router.push(decodeURIComponent(route.query.state as string));
                else await router.push("/");
            } else {
                if (response.status === 401) await router.push("/login?error=accountUnknown");
                else await router.push("/login?error=generic");
            }
        } catch (_e) {
            await router.push("/login?error=generic");
        }
    } else if (route.path === "/auth/register" && !userStore.isAuthenticated) {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/register?code=${route.query.code}&redirectUri=${
                    import.meta.env.VITE_CALLBACK_URL
                }/auth/register`,
            );

            if (response.ok) {
                let apiInitialized = false;
                const responseBody = await response.json();

                try {
                    await initializeApi(responseBody.refreshToken);
                    await initializeWebsocket();

                    apiInitialized = true;
                } catch (_e) {
                    await router.push("/login?error=generic");
                }

                try {
                    await initializeApp(apiInitialized);
                } catch (_e) {
                    await router.push("/login?error=generic");
                }

                if (!userStore.isAuthenticated) {
                    localStorage.removeItem("refreshToken");
                    await router.push("/login?error=generic");
                }

                if (route.query.state && route.query.state !== "undefined") await router.push(decodeURIComponent(route.query.state as string));
                else await router.push("/emergency");
            } else {
                if (response.status === 409) await router.push("/login?error=accountKnown");
                else await router.push("/login?error=generic");
            }
        } catch (_e) {
            await router.push("/login?error=generic");
        }
    } else {
        await router.push("/login");
    }
});
</script>

<template>
    <div class="flex h-screen w-screen items-center justify-center">
        <GlobalLoader width="w-16" height="h-16" text-size="text-2xl" spacing="mb-10" />
    </div>
</template>
