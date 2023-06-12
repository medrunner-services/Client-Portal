<script setup lang="ts">
import type { ClientHistory, Emergency } from "@medrunner-services/api-client";
import type { Ref } from "vue";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import EmergencyForm from "@/components/EmergencyForm.vue";
import EmergencyHistory from "@/components/EmergencyHistory.vue";
import EmergencyTracking from "@/components/EmergencyTracking.vue";
import Loader from "@/components/Loader.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useUserStore } from "@/stores/userStore";
import { api } from "@/utils/medrunnerClient";

const userStore = useUserStore();
const emergencyStore = useEmergencyStore();
const { t } = useI18n();

const pageSize = 5;
const paginationToken: Ref<string | undefined> = ref();
const page = ref(0);
let loadedHistory: Array<Emergency> = [];
let activePage: Ref<Array<Emergency>> = ref([]);
const loaded = ref(false);
const errorLoadingTrackedEmergency = ref(false);
const errorLoadingHistory = ref(false);

onMounted(async () => {
    const shouldFetchExtra = userStore.user?.activeEmergency !== undefined;
    await loadHistory(shouldFetchExtra);
    activePage.value = [...loadedHistory];
    loaded.value = true;

    const apiWebsocket = await api.websocket.initialize();
    await apiWebsocket.start();

    apiWebsocket.on("EmergencyCreate", (newEmergency: Emergency) => {
        userStore.user.activeEmergency = newEmergency.id;
    });

    apiWebsocket.on("EmergencyUpdate", (updatedEmergency: Emergency) => {
        if (updatedEmergency.id === userStore.user.activeEmergency && !loadedHistory.find(emergency => emergency.id === updatedEmergency.id)) {
            if (updatedEmergency.isComplete && updatedEmergency.rating !== 0) {
                completeEmergency(updatedEmergency);
            } else {
                emergencyStore.trackedEmergency = updatedEmergency;
            }
        }
    });

    apiWebsocket.onreconnected(async () => {
        try {
            emergencyStore.trackedEmergency = await emergencyStore.fetchEmergency(userStore.user.activeEmergency ?? "");
        } catch (e) {
            errorLoadingTrackedEmergency.value = true;
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

        paginationToken.value = historyResponse.paginationToken;

        const emergencies = await bulkLoadEmergencies(historyResponse.data);
        const sortedEmergencies = emergencies.filter(e => e.isComplete);

        loadedHistory.push(...sortedEmergencies);
        setActivePageFromCache(0);
    } catch (error: any) {
        errorLoadingHistory.value = true;
        loaded.value = true;
    }
}

async function loadDataForPage(direction: number): Promise<void> {
    if (direction < 0 && page.value <= 0) return;

    page.value += direction;

    const startIndex = page.value * pageSize;
    if (loadedHistory.length > startIndex) {
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
    <div class="flex flex-col-reverse lg:flex-row lg:justify-between content-container">
        <div class="mt-10 lg:mt-0 lg:w-[40%] xl:w-[35%] lg:max-w-xl">
            <h2 class="text-3xl lg:text-4xl font-Mohave font-semibold uppercase mb-5">
                {{ t("home_history") }}
            </h2>
            <div v-auto-animate v-if="loaded && activePage.length > 0">
                <EmergencyHistory
                    v-auto-animate="{ duration: 100 }"
                    v-for="emergency in activePage"
                    :key="emergency.creationTimestamp"
                    class="mt-4 first:mt-0"
                    :emergency="emergency"
                />
            </div>
            <Loader v-else-if="!loaded" class="w-full flex justify-center items-center h-80" />
            <div v-if="loaded && errorLoadingHistory">
                <p>{{ t("home_errorLoadingHistory") }}</p>
            </div>
            <div v-else>
                <p>{{ t("home_noEmergencies") }}</p>
            </div>
            <div v-if="loadedHistory.length > 0" class="mt-10 flex justify-between">
                <div
                    @click="previousPage()"
                    class="bg-primary-900 cursor-pointer p-3 flex justify-center items-center flex-grow select-none"
                    :class="{ 'opacity-50': page <= 0 }"
                >
                    <img src="/icons/arrow-icon.svg" class="w-6 h-6 rotate-90" alt="Dropdown arrow" />
                </div>
                <div class="w-1/2 xl:w-2/3 flex justify-center items-center font-Inter font-bold">
                    {{ page + 1 }} / {{ Math.ceil(userStore.totalNumberOfEmergencies / pageSize) }}
                </div>
                <div
                    @click="nextPage()"
                    class="bg-primary-900 cursor-pointer p-3 flex justify-center items-center flex-grow select-none"
                    :class="{ 'opacity-50': isLastPageHistory }"
                >
                    <img src="/icons/arrow-icon.svg" class="w-6 h-6 -rotate-90" alt="Dropdown arrow" />
                </div>
            </div>
        </div>
        <div class="lg:w-[50%]">
            <h2 class="text-3xl lg:text-4xl font-Mohave font-semibold uppercase mb-5">
                {{ t("home_emergency") }}
            </h2>
            <EmergencyTracking
                v-if="userStore.user.activeEmergency"
                @completed-tracked-emergency="completeEmergency"
                @complete-emergency="completeEmergency(emergencyStore.trackedEmergency)"
                :errorLoadingTrackedEmergency="errorLoadingTrackedEmergency"
            />

            <EmergencyForm v-else />

            <a
                href="https://discord.gg/medrunner"
                target="_blank"
                class="flex text-primary-900 font-Inter font-semibold mt-5 border-b-2 border-primary-900 w-fit items-center"
            >
                <span>{{ t("home_GetHelp") }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 ml-2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
            </a>
        </div>
    </div>
</template>
