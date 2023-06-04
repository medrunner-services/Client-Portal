<script setup lang="ts">
import { ResponseRating } from "@medrunner-services/api-client";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import Loader from "@/components/Loader.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useUserStore } from "@/stores/userStore";

const emit = defineEmits(["completedTrackedEmergency", "completeEmergency"]);

const userStore = useUserStore();
const emergencyStore = useEmergencyStore();
const { t } = useI18n();

const loadingEmergency = ref(false);
const loadingCancelEmergency = ref(false);
const errorLoadingEmergency = ref("");
const loadingCancelEmergencyError = ref("");
const cancelReason = ref("");
const discordServerId = import.meta.env.VITE_DISCORD_SERVER_ID;
const discordBaseUrl = ref("discord://");

onMounted(async () => {
    if (Object.keys(emergencyStore.trackedEmergency).length === 0) {
        loadingEmergency.value = true;
        if (userStore.user.activeEmergency) {
            try {
                emergencyStore.trackedEmergency = await emergencyStore.fetchEmergency(userStore.user.activeEmergency);
            } catch (e) {
                errorLoadingEmergency.value = t("tracking_errorLoadingEmergency");
            }

            loadingEmergency.value = false;
        } else {
            loadingEmergency.value = false;
            errorLoadingEmergency.value = t("tracking_errorLoadingEmergency");
        }
    }

    if (navigator.userAgent.includes("Android")) discordBaseUrl.value = "https://";
});

const emergencyTitle = computed(() => {
    switch (emergencyStore.trackedEmergency.status) {
        case 1:
            return "📡 " + t("tracking_messageReceived");
        case 2:
        case 10:
            return "🚑 " + t("tracking_helpOnTheWay");
        case 3:
            return "✅ " + t("tracking_operationSuccessful");
        case 4:
            return "❌ " + t("tracking_operationFailed");
        case 6:
            return "🚫 " + t("tracking_operationCanceled");
        case 8:
            return "↩️ " + t("tracking_operationAborted");
        case 9:
            return "🖥️ " + t("tracking_serverError");
    }
});

const emergencySubTitle = computed(() => {
    switch (emergencyStore.trackedEmergency.status) {
        case 1:
            return t("tracking_statusTextReceived");
        case 2:
        case 10:
            return t("tracking_statusTextOnTheirWay");
        case 3:
            return t("tracking_statusTextSuccess");
        case 4:
            return t("tracking_statusTextFailed");
        case 6:
            return t("tracking_statusTextCanceled");
        case 8:
            return t("tracking_statusTextAborted");
        case 9:
            return t("tracking_statusTextServerError");
    }
});

function getThreatString(id: number): string {
    switch (id) {
        case 0:
            return t("tracking_unknown");
        case 1:
            return t("tracking_low");
        case 2:
            return t("tracking_medium");
        case 3:
            return t("tracking_high");

        default:
            return t("tracking_unknown");
    }
}

async function cancelTrackedEmergency(): Promise<void> {
    try {
        loadingCancelEmergency.value = true;
        await emergencyStore.cancelEmergency(emergencyStore.trackedEmergency.id);
        loadingCancelEmergency.value = false;
    } catch (error: any) {
        loadingCancelEmergency.value = false;
        loadingCancelEmergencyError.value = t("tracking_errorCancel");
    }
}

async function rateEmergency(rating: ResponseRating): Promise<void> {
    try {
        await emergencyStore.rateCompletedEmergency(emergencyStore.trackedEmergency.id, rating);
    } finally {
        emit("completedTrackedEmergency", emergencyStore.trackedEmergency);
    }
}

async function submitCancelReason(): Promise<void> {
    try {
        await emergencyStore.justifyCanceledEmergency(emergencyStore.trackedEmergency.id, cancelReason.value);
    } finally {
        emit("completedTrackedEmergency", emergencyStore.trackedEmergency);
    }
}
</script>

