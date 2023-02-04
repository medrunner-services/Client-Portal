<script setup lang="ts">
import { ref } from "vue";

import type { Emergency } from "@/stores/userStore";
import { useUserStore } from "@/stores/userStore";

const props = defineProps(["emergencyListIndex"]);
const userStore = useUserStore();

const emergency = userStore.user.emergencyHistory[props.emergencyListIndex];
const emergencyDate = new Date(Date.parse(emergency.created)).toLocaleString();
const developedInfo = ref(false);
const loadingInfo = ref(false);
const errorLoadingInfo = ref(false);
let emergencyInfo: Emergency;

async function switchCollapsedSate(): Promise<void> {
    developedInfo.value = !developedInfo.value;

    if (developedInfo.value) {
        loadingInfo.value = true;
        await userStore
            .fetchEmergency(emergency.id)
            .then(response => {
                emergencyInfo = response;
                loadingInfo.value = false;
            })
            .catch(() => {
                loadingInfo.value = false;
                errorLoadingInfo.value = true;
            });
    }
}

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
    return responders
        .map((responder: { discordHandle: never }) => responder.discordHandle)
        .toString();
}
</script>

<template>
    <div class="flex flex-col border-2 border-primary-900 text-neutral-900">
        <div class="flex items-center">
            <p class="flex-grow py-1 px-2 font-Inter font-semibold">
                {{ emergencyDate }}
            </p>
            <div
                @click="switchCollapsedSate()"
                class="bg-primary-900 cursor-pointer p-3 flex justify-center items-center"
            >
                <img
                    src="/icons/arrow-icon.svg"
                    class="w-6 h-6"
                    :class="{ 'rotate-180': developedInfo }"
                    alt="Dropdown arrow"
                />
            </div>
        </div>
        <div
            v-if="developedInfo"
            class="border-t-2 border-t-primary-900 px-2 py-8"
        >
            <div
                v-if="loadingInfo"
                class="flex items-center justify-center my-20"
            >
                <svg
                    class="animate-spin h-14 w-14 text-primary-900"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="2"
                    ></circle>
                    <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            </div>

            <div
                v-else-if="errorLoadingInfo"
                class="flex items-center justify-center my-16"
            >
                <p class="text-lg font-Inter font-bold text-primary-900">
                    A error occurred
                </p>
            </div>

            <div v-else>
                <div
                    class="font-Inter font-semibold text-xs flex justify-center items-center"
                >
                    <div class="flex flex-col justify-center items-center">
                        <p>Created</p>
                        <img
                            src="/icons/circle-icon.svg"
                            alt="Created"
                            class="my-2"
                        />
                        <p>
                            {{
                                timestampToHours(
                                    emergencyInfo.creationTimestamp,
                                )
                            }}
                        </p>
                    </div>
                    <div class="border border-primary-900 h-0.5 w-16" />
                    <div class="flex flex-col justify-center items-center">
                        <p>Accepted</p>
                        <img
                            src="/icons/circle-icon.svg"
                            alt="Created"
                            class="my-2"
                        />
                        <p>
                            {{
                                timestampToHours(
                                    emergencyInfo.acceptedTimestamp,
                                )
                            }}
                        </p>
                    </div>
                    <div class="border border-primary-900 h-0.5 w-16" />
                    <div class="flex flex-col justify-center items-center">
                        <p>Completed</p>
                        <img
                            src="/icons/circle-icon.svg"
                            alt="Created"
                            class="my-2"
                        />
                        <p>
                            {{
                                timestampToHours(
                                    emergencyInfo.completionTimestamp,
                                )
                            }}
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
    </div>
</template>
