<script setup lang="ts">
import { CancellationReason, ResponseRating } from "@medrunner-services/api-client";
import { computed, onMounted, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import Loader from "@/components/Loader.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useUserStore } from "@/stores/userStore";
import { useLogicStore } from "@/stores/logicStore";

const emit = defineEmits(["completedTrackedEmergency", "completeEmergency", "canceledEmergency"]);

const userStore = useUserStore();
const emergencyStore = useEmergencyStore();
const logicStore = useLogicStore();
const { t } = useI18n();

defineProps<{
    errorLoadingTrackedEmergency: boolean;
}>();

const loadingEmergency = ref(false);
const errorLoadingEmergency = ref(false);
const loadingCancelEmergencyError = ref(false);
const cancelReason: Ref<CancellationReason> = ref(CancellationReason.NONE);
const discordServerId = import.meta.env.VITE_DISCORD_SERVER_ID;
const isEmergencyCanceled = ref(false);

onMounted(async () => {
    if (Object.keys(emergencyStore.trackedEmergency).length === 0) {
        loadingEmergency.value = true;
        if (userStore.user.activeEmergency) {
            try {
                emergencyStore.trackedEmergency = await emergencyStore.fetchEmergency(userStore.user.activeEmergency);
            } catch (e) {
                errorLoadingEmergency.value = true;
            }

            loadingEmergency.value = false;
        } else {
            loadingEmergency.value = false;
            errorLoadingEmergency.value = true;
        }
    }
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
        case 5:
            return "🚫 " + t("tracking_operationNoContact");
        case 6:
            return "🚫 " + t("tracking_operationCanceled");
        case 7:
            return "⛔ " + t("tracking_operationRefused");
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
        case 5:
            return t("tracking_statusTextNoContact");
        case 6:
            return t("tracking_statusTextCanceled");
        case 7:
            return t("tracking_statusTextRefused");
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

async function submitCancelEmergency(): Promise<void> {
    try {
        await emergencyStore.cancelEmergency(emergencyStore.trackedEmergency.id, cancelReason.value);
        emit("completedTrackedEmergency", emergencyStore.trackedEmergency);
    } catch (error: any) {
        loadingCancelEmergencyError.value = true;
    }
}

async function rateEmergency(rating: ResponseRating): Promise<void> {
    try {
        await emergencyStore.rateCompletedEmergency(emergencyStore.trackedEmergency.id, rating);
    } finally {
        emit("completedTrackedEmergency", emergencyStore.trackedEmergency);
    }
}

async function reloadPage(): Promise<void> {
    location.reload();
}

function cancelEmergency(): void {
    isEmergencyCanceled.value = true;
    emit("canceledEmergency");
}
</script>

<template>
    <Loader v-if="loadingEmergency" class="flex h-80 w-full items-center justify-center" />
    <div v-else-if="errorLoadingEmergency || errorLoadingTrackedEmergency">
        <p class="text-primary-400">{{ t("error_loadingTrackedEmergency") }}</p>
        <button
            class="mt-10 flex w-full items-center justify-center bg-primary-900 px-6 py-3 font-medium text-gray-50 lg:w-fit"
            @click="reloadPage()"
        >
            <span>{{ t("tracking_refreshButton") }}</span>
        </button>
    </div>
    <div v-else v-auto-animate>
        <div v-if="isEmergencyCanceled">
            <p class="font-Mohave text-3xl font-semibold text-primary-900">{{ `🚫 ${t("tracking_operationCanceled")}` }}</p>
            <p class="text-sm font-medium">{{ t("tracking_statusTextCanceled") }}</p>
        </div>
        <div v-else>
            <p class="font-Mohave text-3xl font-semibold text-primary-900">{{ emergencyTitle }}</p>
            <p class="text-sm font-medium">{{ emergencySubTitle }}</p>
        </div>

        <div
            class="mt-10"
            v-if="
                !isEmergencyCanceled &&
                (emergencyStore.trackedEmergency.status === 1 ||
                    emergencyStore.trackedEmergency.status === 2 ||
                    emergencyStore.trackedEmergency.status === 10)
            "
        >
            <div class="lg:flex lg:justify-between">
                <div class="bg-gray-50 p-4 shadow-md lg:w-[30%]">
                    <p class="font-Mohave text-2xl font-semibold lg:text-xl">🌌 {{ t("tracking_system") }}</p>
                    <p class="mt-2">{{ emergencyStore.trackedEmergency.system }}</p>
                </div>
                <div class="mt-5 bg-gray-50 p-4 shadow-md lg:mt-0 lg:w-[30%]">
                    <p class="font-Mohave text-2xl font-semibold lg:text-xl">🌍 {{ t("tracking_subSystem") }}</p>
                    <p class="mt-2">{{ emergencyStore.trackedEmergency.subsystem }}</p>
                </div>
                <div class="mt-5 h-fit bg-gray-50 p-4 shadow-md lg:mt-0 lg:w-[30%]">
                    <p class="font-Mohave text-2xl font-semibold lg:text-xl">⚔️ {{ t("tracking_threatLevel") }}</p>
                    <p class="mt-2">
                        {{ getThreatString(emergencyStore.trackedEmergency.threatLevel) }}
                    </p>
                </div>
            </div>
            <div v-if="emergencyStore.trackedEmergency.remarks" class="lg:mt-5 lg:flex lg:justify-between">
                <div class="mt-5 w-full bg-gray-50 p-4 shadow-md lg:mt-0">
                    <p class="font-Mohave text-2xl font-semibold lg:text-xl">🗒️ {{ t("tracking_remarks") }}</p>
                    <p class="mt-2">{{ emergencyStore.trackedEmergency.remarks }}</p>
                </div>
            </div>
        </div>

        <div
            v-if="!isEmergencyCanceled && (emergencyStore.trackedEmergency.status === 2 || emergencyStore.trackedEmergency.status === 10)"
            class="mt-10"
        >
            <p class="mb-3 font-Mohave text-2xl font-semibold text-primary-900">
                {{ t("tracking_responders") }}
            </p>
            <p v-for="responder in emergencyStore.trackedEmergency.respondingTeam.staff" class="font-medium">
                {{ responder.rsiHandle }}
            </p>
        </div>

        <div class="mt-10 flex flex-col lg:flex-row">
            <button
                v-if="emergencyStore.trackedEmergency.status === 1 && !isEmergencyCanceled"
                class="flex w-full items-center justify-center bg-primary-900 px-6 py-3 font-medium text-gray-50 lg:mr-5 lg:w-fit"
                @click="cancelEmergency"
            >
                {{ t("tracking_cancelButton") }}
            </button>

            <a
                v-if="
                    !isEmergencyCanceled &&
                    (emergencyStore.trackedEmergency.status === 1 ||
                        emergencyStore.trackedEmergency.status === 2 ||
                        emergencyStore.trackedEmergency.status === 10)
                "
                :href="`${logicStore.discordBaseUrl}discord.com/channels/${discordServerId}/${emergencyStore.trackedEmergency.coordinationThread?.id}`"
                target="_blank"
                class="mt-5 w-full cursor-pointer border-2 border-primary-900 px-6 py-3 text-center font-medium text-primary-900 lg:mt-0 lg:w-fit"
            >
                {{ t("tracking_chatButton") }}
            </a>
        </div>

        <div v-if="emergencyStore.trackedEmergency.status === 3 || emergencyStore.trackedEmergency.status === 4" class="mt-10">
            <p class="font-Mohave text-xl font-semibold">{{ t("tracking_ratingTitle") }}</p>
            <div class="mt-5 flex w-full justify-between">
                <button class="w-[45%] cursor-pointer border-2 border-primary-900 p-3 font-semibold" @click="rateEmergency(ResponseRating.GOOD)">
                    {{ t("tracking_good") }}
                </button>
                <button class="w-[45%] cursor-pointer border-2 border-primary-900 p-3 font-semibold" @click="rateEmergency(ResponseRating.BAD)">
                    {{ t("tracking_bad") }}
                </button>
            </div>
        </div>

        <form v-if="isEmergencyCanceled" class="mt-7">
            <label class="text-sm font-semibold">{{ t("tracking_cancelTitle") }}</label>
            <select
                class="w-full border-gray-400 focus:border-secondary-500 focus:ring-secondary-500"
                v-model="cancelReason"
                @change="submitCancelEmergency"
            >
                <option :value="CancellationReason.NONE" disabled hidden>
                    {{ t("tracking_cancelQuestionValue") }}
                </option>
                <option :value="CancellationReason.RESCUED">🤝 {{ t("tracking_rescued") }}</option>
                <option :value="CancellationReason.SUCCUMBED_TO_WOUNDS">🩸 {{ t("tracking_bledOut") }}</option>
                <option :value="CancellationReason.SERVER_ERROR">🖥️ {{ t("tracking_serverIssue") }}</option>
                <option :value="CancellationReason.RESPAWNED">🏥 {{ t("tracking_respawned") }}</option>
                <option :value="CancellationReason.OTHER">📝 {{ t("tracking_other") }}</option>
            </select>
            <p v-if="loadingCancelEmergencyError" class="mt-2 w-full text-sm text-primary-400">
                {{ t("tracking_errorCancel") }}
            </p>
        </form>

        <button
            v-if="
                emergencyStore.trackedEmergency.status === 5 ||
                emergencyStore.trackedEmergency.status === 6 ||
                emergencyStore.trackedEmergency.status === 7 ||
                emergencyStore.trackedEmergency.status === 8 ||
                emergencyStore.trackedEmergency.status === 9
            "
            class="mt-10 flex w-full items-center justify-center bg-primary-900 px-6 py-3 font-medium text-gray-50 lg:w-fit"
            @click="$emit('completeEmergency')"
        >
            <span>{{ t("tracking_finishButton") }}</span>
        </button>
    </div>
</template>