<template>
    <Loader v-if="loadingEmergency" class="w-full flex justify-center items-center h-80" />
    <div v-else-if="errorLoadingEmergency">
        <p class="text-primary-900 font-semibold text-lg">{{ errorLoadingEmergency }}</p>
    </div>
    <div v-else v-auto-animate>
        <p class="text-3xl text-primary-900 font-Mohave font-semibold">{{ emergencyTitle }}</p>
        <p class="text-sm font-medium">{{ emergencySubTitle }}</p>

        <div
            class="mt-10"
            v-if="
                emergencyStore.trackedEmergency.status === 1 ||
                emergencyStore.trackedEmergency.status === 2 ||
                emergencyStore.trackedEmergency.status === 10
            "
        >
            <div class="lg:flex lg:justify-between">
                <div class="p-4 shadow-md bg-gray-50 lg:w-[30%]">
                    <p class="font-Mohave font-semibold text-2xl lg:text-xl">🌌 {{ t("tracking_system") }}</p>
                    <p class="mt-2">{{ emergencyStore.trackedEmergency.system }}</p>
                </div>
                <div class="p-4 shadow-md bg-gray-50 mt-5 lg:mt-0 lg:w-[30%]">
                    <p class="font-Mohave font-semibold text-2xl lg:text-xl">🌍 {{ t("tracking_subSystem") }}</p>
                    <p class="mt-2">{{ emergencyStore.trackedEmergency.subsystem }}</p>
                </div>
                <div class="p-4 shadow-md bg-gray-50 mt-5 lg:mt-0 lg:w-[30%] h-fit">
                    <p class="font-Mohave font-semibold text-2xl lg:text-xl">⚔️ {{ t("tracking_threatLevel") }}</p>
                    <p class="mt-2">
                        {{ getThreatString(emergencyStore.trackedEmergency.threatLevel) }}
                    </p>
                </div>
            </div>
            <div v-if="emergencyStore.trackedEmergency.remarks" class="lg:flex lg:justify-between lg:mt-5">
                <div class="p-4 shadow-md bg-gray-50 mt-5 lg:mt-0 w-full">
                    <p class="font-Mohave font-semibold text-2xl lg:text-xl">🗒️ {{ t("tracking_remarks") }}</p>
                    <p class="mt-2">{{ emergencyStore.trackedEmergency.remarks }}</p>
                </div>
            </div>
        </div>

        <div v-if="emergencyStore.trackedEmergency.status === 2 || emergencyStore.trackedEmergency.status === 10" class="mt-10">
            <p class="font-Mohave text-primary-900 text-2xl font-semibold mb-3">
                {{ t("tracking_responders") }}
            </p>
            <p v-for="responder in emergencyStore.trackedEmergency.respondingTeam.staff" class="font-medium">
                {{ responder.rsiHandle }}
            </p>
        </div>

        <div class="flex flex-col lg:flex-row mt-10">
            <button
                v-if="emergencyStore.trackedEmergency.status === 1"
                class="w-full lg:w-fit bg-primary-900 text-gray-50 px-6 py-3 lg:mr-5 font-medium flex items-center justify-center"
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
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <span v-else>{{ t("tracking_cancelButton") }}</span>
            </button>

            <a
                v-if="
                    emergencyStore.trackedEmergency.status === 1 ||
                    emergencyStore.trackedEmergency.status === 2 ||
                    emergencyStore.trackedEmergency.status === 10
                "
                :href="`${discordBaseUrl}discord.com/channels/${discordServerId}/${emergencyStore.trackedEmergency.coordinationThread?.id}`"
                target="_blank"
                class="w-full lg:w-fit text-primary-900 border-2 border-primary-900 px-6 py-3 font-medium mt-5 lg:mt-0 text-center cursor-pointer"
            >
                {{ t("tracking_chatButton") }}
            </a>
        </div>

        <p v-if="loadingCancelEmergencyError" class="mt-2 text-primary-400 text-sm w-full">
            {{ loadingCancelEmergencyError }}
        </p>

        <div v-if="emergencyStore.trackedEmergency.status === 3 || emergencyStore.trackedEmergency.status === 4" class="mt-10">
            <p class="font-Mohave font-semibold text-xl">{{ t("tracking_ratingTitle") }}</p>
            <div class="flex w-full justify-between mt-5">
                <button class="p-3 cursor-pointer font-semibold border-2 border-primary-900 w-[45%]" @click="rateEmergency(ResponseRating.GOOD)">
                    {{ t("tracking_good") }}
                </button>
                <button class="p-3 cursor-pointer font-semibold border-2 border-primary-900 w-[45%]" @click="rateEmergency(ResponseRating.BAD)">
                    {{ t("tracking_bad") }}
                </button>
            </div>
        </div>

        <form v-if="emergencyStore.trackedEmergency.status === 6" class="mt-7">
            <label class="text-sm font-semibold">{{ t("tracking_cancelTitle") }}</label>
            <select
                class="w-full focus:ring-secondary-500 focus:border-secondary-500 border-gray-400"
                v-model="cancelReason"
                @change="submitCancelReason"
            >
                <option selected disabled hidden value>
                    {{ t("tracking_cancelQuestionValue") }}
                </option>
                <option value="rescued">🤝 {{ t("tracking_rescued") }}</option>
                <option value="succumbed">🩸 {{ t("tracking_bledOut") }}</option>
                <option value="server">🖥️ {{ t("tracking_serverIssue") }}</option>
                <option value="respawned">🏥 {{ t("tracking_respawned") }}</option>
                <option value="other">📝 {{ t("tracking_other") }}</option>
            </select>
        </form>

        <button
            v-if="emergencyStore.trackedEmergency.status === 8 || emergencyStore.trackedEmergency.status === 9"
            class="w-full lg:w-fit mt-10 bg-primary-900 text-gray-50 px-6 py-3 font-medium flex items-center justify-center"
            @click="$emit('completeEmergency')"
        >
            <span>{{ t("tracking_finishButton") }}</span>
        </button>
    </div>
</template>
