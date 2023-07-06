<script setup lang="ts">
import type { ClientHistory, Emergency } from "@medrunner-services/api-client";
import type { Ref } from "vue";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import EmergencyForm from "@/components/Emergency/EmergencyForm.vue";
import EmergencyHistory from "@/components/Emergency/EmergencyHistory.vue";
import EmergencyTracking from "@/components/Emergency/EmergencyTracking.vue";
import Loader from "@/components/Loader.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";
import { api } from "@/utils/medrunnerClient";

const userStore = useUserStore();
const emergencyStore = useEmergencyStore();
const logicStore = useLogicStore();
const { t } = useI18n();

const pageSize = 5;
const paginationToken: Ref<string | undefined> = ref();
const page = ref(0);
let loadedHistory: Array<Emergency> = [];
let activePage: Ref<Array<Emergency>> = ref([]);
const loaded = ref(false);
const errorLoadingTrackedEmergency = ref(false);
const errorLoadingHistory = ref(false);
const currentTrackedEmergencyStatus = ref();

onMounted(async () => {
    const shouldFetchExtra = userStore.user?.activeEmergency !== undefined;
    await loadHistory(shouldFetchExtra);
    activePage.value = [...loadedHistory];
    loaded.value = true;

    const apiWebsocket = await api.websocket.initialize();
    await apiWebsocket.start();

    apiWebsocket.on("EmergencyCreate", (newEmergency: Emergency) => {
        if (newEmergency.clientId === userStore.user.id) {
            userStore.user.activeEmergency = newEmergency.id;
            currentTrackedEmergencyStatus.value = newEmergency.status;
        }
    });

    apiWebsocket.on("EmergencyUpdate", (updatedEmergency: Emergency) => {
        if (updatedEmergency.id === userStore.user.activeEmergency && !loadedHistory.find(emergency => emergency.id === updatedEmergency.id)) {
            if (updatedEmergency.isComplete && updatedEmergency.rating !== 0) {
                completeEmergency(updatedEmergency);
                currentTrackedEmergencyStatus.value = undefined;
            } else {
                emergencyStore.trackedEmergency = updatedEmergency;

                if (
                    logicStore.isNotificationGranted &&
                    updatedEmergency.status !== currentTrackedEmergencyStatus.value &&
                    ![1, 10].includes(updatedEmergency.status)
                ) {
                    new Notification(logicStore.getEmergencyStatusTitle(updatedEmergency.status), {
                        body: logicStore.getEmergencyStatusSubtitle(updatedEmergency.status),
                        icon: "/images/medrunner-logo-square.webp",
                    });
                }

                currentTrackedEmergencyStatus.value = updatedEmergency.status;
            }
        }
    });

    apiWebsocket.onreconnected(async () => {
        if (userStore.user.activeEmergency) {
            try {
                emergencyStore.trackedEmergency = await emergencyStore.fetchEmergency(userStore.user.activeEmergency);
            } catch (e) {
                errorLoadingTrackedEmergency.value = true;
            }
        }
    });
});

async function bulkLoadEmergencies(history: ClientHistory[]): Promise<Emergency[]> {
    const historyArray = history.map(h => h.emergencyId);
    return await emergencyStore.fetchEmergencies(historyArray);
}

function setActivePageFromCache(startIndex: number) {
    activePage.value = loadedHistory.slice(startIndex, startIndex + pageSize);
    loaded.value = true;
}

function completeEmergency(emergency: Emergency): void {
    emergencyStore.trackedEmergency = {} as Emergency;
    userStore.user.activeEmergency = "";
    userStore.newlySubmittedEmergencies++;
    loadedHistory.unshift(emergency);
    setActivePageFromCache(0);
}

async function loadHistory(skipFirst = false) {
    const fetchAmount = skipFirst ? pageSize + 1 : pageSize;
    errorLoadingHistory.value = false;

    try {
        const historyResponse = await userStore.fetchUserHistory(fetchAmount, paginationToken.value);

        if (historyResponse.data.length > 0) {
            paginationToken.value = historyResponse.paginationToken;
            const emergencies = await bulkLoadEmergencies(historyResponse.data);
            const sortedEmergencies = emergencies.filter(e => e.isComplete);

            loadedHistory.push(...sortedEmergencies);
            setActivePageFromCache(0);
        }
    } catch (error: any) {
        errorLoadingHistory.value = true;
        loaded.value = true;
    }
}

