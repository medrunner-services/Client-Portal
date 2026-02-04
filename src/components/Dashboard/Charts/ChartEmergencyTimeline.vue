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

import { computed, onMounted, ref, watch } from "vue";
import VChart from "vue-echarts";
import { useI18n } from "vue-i18n";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
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
const daySelector = ref(7);

const emergenciesPerPeriod = ref<number[]>([]);
const dateLabels = ref<string[]>([]);
const totalNumberOfEmergencies = ref(0);
const startDate = ref(new Date(Date.now() - (millisecondsInDay * 7)));
const endDate = ref(new Date());
const periodDates = ref<Date[]>([]);

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
    startDate.value.setHours(0, 0, 0, 0);
    endDate.value.setHours(0, 0, 0, 0);

    generatePeriodDates();
    generateDateLabels();
    await fetchMissions();
    updateChartSeries();
});

watch(locale, () => {
    generateDateLabels();
    updateChartSeries();
});

async function updateDaySelector() {
    startDate.value = new Date(Date.now() - (millisecondsInDay * daySelector.value));
    endDate.value = new Date();

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
            <!--  TODO: Add a range date selector (limit to a year back) alongside the pre-defined day selector  -->
            <div class="flex items-center justify-between">
                <p class="font-Mohave text-2xl font-semibold uppercase">
                    {{ getChartTitle }}
                </p>
                <GlobalSelectInput
                    v-model="daySelector"
                    :options="[
                        { value: 7, label: t('home_day', { number: 7 }, 7) },
                        { value: 30, label: t('home_day', { number: 30 }, 30) },
                        { value: 60, label: t('home_day', { number: 60 }, 60) },
                        { value: 90, label: t('home_day', { number: 90 }, 90) },
                        { value: 180, label: t('home_day', { number: 180 }, 180) },
                        { value: 365, label: t('home_day', { number: 365 }, 365) },
                    ]"
                    @change="updateDaySelector()"
                />
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
