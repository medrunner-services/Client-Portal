<script setup lang="ts">
import { Class, type Emergency, MissionStatus } from "@medrunner/api-client";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import ChatTranscriptModal from "@/components/Modals/ChatTranscriptModal.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import { useLogicStore } from "@/stores/logicStore";

const logicStore = useLogicStore();
const { t } = useI18n();

const props = defineProps<{
    parentDiv: HTMLDivElement | null;
    emergency: Emergency;
}>();

const showDetails = ref(false);
const detailsDiv = ref<HTMLDivElement | null>(null);
const rowParent = ref<HTMLDivElement | null>(null);
const showChatTranscriptModal = ref(false);
const isEmergencyIDCopied = ref(false);
const showMissionDebugInfo = ref(false);

onMounted(async () => {
    document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside);
});

const handleClickOutside = (event: MouseEvent) => {
    if (
        detailsDiv.value &&
        rowParent.value &&
        props.parentDiv &&
        !event.composedPath().includes(detailsDiv.value) &&
        !event.composedPath().includes(rowParent.value) &&
        event.composedPath().includes(props.parentDiv)
    ) {
        showDetails.value = false;
    }
};

function getResponders(responders: any): string {
    let responderArray = [];
    for (const responder of responders) {
        if (responder.class !== Class.LEAD) responderArray.push(responder.rsiHandle);
    }
    return responderArray.join(", ");
}

const teamLeader = computed(() => {
    if (props.emergency.respondingTeam.staff.length > 0) {
        const teamLeader = props.emergency.respondingTeam.staff.find((responder) => responder.class === Class.LEAD);
        if (teamLeader) return teamLeader.rsiHandle;
        else return "";
    } else {
        return "";
    }
});

