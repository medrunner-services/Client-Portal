<script setup lang="ts">
import type { Person } from "@medrunner-services/api-client";
import { HubConnectionState } from "@microsoft/signalr";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouterView, useRoute, useRouter } from "vue-router";

import GlobalFooter from "@/components/GlobalFooter.vue";
import NavbarContainer from "@/components/Navbar/NavbarContainer.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalLoader from "@/components/utils/GlobalLoader.vue";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";
import { ws } from "@/utils/medrunnerClient";

const logicStore = useLogicStore();
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const isLoadingPage = ref(true);
const errorLoadingPage = ref(false);

onMounted(async () => {
    isLoadingPage.value = true;

    if (
        (window.matchMedia("(prefers-color-scheme: dark)").matches && localStorage.getItem("darkMode") == null) ||
        localStorage.getItem("darkMode") === "true"
    ) {
        document.documentElement.classList.add("dark");
        logicStore.darkMode = true;
    }

    try {
        await router.isReady();
    } catch (e) {
        errorLoadingPage.value = true;
    } finally {
        isLoadingPage.value = false;
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

        <div v-if="isLoadingPage" class="flex w-full flex-grow items-center justify-center">
            <GlobalLoader width="w-16" height="h-16" text-size="text-lg" spacing="mb-6" />
        </div>

        <div v-else-if="errorLoadingPage" class="flex w-full flex-grow items-center justify-center">
            <GlobalErrorText :text="t('error_globalLoading')" />
        </div>

        <RouterView
            class="w-full flex-grow"
            :class="route.name === 'login' || route.name === 'loginLink' || route.name === 'auth' ? 'my-0' : 'my-14'"
        />
        <GlobalFooter v-if="route.name !== 'login' && route.name !== 'loginLink' && route.name !== 'auth'" />
    </div>
</template>

<style scoped></style>
