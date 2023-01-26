<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useUserStore } from "@/stores/userStore";
import { onMounted } from "vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

onMounted(() => {
    if (!urlParams.has("code")) {
        router.push("/login");
    }

    if (route.path === "/auth/register") {
        axios
            .get(
                `http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/auth/register?code=${urlParams.get(
                    "code",
                )}&redirectUri=http://localhost:5173/auth/register`,
            )
            .then(response => {
                userStore.accessToken = response.data.accessToken;
                localStorage.setItem(
                    "refreshToken",
                    response.data.refreshToken,
                );
                router.push("/login/link");
            })
            .catch(e => {
                router.push("/login?error=true");
            });
    } else {
        axios
            .get(
                `http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/auth/signin?code=${urlParams.get(
                    "code",
                )}&redirectUri=http://localhost:5173/auth`,
            )
            .then(response => {
                userStore.accessToken = response.data.accessToken;
                localStorage.setItem(
                    "refreshToken",
                    response.data.refreshToken,
                );
                router.push("/");
            })
            .catch(e => {
                router.push("/login?error=true");
            });
    }
});
</script>

<template>
    <div class="w-full h-[90vh] flex justify-center items-center">
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

<style scoped></style>
