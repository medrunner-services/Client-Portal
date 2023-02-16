<script setup lang="ts">
import type { Ref } from "vue";
import { onMounted, ref } from "vue";

import EmergencyHistory from "@/components/EmergencyHistory.vue";
import type { Emergency, History } from "@/stores/userStore";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
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
});

async function bulkLoadEmergencies(history: History[]): Promise<Array<Emergency>> {
    return await userStore.fetchEmergencies(...history.map(h => h.emergencyId));
}

function setActivePageFromCache(startIndex: number) {
    activePage.value = loadedHistory.slice(startIndex, startIndex + pageSize);
    loaded.value = true;
}

async function loadHistory(skipFirst = false) {
    const fetchAmount = skipFirst ? pageSize + 1 : pageSize;

    const historyResponse = await userStore.fetchUserHistory(fetchAmount, paginationToken.value);
    paginationToken.value = historyResponse.paginationToken;

    const emergencies = await bulkLoadEmergencies(historyResponse.data);
    const sortedEmergencies = emergencies
        .filter(e => e.isComplete)
        .sort((a, b) => b.creationTimestamp - a.creationTimestamp); // /bulk doesn't guarantee ordering

    loadedHistory.push(...sortedEmergencies);
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
        // no new data to fetch - if it's not in the cache, we're SOL
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
</script>

<template>
    <div
        class="flex flex-col-reverse lg:flex-row lg:justify-between content-container my-14 lg:my-36"
    >
        <div class="mt-10 lg:mt-0 lg:w-[35%] lg:max-w-xl">
            <h2 class="text-3xl lg:text-4xl font-Mohave font-semibold uppercase mb-5">History</h2>
            <div v-if="loaded && activePage.length > 0">
                <EmergencyHistory
                    v-for="emergency in activePage"
                    :key="emergency.creationTimestamp"
                    class="mt-4 first:mt-0"
                    :emergency="emergency"
                />
            </div>
            <div
                @click="previousPage()"
                class="bg-primary-900 cursor-pointer p-3 flex justify-center items-center"
                :class="{ disabled: page <= 0 }"
            >
                <img src="/icons/arrow-icon.svg" class="w-6 h-6 rotate-90" alt="Dropdown arrow" />
            </div>
            <div>
                {{ page + 1 }}
            </div>
            <div
                @click="nextPage()"
                class="bg-primary-900 cursor-pointer p-3 flex justify-center items-center"
                :class="{ disabled: paginationToken === undefined }"
            >
                <img src="/icons/arrow-icon.svg" class="w-6 h-6 -rotate-90" alt="Dropdown arrow" />
            </div>
        </div>
        <div class="lg:w-[60%]">
            <h2 class="text-3xl lg:text-4xl font-Mohave font-semibold uppercase">Emergency</h2>
        </div>
    </div>
</template>
