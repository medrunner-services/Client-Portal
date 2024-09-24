<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import GlobalToggle from "@/components/utils/GlobalToggle.vue";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";
import { MessageNotification } from "@/types";
import { errorString } from "@/utils/stringUtils";

const { t } = useI18n();
const logicStore = useLogicStore();
const userStore = useUserStore();
const route = useRoute();

const updateNotificationError = ref("");
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
        await userStore.setSettings({ customSoundNotification: !logicStore.customSoundNotification });
    } catch (error: any) {
        logicStore.customSoundNotification = !logicStore.customSoundNotification;
        updateNotificationError.value = errorString(error.statusCode);
    }
}

async function updateEmergencyUpdateNotification() {
    try {
        await userStore.setSettings({ emergencyUpdateNotification: !logicStore.emergencyUpdateNotification });
    } catch (error: any) {
        logicStore.emergencyUpdateNotification = !logicStore.emergencyUpdateNotification;
        updateNotificationError.value = errorString(error.statusCode);
    }
}

async function updateMessageNotification() {
    try {
        await userStore.setSettings({ chatMessageNotification: logicStore.chatMessageNotification });
    } catch (error: any) {
        updateNotificationError.value = errorString(error.statusCode);
        logicStore.chatMessageNotification = userStore.user.clientPortalPreferences.chatMessageNotification as MessageNotification;
    }
}

function updateDarkMode(): void {
    if (logicStore.darkMode) {
        document.documentElement.classList.remove("dark");
        logicStore.darkMode = false;
        localStorage.setItem("darkMode", "false");
    } else {
        document.documentElement.classList.add("dark");
        logicStore.darkMode = true;
        localStorage.setItem("darkMode", "true");
    }
}

function updateDiscordOpen(): void {
    if (logicStore.isDiscordOpenWeb) {
        logicStore.isDiscordOpenWeb = false;
        localStorage.setItem("isDiscordOpenWeb", "false");
    } else {
        logicStore.isDiscordOpenWeb = true;
        localStorage.setItem("isDiscordOpenWeb", "true");
    }
}

async function updateAnalytics(): Promise<void> {
    let newAnalyticsState = true;

    if (logicStore.isAnalyticsAllowed) {
        newAnalyticsState = false;
    }

    try {
        await userStore.setSettings({ globalAnalytics: newAnalyticsState });
    } catch (error: any) {
        logicStore.isAnalyticsAllowed = !newAnalyticsState;
        updateNotificationError.value = errorString(error.statusCode);
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
            });
        }
    } catch (error: any) {
        resetSettingsError.value = errorString(error.statusCode);
    } finally {
        logicStore.isNotificationGranted = "Notification" in window && Notification.permission === "granted";
        logicStore.customSoundNotification = true;
        logicStore.emergencyUpdateNotification = true;
        logicStore.chatMessageNotification = MessageNotification.ALL;
        logicStore.darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        logicStore.isAnalyticsAllowed = true;
        logicStore.isDiscordOpenWeb = false;

        localStorage.removeItem("darkMode");
        localStorage.removeItem("isDiscordOpenWeb");

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
                        :error-text="updateNotificationError"
                        @input-click="updateGlobalNotificationPerms()"
                        >{{ t("user_notificationSetting") }}
                    </GlobalToggle>

                    <div class="ml-4 md:ml-8">
                        <GlobalToggle
                            v-model="logicStore.emergencyUpdateNotification"
                            :disabled="!logicStore.isNotificationGranted"
                            size="small"
                            :helper="t('user_helperNotificationEmergencyUpdateSetting')"
                            @input-click="updateEmergencyUpdateNotification()"
                            >{{ t("user_notificationEmergencyUpdateSetting") }}
                        </GlobalToggle>
                        <GlobalSelectInput
                            v-model="logicStore.chatMessageNotification"
                            :disabled="!logicStore.isNotificationGranted"
                            :label="t('user_notificationChatMessageSetting')"
                            :helper="t('user_helperNotificationChatMessageSetting')"
                            helper-type="text"
                            input-position="row"
                            input-size="small"
                            :options="[
                                { value: MessageNotification.ALL, label: t('user_notificationChatMessageSettingAll') },
                                { value: MessageNotification.PING, label: t('user_notificationChatMessageSettingPing') },
                                { value: MessageNotification.OFF, label: t('user_notificationChatMessageSettingOff') },
                            ]"
                            @change="updateMessageNotification()"
                        />
                        <GlobalToggle
                            v-model="logicStore.customSoundNotification"
                            :disabled="!logicStore.isNotificationGranted"
                            size="small"
                            :helper="t('user_helperNotificationCustomSoundSetting')"
                            @input-click="updateCustomSoundNotification()"
                            >{{ t("user_notificationCustomSoundSetting") }}
                        </GlobalToggle>
                    </div>
                </div>

                <GlobalToggle
                    v-model="logicStore.darkMode"
                    :helper="t('user_helperDarkModeSetting')"
                    side="right"
                    class="mt-4"
                    @input-click="updateDarkMode()"
                    >{{ t("user_darkModeSetting") }}</GlobalToggle
                >
                <GlobalToggle
                    v-model="logicStore.isAnalyticsAllowed"
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
            </div>

            <div class="mt-8 flex w-full">
                <GlobalButton
                    type="outline"
                    class="ml-auto w-full lg:w-fit"
                    :error-text="resetSettingsError"
                    :disabled="isResettingSettings"
                    size="full"
                    @click="resetSettings()"
                    >{{ t("user_resetSettings") }}</GlobalButton
                >
            </div>
        </GlobalCard>
    </div>
</template>

<style scoped></style>
