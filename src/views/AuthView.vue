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
            return;
        } else {
            await router.push("/login");
            return;
        }
    }

    if (route.path === "/auth" && !userStore.isAuthenticated) {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/signin?code=${route.query.code}&redirectUri=${import.meta.env.VITE_CALLBACK_URL}/auth`,
                {
                    credentials: "include",
                },
            );
            if (response.ok) {
                let apiInitialized = false;

                try {
                    await initializeApi();
                    await initializeWebsocket();

                    apiInitialized = true;
                } catch (_e) {
                    await router.push("/login?error=generic");
                    return;
                }

                try {
                    await initializeApp(apiInitialized);
                } catch (_e) {
                    await router.push("/login?error=generic");
                    return;
                }

                if (!userStore.isAuthenticated) {
                    await router.push("/login?error=generic");
                    return;
                }

                if (route.query.state && route.query.state !== "undefined") {
                    await router.push(decodeURIComponent(route.query.state as string));
                    return;
                } else {
                    await router.push("/");
                    return;
                }
            } else {
                if (response.status === 401) {
                    await router.push("/login?error=accountUnknown");
                    return;
                } else {
                    await router.push("/login?error=generic");
                    return;
                }
            }
        } catch (_e) {
            await router.push("/login?error=generic");
            return;
        }
    } else if (route.path === "/auth/register" && !userStore.isAuthenticated) {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/register?code=${route.query.code}&redirectUri=${
                    import.meta.env.VITE_CALLBACK_URL
                }/auth/register`,
                {
                    credentials: "include",
                },
            );

            if (response.ok) {
                let apiInitialized = false;

                try {
                    await initializeApi();
                    await initializeWebsocket();

                    apiInitialized = true;
                } catch (_e) {
                    await router.push("/login?error=generic");
                    return;
                }

                try {
                    await initializeApp(apiInitialized);
                } catch (_e) {
                    await router.push("/login?error=generic");
                    return;
                }

                if (!userStore.isAuthenticated) {
                    await router.push("/login?error=generic");
                    return;
                }

                if (route.query.state && route.query.state !== "undefined") {
                    await router.push(decodeURIComponent(route.query.state as string));
                    return;
                } else {
                    await router.push("/emergency");
                    return;
                }
            } else {
                if (response.status === 409) {
                    await router.push("/login?error=accountKnown");
                    return;
                } else if (response.status === 503) {
                    await router.push("/login?error=registrationDisabled");
                    return;
                } else {
                    await router.push("/login?error=generic");
                    return;
                }
            }
        } catch (_e) {
            await router.push("/login?error=generic");
            return;
        }
    } else {
        await router.push("/login");
        return;
    }
});
</script>

<template>
    <div class="flex h-screen w-screen items-center justify-center">
        <GlobalLoader width="w-16" height="h-16" text-size="text-2xl" spacing="mb-10" />
    </div>
</template>
