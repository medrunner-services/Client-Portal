<script setup lang="ts">
import { type ClientHistory, type Emergency, MissionStatus } from "@medrunner/api-client";
import { computed, onMounted, type Ref, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import HistoryTableRow from "@/components/Dashboard/History/HistoryTableRow.vue";
import WarningNoContactModal from "@/components/Modals/WarningNoContactModal.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalLoader from "@/components/utils/GlobalLoader.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useUserStore } from "@/stores/userStore";
import { ws } from "@/utils/medrunnerClient";

const userStore = useUserStore();
const emergencyStore = useEmergencyStore();
const { t } = useI18n();

const parentRowsDiv: Ref<HTMLDivElement | null> = ref(null);

const activePage: Ref<Emergency[]> = ref([]);
const pageSize = ref(parseInt(localStorage.getItem("selectedPageSize") ?? "10") ?? 10);
const page = ref(0);
const paginationToken: Ref<string | undefined> = ref();

const loadedHistory: Ref<Emergency[]> = ref([]);
const errorLoadingHistory = ref("");
const loaded = ref(false);
const displayWarningNoContactModal = ref(false);

onMounted(async () => {
    await loadHistory();
    activePage.value = [...loadedHistory.value];
    loaded.value = true;

    const lastConfirmedEmergencyWarning =
        "lastConfirmedWarningId" in userStore.user.clientPortalPreferences
            ? (userStore.user.clientPortalPreferences.lastConfirmedWarningId as string)
            : null;

    if (
        loadedHistory.value.length > 0 &&
        loadedHistory.value[0].status === MissionStatus.NO_CONTACT &&
        loadedHistory.value[0].id !== lastConfirmedEmergencyWarning
    ) {
        displayWarningNoContactModal.value = true;
    }

    ws.on("EmergencyCreate", (newEmergency: Emergency) => {
        if (newEmergency.clientId === userStore.user.id) {
            loadedHistory.value.unshift(newEmergency);
            if (page.value === 0) {
                activePage.value = loadedHistory.value.slice(0, pageSize.value);
            }
        }
    });

    ws.on("EmergencyUpdate", (updatedEmergency: Emergency) => {
        if (updatedEmergency.clientId === userStore.user.id) {
            const indexLoadedHistory = loadedHistory.value.findIndex((emergency) => emergency.id === updatedEmergency.id);
            const indexActivePage = activePage.value.findIndex((emergency) => emergency.id === updatedEmergency.id);
            if (indexLoadedHistory !== -1) {
                loadedHistory.value[indexLoadedHistory] = updatedEmergency;
            }
            if (indexActivePage !== -1) {
                activePage.value[indexActivePage] = updatedEmergency;
            }
        }
    });
});

watch(pageSize, async (newPageSize, oldPageSize) => {
    if (loadedHistory.value.length < newPageSize && loadedHistory.value.length >= oldPageSize) {
        loaded.value = false;
        loadedHistory.value = [];
        paginationToken.value = undefined;
        await loadHistory();
    } else {
        setActivePageFromCache(0);
    }

    localStorage.setItem("selectedPageSize", newPageSize.toString());
});

async function bulkLoadEmergencies(history: ClientHistory[]): Promise<Emergency[]> {
    const historyArray = history.map((h) => h.emergencyId);
    return await emergencyStore.fetchEmergencies(historyArray);
}

function setActivePageFromCache(startIndex: number) {
    activePage.value = loadedHistory.value.slice(startIndex, startIndex + pageSize.value);
    loaded.value = true;
}

async function loadHistory() {
    errorLoadingHistory.value = "";

    try {
        const historyResponse = await userStore.fetchUserEmergencyHistory(pageSize.value, paginationToken.value);

        if (historyResponse.data.length > 0) {
            paginationToken.value = historyResponse.paginationToken;
            const emergencies = await bulkLoadEmergencies(historyResponse.data);

            loadedHistory.value.push(...emergencies);
            setActivePageFromCache(0);
        }
    } catch (error: any) {
        errorLoadingHistory.value = t("error_loadingData");
        loaded.value = true;
    }
}

async function loadDataForPage(direction: number): Promise<void> {
    if (direction < 0 && page.value <= 0) return;

    page.value += direction;

    const startIndex = page.value * pageSize.value;
    if (loadedHistory.value.length > startIndex + pageSize.value || (loadedHistory.value.length > startIndex && isLastPageHistory.value)) {
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
    return paginationToken.value === undefined && page.value + 1 >= loadedHistory.value.length / pageSize.value;
});

const heightLoader = computed(() => {
    return 45 * pageSize.value + "px";
});
</script>

