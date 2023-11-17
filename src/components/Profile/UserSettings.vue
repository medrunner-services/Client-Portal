<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { ampli } from "@/ampli";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalToggle from "@/components/utils/GlobalToggle.vue";
import { useLogicStore } from "@/stores/logicStore";

const { t } = useI18n();
const logicStore = useLogicStore();

const notificationCheckbox = ref(logicStore.isNotificationGranted);
const darkModeCheckbox = ref(logicStore.darkMode);
const analyticsCheckbox = ref(logicStore.isAnalyticsAllowed);
const updateNotificationError = ref("");

function updateNotificationPerms(): void {
    if (logicStore.isNotificationGranted) {
        notificationCheckbox.value = false;
        logicStore.isNotificationGranted = false;
        localStorage.setItem("notificationActivated", "false");
    } else {
        if ("Notification" in window && Notification.permission === "granted") {
            notificationCheckbox.value = true;
            logicStore.isNotificationGranted = true;
            localStorage.setItem("notificationActivated", "true");
        } else if ("Notification" in window) {
            Notification.requestPermission()
                .then((permission) => {
                    if (permission === "granted") {
                        notificationCheckbox.value = true;
                        updateNotificationError.value = "";
                        logicStore.isNotificationGranted = true;
                        localStorage.setItem("notificationActivated", "true");
                    } else {
                        notificationCheckbox.value = false;
                        logicStore.isNotificationGranted = false;
                        updateNotificationError.value = t("error_notificationPermissions");
                    }
                })
                .catch(() => {
                    notificationCheckbox.value = false;
                    logicStore.isNotificationGranted = false;
                    updateNotificationError.value = t("error_generic");
                });
        }
    }
}

function updateDarkMode(): void {
    if (darkModeCheckbox.value) {
        document.documentElement.classList.remove("dark");
        darkModeCheckbox.value = false;
        logicStore.darkMode = false;
        localStorage.setItem("darkMode", "false");
    } else {
        document.documentElement.classList.add("dark");
        darkModeCheckbox.value = true;
        logicStore.darkMode = true;
        localStorage.setItem("darkMode", "true");
    }
}

function updateAnalytics(): void {
    if (analyticsCheckbox.value) {
        if (ampli.isLoaded) {
            ampli.client.setOptOut(true);
            ampli.client.flush();
        }

        analyticsCheckbox.value = false;
        logicStore.isAnalyticsAllowed = false;
        localStorage.setItem("analyticsActivated", "false");
    } else {
        analyticsCheckbox.value = true;
        logicStore.isAnalyticsAllowed = true;
        localStorage.setItem("analyticsActivated", "true");
    }
}
</script>

<template>
    <div>
        <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("user_settings") }}</h2>
        <GlobalCard class="mt-4 flex flex-col items-center justify-center">
            <div class="w-full">
                <GlobalToggle
                    @input-click="updateNotificationPerms()"
                    v-model="notificationCheckbox"
                    :helper="t('user_helperNotificationSetting')"
                    side="right"
                    :error-text="updateNotificationError"
                    >{{ t("user_notificationSetting") }}</GlobalToggle
                >
                <GlobalToggle
                    @input-click="updateDarkMode()"
                    v-model="darkModeCheckbox"
                    :helper="t('user_helperDarkModeSetting')"
                    side="right"
                    class="mt-4"
                    >{{ t("user_darkModeSetting") }}</GlobalToggle
                >
                <GlobalToggle
                    @input-click="updateAnalytics()"
                    v-model="analyticsCheckbox"
                    :helper="t('user_analyticsDisclaimer')"
                    side="right"
                    class="mt-4"
                    >{{ t("user_analyticsSetting") }}</GlobalToggle
                >
            </div>
        </GlobalCard>
    </div>
</template>

<style scoped></style>
