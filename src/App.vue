<script setup lang="ts">
import type { Person } from "@medrunner-services/api-client";
import { HubConnectionState } from "@microsoft/signalr";
import { onMounted } from "vue";
import { RouterView, useRoute } from "vue-router";

import Loader from "@/components/Loader.vue";
import Navbar from "@/components/Navbar.vue";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";
import { ws } from "@/utils/medrunnerClient";

const route = useRoute();
const logicStore = useLogicStore();
const userStore = useUserStore();

onMounted(() => {
    if (
        (window.matchMedia("(prefers-color-scheme: dark)").matches && localStorage.getItem("darkMode") == null) ||
        localStorage.getItem("darkMode") === "true"
    ) {
        document.documentElement.classList.add("dark");
        logicStore.darkMode = true;
    }

    if (!document.getElementById("uptime-alerts")) {
        const scriptTag = document.createElement("script");
        scriptTag.id = "uptime-alerts";
        scriptTag.type = "text/javascript";
        scriptTag.src = "https://uptime.betterstack.com/widgets/announcement.js";
        scriptTag.async = true;
        scriptTag.setAttribute("data-id", import.meta.env.VITE_BETTERUPTIME_ID);
        document.getElementsByTagName("head")[0].appendChild(scriptTag);
    }

    if (ws && ws.state === HubConnectionState.Connected) {
        ws.on("PersonUpdate", (newUser: Person) => {
            userStore.user = newUser;
        });

        ws.onreconnected(async () => {
            userStore.user = await userStore.fetchUser();
        });
    }
});
</script>

<template>
    <div class="min-h-screen dark:bg-stone-900 dark:text-slate-50">
        <Navbar v-if="route.name !== 'login' && route.name !== 'loginLink' && route.name !== 'auth'" />

        <Loader v-if="logicStore.isRouterLoading" class="flex h-[90vh] w-full items-center justify-center" />
        <RouterView v-else :class="{ 'py-14 lg:py-20': route.name !== 'login' && route.name !== 'loginLink' }" />
    </div>
</template>

<style scoped></style>
