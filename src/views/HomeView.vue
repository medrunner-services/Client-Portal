<script setup lang="ts">
import type { ClientHistory, Emergency } from "@medrunner-services/api-client";
import type { Ref } from "vue";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import EmergencyForm from "@/components/EmergencyForm.vue";
import EmergencyHistory from "@/components/EmergencyHistory.vue";
import EmergencyTracking from "@/components/EmergencyTracking.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useUserStore } from "@/stores/userStore";
import { establishConnection } from "@/utils/signalRConnection";
import {api} from "@/utils/medrunnerClient";

const userStore = useUserStore();
const emergencyStore = useEmergencyStore();
const { t } = useI18n();

const pageSize = 5;
const paginationToken: Ref<string | undefined> = ref();
const page = ref(0);
let loadedHistory: Array<Emergency> = [];
let activePage: Ref<Array<Emergency>> = ref([]);
const loaded = ref(false);

onMounted(async () => {
    const shouldFetchExtra = userStore.user?.activeEmergency !== undefined;
    await loadHistory(shouldFetchExtra);
    activePage.value = [...loadedHistory];
    loaded.value = true;

    // TODO: Re-enable SignalR with api-client
    // const signalrConnection = establishConnection(await userStore.getToken());
    //
    // signalrConnection.on("EmergencyCreate", (newEmergency: Emergency) => {
    //     userStore.user.activeEmergency = newEmergency.id;
    // });
    //
    // signalrConnection.on("EmergencyUpdate", (updatedEmergency: Emergency) => {
    //     if (updatedEmergency.rating || updatedEmergency.statusDescription) {
    //         completeEmergency(updatedEmergency);
    //     } else {
    //         userStore.trackedEmergency = updatedEmergency;
    //     }
    // });
    // await signalrConnection.start();
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
    loadedHistory.unshift(emergency);
    setActivePageFromCache(0);
}

async function loadHistory(skipFirst = false) {
    const fetchAmount = skipFirst ? pageSize + 1 : pageSize;

    try {
        const historyResponse = await userStore.fetchUserHistory(fetchAmount, paginationToken.value);

        paginationToken.value = historyResponse.paginationToken;

        const emergencies = await bulkLoadEmergencies(historyResponse.data);
        const sortedEmergencies = emergencies.filter(e => e.isComplete);

        loadedHistory.push(...sortedEmergencies);
        setActivePageFromCache(0);
    } catch (error: any) {
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
    <div class="flex flex-col-reverse lg:flex-row lg:justify-between content-container my-14 lg:my-36">
        <div class="mt-10 lg:mt-0 lg:w-[35%] lg:max-w-xl">
            <h2 class="text-3xl lg:text-4xl font-Mohave font-semibold uppercase mb-5">
                {{ t("home_history") }}
            </h2>
            <div v-if="loaded && activePage.length > 0">
                <EmergencyHistory v-for="emergency in activePage" :key="emergency.creationTimestamp" class="mt-4 first:mt-0" :emergency="emergency" />
            </div>
            <div v-else-if="!loaded" class="w-full flex justify-center items-center h-80">
                <svg class="animate-spin h-14 w-14 text-primary-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>
                    <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
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
                    {{ page + 1 }}
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
            <EmergencyTracking v-if="userStore.user.activeEmergency" @completed-tracked-emergency="completeEmergency" />
            <EmergencyForm v-else />
        </div>
    </div>
</template>
