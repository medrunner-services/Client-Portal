<script setup lang="ts">
import { ref } from "vue";

import type { Emergency } from "@/stores/userStore";

const props = defineProps(["emergency"]);

const showCard = ref(false);
let emergencyInfo: Emergency = props.emergency;

function timestampToHours(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getThreatString(id: number): string {
    switch (id) {
        case 0:
            return "Unknown";
        case 1:
            return "Low";
        case 2:
            return "Medium";
        case 3:
            return "High";

        default:
            return "Unknown";
    }
}
function getResponders(responders: any): string {
    let responderArray = [];
    for (const responder of responders) {
        responderArray.push(responder.rsiHandle);
    }
    return responderArray.toString();
}
</script>

<template>
    <div class="flex flex-col border-2 border-primary-900 text-neutral-900">
        <div class="flex items-center">
            <p class="flex-grow py-1 px-2 font-Inter font-semibold">
                {{ emergencyInfo.created }}
            </p>
            <div
                @click="showCard = !showCard"
                class="bg-primary-900 cursor-pointer p-3 flex justify-center items-center"
            >
                <img
                    src="/icons/arrow-icon.svg"
                    class="w-6 h-6"
                    :class="{ 'rotate-180': showCard }"
                    alt="Dropdown arrow"
                />
            </div>
        </div>
        <div v-if="showCard" class="border-t-2 border-t-primary-900 px-2 py-8">
            <div class="font-Inter font-semibold text-xs flex justify-center items-center">
                <div class="flex flex-col justify-center items-center">
                    <p>Created</p>
                    <img src="/icons/circle-icon.svg" alt="Created" class="my-2" />
                    <p>
                        {{ timestampToHours(emergencyInfo.creationTimestamp) }}
                    </p>
                </div>
                <div class="border border-primary-900 h-0.5 w-16" />
                <div class="flex flex-col justify-center items-center">
                    <p>Accepted</p>
                    <img src="/icons/circle-icon.svg" alt="Created" class="my-2" />
                    <p>
                        {{ timestampToHours(emergencyInfo.acceptedTimestamp) }}
                    </p>
                </div>
                <div class="border border-primary-900 h-0.5 w-16" />
                <div class="flex flex-col justify-center items-center">
                    <p>Completed</p>
                    <img src="/icons/circle-icon.svg" alt="Created" class="my-2" />
                    <p>
                        {{ timestampToHours(emergencyInfo.completionTimestamp) }}
                    </p>
                </div>
            </div>
            <div class="mt-8">
                <p>
                    🌌 <span class="font-bold">System:</span>
                    {{ emergencyInfo.system }}
                </p>
                <p>
                    🌍 <span class="font-bold">Nearest planet:</span>
                    {{ emergencyInfo.subsystem }}
                </p>
                <p>
                    ⚔️ <span class="font-bold">Threat level:</span>
                    {{ getThreatString(emergencyInfo.threatLevel) }}
                </p>
                <p v-if="emergencyInfo.respondingTeam.staff.length > 0">
                    🚑 <span class="font-bold">Responders:</span>
                    {{ getResponders(emergencyInfo.respondingTeam.staff) }}
                </p>
                <p v-if="emergencyInfo.remarks">
                    🗒️ <span class="font-bold">Remarks:</span>
                    {{ emergencyInfo.remarks }}
                </p>
            </div>
        </div>
    </div>
</template>
