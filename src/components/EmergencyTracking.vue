<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { AxiosError } from "axios";
import { computed, onMounted, ref } from "vue";

import type { Emergency } from "@/stores/userStore";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const trackedEmergency = ref({} as Emergency);
const loadingEmergency = ref(false);
const loadingCancelEmergency = ref(false);
const errorLoadingEmergency = ref("");
const loadingCancelEmergencyError = ref("");
const cancelReason = ref("");

onMounted(async () => {
    try {
        loadingEmergency.value = true;
        trackedEmergency.value = await userStore.fetchEmergency(userStore.user.activeEmergency);
        loadingEmergency.value = false;
    } catch (error: AxiosError | any) {
        loadingEmergency.value = false;
        errorLoadingEmergency.value = "An error occurred loading your ongoing emergency";
    }
});

const emergencyTitle = computed(() => {
    switch (trackedEmergency.value.status) {
        case 1:
            return "📡 Message received";
        case 2:
            return "🚑 Help is on the way";
        case 3:
            return "✅ Operation successful";
        case 4:
            return "❌ Operation failed";
        case 6:
            return "🚫 Operation canceled";
        case 8:
            return "↩️ Operation aborted";
        case 9:
            return "🖥️ Server error";
    }
});

const emergencySubTitle = computed(() => {
    switch (trackedEmergency.value.status) {
        case 1:
            return "awaiting for dispatch confirmation";
        case 2:
            return "Medrunners are on their way to rescue you";
        case 3:
            return "Thanks for choosing Medrunner";
        case 4:
            return "The operation has failed";
        case 6:
            return "The medrunner team is retreating";
        case 8:
            return "The operation was aborted";
        case 9:
            return "The operation was aborted due too a server error";
    }
});

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

async function cancelTrackedEmergency(): Promise<void> {
    try {
        loadingCancelEmergency.value = true;
        await userStore.cancelEmergency(trackedEmergency.value.id);
        trackedEmergency.value.status = 6;
        loadingCancelEmergency.value = false;
    } catch (error: AxiosError | any) {
        loadingCancelEmergency.value = false;
        loadingCancelEmergencyError.value =
            "An error occurred while canceling your ongoing emergency";
    }
}

async function submitCancelReason(): Promise<void> {
    console.log(cancelReason.value);
}
</script>

<template>
    <div v-if="loadingEmergency" class="w-full flex justify-center items-center h-80">
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
    <div v-else-if="errorLoadingEmergency">
        <p class="text-primary-900 font-semibold text-lg">{{ errorLoadingEmergency }}</p>
    </div>
    <div v-else>
        <p class="text-3xl text-primary-900 font-Mohave font-semibold">{{ emergencyTitle }}</p>
        <p class="text-sm font-medium">{{ emergencySubTitle }}</p>

        <div class="mt-10" v-if="trackedEmergency.status === 1 || trackedEmergency.status === 2">
            <div class="lg:flex lg:justify-between">
                <div class="p-4 shadow-md bg-gray-50 lg:w-[30%]">
                    <p class="font-Mohave font-semibold text-2xl lg:text-xl">🌌 System</p>
                    <p class="mt-2">{{ trackedEmergency.system }}</p>
                </div>
                <div class="p-4 shadow-md bg-gray-50 mt-5 lg:mt-0 lg:w-[30%]">
                    <p class="font-Mohave font-semibold text-2xl lg:text-xl">🌍 Sub System</p>
                    <p class="mt-2">{{ trackedEmergency.subsystem }}</p>
                </div>
                <div class="p-4 shadow-md bg-gray-50 mt-5 lg:mt-0 lg:w-[30%] h-fit">
                    <p class="font-Mohave font-semibold text-2xl lg:text-xl">⚔️ Threat Level</p>
                    <p class="mt-2">{{ getThreatString(trackedEmergency.threatLevel) }}</p>
                </div>
            </div>
            <div v-if="trackedEmergency.remarks" class="lg:flex lg:justify-between lg:mt-5">
                <div class="p-4 shadow-md bg-gray-50 mt-5 lg:mt-0 w-full">
                    <p class="font-Mohave font-semibold text-2xl lg:text-xl">🗒️ Remarks</p>
                    <p class="mt-2">{{ trackedEmergency.remarks }}</p>
                </div>
            </div>
        </div>

        <div v-if="trackedEmergency.status === 2" class="mt-10">
            <p class="font-Mohave text-primary-900 text-2xl font-semibold mb-3">Responders</p>
            <p v-for="responder in trackedEmergency.respondingTeam.staff" class="font-medium">
                {{ responder.rsiHandle }}
            </p>
        </div>

        <button
            v-if="trackedEmergency.status === 1 || trackedEmergency.status === 2"
            class="w-full lg:w-fit mt-10 bg-primary-900 text-gray-50 px-6 py-3 font-medium flex items-center justify-center"
            @click="cancelTrackedEmergency()"
            :disabled="loadingCancelEmergency"
        >
            <svg
                v-if="loadingCancelEmergency"
                class="animate-spin h-5 w-5 text-white mx-14 my-0.5"
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
                    stroke-width="4"
                ></circle>
                <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            <span v-else>Cancel Emergency</span>
        </button>
        <p v-if="loadingCancelEmergencyError" class="mt-2 text-primary-400 text-sm w-full">
            {{ loadingCancelEmergencyError }}
        </p>

        <div v-if="trackedEmergency.status === 3" class="mt-10">
            <p class="font-Mohave font-semibold text-xl">How was your experience with Medrunner?</p>
            <div class="flex w-full justify-between mt-5">
                <button
                    class="p-3 cursor-pointer font-semibold border-2 border-primary-900 w-[45%]"
                >
                    Good
                </button>
                <button
                    class="p-3 cursor-pointer font-semibold border-2 border-primary-900 w-[45%]"
                >
                    Bad
                </button>
            </div>
        </div>

        <form v-if="trackedEmergency.status === 6" class="mt-7">
            <label class="text-sm font-semibold">Reason for cancellation</label>
            <select
                class="w-full focus:ring-secondary-500 focus:border-secondary-500 border-gray-400"
                v-model="cancelReason"
                @change="submitCancelReason"
            >
                <option selected disabled hidden value>Why did you cancel ?</option>
                <option value="0">🤝 Rescued</option>
                <option value="1">🩸 Bled Out</option>
                <option value="2">🖥️ Server Issue</option>
                <option value="3">🏥 Respawned</option>
                <option value="4">📝 Other</option>
            </select>
        </form>
    </div>
</template>

<style scoped></style>
