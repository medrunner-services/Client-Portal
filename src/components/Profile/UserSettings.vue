<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import GlobalToggle from "@/components/utils/GlobalToggle.vue";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";
import { LocalStorageItems, MessageNotification } from "@/types";
import { usePostHog } from "@/usePostHog";
import { errorString } from "@/utils/functions/stringFunctions.ts";

const { t } = useI18n();
const logicStore = useLogicStore();
const userStore = useUserStore();
const route = useRoute();
const { posthog } = usePostHog();

const updateNotificationError = ref("");
const updateHourFormatingError = ref("");
const resetSettingsError = ref("");
const isResettingSettings = ref(false);

async function updateGlobalNotificationPerms(): Promise<void> {
    updateNotificationError.value = "";
    let newNotificationState = false;

    if (!logicStore.isNotificationGranted) {
        if ("Notification" in window && Notification.permission === "granted") {
            newNotificationState = true;
        } else if ("Notification" in window) {
            try {
                const permission = await Notification.requestPermission();

                if (permission === "granted") {
                    newNotificationState = true;
                } else {
                    logicStore.isNotificationGranted = false;
                    updateNotificationError.value = t("error_notificationPermissions");
                }
            } catch (error: any) {
                logicStore.isNotificationGranted = false;
                updateNotificationError.value = errorString(error.statusCode);
            }
        }
    }

    if (!updateNotificationError.value) {
        try {
            await userStore.setSettings({ globalNotifications: newNotificationState });
        } catch (error: any) {
            logicStore.isNotificationGranted = !newNotificationState;
            updateNotificationError.value = errorString(error.statusCode);
        }
    }
}

async function updateCustomSoundNotification() {
    try {
        await userStore.setSettings({ customSoundNotification: !userStore.syncedSettings.customSoundNotification });
    } catch (error: any) {
        userStore.syncedSettings.customSoundNotification = !userStore.syncedSettings.customSoundNotification;
        updateNotificationError.value = errorString(error.statusCode);
    }
}

async function updateEmergencyUpdateNotification() {
    try {
        await userStore.setSettings({ emergencyUpdateNotification: !userStore.syncedSettings.emergencyUpdateNotification });
    } catch (error: any) {
        userStore.syncedSettings.emergencyUpdateNotification = !userStore.syncedSettings.emergencyUpdateNotification;
        updateNotificationError.value = errorString(error.statusCode);
    }
}

async function updateMessageNotification() {
    try {
        await userStore.setSettings({ chatMessageNotification: userStore.syncedSettings.chatMessageNotification });
    } catch (error: any) {
        updateNotificationError.value = errorString(error.statusCode);
    }
}

async function updateHourFormatingPreference() {
    try {
        updateHourFormatingError.value = "";
        await userStore.setSettings({ hourFormatingPreference: userStore.syncedSettings.hour12FormatingPreference });
    } catch (error: any) {
        updateHourFormatingError.value = errorString(error.statusCode);
    }
}

function updateDarkMode(): void {
    if (logicStore.darkMode) {
        document.documentElement.classList.remove("dark");
        logicStore.darkMode = false;
        localStorage.setItem(LocalStorageItems.DARK_MODE, "false");
    } else {
        document.documentElement.classList.add("dark");
        logicStore.darkMode = true;
        localStorage.setItem(LocalStorageItems.DARK_MODE, "true");
    }
}

function updateDiscordOpen(): void {
    if (logicStore.isDiscordOpenWeb) {
        logicStore.isDiscordOpenWeb = false;
        localStorage.setItem(LocalStorageItems.IS_DISCORD_OPEN_WEB, "false");
    } else {
        logicStore.isDiscordOpenWeb = true;
        localStorage.setItem(LocalStorageItems.IS_DISCORD_OPEN_WEB, "true");
    }
}

async function updateAnalytics(): Promise<void> {
    let newAnalyticsState = true;

    if (userStore.syncedSettings.globalAnalytics) newAnalyticsState = false;

    try {
        await userStore.setSettings({ globalAnalytics: newAnalyticsState });
    } catch (error: any) {
        userStore.syncedSettings.globalAnalytics = !newAnalyticsState;
        updateNotificationError.value = errorString(error.statusCode);
    }

    if (userStore.syncedSettings.globalAnalytics) {
        posthog.opt_in_capturing();
    } else {
        posthog.opt_out_capturing();
    }
}

function updateDebugLogger(): void {
    if (logicStore.isDebugLoggerEnabled) {
        logicStore.isDebugLoggerEnabled = false;
        localStorage.setItem(LocalStorageItems.IS_DEBUG_LOGGER_ENABLED, "false");
    } else {
        logicStore.isDebugLoggerEnabled = true;
        localStorage.setItem(LocalStorageItems.IS_DEBUG_LOGGER_ENABLED, "true");
    }
}

