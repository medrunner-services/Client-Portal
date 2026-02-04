<script setup lang="ts">
import type { Emergency } from "@medrunner/api-client";
import type { LineSeriesOption } from "echarts/charts";
import type { GridComponentOption, TooltipComponentOption } from "echarts/components";
import type { ComposeOption, EChartsInitOpts } from "echarts/core";
import type { EchartLoadingOptions } from "@/@types/types.ts";
import {
    addDays,
    addMonths,
    addWeeks,
    differenceInDays,
    eachDayOfInterval,
    eachMonthOfInterval,
    eachWeekendOfInterval,
    endOfDay,
    isWithinInterval,
} from "date-fns";
import { millisecondsInDay } from "date-fns/constants";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { use } from "echarts/core";
import { SVGRenderer } from "echarts/renderers";

import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
import VChart from "vue-echarts";
import { useI18n } from "vue-i18n";
import HistoryDateFilter from "@/components/Dashboard/History/HistoryDateFilter.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import { useClickOutside } from "@/composables/clickOutside.ts";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";
import { toUserDateString } from "@/utils/functions/dateTimeFunctions.ts";
import { fetchAllPaginatedResponse } from "@/utils/functions/fetchFunctions.ts";
import { errorString } from "@/utils/functions/stringFunctions.ts";

const userStore = useUserStore();
const logicStore = useLogicStore();
const { t, locale } = useI18n();
use([TooltipComponent, GridComponent, LineChart, SVGRenderer]);

type ChartOptions = ComposeOption<TooltipComponentOption | GridComponentOption | LineSeriesOption>;
type GroupingMode = "daily" | "weekly" | "monthly";

const loading = ref(false);
const isAnimationEnabled = ref(true);
const errorLoading = ref("");
const showDateSelector = ref(false);
const daySelector = ref(7);
const startDateSelector = ref<string | undefined>();
const endDateSelector = ref<string | undefined>();
const dateSelectorRef = useTemplateRef("dateSelector");

const emergenciesPerPeriod = ref<number[]>([]);
const dateLabels = ref<string[]>([]);
const totalNumberOfEmergencies = ref(0);
const startDate = ref(new Date(Date.now() - (millisecondsInDay * 7)));
const endDate = ref(new Date());
const periodDates = ref<Date[]>([]);

useClickOutside(dateSelectorRef, () => showDateSelector.value = false);

const groupingMode = computed<GroupingMode>(() => {
    const dayDifference = differenceInDays(endDate.value, startDate.value);

    if (dayDifference < 60)
        return "daily";
    if (dayDifference < 179)
        return "weekly";
    return "monthly";
});

const getChartTitle = computed(() => {
    switch (groupingMode.value) {
        case "daily":
            return t("home_emergenciesPerDay");
        case "weekly":
            return t("home_emergenciesPerWeek");
        case "monthly":
            return t("home_emergenciesPerMonth");
        default:
            return t("home_emergenciesPerDay");
    }
});

const initOptions: EChartsInitOpts = {
    locale: locale.value,
    renderer: "svg",
};

const loadingOptions: EchartLoadingOptions = {
    text: "",
    color: "#AA0000",
    maskColor: logicStore.darkMode ? "rgba(29, 39, 53, 0.8)" : "rgba(255, 255, 255, 0.8)",
    spinnerRadius: 15,
};

const chartOptions = ref<ChartOptions>({
    color: ["#AA0000"],
    backgroundColor: "transparent",
    stateAnimation: {
        duration: 0,
    },
    grid: {
        left: 0,
        right: 0,
        bottom: 0,
    },
    tooltip: {
        trigger: "axis",
        axisPointer: {
            type: "cross",
            label: {
                backgroundColor: "#6a7985",
            },
        },
    },
    xAxis: {
        type: "category",
        boundaryGap: false,
        animation: false,
    },
    yAxis: {
        type: "value",
        show: false,
        minInterval: 1,
        axisPointer: {
            snap: true,
        },
    },
    series: {
        name: t("home_emergencies"),
        type: "line",
        smooth: true,
        smoothMonotone: "x",
        lineStyle: {
            width: 4,
            color: "#AA0000",
            cap: "round",
        },
        showSymbol: false,
        areaStyle: {
            opacity: 1,
            color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                    {
                        offset: 0,
                        color: "rgba(170, 0, 0, 0.7)",
                    },
                    {
                        offset: 1,
                        color: "rgba(170, 0, 0, 0.1)",
                    },
                ],
            },
        },
        emphasis: {
            focus: "series",
        },
    },
});

