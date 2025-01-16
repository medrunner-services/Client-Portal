<script setup lang="ts">
import { type Emergency, type MissionStatus, Origin, SubmissionSource } from "@medrunner/api-client";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import EmergencyChatBox from "@/components/Emergency/EmergencyChatBox.vue";
import EmergencyCompletion from "@/components/Emergency/EmergencyCompletion.vue";
import EmergencyDetailsForm from "@/components/Emergency/EmergencyDetailsForm.vue";
import EmergencyReportForm from "@/components/Emergency/EmergencyReportForm.vue";
import EmergencyTracking from "@/components/Emergency/EmergencyTracking.vue";
import ServiceStatus from "@/components/Emergency/ServiceStatus.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";
import { ws } from "@/utils/medrunnerClient";
import { sendBrowserNotification } from "@/utils/notificationFunctions";
import { errorString } from "@/utils/stringUtils";

const emergencyStore = useEmergencyStore();
const userStore = useUserStore();
const logicStore = useLogicStore();
const { t } = useI18n();
const router = useRouter();

const discordServerId = import.meta.env.VITE_DISCORD_SERVER_ID;

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
            if (emergencyStore.trackedEmergency.status === 1) displayFormDetails.value = true;
        } catch (error: any) {
            errorLoadingEmergency.value = errorString(error.statusCode, t("error_loadingTrackedEmergency"));
        }

        loadingEmergency.value = false;
    }

    ws.on("EmergencyCreate", (newEmergency: Emergency) => {
        if (newEmergency.clientId === userStore.user.id && !newEmergency.isComplete) {
            emergencyStore.trackedEmergency = newEmergency;
            oldEmergencyStatus.value = newEmergency.status;
            displayFormDetails.value = true;
        }
    });

    ws.on("EmergencyUpdate", async (updatedEmergency: Emergency) => {
        if (emergencyStore.trackedEmergency && updatedEmergency.id === emergencyStore.trackedEmergency.id) {
            emergencyStore.trackedEmergency = updatedEmergency;

            if (updatedEmergency.respondingTeam.staff.length !== respondingTeamNumber.value && updatedEmergency.respondingTeam.staff.length > 0) {
                emergencyStore.trackedEmergencyTeamDetails = await emergencyStore.fetchEmergencyTeamDetail(updatedEmergency.id);
                respondingTeamNumber.value = updatedEmergency.respondingTeam.staff.length;
            }

            if (
                updatedEmergency.status !== 1 &&
                oldEmergencyStatus.value !== updatedEmergency.status &&
                userStore.syncedSettings.emergencyUpdateNotification &&
                !logicStore.emergencyCompletedNotificationSent.includes(updatedEmergency.id)
            ) {
                await sendBrowserNotification(
                    emergencyStore.getEmergencyStatusTitle(updatedEmergency.status),
                    emergencyStore.getEmergencyStatusSubtitle(updatedEmergency.status),
                    () => {
                        window.focus();
                        router.push({ name: "emergency" });
                    },
                );

                if (updatedEmergency.status > 2) logicStore.emergencyCompletedNotificationSent.push(updatedEmergency.id);
            }

            oldEmergencyStatus.value = updatedEmergency.status;
        }
    });

    ws.onreconnected(async () => {
        if (userStore.user.activeEmergency) {
            try {
                emergencyStore.trackedEmergency = await emergencyStore.fetchEmergency(userStore.user.activeEmergency);
            } catch (error: any) {
                errorLoadingEmergency.value = errorString(error.statusCode, t("error_loadingTrackedEmergency"));
            }
        }
    });
});
</script>

<template>
    <div class="content-container flex flex-col gap-10 xl:flex-row">
        <div class="xl:w-1/2">
            <div v-if="errorLoadingEmergency || userStore.isBlocked">
                <div class="min-h-11">
                    <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("home_OngoingEmergency") }}</h2>
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
                <div class="min-h-11">
                    <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("tracking_chatTitle") }}</h2>
                </div>

                <EmergencyChatBox
                    v-if="
                        emergencyStore.trackedEmergency.submissionSource !== SubmissionSource.BOT ||
                        emergencyStore.trackedEmergency.origin === Origin.EVALUATION
                    "
                    class="mt-8"
                />

                <div v-else class="mt-8">
                    <GlobalCard class="mt-4 flex flex-col items-center justify-center text-center">
                        <p>{{ t("tracking_textDiscordThread") }}</p>
                        <a
                            :href="`${logicStore.discordBaseUrl}discord.com/channels/${discordServerId}/${emergencyStore.trackedEmergency.coordinationThread?.id}`"
                            target="_blank"
                            class="mt-8"
                        >
                            <GlobalButton icon="link">{{ t("tracking_buttonDiscordThread") }}</GlobalButton>
                        </a>
                    </GlobalCard>
                </div>
            </div>

            <div v-else>
                <ServiceStatus />
            </div>
        </div>
    </div>
</template>
