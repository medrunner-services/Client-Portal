<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import EmergencyChatBox from "@/components/Emergency/EmergencyChatBox.vue";
import { useEmergencyStore } from "@/stores/emergencyStore.ts";
import { useUserStore } from "@/stores/userStore.ts";
import { errorString } from "@/utils/functions/stringFunctions.ts";

const emergencyStore = useEmergencyStore();
const userStore = useUserStore();
const { t } = useI18n();

const isLoadingEmergency = ref(false);
const errorLoadingEmergency = ref("");

onMounted(async () => {
    try {
        isLoadingEmergency.value = true;
        errorLoadingEmergency.value = "";

        if (userStore.user.activeEmergency) {
            emergencyStore.trackedEmergency = await emergencyStore.fetchEmergency(userStore.user.activeEmergency);
            emergencyStore.trackedEmergencyMessages = (await emergencyStore.fetchChatHistory(userStore.user.activeEmergency)).data;
        }
    }
    catch (error: any) {
        errorLoadingEmergency.value = errorString(error.statusCode, t("error_loadingTrackedEmergency"));
    }
    finally {
        isLoadingEmergency.value = false;
    }
});
</script>

<template>
    <div v-if="emergencyStore.trackedEmergency" class="content-container flex h-screen flex-col gap-2 py-2">
        <EmergencyChatBox :is-popup-window="true" class="grow overflow-auto" />
    </div>

    <div v-else class="flex h-full w-full flex-col items-center justify-center text-center">
        <p class="mt-4 text-3xl font-bold">
            {{ t("tracking_waitingNewEmergency") }}
        </p>
        <p class="mt-2">
            {{ t("tracking_waitingNewEmergencyHelper") }}
        </p>
    </div>
</template>

<style scoped></style>