function updateChartSeries() {
    if (chartOptions.value.series && !Array.isArray(chartOptions.value.series)) {
        if (!isAnimationEnabled.value) {
            chartOptions.value.series.animation = false;
        }
        isAnimationEnabled.value = false;

        chartOptions.value.series.data = emergenciesPerPeriod.value;
        chartOptions.value.series.name = t("home_emergencies");
    }

    if (chartOptions.value.xAxis && !Array.isArray(chartOptions.value.xAxis)) {
        // @ts-expect-error - xAxis.data does exist on the type
        chartOptions.value.xAxis.data = dateLabels.value;
    }
}

function generatePeriodDates() {
    switch (groupingMode.value) {
        case "daily":
            periodDates.value = eachDayOfInterval({
                start: startDate.value,
                end: endDate.value,
            });
            break;
        case "weekly":
            periodDates.value = eachWeekendOfInterval({
                start: startDate.value,
                end: endDate.value,
            });
            break;
        case "monthly":
            periodDates.value = eachMonthOfInterval({
                start: startDate.value,
                end: endDate.value,
            });
            break;
    }
}

function generateDateLabels() {
    const labels = [];

    for (const date of periodDates.value) {
        if (groupingMode.value === "daily") {
            labels.push(
                toUserDateString(date, {
                    month: "2-digit",
                    day: "2-digit",
                }),
            );
        }
        else if (groupingMode.value === "weekly") {
            labels.push(
                toUserDateString(date, {
                    month: "2-digit",
                    day: "2-digit",
                }),
            );
        }
        else {
            labels.push(
                toUserDateString(date, {
                    month: "short",
                    year: "numeric",
                }),
            );
        }
    }

    dateLabels.value = labels;
}

function generateChartData(emergencies: Emergency[]): number[] {
    const graphData = Array.from({ length: periodDates.value.length }, () => 0);

    for (const emergency of emergencies) {
        for (let i = 0; i < periodDates.value.length; i++) {
            let periodEnd = periodDates.value[i + 1];
            if (i === periodDates.value.length - 1) {
                switch (groupingMode.value) {
                    case "daily":
                        periodEnd = addDays(periodDates.value[i], 1);
                        break;
                    case "weekly":
                        periodEnd = addWeeks(periodDates.value[i], 1);
                        break;
                    case "monthly":
                        periodEnd = addMonths(periodDates.value[i], 1);
                        break;
                }
            }

            if (isWithinInterval(emergency.created, { start: periodDates.value[i], end: periodEnd })) {
                graphData[i]++;
                break;
            }
        }
    }

    return graphData;
}

async function fetchMissions() {
    errorLoading.value = "";
    loading.value = true;

    try {
        const response = await fetchAllPaginatedResponse(
            userStore.fetchUserClientEmergencyHistory,
            undefined,
            undefined,
            startDate.value.toISOString(),
            endOfDay(endDate.value).toISOString(),
        );

        totalNumberOfEmergencies.value = response.totalCount;
        emergenciesPerPeriod.value = generateChartData(response.data);
    }
    catch (error: any) {
        errorLoading.value = errorString(error.statusCode, t("error_loadingData"));
    }
    finally {
        loading.value = false;
    }
}

onMounted(async () => {
    await updateDateSelector();
});

watch(locale, () => {
    generateDateLabels();
    updateChartSeries();
});

