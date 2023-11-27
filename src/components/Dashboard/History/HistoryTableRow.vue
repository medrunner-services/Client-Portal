<script setup lang="ts">
import { Class, type Emergency, MissionStatus } from "@medrunner-services/api-client";
import { computed, onBeforeUnmount, onMounted, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import { useLogicStore } from "@/stores/logicStore";

const logicStore = useLogicStore();
const { t } = useI18n();

const props = defineProps<{
    parentDiv: HTMLDivElement | null;
    emergency: Emergency;
}>();

const showDetails = ref(false);
const detailsDiv: Ref<HTMLDivElement | null> = ref(null);
const rowParent: Ref<HTMLDivElement | null> = ref(null);

onMounted(() => {
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
</script>

<template>
    <div
        ref="rowParent"
        @click="showDetails = !showDetails"
        class="grid cursor-pointer grid-cols-7 items-center border-b py-3 hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 md:grid-cols-10"
        :class="showDetails ? 'bg-gray-200 dark:bg-gray-700' : ''"
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
                    <div class="mt-2 text-center" v-if="props.emergency.acceptedTimestamp">
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
                    <p class="text mb-2 text-base font-semibold text-gray-900 dark:text-white">{{ t("form_location") }}</p>
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
            </div>
            <div class="mt-4 grid w-full gap-4">
                <div
                    v-if="props.emergency.respondingTeam.staff.length > 0"
                    class="flex w-full flex-col items-start justify-between rounded-lg bg-white p-3 shadow dark:bg-gray-700"
                >
                    <p class="text mb-2 text-base font-semibold text-gray-900 dark:text-white">{{ t("history_responders") }}</p>
                    <p class="text mb-2 text-base text-gray-500 dark:text-gray-400" v-if="teamLeader">
                        {{ teamLeader }} ({{ t("history_TeamLead") }})
                    </p>
                    <p class="text text-base text-gray-500 dark:text-gray-400">{{ getResponders(props.emergency.respondingTeam.staff) }}</p>
                </div>
            </div>
            <div v-if="props.emergency.remarks" class="mt-4 w-full">
                <p class="text mb-2 text-base font-semibold text-gray-900 dark:text-white">{{ t("history_remarks") }}</p>
                <p class="text text-base text-gray-500 dark:text-gray-400">{{ props.emergency.remarks }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
