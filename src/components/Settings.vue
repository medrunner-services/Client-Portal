<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { ampli } from "@/ampli";
import { useLogicStore } from "@/stores/logicStore";

const { t } = useI18n();
const logicStore = useLogicStore();

const updateNotificationError = ref("");
const notificationCheckbox = ref(logicStore.isNotificationGranted);
const darkModeCheckbox = ref(logicStore.darkMode);
const analyticsCheckbox = ref(logicStore.isAnalyticsAllowed);

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
                .then(permission => {
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
    <div class="flex items-center justify-between">
        <span class="font-semibold">{{ t("user_notificationSetting") }}</span>
        <label class="relative mr-5 inline-flex cursor-pointer items-center">
            <input @click="updateNotificationPerms" type="checkbox" v-model="notificationCheckbox" class="peer sr-only" />
            <div
                class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-900 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-900/30 dark:bg-stone-800"
            ></div>
        </label>
    </div>
    <p v-if="updateNotificationError" class="mt-2 w-full text-xs text-primary-400">{{ updateNotificationError }}</p>
    <div class="mt-2 flex items-center justify-between">
        <span class="font-semibold">{{ t("user_darkModeSetting") }}</span>
        <label class="relative mr-5 inline-flex cursor-pointer items-center">
            <input @click="updateDarkMode" type="checkbox" v-model="darkModeCheckbox" class="peer sr-only" />
            <div
                class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-900 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-900/30 dark:bg-stone-800"
            ></div>
        </label>
    </div>
    <div class="mt-2 flex items-center justify-between">
        <span class="font-semibold">{{ t("user_analyticsSetting") }}</span>
        <label class="relative mr-5 inline-flex cursor-pointer items-center">
            <input @click="updateAnalytics" type="checkbox" v-model="analyticsCheckbox" class="peer sr-only" />
            <div
                class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-900 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-900/30 dark:bg-stone-700"
            ></div>
        </label>
    </div>
    <p class="mt-1 text-xs italic">{{ t("user_analyticsDisclaimer") }}</p>
</template>

<style scoped></style>
