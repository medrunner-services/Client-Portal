<script setup lang="ts">
import { CancellationReason, ResponseRating, type TeamMember } from "@medrunner-services/api-client";
import { onMounted, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import EmergencyFormDetails from "@/components/Emergency/EmergencyFormDetails.vue";
import Loader from "@/components/Loader.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";

const emit = defineEmits(["completedTrackedEmergency", "completeEmergency", "canceledEmergency", "updateCurrentEmergencyStatus"]);

const userStore = useUserStore();
const emergencyStore = useEmergencyStore();
const logicStore = useLogicStore();
const { t } = useI18n();

defineProps<{
    errorLoadingTrackedEmergency: boolean;
}>();

const loadingEmergency = ref(false);
const errorLoadingEmergency = ref(false);
const cancelEmergencyError = ref(false);
const cancelReason: Ref<CancellationReason | string> = ref("");
const discordServerId = import.meta.env.VITE_DISCORD_SERVER_ID;
const formCancelingEmergency = ref(false);
const isCancelConflictError = ref(false);
const displayFormDetails = ref(false);

onMounted(async () => {
    if (Object.keys(emergencyStore.trackedEmergency).length === 0) {
        loadingEmergency.value = true;
        if (userStore.user.activeEmergency) {
            try {
                emergencyStore.trackedEmergency = await emergencyStore.fetchEmergency(userStore.user.activeEmergency);
                if (emergencyStore.trackedEmergency.status === 1) displayFormDetails.value = true;
                emit("updateCurrentEmergencyStatus", emergencyStore.trackedEmergency.status);
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

function getClassString(id: number): string {
    switch (id) {
        case 1:
            return `🩺 ${t("tracking_classMedic")}`;
        case 2:
            return `🛡️ ${t("tracking_classSecurity")}`;
        case 3:
            return `✈️ ${t("tracking_classPilot")}`;
        case 4:
            return `🗣️ ${t("tracking_classLead")}`;
        case 9:
            return `🚁 ${t("tracking_classQRF")}`;

        default:
            return t("tracking_classOthers");
    }
}

async function submitCancelEmergency(): Promise<void> {
    formCancelingEmergency.value = true;
    if (typeof cancelReason.value === "string") {
        cancelEmergencyError.value = true;
        formCancelingEmergency.value = false;
    } else {
        try {
            await emergencyStore.cancelEmergency(emergencyStore.trackedEmergency.id, cancelReason.value);
            cancelReason.value = "";
            emergencyStore.isTrackedEmergencyCanceled = false;
            emit("completedTrackedEmergency", emergencyStore.trackedEmergency);
        } catch (error: any) {
            if (error.statusCode === 409) isCancelConflictError.value = true;
            else cancelEmergencyError.value = true;
        } finally {
            formCancelingEmergency.value = false;
        }
    }
}

async function rateEmergency(rating: ResponseRating): Promise<void> {
    try {
        await emergencyStore.rateCompletedEmergency(emergencyStore.trackedEmergency.id, rating);
    } finally {
        emit("completedTrackedEmergency", emergencyStore.trackedEmergency);
    }
}

function reloadPage(): void {
    location.reload();
}

function rejoinEmergency(): void {
    emergencyStore.isTrackedEmergencyCanceled = false;
    isCancelConflictError.value = false;
    cancelEmergencyError.value = false;
    cancelReason.value = "";
}

function ResponderTeamToClassTeam(array: TeamMember[]): Record<number, TeamMember[]> {
    const transformedObj: Record<number, TeamMember[]> = {};

    array.forEach(TeamMember => {
        const { class: classValue } = TeamMember;

        if (!transformedObj[classValue]) {
            transformedObj[classValue] = [];
        }

        transformedObj[classValue].push(TeamMember);
    });

    return transformedObj;
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
        <div v-if="emergencyStore.isTrackedEmergencyCanceled">
            <p class="font-Mohave text-3xl font-semibold text-primary-900">{{ `🚫 ${t("tracking_operationCanceled")}` }}</p>
            <p class="text-sm font-medium">{{ t("tracking_statusTextCanceled") }}</p>
        </div>
        <div v-else>
            <p class="font-Mohave text-3xl font-semibold text-primary-900">
                {{ logicStore.getEmergencyStatusTitle(emergencyStore.trackedEmergency.status) }}
            </p>
            <p class="text-sm font-medium">{{ logicStore.getEmergencyStatusSubtitle(emergencyStore.trackedEmergency.status) }}</p>
        </div>

        <EmergencyFormDetails
            v-if="
                !emergencyStore.isTrackedEmergencyCanceled &&
                (emergencyStore.trackedEmergency.status === 1 ||
                    emergencyStore.trackedEmergency.status === 2 ||
                    emergencyStore.trackedEmergency.status === 10) &&
                displayFormDetails
            "
            @close="displayFormDetails = false"
        />

        <div
            class="mt-10"
            v-if="
                !emergencyStore.isTrackedEmergencyCanceled &&
                !displayFormDetails &&
                (emergencyStore.trackedEmergency.status === 1 ||
                    emergencyStore.trackedEmergency.status === 2 ||
                    emergencyStore.trackedEmergency.status === 10)
            "
        >
            <div class="lg:flex lg:justify-between">
                <div class="bg-gray-50 p-4 shadow-md dark:bg-stone-800 dark:shadow-stone-800 lg:w-[30%]">
                    <p class="font-Mohave text-2xl font-semibold lg:text-xl">🌌 {{ t("tracking_system") }}</p>
                    <p class="mt-2">{{ emergencyStore.trackedEmergency.system }}</p>
                </div>
                <div class="mt-5 bg-gray-50 p-4 shadow-md dark:bg-stone-800 dark:shadow-stone-800 lg:mt-0 lg:w-[30%]">
                    <p class="font-Mohave text-2xl font-semibold lg:text-xl">🌍 {{ t("tracking_subSystem") }}</p>
                    <p class="mt-2">{{ emergencyStore.trackedEmergency.subsystem }}</p>
                </div>
                <div class="mt-5 h-fit bg-gray-50 p-4 shadow-md dark:bg-stone-800 dark:shadow-stone-800 lg:mt-0 lg:w-[30%]">
                    <p class="font-Mohave text-2xl font-semibold lg:text-xl">⚔️ {{ t("tracking_threatLevel") }}</p>
                    <p class="mt-2">
                        {{ getThreatString(emergencyStore.trackedEmergency.threatLevel) }}
                    </p>
                </div>
            </div>
            <div v-if="emergencyStore.trackedEmergency.remarks" class="lg:mt-5 lg:flex lg:justify-between">
                <div class="mt-5 w-full bg-gray-50 p-4 shadow-md dark:bg-stone-800 dark:shadow-stone-800 lg:mt-0">
                    <p class="font-Mohave text-2xl font-semibold lg:text-xl">🗒️ {{ t("tracking_remarks") }}</p>
                    <p class="mt-2">{{ emergencyStore.trackedEmergency.remarks }}</p>
                </div>
            </div>

            <div v-auto-animate class="mt-10">
                <p
                    v-if="
                        emergencyStore.trackedEmergency.respondingTeam.dispatchers.length > 0 ||
                        emergencyStore.trackedEmergency.respondingTeam.staff.length > 0
                    "
                    class="mb-3 font-Mohave text-2xl font-semibold text-primary-900"
                >
                    {{ t("tracking_responders") }}
                </p>

                <div v-if="emergencyStore.trackedEmergency.respondingTeam.dispatchers.length > 0" class="lg:mt-5 lg:flex lg:justify-between">
                    <div class="mt-5 bg-gray-50 p-4 shadow-md dark:bg-stone-800 dark:shadow-stone-800 lg:mt-0 lg:w-[30%]">
                        <p class="font-Mohave text-2xl font-semibold lg:text-xl">🎧 {{ t("tracking_classDispatcher") }}</p>
                        <ul class="mt-2 list-none">
                            <li v-for="dispatcher in emergencyStore.trackedEmergency.respondingTeam.dispatchers" :key="dispatcher.discordId">
                                {{ dispatcher.rsiHandle }}
                            </li>
                        </ul>
                    </div>
                </div>

                <div v-if="emergencyStore.trackedEmergency.respondingTeam.staff.length > 0">
                    <div class="grid grid-cols-1 gap-4 font-medium lg:grid-cols-3">
                        <div
                            v-for="responderClass in ResponderTeamToClassTeam(emergencyStore.trackedEmergency.respondingTeam.staff)"
                            class="bg-gray-50 p-4 shadow-md dark:bg-stone-800 dark:shadow-stone-800"
                        >
                            <p class="font-Mohave text-2xl font-semibold lg:text-xl">{{ getClassString(responderClass[0].class) }}</p>
                            <ul class="mt-2 list-none">
                                <li v-for="responder in responderClass" :key="responder.discordId">{{ responder.rsiHandle }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <p
            v-if="
                !emergencyStore.isTrackedEmergencyCanceled &&
                !displayFormDetails &&
                (emergencyStore.trackedEmergency.status === 1 ||
                    emergencyStore.trackedEmergency.status === 2 ||
                    emergencyStore.trackedEmergency.status === 10)
            "
            @click="displayFormDetails = true"
            class="mt-10 w-fit cursor-pointer items-center border-b-2 border-primary-900 font-Inter font-semibold text-primary-900"
        >
            {{ t("tracking_sendDetailedInformationButton") }}
        </p>

        <div class="mt-10 flex flex-col lg:flex-row">
            <button
                v-if="emergencyStore.trackedEmergency.status === 1 && !emergencyStore.isTrackedEmergencyCanceled"
                class="flex w-full items-center justify-center bg-primary-900 px-6 py-3 font-medium text-gray-50 lg:mr-5 lg:w-fit"
                @click="emergencyStore.isTrackedEmergencyCanceled = true"
            >
                {{ t("tracking_cancelButton") }}
            </button>

            <a
                v-if="
                    !emergencyStore.isTrackedEmergencyCanceled &&
                    (emergencyStore.trackedEmergency.status === 1 ||
                        emergencyStore.trackedEmergency.status === 2 ||
                        emergencyStore.trackedEmergency.status === 10)
                "
                :href="`${logicStore.discordBaseUrl}discord.com/channels/${discordServerId}/${emergencyStore.trackedEmergency.coordinationThread?.id}`"
                target="_blank"
                class="mt-5 w-full cursor-pointer border-2 border-primary-900 px-6 py-3 text-center font-medium text-primary-900 dark:text-slate-50 lg:mt-0 lg:w-fit"
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

        <form v-if="emergencyStore.isTrackedEmergencyCanceled" class="mt-7" @submit.prevent="submitCancelEmergency()">
            <p v-if="isCancelConflictError">
                {{ t("tracking_cancelConflictError") }}
            </p>
            <label v-if="!isCancelConflictError" class="text-sm font-semibold">{{ t("tracking_cancelTitle") }}</label>
            <select
                v-if="!isCancelConflictError"
                required
                class="w-full border-gray-400 focus:border-secondary-500 focus:ring-secondary-500"
                v-model="cancelReason"
            >
                <option selected hidden disabled value="">
                    {{ t("tracking_cancelQuestionValue") }}
                </option>
                <option :value="CancellationReason.RESCUED">🤝 {{ t("tracking_rescued") }}</option>
                <option :value="CancellationReason.SUCCUMBED_TO_WOUNDS">🩸 {{ t("tracking_bledOut") }}</option>
                <option :value="CancellationReason.SERVER_ERROR">🖥️ {{ t("tracking_serverIssue") }}</option>
                <option :value="CancellationReason.RESPAWNED">🏥 {{ t("tracking_respawned") }}</option>
                <option :value="CancellationReason.OTHER">📝 {{ t("tracking_other") }}</option>
            </select>

            <div class="my-10 flex flex-col lg:flex-row lg:gap-10">
                <button
                    type="submit"
                    class="flex w-full items-center justify-center bg-primary-900 px-6 py-3 font-medium text-gray-50 lg:mt-5"
                    :disabled="formCancelingEmergency"
                    v-if="!isCancelConflictError"
                >
                    <svg
                        v-if="formCancelingEmergency"
                        class="mx-14 my-0.5 h-5 w-5 animate-spin text-white"
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
                    <span v-else>{{ t("tracking_confirmCancelButton") }}</span>
                </button>

                <button
                    class="mt-5 flex w-full items-center justify-center border-2 border-primary-900 px-6 py-3 font-medium"
                    :disabled="formCancelingEmergency"
                    @click.prevent="rejoinEmergency()"
                >
                    {{ t("tracking_backCancelButton") }}
                </button>
            </div>

            <p v-if="cancelEmergencyError" class="mt-2 w-full text-sm text-primary-400">
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
