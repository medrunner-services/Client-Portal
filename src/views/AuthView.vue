<script setup lang="ts">
import axios from "axios";
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import Loader from "@/components/Loader.vue";
import { initializeApi } from "@/utils/medrunnerClient";

const route = useRoute();
const router = useRouter();

onMounted(async () => {
    if (!route.query.code) {
        await router.push("/login");
    }

    if (route.path === "/auth/register") {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/auth/register?code=${route.query.code}&redirectUri=${
                    import.meta.env.VITE_CALLBACK_URL
                }/auth/register`,
            );

            localStorage.setItem("refreshToken", response.data.refreshToken);
            initializeApi(response.data.refreshToken);

            await router.push("/login/link");
        } catch (e) {
            await router.push("/login?error=true");
        }
    } else {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/auth/signin?code=${route.query.code}&redirectUri=${import.meta.env.VITE_CALLBACK_URL}/auth`,
            );

            localStorage.setItem("refreshToken", response.data.refreshToken);
            initializeApi(response.data.refreshToken);

            await router.push("/");
        } catch (e) {
            await router.push("/login?error=true");
        }
    }
});
</script>

<template>
    <Loader class="w-full h-[70vh] flex justify-center items-center" />
</template>
