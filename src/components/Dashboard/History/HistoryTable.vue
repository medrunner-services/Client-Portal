<script setup lang="ts">
import type { Emergency } from "@medrunner/api-client";
import type { HistoryFilterStatus, WebSocketMessage } from "@/@types/types.ts";
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { AlertColors, LocalStorageItems } from "@/@types/types.ts";
import HistoryDateFilter from "@/components/Dashboard/History/HistoryDateFilter.vue";
import HistoryStatusFilter from "@/components/Dashboard/History/HistoryStatusFilter.vue";
import HistoryTableRow from "@/components/Dashboard/History/HistoryTableRow.vue";
import HistoryMobileFiltersModal from "@/components/Modals/HistoryMobileFiltersModal.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalLoader from "@/components/utils/GlobalLoader.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import { Breakpoint, useBreakpoint } from "@/composables/breakpoints.ts";
import { useClickOutside } from "@/composables/clickOutside.ts";
import { useAlertStore } from "@/stores/alertStore.ts";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useUserStore } from "@/stores/userStore";
import { errorString } from "@/utils/functions/stringFunctions.ts";
import { ws } from "@/utils/medrunnerClient";

const userStore = useUserStore();
const emergencyStore = useEmergencyStore();
const alertStore = useAlertStore();
const { t } = useI18n();
const currentBreakpoint = useBreakpoint();

const parentRowsDiv = ref<HTMLDivElement | null>(null);

const activePage = ref<Emergency[]>([]);
const pageSize = ref(Number.parseInt(localStorage.getItem(LocalStorageItems.SELECTED_PAGE_SIZE) ?? "10") ?? 10);
const page = ref(0);
const totalFetchedEmergencies = ref(0);
const paginationToken = ref<string | undefined>();

const loadedHistory = ref<Emergency[]>([]);
const errorLoadingHistory = ref("");
const loaded = ref(false);

const ascendingOrder = ref(false);
const showStatusFilter = ref(false);
const statusFilterRef = useTemplateRef("statusFilterRef");
const filteredStatuses = ref<HistoryFilterStatus[]>([]);
const showDateFilter = ref(false);
const dateFilterRef = useTemplateRef("dateFilterRef");
const filterStartDate = ref<string>("");
const filterEndDate = ref<string>("");
const displayMobileFilterModal = ref(false);

useClickOutside(statusFilterRef, () => showStatusFilter.value = false);
useClickOutside(dateFilterRef, () => showDateFilter.value = false);

onMounted(async () => {
    await loadHistory();
    activePage.value = [...loadedHistory.value];
    loaded.value = true;

    ws.on("EmergencyCreate", async (message: WebSocketMessage) => {
        try {
            const newEmergency = await emergencyStore.fetchEmergency(message.id);

            if (newEmergency.clientId === userStore.user.id) {
                loadedHistory.value.unshift(newEmergency);
                if (page.value === 0) {
                    activePage.value = loadedHistory.value.slice(0, pageSize.value);
                }
            }
        }
        catch (_e) {
            alertStore.newAlert(AlertColors.RED, t("error_globalLoading"), false, "warning", 5000);
        }
    });

    ws.on("EmergencyUpdate", async (message: WebSocketMessage) => {
        try {
            const updatedEmergency = await emergencyStore.fetchEmergency(message.id);

            if (updatedEmergency.clientId === userStore.user.id) {
                const indexLoadedHistory = loadedHistory.value.findIndex(emergency => emergency.id === updatedEmergency.id);
                const indexActivePage = activePage.value.findIndex(emergency => emergency.id === updatedEmergency.id);
                if (indexLoadedHistory !== -1) {
                    loadedHistory.value[indexLoadedHistory] = updatedEmergency;
                }
                if (indexActivePage !== -1) {
                    activePage.value[indexActivePage] = updatedEmergency;
                }
            }
        }
        catch (_e) {
            alertStore.newAlert(AlertColors.RED, t("error_globalLoading"), false, "warning", 5000);
        }
    });
});

watch(pageSize, async (newPageSize, oldPageSize) => {
    if (loadedHistory.value.length < newPageSize && loadedHistory.value.length >= oldPageSize) {
        await reloadHistory();
    }
    else {
        setActivePageFromCache(0);
    }

    localStorage.setItem(LocalStorageItems.SELECTED_PAGE_SIZE, newPageSize.toString());
});

const isLastPageHistory = computed(() => {
    return paginationToken.value === undefined && page.value + 1 >= loadedHistory.value.length / pageSize.value;
});

const heightLoader = computed(() => {
    if (currentBreakpoint.value >= Breakpoint.MD) {
        return `${45 * pageSize.value}px`;
    }
    else {
        return `${77 * pageSize.value}px`;
    }
});

