<script setup lang="ts">
import axios from "axios";
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useUserStore } from "@/stores/userStore";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
    if (!route.query.code) {
        router.push("/login");
    }

    if (route.path === "/auth/register") {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/auth/register?code=${route.query.code}&redirectUri=${import.meta.env.VITE_CALLBACK_URL}/auth/register`,
            );

            userStore.setTokens({
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
            });
            router.push("/login/link");
        } catch (e) {
            router.push("/login?error=true");
        }
    } else {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/auth/signin?code=${route.query.code}&redirectUri=${import.meta.env.VITE_CALLBACK_URL}/auth`,
            );

            userStore.setTokens({
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
            });
            router.push("/");
        } catch (e) {
            router.push("/login?error=true");
        }
    }
});
</script>

<template>
    <div class="w-full h-[70vh] flex justify-center items-center">
        <svg
            class="animate-spin h-14 w-14 text-primary-900"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
            ></circle>
            <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    </div>
</template>
