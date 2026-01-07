<script setup lang="ts">
import type { WebSocketMessage } from "@/@types/types.ts";
import { MissionStatus } from "@medrunner/api-client";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import { useRouter } from "vue-router";
import { AlertColors } from "@/@types/types.ts";
import EmergencyChatBox from "@/components/Emergency/EmergencyChatBox.vue";
import EmergencyCompletion from "@/components/Emergency/EmergencyCompletion.vue";
import EmergencyDetailsForm from "@/components/Emergency/EmergencyDetailsForm.vue";
import EmergencyReportForm from "@/components/Emergency/EmergencyReportForm.vue";
import EmergencyTracking from "@/components/Emergency/EmergencyTracking.vue";
import ServiceStatus from "@/components/Emergency/ServiceStatus.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import { useAlertStore } from "@/stores/alertStore.ts";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useUserStore } from "@/stores/userStore";
import { getEmergencyStatusSubtitle, getEmergencyStatusTitle } from "@/utils/functions/getStringsFunctions.ts";
import { sendBrowserNotification } from "@/utils/functions/notificationFunctions.ts";
import { errorString } from "@/utils/functions/stringFunctions.ts";
import { ws } from "@/utils/medrunnerClient";

const emergencyStore = useEmergencyStore();
const userStore = useUserStore();
const { t } = useI18n();
const router = useRouter();
const alertStore = useAlertStore();

const displayFormDetails = ref(false);
const loadingEmergency = ref(false);
const errorLoadingEmergency = ref("");
const respondingTeamNumber = ref(0);
const oldEmergencyStatus = ref<MissionStatus | undefined>(undefined);

onMounted(async () => {
    if (userStore.user.activeEmergency) {
        loadingEmergency.value = true;

        try {
            emergencyStore.trackedEmergency = await emergencyStore.fetchEmergency(userStore.user.activeEmergency);
            emergencyStore.trackedEmergencyTeamDetails = await emergencyStore.fetchEmergencyTeamDetail(userStore.user.activeEmergency);
            respondingTeamNumber.value = emergencyStore.trackedEmergency.respondingTeam.staff.length;
            if (emergencyStore.trackedEmergency.status === MissionStatus.RECEIVED)
                displayFormDetails.value = true;
        }
        catch (error: any) {
            errorLoadingEmergency.value = errorString(error.statusCode, t("error_loadingTrackedEmergency"));
        }

        loadingEmergency.value = false;
    }

    ws.on("EmergencyCreate", async (message: WebSocketMessage) => {
        try {
            const newEmergency = await emergencyStore.fetchEmergency(message.id);

            if (newEmergency.clientId === userStore.user.id && !newEmergency.isComplete) {
                emergencyStore.trackedEmergency = newEmergency;
                oldEmergencyStatus.value = newEmergency.status;
                displayFormDetails.value = true;
            }
        }
        catch (_e) {
            alertStore.newAlert(AlertColors.RED, t("error_globalLoading"), false, "warning", 5000);
        }
    });

    ws.on("EmergencyUpdate", async (message: WebSocketMessage) => {
        try {
            const updatedEmergency = await emergencyStore.fetchEmergency(message.id);

            if (emergencyStore.trackedEmergency && updatedEmergency.id === emergencyStore.trackedEmergency.id) {
                emergencyStore.trackedEmergency = updatedEmergency;

                if (updatedEmergency.respondingTeam.staff.length !== respondingTeamNumber.value && updatedEmergency.respondingTeam.staff.length > 0) {
                    emergencyStore.trackedEmergencyTeamDetails = await emergencyStore.fetchEmergencyTeamDetail(updatedEmergency.id);
                    respondingTeamNumber.value = updatedEmergency.respondingTeam.staff.length;
                }

                if (
                    updatedEmergency.status !== MissionStatus.RECEIVED
                    && oldEmergencyStatus.value !== updatedEmergency.status
                    && userStore.syncedSettings.emergencyUpdateNotification
                ) {
                    await sendBrowserNotification(
                        getEmergencyStatusTitle(updatedEmergency.status),
                        `emergencyUpdate-${updatedEmergency.id}-${updatedEmergency.updated}`,
                        getEmergencyStatusSubtitle(updatedEmergency.status),
                        () => {
                            window.focus();
                            void router.push({ name: "emergency" });
                        },
                    );
                }

                oldEmergencyStatus.value = updatedEmergency.status;
            }
        }
        catch (_e) {
            alertStore.newAlert(AlertColors.RED, t("error_globalLoading"), false, "warning", 5000);
        }
    });

    ws.onreconnected(async () => {
        if (userStore.user.activeEmergency) {
            try {
                emergencyStore.trackedEmergency = await emergencyStore.fetchEmergency(userStore.user.activeEmergency);
            }
            catch (error: any) {
                errorLoadingEmergency.value = errorString(error.statusCode, t("error_loadingTrackedEmergency"));
            }
        }
    });
});
</script>

<template>
    <div
        class="
            content-container flex flex-col gap-10
            xl:flex-row
        "
    >
        <div class="xl:w-1/2">
            <div v-if="errorLoadingEmergency || userStore.isBlocked">
                <div class="min-h-11">
                    <h2 class="font-Mohave text-2xl font-semibold uppercase">
                        {{ t("home_OngoingEmergency") }}
                    </h2>
                </div>

                <GlobalCard class="mt-8">
                    <div class="flex w-full items-center justify-center py-[4.65rem]">
                        <GlobalErrorText :text="userStore.isBlocked ? t('error_blockedUser') : errorLoadingEmergency" />
                    </div>
                </GlobalCard>
            </div>
            <div v-else-if="emergencyStore.trackedEmergency">
                <EmergencyDetailsForm
                    v-if="displayFormDetails && !emergencyStore.trackedEmergency.isComplete"
                    @submitted-details="displayFormDetails = false"
                />
                <EmergencyTracking v-else-if="!emergencyStore.trackedEmergency.isComplete" @send-new-details="displayFormDetails = true" />
                <EmergencyCompletion v-else @rated-emergency="emergencyStore.resetTrackedEmergency()" />
            </div>

            <EmergencyReportForm v-else />
        </div>

        <div class="xl:w-1/2">
            <div v-if="emergencyStore.trackedEmergency && !userStore.isBlocked">
                <EmergencyChatBox />
            </div>

            <div v-else>
                <ServiceStatus />
            </div>
        </div>
    </div>
</template>