async function reloadHistory() {
    loaded.value = false;
    loadedHistory.value = [];
    paginationToken.value = undefined;
    page.value = 0;
    await loadHistory();
}

function setActivePageFromCache(startIndex: number) {
    activePage.value = loadedHistory.value.slice(startIndex, startIndex + pageSize.value);
    loaded.value = true;
}

async function loadHistory() {
    errorLoadingHistory.value = "";

    try {
        const historyResponse = await userStore.fetchUserClientEmergencyHistory(pageSize.value, paginationToken.value, ascendingOrder.value, filteredStatuses.value, filterStartDate.value?.toString(), filterEndDate.value?.toString());

        paginationToken.value = historyResponse.paginationToken;
        totalFetchedEmergencies.value = historyResponse.totalCount;

        loadedHistory.value.push(...historyResponse.data);
        setActivePageFromCache(0);
    }
    catch (error: any) {
        errorLoadingHistory.value = errorString(error.statusCode, t("error_loadingData"));
        loaded.value = true;
    }
}

async function loadDataForPage(direction: number): Promise<void> {
    if (direction < 0 && page.value <= 0)
        return;

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

async function toggleOrder(): Promise<void> {
    ascendingOrder.value = !ascendingOrder.value;

    await reloadHistory();
}

async function updateStatusFilter(newStatus: HistoryFilterStatus[]): Promise<void> {
    showStatusFilter.value = false;
    filteredStatuses.value = newStatus;

    await reloadHistory();
}

async function updateDateFilter(newStartDate: string, newEndDate: string): Promise<void> {
    showDateFilter.value = false;
    filterStartDate.value = newStartDate;
    filterEndDate.value = newEndDate;

    await reloadHistory();
}

async function updateAllFilters(newStartDate: string, newEndDate: string, newStatus: HistoryFilterStatus[]): Promise<void> {
    displayMobileFilterModal.value = false;

    filterStartDate.value = newStartDate;
    filterEndDate.value = newEndDate;
    filteredStatuses.value = newStatus;

    await reloadHistory();
}

const hasFilters = computed(() => {
    return filterStartDate.value || filterEndDate.value || (filteredStatuses.value.length > 0 && filteredStatuses.value.length < 7);
});
</script>

<template>
    <div class="w-full">
        <div
            class="
                mb-2 flex items-center justify-between gap-2
                md:hidden
            "
        >
            <GlobalButton
                :type="ascendingOrder ? 'primary' : 'outline-solid'"
                padding-class="p-1.5"
                @click="toggleOrder()"
            >
                <div class="flex items-center justify-between gap-2">
                    <svg
                        v-if="!ascendingOrder"
                        class="size-4 cursor-pointer"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20" fill="currentColor"
                    >
                        <path fill-rule="evenodd" d="M2.24 6.8a.75.75 0 0 0 1.06-.04l1.95-2.1v8.59a.75.75 0 0 0 1.5 0V4.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0L2.2 5.74a.75.75 0 0 0 .04 1.06Zm8 6.4a.75.75 0 0 0-.04 1.06l3.25 3.5a.75.75 0 0 0 1.1 0l3.25-3.5a.75.75 0 1 0-1.1-1.02l-1.95 2.1V6.75a.75.75 0 0 0-1.5 0v8.59l-1.95-2.1a.75.75 0 0 0-1.06-.04Z" clip-rule="evenodd" />
                    </svg>
                    <svg
                        v-else
                        class="size-3.5 cursor-pointer text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="3"
                        stroke="currentColor"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                    </svg>

                    <p>
                        {{ t("history_sortByDate") }}
                    </p>
                </div>
            </GlobalButton>

            <GlobalButton
                :type="hasFilters ? 'primary' : 'outline-solid'"
                padding-class="p-1.5"
                @click="displayMobileFilterModal = true"
            >
                <div class="flex items-center justify-between gap-2">
                    <p>{{ t("history_filters") }}</p>
                    <svg
                        v-if="hasFilters"
                        class="size-4 cursor-pointer text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path fill-rule="evenodd" d="M3.792 2.938A49.069 49.069 0 0 1 12 2.25c2.797 0 5.54.236 8.209.688a1.857 1.857 0 0 1 1.541 1.836v1.044a3 3 0 0 1-.879 2.121l-6.182 6.182a1.5 1.5 0 0 0-.439 1.061v2.927a3 3 0 0 1-1.658 2.684l-1.757.878A.75.75 0 0 1 9.75 21v-5.818a1.5 1.5 0 0 0-.44-1.06L3.13 7.938a3 3 0 0 1-.879-2.121V4.774c0-.897.64-1.683 1.542-1.836Z" clip-rule="evenodd" />
                    </svg>
                    <svg
                        v-else
                        class="size-4 cursor-pointer"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                    </svg>
                </div>
            </GlobalButton>
        </div>

        <div
            class="
                rounded-lg shadow-md
                dark:bg-gray-800 dark:shadow-gray-900
            "
        >
            <div>
                <div
                    class="
                        w-full text-left text-sm text-gray-500
                        dark:text-gray-400
                    "
                >
                    <div
                        class="
                            grid grid-cols-12 rounded-t-lg bg-gray-50 py-3 font-Mohave font-semibold text-gray-500 uppercase
                            md:grid-cols-24
                            dark:bg-gray-700 dark:text-gray-400
                        "
                    >
                        <div
                            class="
                                col-span-7 col-start-2 pl-1
                                md:col-span-10 md:col-start-3
                            "
                        >
                            {{ t("history_emergencyName") }}
                        </div>
                        <div
                            class="
                                col-span-2 hidden items-center justify-between pr-2
                                md:col-span-4 md:flex md:pr-4
                            "
                        >
                            <p>{{ t("history_date") }}</p>
                            <div class="relative flex items-center justify-between gap-1">
                                <svg
                                    v-if="filterStartDate || filterEndDate" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="
                                        size-4 cursor-pointer text-gray-900
                                        dark:text-gray-300
                                    " @click="showDateFilter = !showDateFilter"
                                >
                                    <path fill-rule="evenodd" d="M3.792 2.938A49.069 49.069 0 0 1 12 2.25c2.797 0 5.54.236 8.209.688a1.857 1.857 0 0 1 1.541 1.836v1.044a3 3 0 0 1-.879 2.121l-6.182 6.182a1.5 1.5 0 0 0-.439 1.061v2.927a3 3 0 0 1-1.658 2.684l-1.757.878A.75.75 0 0 1 9.75 21v-5.818a1.5 1.5 0 0 0-.44-1.06L3.13 7.938a3 3 0 0 1-.879-2.121V4.774c0-.897.64-1.683 1.542-1.836Z" clip-rule="evenodd" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 cursor-pointer" @click="showDateFilter = !showDateFilter">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                                </svg>

                                <div
                                    v-if="showDateFilter"
                                    ref="dateFilterRef"
                                    class="
                                        absolute top-6 -left-2 z-50 w-44 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-md
                                        dark:border-gray-700 dark:bg-[#1D2735] dark:shadow-gray-900
                                    "
                                >
                                    <HistoryDateFilter
                                        :current-start="filterStartDate"
                                        :current-end="filterEndDate"
                                        @update-filter="(start, end) => updateDateFilter(start, end)"
                                    />
                                </div>

                                <svg
                                    v-if="!ascendingOrder"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20" fill="currentColor" class="size-4 cursor-pointer" @click="toggleOrder()"
                                >
                                    <path fill-rule="evenodd" d="M2.24 6.8a.75.75 0 0 0 1.06-.04l1.95-2.1v8.59a.75.75 0 0 0 1.5 0V4.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0L2.2 5.74a.75.75 0 0 0 .04 1.06Zm8 6.4a.75.75 0 0 0-.04 1.06l3.25 3.5a.75.75 0 0 0 1.1 0l3.25-3.5a.75.75 0 1 0-1.1-1.02l-1.95 2.1V6.75a.75.75 0 0 0-1.5 0v8.59l-1.95-2.1a.75.75 0 0 0-1.06-.04Z" clip-rule="evenodd" />
                                </svg>
                                <svg
                                    v-else
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="
                                        mr-0.5 size-3.5 cursor-pointer text-gray-900
                                        dark:text-gray-300
                                    " @click="toggleOrder()"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                                </svg>
                            </div>
                        </div>
                        <div
                            class="
                                col-span-2 hidden
                                md:col-span-4 md:block
                            "
                        >
                            {{ t("history_location") }}
                        </div>
                        <div
                            class="
                                col-span-4 mr-2 flex items-center justify-between gap-4 justify-self-end
                                md:col-span-4 md:mr-0 md:gap-0 md:justify-self-auto md:pr-4
                            "
                        >
                            <p>{{ t("history_status") }}</p>
                            <div
                                class="
                                    relative hidden items-center justify-between gap-1
                                    md:flex
                                "
                            >
                                <svg
                                    v-if="(filteredStatuses.length > 0 && filteredStatuses.length < 7)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="
                                        size-4 cursor-pointer text-gray-900
                                        dark:text-gray-300
                                    " @click="showStatusFilter = !showStatusFilter"
                                >
                                    <path fill-rule="evenodd" d="M3.792 2.938A49.069 49.069 0 0 1 12 2.25c2.797 0 5.54.236 8.209.688a1.857 1.857 0 0 1 1.541 1.836v1.044a3 3 0 0 1-.879 2.121l-6.182 6.182a1.5 1.5 0 0 0-.439 1.061v2.927a3 3 0 0 1-1.658 2.684l-1.757.878A.75.75 0 0 1 9.75 21v-5.818a1.5 1.5 0 0 0-.44-1.06L3.13 7.938a3 3 0 0 1-.879-2.121V4.774c0-.897.64-1.683 1.542-1.836Z" clip-rule="evenodd" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 cursor-pointer" @click="showStatusFilter = !showStatusFilter">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                                </svg>

                                <div
                                    v-if="showStatusFilter"
                                    ref="statusFilterRef"
                                    class="
                                        absolute top-6 -right-2 z-50 w-36 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-md
                                        xl:right-auto xl:-left-2
                                        dark:border-gray-700 dark:bg-[#1D2735] dark:shadow-gray-900
                                    "
                                >
                                    <HistoryStatusFilter
                                        :current-status="filteredStatuses"
                                        @update-filter="(newStatus) => updateStatusFilter(newStatus)"
                                    />
                                </div>
                            </div>
                        </div>
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
            <div
                class="
                    flex items-center justify-between p-2
                    md:p-4
                "
            >
                <div
                    class="
                        flex items-center text-xs
                        md:space-x-3
                    "
                >
                    <p
                        class="
                            hidden text-sm font-normal text-gray-500
                            md:block
                            dark:text-gray-400
                        "
                    >
                        {{ t("history_rowsPerPage") }}
                    </p>
                    <GlobalSelectInput
                        v-model="pageSize"
                        input-size="small"
                        :options="[{ value: 5 }, { value: 10 }, { value: 20 }, { value: 30 }, { value: 50 }, { value: 75 }, { value: 100 }]"
                    />
                    <div
                        class="
                            ml-2 text-xs font-normal text-gray-500
                            md:ml-0
                            dark:text-gray-400
                        "
                    >
                        <p
                            class="
                                text-xs font-normal text-gray-500
                                md:text-sm
                                dark:text-gray-400
                            "
                        >
                            <span
                                class="
                                    font-semibold text-gray-900
                                    dark:text-white
                                "
                            >{{ activePage.length === 0 ? 0 : page * pageSize + 1 }}-<span v-if="!loaded">{{
                                userStore.totalNumberOfEmergencies < pageSize
                                    ? userStore.totalNumberOfEmergencies
                                    : page * pageSize + activePage.length
                            }}</span>
                                <span v-else-if="activePage.length === 0">0</span>
                                <span v-else-if="totalFetchedEmergencies >= loadedHistory.length">{{
                                    page * pageSize + activePage.length > totalFetchedEmergencies
                                        ? totalFetchedEmergencies
                                        : page * pageSize + activePage.length
                                }}</span><span v-else>{{ page * pageSize + activePage.length }}</span></span>
                            {{ t("history_of") }}
                            <span
                                class="
                                    font-semibold text-gray-900
                                    dark:text-white
                                "
                            >{{
                                totalFetchedEmergencies
                            }}</span>
                        </p>
                    </div>
                </div>
                <div class="flex items-center">
                    <div class="flex items-stretch">
                        <button :disabled="!loaded" @click="previousPage()">
                            <span
                                class="
                                    ml-0 flex h-full w-16 cursor-pointer items-center justify-center rounded-l-lg border border-gray-300 bg-white px-3 py-1.5 text-xs/tight text-gray-500 select-none
                                    hover:bg-gray-100
                                    md:w-24 md:text-sm
                                    dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400
                                    dark:hover:bg-gray-700
                                "
                                :class="
                                    page <= 0 ? `
                                        opacity-50
                                        hover:bg-white
                                        dark:hover:bg-gray-800 dark:hover:text-gray-400
                                    ` : 'dark:hover:text-white'
                                "
                            >
                                {{ t("history_previous") }}
                            </span>
                        </button>
                        <button :disabled="!loaded" @click="nextPage()">
                            <span
                                class="
                                    flex h-full w-16 cursor-pointer items-center justify-center rounded-r-lg border border-gray-300 bg-white px-3 py-1.5 text-xs/tight text-gray-500 select-none
                                    hover:bg-gray-100
                                    md:w-24 md:text-sm
                                    dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400
                                    dark:hover:bg-gray-700
                                "
                                :class="
                                    isLastPageHistory
                                        ? `
                                            opacity-50
                                            hover:bg-white
                                            dark:hover:bg-gray-800 dark:hover:text-gray-400
                                        `
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

        <HistoryMobileFiltersModal
            v-if="displayMobileFilterModal"
            :current-start="filterStartDate"
            :current-end="filterEndDate"
            :current-status="filteredStatuses"
            @update-filters="(start, end, status) => updateAllFilters(start, end, status)"
            @close="displayMobileFilterModal = false"
        />
    </div>
</template>