function getStatusColor(id: MissionStatus): string {
    switch (id) {
        case MissionStatus.SUCCESS:
            return "bg-emerald-100 text-emerald-800";
        case MissionStatus.FAILED:
            return "bg-red-100 text-red-800";
        case MissionStatus.NO_CONTACT:
            return "bg-blue-100 text-blue-800";
        case MissionStatus.CANCELED:
            return "bg-orange-100 text-orange-800";
        case MissionStatus.REFUSED:
            return "bg-violet-100 text-violet-800";
        case MissionStatus.ABORTED:
            return "bg-teal-100 text-teal-800";
        case MissionStatus.SERVER_ERROR:
            return "bg-pink-100 text-pink-800";
        case MissionStatus.CREATED || MissionStatus.RECEIVED || MissionStatus.IN_PROGRESS:
            return "bg-slate-100 text-slate-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

async function addTextToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    isEmergencyIDCopied.value = true;
    setTimeout(() => {
        isEmergencyIDCopied.value = false;
    }, 2000);
}
</script>

<template>
    <div>
        <div
            ref="rowParent"
            class="grid cursor-pointer grid-cols-7 items-center border-b py-3 hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 md:grid-cols-10"
            :class="showDetails ? 'bg-gray-200 dark:bg-gray-700' : ''"
            @click="showDetails = !showDetails"
        >
            <div class="px-3">
                <svg
                    class="h-3 w-3 text-gray-500 dark:text-gray-400"
                    :class="showDetails ? 'rotate-180 text-gray-900 dark:text-gray-200' : ''"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 10"
                >
                    <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1"
                    />
                </svg>
            </div>
            <div class="col-span-4 font-medium text-gray-900 dark:text-white md:col-span-3 md:col-start-2">
                {{ props.emergency.missionName ?? t("tracking_unknown") }}
            </div>
            <div class="col-span-2">{{ logicStore.timestampToDate(props.emergency.creationTimestamp) }}</div>
            <div class="col-span-2 hidden font-medium text-gray-900 dark:text-white md:block">
                {{ props.emergency.tertiaryLocation ?? props.emergency.subsystem }}
            </div>
            <div class="col-span-2 hidden md:block">
                <div class="mr-2 w-fit rounded px-2.5 py-0.5 text-xs font-medium" :class="getStatusColor(props.emergency.status)">
                    {{ logicStore.getStatusString(props.emergency.status) }}
                </div>
            </div>
        </div>

        <div v-if="showDetails" ref="detailsDiv" class="w-full flex-1 overflow-x-auto bg-gray-50 dark:bg-gray-900">
            <div class="border-b p-4 dark:border-gray-700">
                <div class="mb-4">
                    <ol class="flex w-full items-center">
                        <li
                            class="after:border-1 flex w-full items-center after:mx-6 after:inline-block after:w-full after:border-b-2 after:border-primary-600 after:content-['']"
                        >
                            <div class="rounded-full bg-primary-100 p-2 text-primary-600">
                                <svg class="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                                    <path
                                        d="M15 18h-2v-3.333a2 2 0 0 0-.4-1.2L10.45 10.6a1 1 0 0 1 0-1.2l2.15-2.867a2 2 0 0 0 .4-1.2V2h2a1 1 0 1 0 0-2H1a1 1 0 0 0 0 2h2v3.333a2 2 0 0 0 .4 1.2L5.55 9.4a1 1 0 0 1 0 1.2L3.4 13.467a2 2 0 0 0-.4 1.2V18H1a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2Z"
                                    />
                                </svg>
                            </div>
                        </li>
                        <li
                            v-if="props.emergency.acceptedTimestamp"
                            class="after:border-1 flex w-full items-center after:mx-6 after:inline-block after:w-full after:border-b-2 after:border-primary-600 after:content-['']"
                        >
                            <div class="rounded-full bg-primary-100 p-2 text-primary-600">
                                <svg class="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
                                    <path
                                        d="M15 1.943v12.114a1 1 0 0 1-1.581.814L8 11V5l5.419-3.871A1 1 0 0 1 15 1.943ZM7 4H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2v5a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V4ZM4 17v-5h1v5H4ZM16 5.183v5.634a2.984 2.984 0 0 0 0-5.634Z"
                                    />
                                </svg>
                            </div>
                        </li>
                        <li class="flex items-center">
                            <div class="rounded-full bg-primary-100 p-2 text-primary-600">
                                <svg
                                    v-if="props.emergency.status === MissionStatus.SUCCESS"
                                    class="h-3 w-3"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 16 12"
                                >
                                    <path
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M1 5.917 5.724 10.5 15 1.5"
                                    />
                                </svg>
                                <svg
                                    v-else-if="
                                        [MissionStatus.CREATED, MissionStatus.RECEIVED, MissionStatus.IN_PROGRESS].includes(props.emergency.status)
                                    "
                                    class="h-3 w-3"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 16 3"
                                >
                                    <path
                                        d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"
                                    />
                                </svg>
                                <svg v-else class="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                    />
                                </svg>
                            </div>
                        </li>
                    </ol>
                    <div class="grid w-full grid-cols-3">
                        <div class="mt-2">
                            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ t("history_created") }}</p>
                            <p class="mt-1 text-xs text-gray-400">{{ logicStore.timestampToHours(props.emergency.creationTimestamp) }}</p>
                        </div>
                        <div v-if="props.emergency.acceptedTimestamp" class="mt-2 text-center">
                            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ t("history_accepted") }}</p>
                            <p class="mt-1 text-xs text-gray-400">{{ logicStore.timestampToHours(props.emergency.acceptedTimestamp) }}</p>
                        </div>
                        <div class="col-start-3 mt-2 text-right">
                            <p class="text-right text-sm font-semibold text-gray-900 dark:text-white">
                                {{ logicStore.getStatusString(props.emergency.status) }}
                            </p>
                            <p v-if="props.emergency.completionTimestamp" class="mt-1 text-xs text-gray-400">
                                {{ logicStore.timestampToHours(props.emergency.completionTimestamp) }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="mt-4 flex w-full flex-col gap-4 md:flex-row">
                    <div class="flex w-full flex-col items-start justify-between rounded-lg bg-white p-3 shadow dark:bg-gray-700">
                        <p class="text mb-2 text-base font-semibold text-gray-900 dark:text-white">{{ t("history_system") }}</p>
                        <p class="text text-base text-gray-500 dark:text-gray-400">{{ props.emergency.system }}</p>
                    </div>
                    <div class="flex w-full flex-col items-start justify-between rounded-lg bg-white p-3 shadow dark:bg-gray-700">
                        <p class="text mb-2 text-base font-semibold text-gray-900 dark:text-white">{{ t("history_nearestPlanet") }}</p>
                        <p class="text text-base text-gray-500 dark:text-gray-400">{{ props.emergency.subsystem }}</p>
                    </div>
                    <div
                        v-if="props.emergency.tertiaryLocation"
                        class="flex w-full flex-col items-start justify-between rounded-lg bg-white p-3 shadow dark:bg-gray-700"
                    >
                        <p class="text mb-2 text-base font-semibold text-gray-900 dark:text-white">{{ t("form_moon") }}</p>
                        <p class="text text-base text-gray-500 dark:text-gray-400">{{ props.emergency.tertiaryLocation }}</p>
                    </div>
                </div>
                <div class="mt-4 flex w-full flex-col gap-4 md:flex-row">
                    <div class="flex w-full flex-col items-start justify-between rounded-lg bg-white p-3 shadow dark:bg-gray-700">
                        <p class="text mb-2 text-base font-semibold text-gray-900 dark:text-white">{{ t("history_threatLevel") }}</p>
                        <p class="text text-base text-gray-500 dark:text-gray-400">{{ logicStore.getThreatString(props.emergency.threatLevel) }}</p>
                    </div>
                    <div
                        v-if="props.emergency.rating"
                        class="flex w-full flex-col items-start justify-between rounded-lg bg-white p-3 shadow dark:bg-gray-700"
                    >
                        <p class="text mb-2 text-base font-semibold text-gray-900 dark:text-white">{{ t("history_rating") }}</p>
                        <p class="text text-base text-gray-500 dark:text-gray-400">{{ logicStore.getRatingString(props.emergency.rating) }}</p>
                    </div>
                    <div
                        v-else-if="props.emergency.cancellationReason"
                        class="flex w-full flex-col items-start justify-between rounded-lg bg-white p-3 shadow dark:bg-gray-700"
                    >
                        <p class="text mb-2 text-base font-semibold text-gray-900 dark:text-white">{{ t("history_cancelReason") }}</p>
                        <p class="text text-base text-gray-500 dark:text-gray-400">
                            {{ logicStore.getCancelReasonString(props.emergency.cancellationReason) }}
                        </p>
                    </div>
                </div>
                <div class="mt-4 grid w-full gap-4">
                    <div
                        v-if="props.emergency.respondingTeam.staff.length > 0"
                        class="flex w-full flex-col items-start justify-between rounded-lg bg-white p-3 shadow dark:bg-gray-700"
                    >
                        <p class="text mb-2 text-base font-semibold text-gray-900 dark:text-white">{{ t("history_responders") }}</p>
                        <p v-if="teamLeader" class="text mb-2 text-base text-gray-500 dark:text-gray-400">
                            {{ teamLeader }} ({{ t("history_TeamLead") }})
                        </p>
                        <p class="text text-base text-gray-500 dark:text-gray-400">{{ getResponders(props.emergency.respondingTeam.staff) }}</p>
                    </div>
                </div>
                <div v-if="props.emergency.remarks" class="mt-4 w-full">
                    <p class="text mb-2 text-base font-semibold text-gray-900 dark:text-white">{{ t("history_remarks") }}</p>
                    <p class="text text-base text-gray-500 dark:text-gray-400">{{ props.emergency.remarks }}</p>
                </div>
                <div class="mt-4">
                    <p
                        class="cursor-pointer text-sm text-gray-500 underline dark:text-gray-400"
                        @click="showMissionDebugInfo = !showMissionDebugInfo"
                    >
                        {{ showMissionDebugInfo ? t("history_lessInfo") : t("history_moreInfo") }}
                    </p>

                    <div v-if="showMissionDebugInfo" class="mt-2 h-fit rounded-lg border border-gray-200 px-4 py-2.5 dark:border-gray-700">
                        <div class="flex gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <p class="font-medium">{{ t("tracking_emergencyID") }}</p>

                            <div class="flex cursor-pointer gap-1" :title="t('tracking_ClickToCopy')" @click="addTextToClipboard(props.emergency.id)">
                                <p>
                                    {{ props.emergency.id }}
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
                                        d="M4 5a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 4 14h5a1.5 1.5 0 0 0 1.5-1.5V8.621a1.5 1.5 0 0 0-.44-1.06L7.94 5.439A1.5 1.5 0 0 0 6.878 5H4Z"
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

                <GlobalButton size="full" type="outline" class="mt-4 lg:w-fit" @click="showChatTranscriptModal = true">{{
                    t("button_seeMessagesTranscript")
                }}</GlobalButton>
            </div>
        </div>

        <ChatTranscriptModal
            v-if="showChatTranscriptModal"
            :emergency-id="props.emergency.id"
            :responding-team="props.emergency.respondingTeam.allMembers"
            @close="showChatTranscriptModal = false"
        />
    </div>
</template>

<style scoped></style>
