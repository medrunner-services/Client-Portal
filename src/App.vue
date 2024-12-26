<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
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
import { WSState } from "@/types.ts";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const alertStore = useAlertStore();
const logicStore = useLogicStore();

const isLoadingPage = ref(true);
const errorLoadingPage = ref(false);

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

const showMOTDAlertBanner = computed(() => {
    const now = new Date();
    const messageOfTheDay = logicStore.medrunnerSettings?.messageOfTheDay;
    const dateRange = messageOfTheDay?.dateRange;

    return (
        logicStore.isMOTDBannerVisible &&
        messageOfTheDay &&
        messageOfTheDay.message &&
        (!dateRange || (now >= new Date(dateRange.startDate) && now <= new Date(dateRange.endDate)))
    );
});

const showWSAlertBanner = computed(() => {
    return logicStore.currentWSState === WSState.RECONNECTING || logicStore.currentWSState === WSState.DISCONNECTED;
});

const getWSAlertBannerMessage = computed(() => {
    return logicStore.currentWSState === WSState.RECONNECTING ? t("error_webSocketReconnection") : t("error_webSocketDisconnected");
});

function reloadPage() {
    window.location.reload();
}
</script>

<template>
    <div>
        <GlobalAlert v-if="alertStore.showAlert" />

        <AlertBanner
            v-if="route.name !== 'login' && route.name !== 'loginLink' && route.name !== 'auth' && route.name !== 'redeem' && showWSAlertBanner"
            icon="warning"
            :message="getWSAlertBannerMessage"
            :show-button="logicStore.currentWSState !== WSState.RECONNECTING"
            :color="logicStore.currentWSState === WSState.RECONNECTING ? 'yellow' : 'red'"
            font-weight="medium"
            :button-text="logicStore.currentWSState === WSState.DISCONNECTED ? t('home_reload') : undefined"
            :button-function="logicStore.currentWSState === WSState.DISCONNECTED ? () => reloadPage() : undefined"
        />

        <div class="flex min-h-screen flex-col dark:bg-gray-800 dark:text-white">
            <NavbarContainer
                v-if="
                    route.name !== 'login' && route.name !== 'loginLink' && route.name !== 'auth' && route.name !== 'redeem' && route.name !== '404'
                "
            />

            <AlertBanner
                v-if="route.name !== 'login' && route.name !== 'loginLink' && route.name !== 'auth' && route.name !== 'redeem' && showMOTDAlertBanner"
                :message="logicStore!.medrunnerSettings!.messageOfTheDay!.message"
                :show-button="true"
                :button-function="
                    () => {
                        logicStore.isMOTDBannerVisible = false;
                    }
                "
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
                :class="
                    route.name === 'login' || route.name === 'loginLink' || route.name === 'auth' || route.name === 'redeem'
                        ? 'my-0'
                        : logicStore.isMOTDBannerVisible
                          ? 'mb-14 mt-6'
                          : 'my-14'
                "
            />
            <GlobalFooter v-if="route.name !== 'login' && route.name !== 'loginLink' && route.name !== 'auth' && route.name !== 'redeem'" />
        </div>

        <NotificationPermissionModal v-if="logicStore.showNotificationPermissionModal" @close="logicStore.showNotificationPermissionModal = false" />
    </div>
</template>

<style scoped></style>
