<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView, useRoute } from "vue-router";

import Loader from "@/components/Loader.vue";
import Navbar from "@/components/Navbar.vue";
import { useLogicStore } from "@/stores/logicStore";

const route = useRoute();
const logicStore = useLogicStore();

onMounted(() => {
    if (
        Notification.permission === "default" &&
        (localStorage.getItem("notificationActivated") == null || localStorage.getItem("notificationActivated") === "true")
    ) {
        Notification.requestPermission().then(permission => {
            if (permission == "granted") {
                logicStore.isNotificationGranted = true;
                localStorage.setItem("notificationActivated", "true");
            }
        });
    }

    if (
        (window.matchMedia("(prefers-color-scheme: dark)").matches && localStorage.getItem("darkMode") == null) ||
        localStorage.getItem("darkMode") === "true"
    ) {
        document.documentElement.classList.add("dark");
        logicStore.darkMode = true;
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
