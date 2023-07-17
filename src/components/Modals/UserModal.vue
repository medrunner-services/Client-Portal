<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { ampli } from "@/ampli";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";

const { t, te } = useI18n();

const userStore = useUserStore();
const logicStore = useLogicStore();

const emit = defineEmits(["disconnectUser", "gotoDevView"]);

const isInputtingRsiHandle = ref(false);
const newRsiHandle = ref(userStore.user.rsiHandle);
const rsiHandleErrorMessage = ref("");
const updateNotificationError = ref("");
const rsiHandleUpdating = ref(false);
const displayFullUpdateNotes = ref(false);
const notificationCheckbox = ref(logicStore.isNotificationGranted);
const darkModeCheckbox = ref(logicStore.darkMode);
const analyticsCheckbox = ref(logicStore.isAnalyticsAllowed);
// eslint-disable-next-line no-undef
const appVersion = APP_VERSION;

async function updateRsiHandle(): Promise<void> {
    if (!isInputtingRsiHandle.value) {
        isInputtingRsiHandle.value = true;
        return;
    }

    rsiHandleUpdating.value = true;
    try {
        if (newRsiHandle.value) {
            await userStore.linkUser(newRsiHandle.value);
        }

        isInputtingRsiHandle.value = false;
        rsiHandleUpdating.value = false;
        rsiHandleErrorMessage.value = "";
    } catch (error: any) {
        if (error.statusCode === 451) rsiHandleErrorMessage.value = t("error_blockedUser");
        else if (error.statusCode === 403) rsiHandleErrorMessage.value = t("error_noIdRsiBio");
        else if (error.statusCode === 404) rsiHandleErrorMessage.value = t("error_unknownRsiAccount");
        else if (error.statusCode === 409) rsiHandleErrorMessage.value = t("error_rsiAccountLinked");
        else if (error.statusCode === 429) rsiHandleErrorMessage.value = t("error_rateLimit");
        else rsiHandleErrorMessage.value = t("error_generic");

        rsiHandleUpdating.value = false;
    }
}

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
        ampli.client.setOptOut(true);
        ampli.client.flush();

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
    <div class="border-b border-gray-200 pb-5 dark:border-stone-700">
        <div class="mt-2 flex flex-col justify-between lg:flex-row lg:items-center">
            <input
                v-if="isInputtingRsiHandle"
                type="text"
                v-model="newRsiHandle"
                class="w-fit flex-grow"
                :class="[rsiHandleErrorMessage ? 'input-text-error' : 'input-text', userStore.user.personType !== 0 ? 'w-fit' : '']"
                :disabled="!isInputtingRsiHandle"
            />
            <p v-else class="font-Mohave text-3xl font-bold text-primary-900 lg:text-3xl">{{ userStore.user.rsiHandle }}</p>
            <button
                v-if="userStore.user.personType === 0"
                :disabled="rsiHandleUpdating"
                @click.prevent="updateRsiHandle()"
                class="mt-3 flex w-fit items-center justify-center border-2 border-primary-900 px-5 py-2 font-Inter font-bold lg:mt-0 lg:px-10"
                :class="[isInputtingRsiHandle ? 'ml-0 lg:ml-3' : 'ml-0']"
            >
                <svg
                    v-if="rsiHandleUpdating"
                    class="mx-5 h-5 w-5 animate-spin text-primary-900"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <span v-else>{{ isInputtingRsiHandle ? t("form_confirm") : t("form_edit") }}</span>
            </button>
        </div>
        <p v-if="rsiHandleErrorMessage" class="mt-2 w-full text-xs text-primary-400">
            {{ rsiHandleErrorMessage }}
        </p>
    </div>

    <div v-auto-animate class="border-b border-gray-200 py-5 dark:border-stone-700">
        <p class="font-Mohave text-2xl font-semibold text-primary-900">{{ t("user_whatsNew") }}</p>
        <p class="mt-2 font-semibold">{{ t("user_newFeaturesTitle") }} ✨</p>
        <ul class="list-inside list-disc">
            <li>
                Added analytics for technical data, no personal or identifiable data is collected (no localisation, no ip adresses...). This can be
                turned off in the user settings.
            </li>
        </ul>
        <div v-if="displayFullUpdateNotes">
            <p class="mt-4 font-semibold">{{ t("user_bugFixesTitle") }} 🐛</p>
            <ul class="list-inside list-disc">
                <li>Missing asterisks on required inputs</li>
                <li>Api token copy icon stays black in dark mode</li>
                <li>Error messages not displaying on login page</li>
                <li>Login page was blank on iOS Safari</li>
            </ul>
            <p class="mt-4 font-semibold">{{ t("user_improvementsTitle") }} 🛠️</p>
            <ul class="list-inside list-disc">
                <li>API tokens expiration date is now red when reached</li>
                <li>Added a 404 page so that you know when you are lost</li>
                <li>Added some missing animations</li>
            </ul>
        </div>
        <p v-else class="mt-2 w-fit cursor-pointer font-semibold" @click="displayFullUpdateNotes = true">[...]</p>
    </div>

    <div class="border-b border-gray-200 py-5 dark:border-stone-700">
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
    </div>

    <div class="border-b border-gray-200 py-5 dark:border-stone-700">
        <p @click="$emit('gotoDevView')" class="mb-2 w-fit cursor-pointer font-semibold underline decoration-2">{{ t("user_developerLink") }}</p>
        <div class="w-fit cursor-pointer">
            <a
                href="https://www.medrunner.space/legal-information"
                target="_blank"
                class="flex w-fit items-center font-semibold underline decoration-2"
            >
                <span>{{ t("user_privacyPolicyLink") }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" stroke-width="1.5" stroke="currentColor" class="ml-1 h-3 w-3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
            </a>
        </div>
    </div>

    <div class="mt-16 lg:flex lg:items-end lg:justify-between">
        <button @click="emit('disconnectUser')" class="button-primary button-48 w-full lg:w-fit">
            {{ t("navbar_disconnect") }}
        </button>

        <p class="mt-5 w-fit text-xs lg:mt-0">v{{ appVersion }}</p>
    </div>
</template>

<style scoped></style>
