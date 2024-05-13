<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouterView, useRoute, useRouter } from "vue-router";

import GlobalFooter from "@/components/GlobalFooter.vue";
import NavbarContainer from "@/components/Navbar/NavbarContainer.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalLoader from "@/components/utils/GlobalLoader.vue";
import { initializeApp } from "@/utils/initializeApp";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const isLoadingPage = ref(true);
const errorLoadingPage = ref(false);

onMounted(async () => {
    isLoadingPage.value = true;

    try {
        await router.isReady();
    } catch (e) {
        errorLoadingPage.value = true;
    } finally {
        isLoadingPage.value = false;
    }

    await initializeApp();
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
