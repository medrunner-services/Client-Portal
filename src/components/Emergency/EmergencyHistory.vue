<script setup lang="ts">
import type { Emergency } from "@medrunner-services/api-client";
import { CancellationReason } from "@medrunner-services/api-client";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps(["emergency"]);
const { t, locale } = useI18n();

const showCard = ref(false);
let emergencyInfo: Emergency = props.emergency;

function timestampToHours(timestamp: number | undefined): string {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString(locale.value, {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function timestampToDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString(locale.value, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

function getThreatString(id: number): string {
    switch (id) {
        case 0:
            return t("history_unknown");
        case 1:
            return t("history_low");
        case 2:
            return t("history_medium");
        case 3:
            return t("history_high");

        default:
            return t("history_unknown");
    }
}

function getRatingString(rating: number): string {
    switch (rating) {
        case 1:
            return t("history_good");
        case 2:
            return t("history_bad");

        default:
            return t("history_noRating");
    }
}

function getCancelReasonString(reason: CancellationReason): string {
    switch (reason) {
        case CancellationReason.RESCUED:
            return t("history_rescued");
        case CancellationReason.SUCCUMBED_TO_WOUNDS:
            return t("history_bledOut");
        case CancellationReason.SERVER_ERROR:
            return t("history_serverIssue");
        case CancellationReason.RESPAWNED:
            return t("history_respawned");
        case CancellationReason.OTHER:
            return t("history_other");

        default:
            return t("history_unknown");
    }
}

function getStatusString(id: number): string {
    switch (id) {
        case 0:
            return t("history_created");
        case 1:
            return t("history_received");
        case 2:
        case 10:
            return t("history_inProgress");
        case 3:
            return t("history_completed");
        case 4:
            return t("history_failed");
        case 5:
            return t("history_noContact");
        case 6:
            return t("history_canceled");
        case 7:
            return t("history_refused");
        case 8:
            return t("history_aborted");
        case 9:
            return t("history_serverError");
        default:
            return t("history_accepted");
    }
}

function getResponders(responders: any): string {
    let responderArray = [];
    for (const responder of responders) {
        responderArray.push(responder.rsiHandle);
    }
    return responderArray.join(", ");
}
</script>

<template>
    <div class="flex flex-col border-2 border-primary-900">
        <div class="flex items-center">
            <p class="flex-grow px-2 py-1 font-Inter font-semibold">
                {{ timestampToDate(emergencyInfo.creationTimestamp) }} -
                {{ getStatusString(emergencyInfo.status) }}
            </p>
            <div @click="showCard = !showCard" class="flex cursor-pointer items-center self-stretch bg-primary-900 p-3">
                <img src="/icons/arrow-icon.svg" class="h-6 w-6 select-none" :class="{ 'rotate-180': showCard }" alt="Dropdown arrow" />
            </div>
        </div>
        <div v-if="showCard" class="border-t-2 border-t-primary-900 px-2 py-8">
            <div class="flex items-center justify-center font-Inter text-xs font-semibold">
                <div class="flex flex-col items-center justify-center">
                    <p>{{ t("history_created") }}</p>
                    <img src="/icons/circle-icon.svg" alt="Created" class="my-2" />
                    <p>
                        {{ timestampToHours(emergencyInfo.creationTimestamp) }}
                    </p>
                </div>
                <div v-if="emergencyInfo.acceptedTimestamp !== undefined" class="h-0.5 w-16 border border-primary-900" />
                <div v-if="emergencyInfo.acceptedTimestamp !== undefined" class="flex flex-col items-center justify-center">
                    <p>{{ t("history_accepted") }}</p>
                    <img src="/icons/circle-icon.svg" alt="Received" class="my-2" />
                    <p>
                        {{ timestampToHours(emergencyInfo.acceptedTimestamp) }}
                    </p>
                </div>
                <div class="h-0.5 w-16 border border-primary-900" />
                <div class="flex flex-col items-center justify-center">
                    <p>{{ getStatusString(emergencyInfo.status) }}</p>
                    <img src="/icons/circle-icon.svg" alt="Created" class="my-2" />
                    <p>
                        {{ timestampToHours(emergencyInfo.completionTimestamp) }}
                    </p>
                </div>
            </div>
            <div class="mt-8">
                <p>
                    🌌 <span class="font-bold">{{ t("history_system") }}:</span>
                    {{ emergencyInfo.system }}
                </p>
                <p>
                    🌍 <span class="font-bold">{{ t("history_nearestPlanet") }}:</span>
                    {{ emergencyInfo.subsystem }}
                </p>
                <p>
                    ⚔️ <span class="font-bold">{{ t("history_threatLevel") }}:</span>
                    {{ getThreatString(emergencyInfo.threatLevel) }}
                </p>
                <p v-if="emergencyInfo.respondingTeam.staff.length > 0">
                    🚑 <span class="font-bold">{{ t("history_responders") }}:</span>
                    {{ getResponders(emergencyInfo.respondingTeam.staff) }}
                </p>
                <p v-if="emergencyInfo.remarks">
                    🗒️ <span class="font-bold">{{ t("history_remarks") }}:</span>
                    {{ emergencyInfo.remarks }}
                </p>
                <p class="mt-4" v-if="emergencyInfo.cancellationReason">
                    🚫 <span class="font-bold">{{ t("history_cancelReason") }}:</span>
                    {{ getCancelReasonString(emergencyInfo.cancellationReason) }}
                </p>
                <p class="mt-4" v-if="emergencyInfo.status === 3 || emergencyInfo.status === 4">
                    ⭐ <span class="font-bold">{{ t("history_rating") }}:</span>
                    {{ getRatingString(emergencyInfo.rating) }}
                </p>
            </div>
        </div>
    </div>
</template>