async function resetSettings() {
    isResettingSettings.value = true;

    try {
        if (userStore.isAuthenticated) {
            await userStore.setSettings({
                globalNotifications: null,
                customSoundNotification: null,
                emergencyUpdateNotification: null,
                chatMessageNotification: null,
                globalAnalytics: null,
                hourFormatingPreference: null,
            });
        }
    } catch (error: any) {
        resetSettingsError.value = errorString(error.statusCode);
    } finally {
        logicStore.isNotificationGranted = "Notification" in window && Notification.permission === "granted";
        userStore.syncedSettings.customSoundNotification = true;
        userStore.syncedSettings.emergencyUpdateNotification = true;
        userStore.syncedSettings.chatMessageNotification = MessageNotification.ALL;
        userStore.syncedSettings.globalAnalytics = true;
        userStore.syncedSettings.hour12FormatingPreference = undefined;
        logicStore.darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        logicStore.isDiscordOpenWeb = false;

        localStorage.removeItem(LocalStorageItems.DARK_MODE);
        localStorage.removeItem(LocalStorageItems.IS_DEBUG_LOGGER_ENABLED);

        if (logicStore.darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        isResettingSettings.value = false;
    }
}
</script>

<template>
    <div>
        <div class="min-h-11">
            <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("user_settings") }}</h2>
        </div>

        <GlobalCard class="mt-4 flex flex-col items-center justify-center">
            <div class="w-full">
                <div v-if="route.name !== 'login'">
                    <GlobalToggle
                        v-model="logicStore.isNotificationGranted"
                        :helper="t('user_helperNotificationSetting')"
                        side="right"
                        @input-click="updateGlobalNotificationPerms()"
                        >{{ t("user_notificationSetting") }}
                    </GlobalToggle>
                    <GlobalErrorText
                        v-if="updateNotificationError"
                        :text="updateNotificationError"
                        :icon="false"
                        class="mt-2 text-sm font-semibold"
                    />

                    <div class="ml-4 md:ml-8">
                        <GlobalToggle
                            v-model="userStore.syncedSettings.emergencyUpdateNotification"
                            :disabled="!logicStore.isNotificationGranted"
                            size="small"
                            :helper="t('user_helperNotificationEmergencyUpdateSetting')"
                            @input-click="updateEmergencyUpdateNotification()"
                            >{{ t("user_notificationEmergencyUpdateSetting") }}
                        </GlobalToggle>
                        <GlobalSelectInput
                            v-model="userStore.syncedSettings.chatMessageNotification"
                            :disabled="!logicStore.isNotificationGranted"
                            :label="t('user_notificationChatMessageSetting')"
                            :helper="t('user_helperNotificationChatMessageSetting')"
                            helper-type="text"
                            input-position="row"
                            label-size="small"
                            input-size="small"
                            :options="[
                                { value: MessageNotification.ALL, label: t('user_notificationChatMessageSettingAll') },
                                { value: MessageNotification.PING, label: t('user_notificationChatMessageSettingPing') },
                                { value: MessageNotification.OFF, label: t('user_notificationChatMessageSettingOff') },
                            ]"
                            @change="updateMessageNotification()"
                        />
                        <GlobalToggle
                            v-model="userStore.syncedSettings.customSoundNotification"
                            :disabled="!logicStore.isNotificationGranted"
                            size="small"
                            :helper="t('user_helperNotificationCustomSoundSetting')"
                            @input-click="updateCustomSoundNotification()"
                            >{{ t("user_notificationCustomSoundSetting") }}
                        </GlobalToggle>
                    </div>

                    <div class="mt-4">
                        <GlobalSelectInput
                            v-model="userStore.syncedSettings.hour12FormatingPreference"
                            :label="t('user_timeFormatSetting')"
                            :helper="t('user_timeFormatSettingHelper')"
                            helper-type="text"
                            input-position="row"
                            input-size="small"
                            :options="[
                                { value: undefined, label: t('user_timeFormatSettingAutomatic') },
                                { value: false, label: t('user_timeFormatSetting24h') },
                                { value: true, label: t('user_timeFormatSetting12h') },
                            ]"
                            @change="updateHourFormatingPreference()"
                        />
                        <GlobalErrorText
                            v-if="updateHourFormatingError"
                            :icon="false"
                            class="text-sm"
                            weight="font-medium"
                            :text="updateHourFormatingError"
                        />
                    </div>
                </div>

                <GlobalToggle
                    v-model="logicStore.darkMode"
                    :helper="t('user_helperDarkModeSetting')"
                    side="right"
                    class="mt-2"
                    @input-click="updateDarkMode()"
                    >{{ t("user_darkModeSetting") }}</GlobalToggle
                >
                <GlobalToggle
                    v-model="userStore.syncedSettings.globalAnalytics"
                    :helper="t('user_analyticsDisclaimer')"
                    side="right"
                    class="mt-4"
                    @input-click="updateAnalytics()"
                    >{{ t("user_analyticsSetting") }}</GlobalToggle
                >
                <GlobalToggle
                    v-model="logicStore.isDiscordOpenWeb"
                    :helper="t('user_helperDiscordLinkSetting')"
                    side="right"
                    class="mt-4"
                    @input-click="updateDiscordOpen()"
                    >{{ t("user_discordLinkSetting") }}</GlobalToggle
                >
                <GlobalToggle
                    v-model="logicStore.isDebugLoggerEnabled"
                    :helper="t('user_helperDebugModeSetting')"
                    side="right"
                    class="mt-4"
                    @input-click="updateDebugLogger()"
                    >{{ t("user_debugModeSetting") }}</GlobalToggle
                >
            </div>

            <div class="mt-8 flex w-full">
                <GlobalButton type="outline" class="ml-auto w-full lg:w-fit" :disabled="isResettingSettings" size="full" @click="resetSettings()">{{
                    t("user_resetSettings")
                }}</GlobalButton>
                <GlobalErrorText v-if="resetSettingsError" :text="resetSettingsError" :icon="false" class="mt-2 text-sm font-semibold" />
            </div>
        </GlobalCard>
    </div>
</template>

<style scoped></style>
