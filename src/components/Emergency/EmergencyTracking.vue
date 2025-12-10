<script setup lang="ts">
import { Class, type TeamMember } from "@medrunner/api-client";
import { Level } from "@medrunner/api-client";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import { WSState } from "@/@types/types.ts";
import EmergencyResponderStaffName from "@/components/Emergency/EmergencyResponderStaffName.vue";
import CancelEmergencyModal from "@/components/Modals/CancelEmergencyModal.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalTextBox from "@/components/utils/GlobalTextBox.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useLogicStore } from "@/stores/logicStore.ts";
import { getEmergencyStatusSubtitle, getEmergencyStatusTitle, getThreatString } from "@/utils/functions/getStringsFunctions.ts";

const emergencyStore = useEmergencyStore();
const logicStore = useLogicStore();
const { t } = useI18n();

const emit = defineEmits(["sendNewDetails"]);
const displayCancelEmergencyModal = ref(false);
const showMissionDebugInfo = ref(false);
const isEmergencyIDCopied = ref(false);

function responderTeamToClassTeam(array: TeamMember[]): Record<number, TeamMember[]> {
    const transformedObj: Record<number, TeamMember[]> = {};

    array.forEach((TeamMember) => {
        const { class: classValue } = TeamMember;

        if (!transformedObj[classValue]) {
            transformedObj[classValue] = [];
        }

        transformedObj[classValue].push(TeamMember);
    });

    return transformedObj;
}

function getResponderLevel(id: string): Level | undefined {
    if (emergencyStore.trackedEmergencyTeamDetails) {
        const responder = emergencyStore.trackedEmergencyTeamDetails.stats.find((responder) => responder.id === id);
        if (responder) return responder.level;
        else return undefined;
    }
}

function getClassString(userClass: Class): string {
    switch (userClass) {
        case Class.MEDIC:
            return t("tracking_classMedic");
        case Class.SECURITY:
            return t("tracking_classSecurity");
        case Class.PILOT:
            return t("tracking_classPilot");
        case Class.LEAD:
            return t("tracking_classLead");
        case Class.QRF:
            return t("tracking_classQRF");

        default:
            return t("tracking_classOthers");
    }
}

async function addTextToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    isEmergencyIDCopied.value = true;
    setTimeout(() => {
        isEmergencyIDCopied.value = false;
    }, 2000);
}

const getAssignedTeamsString = computed(() => {
    if (emergencyStore.trackedEmergency && emergencyStore.trackedEmergency.respondingTeams.length > 0) {
        const teamNames = emergencyStore.trackedEmergency.respondingTeams
            .slice()
            .sort((a, b) => a.teamName.localeCompare(b.teamName))
            .map((team) => team.teamName);

        const teamNamesString = teamNames.join(", ").replace(/, ([^,]*)$/, " and $1");

        return t(
            "teams_assignedTo",
            {
                teamNames: teamNamesString,
            },
            teamNames.length,
        );
    } else {
        return "";
    }
});

const showSuccessRate = computed(() => {
    return emergencyStore.trackedEmergency && emergencyStore.trackedEmergency.respondingTeam.staff.length >= 3;
});
</script>

