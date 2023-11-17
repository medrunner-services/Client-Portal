<script setup lang="ts">
import type { TeamMember } from "@medrunner-services/api-client";
import { Level } from "@medrunner-services/api-client";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import EmergencyResponderStaffName from "@/components/Emergency/EmergencyResponderStaffName.vue";
import CancelEmergencyModal from "@/components/Modals/CancelEmergencyModal.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useLogicStore } from "@/stores/logicStore";

const emergencyStore = useEmergencyStore();
const logicStore = useLogicStore();
const { t } = useI18n();

const emit = defineEmits(["sendNewDetails"]);
const displayCancelEmergencyModal = ref(false);

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
    if (emergencyStore.trackedEmergencyTeamDetails.stats) {
        const responder = emergencyStore.trackedEmergencyTeamDetails.stats.find((responder) => responder.id === id);
        if (responder) return responder.level;
        else return undefined;
    }
}

function getClassString(id: number): string {
    switch (id) {
        case 1:
            return t("tracking_classMedic");
        case 2:
            return t("tracking_classSecurity");
        case 3:
            return t("tracking_classPilot");
        case 4:
            return t("tracking_classLead");
        case 9:
            return t("tracking_classQRF");

        default:
            return t("tracking_classOthers");
    }
}
</script>

<template>
    <div>
        <div>
            <div class="flex items-center">
                <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("home_OngoingEmergency") }}</h2>
                <span class="relative mb-[0.35rem] ml-5 flex h-3 w-3">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-600 opacity-75"></span>
                    <span class="relative inline-flex h-3 w-3 rounded-full bg-primary-600"></span>
                </span>
            </div>
        </div>

        <GlobalCard class="mt-8">
            <p class="font-Mohave text-3xl font-bold text-primary-600 dark:text-red-700">
                {{ emergencyStore.getEmergencyStatusTitle(emergencyStore.trackedEmergency.status) }}
            </p>
            <p class="mt-1 font-medium">{{ emergencyStore.getEmergencyStatusSubtitle(emergencyStore.trackedEmergency.status) }}</p>

            <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div class="rounded-lg bg-gray-100 p-2 shadow dark:bg-gray-700">
                    <p class="text-lg font-semibold">{{ t("tracking_system") }}</p>
                    <p class="text-lg">{{ emergencyStore.trackedEmergency.system }}</p>
                </div>

                <div class="rounded-lg bg-gray-100 p-2 shadow dark:bg-gray-700">
                    <p class="text-lg font-semibold">{{ t("tracking_subSystem") }}</p>
                    <p class="text-lg">{{ emergencyStore.trackedEmergency.subsystem }}</p>
                </div>

                <div class="rounded-lg bg-gray-100 p-2 shadow dark:bg-gray-700">
                    <p class="text-lg font-semibold">{{ t("form_location") }}</p>
                    <p class="text-lg">{{ emergencyStore.trackedEmergency.tertiaryLocation }}</p>
                </div>

                <div class="rounded-lg bg-gray-100 p-2 shadow dark:bg-gray-700">
                    <p class="text-lg font-semibold">{{ t("tracking_threatLevel") }}</p>
                    <p class="text-lg">{{ logicStore.getThreatString(emergencyStore.trackedEmergency.threatLevel) }}</p>
                </div>
            </div>

            <div v-if="emergencyStore.trackedEmergency.respondingTeam.staff.length > 0">
                <p class="mt-8 font-Mohave text-2xl font-bold">{{ t("tracking_responders") }}</p>
                <p class="mt-1 text-sm font-medium">
                    {{ Math.round(emergencyStore.trackedEmergencyTeamDetails.aggregatedSuccessRate * 100) }}% {{ t("tracking_responderSuccessRate") }}
                </p>

                <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div
                        v-for="responderClass in responderTeamToClassTeam(emergencyStore.trackedEmergency.respondingTeam.staff)"
                        class="rounded-lg bg-gray-100 p-2 shadow dark:bg-gray-700"
                        :key="responderClass[0].class"
                    >
                        <div class="flex gap-2">
                            <img :src="`/icons/classIcon_${responderClass[0].class}.png`" alt="Class icon" class="h-7 w-7" />
                            <p class="text-lg font-semibold">{{ getClassString(responderClass[0].class) }}</p>
                        </div>

                        <ul class="mt-2 list-none">
                            <li v-for="responder in responderClass" :key="responder.discordId" class="mt-1">
                                <EmergencyResponderStaffName :name="responder.rsiHandle" :level="getResponderLevel(responder.id)" />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="mt-6 flex flex-col gap-4 lg:flex-row">
                <GlobalButton
                    v-if="emergencyStore.trackedEmergency.status === 1"
                    icon="cancel"
                    size="full"
                    @click="displayCancelEmergencyModal = true"
                    >{{ t("tracking_cancelButton") }}</GlobalButton
                >
                <GlobalButton @click="emit('sendNewDetails')" type="secondary" size="full">{{ t("tracking_sendNewDetails") }}</GlobalButton>
            </div>
        </GlobalCard>

        <CancelEmergencyModal
            @close="displayCancelEmergencyModal = false"
            @emergency-canceled="emergencyStore.resetTrackedEmergency()"
            v-if="displayCancelEmergencyModal"
        />
    </div>
</template>

<style scoped></style>
