<script setup lang="ts">
import axios from "axios";
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import Loader from "@/components/Loader.vue";
import { useUserStore } from "@/stores/userStore";
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
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/auth/signin?code=${route.query.code}&redirectUri=${import.meta.env.VITE_CALLBACK_URL}/auth`,
            );

            localStorage.setItem("refreshToken", response.data.refreshToken);
            await initializeApi(localStorage.getItem("refreshToken") ?? undefined);
            await initializeWebsocket();

            await router.push("/");
        } catch (error: any) {
            if (error.statusCode === 401) await router.push("/login?error=accountUnknown");
            else await router.push("/login?error=generic");
        }
    }
    // TODO: Reactivate with registration
    // else if (route.path === "/auth/register" && !userStore.isAuthenticated) {
    //     try {
    //         const response = await axios.get(
    //             `${import.meta.env.VITE_API_URL}/auth/register?code=${route.query.code}&redirectUri=${
    //                 import.meta.env.VITE_CALLBACK_URL
    //             }/auth/register`,
    //         );
    //
    //         localStorage.setItem("refreshToken", response.data.refreshToken);
    //         await initializeApi(localStorage.getItem("refreshToken") ?? undefined);
    //         await initializeWebsocket();
    //
    //         await router.push("/login/link");
    //     } catch (error: any) {
    //         if (error.statusCode === 409) await router.push("/login?error=accountKnown");
    //         else await router.push("/login?error=generic");
    //     }
    // }
    // else {
    //     await router.push("/login");
    // }
});
</script>

<template>
    <Loader class="flex h-screen w-screen items-center justify-center" />
</template>