async function updateDateSelector(params?: { start: string; end: string }) {
    showDateSelector.value = false;

    if (params && params.start && params.end) {
        daySelector.value = -1;
        startDateSelector.value = params.start;
        endDateSelector.value = params.end;

        startDate.value = new Date(params.start);
        endDate.value = new Date(params.end);
    }
    else {
        startDateSelector.value = undefined;
        endDateSelector.value = undefined;

        if (daySelector.value === -1)
            daySelector.value = 7;

        startDate.value = new Date(Date.now() - (millisecondsInDay * daySelector.value));
        endDate.value = new Date();
    }

    startDate.value.setHours(0, 0, 0, 0);
    endDate.value.setHours(0, 0, 0, 0);

    generatePeriodDates();
    generateDateLabels();
    await fetchMissions();
    updateChartSeries();
}
</script>

<template>
    <GlobalCard>
        <div v-if="errorLoading" class="flex h-80 items-center justify-center">
            <GlobalErrorText :text="errorLoading" />
        </div>

        <div v-else>
            <div class="relative flex items-center justify-between">
                <p class="font-Mohave text-2xl font-semibold uppercase">
                    {{ getChartTitle }}
                </p>

                <button
                    class="
                        flex w-fit cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900
                        focus:border-gray-500 focus:ring-1 focus:ring-gray-500
                        disabled:cursor-not-allowed
                        dark:border-gray-600 dark:bg-gray-700 dark:text-white
                        dark:focus:border-gray-400 dark:focus:ring-gray-400
                    "
                    @click="showDateSelector = !showDateSelector"
                >
                    <span
                        class="
                            min-w-16 text-left
                            sm:pr-8
                        "
                    >{{ daySelector < 0 ? t("home_custom") : t('home_day', { number: daySelector }, daySelector) }}</span>
                    <svg
                        class="size-2.5 text-gray-500"
                        :class="showDateSelector ? 'rotate-180' : ''"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                    </svg>
                </button>

                <div
                    v-if="showDateSelector"
                    ref="dateSelector"
                    class="
                        absolute top-12 right-0 z-50 inline-block rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm shadow-sm
                        max-[362px]:top-14
                        dark:border-gray-600 dark:bg-gray-700
                    "
                >
                    <GlobalSelectInput
                        v-model="daySelector"
                        input-size="small"
                        :options="[
                            { value: 7, label: t('home_day', { number: 7 }, 7) },
                            { value: 30, label: t('home_day', { number: 30 }, 30) },
                            { value: 60, label: t('home_day', { number: 60 }, 60) },
                            { value: 90, label: t('home_day', { number: 90 }, 90) },
                            { value: 180, label: t('home_day', { number: 180 }, 180) },
                            { value: 365, label: t('home_day', { number: 365 }, 365) },
                            { value: -1, label: t('home_custom') },
                        ]"
                        @change="updateDateSelector()"
                    />

                    <hr class="my-2">

                    <HistoryDateFilter
                        class="mt-2"
                        :current-start="startDateSelector"
                        :current-end="endDateSelector"
                        @update-filter="(start, end) => updateDateSelector({ start, end })"
                    />
                </div>
            </div>

            <div class="mt-6">
                <p
                    class="
                        font-Mohave text-4xl font-bold text-gray-900
                        dark:text-white
                    "
                >
                    {{ totalNumberOfEmergencies }}
                </p>
                <p
                    class="
                        font-Mohave text-lg text-gray-500
                        dark:text-gray-400
                    "
                >
                    {{ t("home_emergencyChartTitle", totalNumberOfEmergencies) }}
                </p>
            </div>

            <div class="w-full justify-center">
                <VChart
                    class="chart"
                    :init-options="initOptions"
                    :option="chartOptions"
                    :loading-options="loadingOptions"
                    :loading="loading"
                    :autoresize="true"
                    :theme="logicStore.darkMode ? 'dark' : 'light'"
                />
            </div>
        </div>
    </GlobalCard>
</template>

<style scoped>
.chart {
    height: 300px;
    width: 100%;
}
</style>