<template>
    <div class="w-full">
        <div class="rounded-lg shadow-md dark:bg-gray-800 dark:shadow-gray-900">
            <div>
                <div class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <div
                        class="grid grid-cols-7 rounded-t-lg bg-gray-50 py-3 font-Mohave font-semibold uppercase text-gray-500 dark:bg-gray-700 dark:text-gray-400 md:grid-cols-10"
                    >
                        <div class="col-span-4 col-start-2 md:col-span-3 md:col-start-2">{{ t("history_emergencyName") }}</div>
                        <div class="col-span-2">{{ t("history_date") }}</div>
                        <div class="col-span-2 hidden md:block">{{ t("history_location") }}</div>
                        <div class="col-span-2 hidden md:block">{{ t("history_status") }}</div>
                    </div>
                    <div v-if="errorLoadingHistory" class="flex h-[14.063rem] w-full items-center justify-center">
                        <GlobalErrorText :text="errorLoadingHistory" />
                    </div>
                    <div v-else-if="loaded && activePage.length > 0" ref="parentRowsDiv">
                        <HistoryTableRow v-for="emergency in activePage" :key="emergency.id" :emergency="emergency" :parent-div="parentRowsDiv" />
                    </div>
                    <div v-else-if="loaded && activePage.length === 0" class="flex h-[14.063rem] w-full items-center justify-center">
                        <p>{{ t("home_noEmergencies") }}</p>
                    </div>
                    <div v-else class="flex w-full items-center justify-center" :style="{ height: heightLoader }">
                        <GlobalLoader width="w-8" height="h-8" text-size="text-md" spacing="mb-4" />
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-between p-4">
                <div class="flex items-center text-xs md:space-x-3">
                    <p class="hidden text-sm font-normal text-gray-500 dark:text-gray-400 md:block">{{ t("history_rowsPerPage") }}</p>
                    <GlobalSelectInput
                        v-model="pageSize"
                        :options="[{ value: 5 }, { value: 10 }, { value: 20 }, { value: 30 }, { value: 50 }, { value: 75 }, { value: 100 }]"
                    />
                    <div class="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400 md:ml-0">
                        <p class="text-sm font-normal text-gray-500 dark:text-gray-400">
                            <span class="font-semibold text-gray-900 dark:text-white"
                                >{{ activePage.length === 0 ? 0 : page * pageSize + 1 }}-<span v-if="!loaded">{{
                                    userStore.totalNumberOfEmergencies < pageSize
                                        ? userStore.totalNumberOfEmergencies
                                        : page * pageSize + activePage.length
                                }}</span>
                                <span v-else-if="activePage.length === 0">0</span>
                                <span v-else-if="userStore.totalNumberOfEmergencies >= loadedHistory.length">{{
                                    page * pageSize + activePage.length > userStore.totalNumberOfEmergencies
                                        ? userStore.totalNumberOfEmergencies
                                        : page * pageSize + activePage.length
                                }}</span
                                ><span v-else>{{ page * pageSize + activePage.length }}</span></span
                            >
                            {{ t("history_of") }}
                            <span class="font-semibold text-gray-900 dark:text-white">{{
                                userStore.totalNumberOfEmergencies >= loadedHistory.length ? userStore.totalNumberOfEmergencies : loadedHistory.length
                            }}</span>
                        </p>
                    </div>
                </div>
                <div class="flex items-center">
                    <div class="flex items-stretch">
                        <button :disabled="!loaded" @click="previousPage()">
                            <span
                                class="ml-0 flex h-full w-20 cursor-pointer select-none items-center justify-center rounded-l-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 md:w-24"
                                :class="
                                    page <= 0 ? 'opacity-50 hover:bg-white dark:hover:bg-gray-800 dark:hover:text-gray-400' : 'dark:hover:text-white'
                                "
                            >
                                {{ t("history_previous") }}
                            </span>
                        </button>
                        <button :disabled="!loaded" @click="nextPage()">
                            <span
                                class="flex h-full w-20 cursor-pointer select-none items-center justify-center rounded-r-lg border border-gray-300 bg-white px-3 py-1.5 text-sm leading-tight text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 md:w-24"
                                :class="
                                    isLastPageHistory
                                        ? 'opacity-50 hover:bg-white dark:hover:bg-gray-800 dark:hover:text-gray-400'
                                        : 'dark:hover:text-white'
                                "
                            >
                                {{ t("history_next") }}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <WarningNoContactModal
            v-if="displayWarningNoContactModal"
            :emergency-id="loadedHistory[0].id"
            @close="displayWarningNoContactModal = false"
        />
    </div>
</template>
