<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouterView, useRoute, useRouter } from "vue-router";

import GlobalFooter from "@/components/GlobalFooter.vue";
import NotificationPermissionModal from "@/components/Modals/NotificationPermissionModal.vue";
import AlertBanner from "@/components/Navbar/AlertBanner.vue";
import NavbarContainer from "@/components/Navbar/NavbarContainer.vue";
import GlobalAlert from "@/components/utils/GlobalAlert.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalLoader from "@/components/utils/GlobalLoader.vue";
import { useAlertStore } from "@/stores/alertStore";
import { useLogicStore } from "@/stores/logicStore.ts";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const alertStore = useAlertStore();
const logicStore = useLogicStore();

const isLoadingPage = ref(true);
const errorLoadingPage = ref(false);
const showAlertBanner = ref(false);

onMounted(async () => {
    isLoadingPage.value = true;

    try {
        await router.isReady();
    } catch (_e) {
        errorLoadingPage.value = true;
    } finally {
        isLoadingPage.value = false;
    }
});
</script>

<template>
    <div>
        <GlobalAlert v-if="alertStore.showAlert" />

        <div class="flex min-h-screen flex-col dark:bg-gray-800 dark:text-white">
            <NavbarContainer
                v-if="
                    route.name !== 'login' && route.name !== 'loginLink' && route.name !== 'auth' && route.name !== 'redeem' && route.name !== '404'
                "
            />

            <AlertBanner
                v-if="route.name !== 'login' && route.name !== 'loginLink' && route.name !== 'auth' && route.name !== 'redeem' && showAlertBanner"
            />

            <div v-if="isLoadingPage || logicStore.isRouterLoading" class="flex w-full flex-grow items-center justify-center">
                <GlobalLoader width="w-16" height="h-16" text-size="text-lg" spacing="mb-6" />
            </div>

            <div v-else-if="errorLoadingPage" class="flex w-full flex-grow items-center justify-center">
                <GlobalErrorText :text="t('error_globalLoading')" />
            </div>

            <RouterView
                v-else
                class="w-full flex-grow"
                :class="route.name === 'login' || route.name === 'loginLink' || route.name === 'auth' || route.name === 'redeem' ? 'my-0' : 'my-14'"
            />
            <GlobalFooter v-if="route.name !== 'login' && route.name !== 'loginLink' && route.name !== 'auth' && route.name !== 'redeem'" />
        </div>

        <NotificationPermissionModal v-if="logicStore.showNotificationPermissionModal" @close="logicStore.showNotificationPermissionModal = false" />
    </div>
</template>

<style scoped></style>