async function loadDataForPage(direction: number): Promise<void> {
    if (direction < 0 && page.value <= 0) return;

    page.value += direction;

    const startIndex = page.value * pageSize;
    if (loadedHistory.length > startIndex + pageSize || (loadedHistory.length > startIndex && isLastPageHistory.value)) {
        setActivePageFromCache(startIndex);
        return;
    }

    if (paginationToken.value === undefined) {
        page.value -= direction;
        return;
    }

    loaded.value = false;

    await loadHistory();

    setActivePageFromCache(startIndex);
}

async function previousPage(): Promise<void> {
    await loadDataForPage(-1);
}

async function nextPage(): Promise<void> {
    await loadDataForPage(1);
}

const isLastPageHistory = computed(() => {
    return paginationToken.value === undefined && page.value + 1 >= loadedHistory.length / pageSize;
});
</script>

<template>
    <div class="content-container flex flex-col-reverse lg:flex-row lg:justify-between">
        <div class="mt-10 lg:mt-0 lg:w-[40%] lg:max-w-xl xl:w-[35%]">
            <h2 class="mb-5 font-Mohave text-3xl font-semibold uppercase lg:text-4xl">
                {{ t("home_history") }}
            </h2>
            <div class="min-h-[22rem]">
                <div v-auto-animate v-if="loaded && activePage.length > 0">
                    <EmergencyHistory
                        v-auto-animate="{ duration: 100 }"
                        v-for="emergency in activePage"
                        :key="emergency.id"
                        class="mt-4 first:mt-0"
                        :emergency="emergency"
                    />
                </div>
                <Loader v-else-if="!loaded" class="flex h-80 w-full items-center justify-center" />

                <div v-else-if="loaded && errorLoadingHistory">
                    <p class="text-primary-400">{{ t("error_loadingHistory") }}</p>
                </div>
                <div v-else-if="loaded && activePage.length === 0">
                    <p>{{ t("home_noEmergencies") }}</p>
                </div>
            </div>

            <div v-if="loadedHistory.length > 0" class="mt-10 flex justify-between">
                <div
                    @click="previousPage()"
                    class="flex flex-grow cursor-pointer select-none items-center justify-center bg-primary-900 p-3"
                    :class="{ 'opacity-50': page <= 0 }"
                >
                    <img src="/icons/arrow-icon.svg" class="h-6 w-6 rotate-90" alt="Dropdown arrow" />
                </div>
                <div class="flex w-1/2 items-center justify-center font-Inter font-bold xl:w-2/3">
                    {{ page + 1 }} / {{ Math.ceil(userStore.totalNumberOfEmergencies / pageSize) }}
                </div>
                <div
                    @click="nextPage()"
                    class="flex flex-grow cursor-pointer select-none items-center justify-center bg-primary-900 p-3"
                    :class="{ 'opacity-50': isLastPageHistory }"
                >
                    <img src="/icons/arrow-icon.svg" class="h-6 w-6 -rotate-90" alt="Dropdown arrow" />
                </div>
            </div>
        </div>
        <div class="lg:w-1/2 xl:w-1/2">
            <div class="mb-5 flex items-center">
                <h2 class="font-Mohave text-3xl font-semibold uppercase lg:text-4xl">
                    {{ t("home_emergency") }}
                </h2>
                <span
                    v-if="
                        emergencyStore.trackedEmergency.id &&
                        !errorLoadingTrackedEmergency &&
                        !emergencyStore.isTrackedEmergencyCanceled &&
                        (emergencyStore.trackedEmergency.status === 1 ||
                            emergencyStore.trackedEmergency.status === 2 ||
                            emergencyStore.trackedEmergency.status === 10)
                    "
                    class="relative mb-[0.35rem] ml-5 flex h-3 w-3"
                >
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-900 opacity-75"></span>
                    <span class="relative inline-flex h-3 w-3 rounded-full bg-primary-900"></span>
                </span>
            </div>
            <EmergencyTracking
                v-if="userStore.user.activeEmergency"
                @completed-tracked-emergency="completeEmergency"
                @complete-emergency="completeEmergency(emergencyStore.trackedEmergency)"
                @update-current-emergency-status="status => (currentTrackedEmergencyStatus = status)"
                :errorLoadingTrackedEmergency="errorLoadingTrackedEmergency"
            />

            <EmergencyForm v-else />

            <a
                href="https://discord.gg/medrunner"
                target="_blank"
                class="mt-5 flex w-fit items-center border-b-2 border-primary-900 font-Inter font-semibold text-primary-900"
            >
                <span>{{ t("home_GetHelp") }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="ml-2 h-5 w-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
            </a>
        </div>
    </div>
</template>
