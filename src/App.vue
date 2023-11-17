<script setup lang="ts">
import type { Person } from "@medrunner-services/api-client";
import { HubConnectionState } from "@microsoft/signalr";
import { onMounted } from "vue";
import { RouterView, useRoute } from "vue-router";

import GlobalFooter from "@/components/GlobalFooter.vue";
import NavbarContainer from "@/components/Navbar/NavbarContainer.vue";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";
import { ws } from "@/utils/medrunnerClient";

const logicStore = useLogicStore();
const userStore = useUserStore();
const route = useRoute();

onMounted(() => {
    if (
        (window.matchMedia("(prefers-color-scheme: dark)").matches && localStorage.getItem("darkMode") == null) ||
        localStorage.getItem("darkMode") === "true"
    ) {
        document.documentElement.classList.add("dark");
        logicStore.darkMode = true;
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
    <div class="flex min-h-screen flex-col dark:bg-gray-800 dark:text-white">
        <NavbarContainer v-if="route.name !== 'login' && route.name !== 'loginLink' && route.name !== 'auth' && route.name !== '404'" />
        <RouterView
            class="w-full flex-grow"
            :class="route.name === 'login' || route.name === 'loginLink' || route.name === 'auth' ? 'my-0' : 'my-14'"
        />
        <GlobalFooter v-if="route.name !== 'login' && route.name !== 'loginLink' && route.name !== 'auth'" />
    </div>
</template>

<style scoped></style>
