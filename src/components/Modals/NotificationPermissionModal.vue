<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";
import { useLogicStore } from "@/stores/logicStore.ts";
import { useUserStore } from "@/stores/userStore.ts";

const emit = defineEmits(["close"]);
const { t } = useI18n();
const logicStore = useLogicStore();
const userStore = useUserStore();

const waitingForPermission = ref(false);
const disablingNotifications = ref(false);
const permission = ref<"unsupported" | "default" | "denied" | "granted">("Notification" in window ? Notification.permission : "unsupported");

async function askBrowserPermission() {
    if ("Notification" in window) {
        waitingForPermission.value = true;
        permission.value = await Notification.requestPermission();
        waitingForPermission.value = false;
    }
    else {
        permission.value = "unsupported";
    }
    if (permission.value === "granted") {
        try {
            await userStore.setSettings({ globalNotifications: true });
            logicStore.isNotificationGranted = true;
        }
        catch (_e) {

        }
    }
}

async function disableNotifications() {
    try {
        disablingNotifications.value = true;
        await userStore.setSettings({ globalNotifications: false });
        logicStore.isNotificationGranted = false;
    }
    catch (_e) {
        return;
    }
    finally {
        disablingNotifications.value = false;
        document.body.style.overflow = "auto";
        emit("close");
    }
}
</script>

<template>
    <ModalContainer v-slot="modalContainer" :title="t('notification_modalTitle')" @close="emit('close')">
        <div>
            <div v-if="permission !== 'granted'">
                <p
                    class="
                        text-gray-500
                        dark:text-gray-400
                    "
                >
                    {{ t("notification_usageDescription") }}
                </p>
                <p class="mt-4 font-medium">
                    {{ t("notification_activationHelper") }}
                </p>
            </div>

            <div v-else class="mt-8 flex flex-col items-center justify-center text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-12">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>

                <p
                    class="
                        mt-4 text-gray-500
                        dark:text-gray-400
                    "
                >
                    {{ t("notification_activationSuccess") }}
                </p>
            </div>

            <div class="mt-8">
                <div
                    v-if="permission !== 'granted'" class="
                        gap-2
                        lg:flex
                    "
                >
                    <GlobalButton v-if="!waitingForPermission" size="full" @click="askBrowserPermission()">
                        {{ t("notification_buttonEnable") }}
                    </GlobalButton>
                    <GlobalButton v-else-if="waitingForPermission" size="full" :disabled="true">
                        {{ t("notification_waitingBrowser") }}
                    </GlobalButton>

                    <GlobalButton
                        type="secondary"
                        size="full"
                        class="
                            mt-2
                            lg:mt-0
                        "
                        :loading="disablingNotifications"
                        @click="disableNotifications()"
                    >
                        {{ t("notification_buttonDisable") }}
                    </GlobalButton>
                </div>

                <div v-else>
                    <GlobalButton
                        type="secondary" size="full" class="
                            mt-2
                            lg:mt-0
                        " @click="modalContainer.close()"
                    >
                        {{
                            t("user_close")
                        }}
                    </GlobalButton>
                </div>
            </div>

            <div v-if="waitingForPermission" class="flashing-circle">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-16">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                </svg>
            </div>
        </div>
    </ModalContainer>
</template>

<style scoped>
.flashing-circle {
    position: fixed;
    z-index: 50;
    top: 40px;
    left: 40px;
    width: 50px;
    height: 50px;
    color: white;
    border-radius: 50%;
    animation: flash 1.5s infinite;
}

@keyframes flash {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
}
</style>