<template>
    <div v-if="emergencyStore.trackedEmergency">
        <div>
            <div class="flex min-h-11 items-center">
                <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("home_OngoingEmergency") }}</h2>
                <span v-if="logicStore.currentWSState === WSState.HEALTHY" class="relative mb-[0.35rem] ml-5 flex h-3 w-3">
                    <span class="bg-primary-600 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                    <span class="bg-primary-600 relative inline-flex h-3 w-3 rounded-full"></span>
                </span>
            </div>
        </div>

        <GlobalCard class="mt-8">
            <p class="font-Mohave text-primary-600 text-3xl font-bold dark:text-red-700">
                {{ getEmergencyStatusTitle(emergencyStore.trackedEmergency.status) }}
            </p>
            <p class="mt-1 font-medium">{{ getEmergencyStatusSubtitle(emergencyStore.trackedEmergency.status) }}</p>

            <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div class="rounded-lg bg-gray-100 p-2 shadow-sm dark:bg-gray-700">
                    <p class="text-lg font-semibold">{{ t("tracking_system") }}</p>
                    <p class="text-lg">{{ emergencyStore.trackedEmergency.system }}</p>
                </div>

                <div class="rounded-lg bg-gray-100 p-2 shadow-sm dark:bg-gray-700">
                    <p class="text-lg font-semibold">{{ t("tracking_subSystem") }}</p>
                    <p class="text-lg">{{ emergencyStore.trackedEmergency.subsystem }}</p>
                </div>

                <div v-if="emergencyStore.trackedEmergency.tertiaryLocation" class="rounded-lg bg-gray-100 p-2 shadow-sm dark:bg-gray-700">
                    <p class="text-lg font-semibold">{{ t("form_moon") }}</p>
                    <p class="text-lg">{{ emergencyStore.trackedEmergency.tertiaryLocation }}</p>
                </div>

                <div class="rounded-lg bg-gray-100 p-2 shadow-sm dark:bg-gray-700">
                    <p class="text-lg font-semibold">{{ t("tracking_threatLevel") }}</p>
                    <p class="text-lg">{{ getThreatString(emergencyStore.trackedEmergency.threatLevel) }}</p>
                </div>
            </div>

            <div v-if="emergencyStore.trackedEmergency.respondingTeam.staff.length > 0 && emergencyStore.trackedEmergencyTeamDetails">
                <p class="font-Mohave mt-8 text-2xl font-bold">{{ t("tracking_responders") }}</p>

                <GlobalTextBox v-if="getAssignedTeamsString || showSuccessRate" class="mt-2 text-sm lg:w-fit" font-weight="normal">
                    <div class="flex items-center">
                        <p v-if="getAssignedTeamsString">{{ getAssignedTeamsString }}</p>
                        <p v-if="getAssignedTeamsString && showSuccessRate" class="px-1 font-medium">|</p>
                        <p v-if="showSuccessRate" class="font-medium">
                            {{ Math.round(emergencyStore.trackedEmergencyTeamDetails.aggregatedSuccessRate * 100) }}%
                            {{ t("tracking_responderSuccessRate") }}
                        </p>
                    </div></GlobalTextBox
                >

                <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div
                        v-for="responderClass in responderTeamToClassTeam(emergencyStore.trackedEmergency.respondingTeam.staff)"
                        :key="responderClass[0].class"
                        class="rounded-lg bg-gray-100 p-2 shadow-sm dark:bg-gray-700"
                    >
                        <div class="flex gap-2">
                            <img :src="`/icons/classIcon_${responderClass[0].class}.svg`" alt="Class icon" class="h-7 w-7" />
                            <p class="text-lg font-semibold">{{ getClassString(responderClass[0].class) }}</p>
                        </div>

                        <ul class="mt-2 list-none">
                            <li v-for="responder in responderClass" :key="responder.id" class="mt-1">
                                <EmergencyResponderStaffName :name="responder.rsiHandle" :level="getResponderLevel(responder.id)" />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="mt-4">
                <p class="cursor-pointer text-sm text-gray-500 underline dark:text-gray-400" @click="showMissionDebugInfo = !showMissionDebugInfo">
                    {{ showMissionDebugInfo ? t("history_lessInfo") : t("history_moreInfo") }}
                </p>

                <div v-if="showMissionDebugInfo" class="mt-2 h-fit rounded-lg border border-gray-200 px-4 py-2.5 dark:border-gray-700">
                    <div class="flex gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <p class="font-medium">{{ t("tracking_emergencyID") }}</p>

                        <div
                            class="flex cursor-pointer gap-1"
                            :title="t('tracking_ClickToCopy')"
                            @click="addTextToClipboard(emergencyStore.trackedEmergency.id)"
                        >
                            <p>
                                {{ emergencyStore.trackedEmergency.id }}
                            </p>

                            <svg
                                v-if="!isEmergencyIDCopied"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                class="h-4 w-4"
                            >
                                <path
                                    d="M5.5 3.5A1.5 1.5 0 0 1 7 2h2.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 1 .439 1.061V9.5A1.5 1.5 0 0 1 12 11V8.621a3 3 0 0 0-.879-2.121L9 4.379A3 3 0 0 0 6.879 3.5H5.5Z"
                                />
                                <path
                                    d="M4 5a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 4 14h5a1.5 1.5 0 0 0 1.5-1.5V8.621a1 .5 1.5 0 0 0-.44-1.06L7.94 5.439A1.5 1.5 0 0 0 6.878 5H4Z"
                                />
                            </svg>

                            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4">
                                <path
                                    fill-rule="evenodd"
                                    d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-6 flex flex-col gap-4 lg:flex-row">
                <GlobalButton
                    :disabled="emergencyStore.trackedEmergency.status !== 1"
                    :title="emergencyStore.trackedEmergency.status !== 1 ? t('tracking_titleNoCancel') : null"
                    icon="cancel"
                    size="full"
                    @click="displayCancelEmergencyModal = true"
                    >{{ t("tracking_cancelButton") }}</GlobalButton
                >
                <GlobalButton type="secondary" size="full" @click="emit('sendNewDetails')">{{ t("tracking_sendNewDetails") }}</GlobalButton>
            </div>
        </GlobalCard>

        <CancelEmergencyModal
            v-if="displayCancelEmergencyModal"
            @close="displayCancelEmergencyModal = false"
            @emergency-canceled="emergencyStore.resetTrackedEmergency()"
        />
    </div>
</template>

<style scoped></style>
