<script setup lang="ts">
import type { LineSeriesOption } from "echarts/charts";
import type { GridComponentOption, TooltipComponentOption } from "echarts/components";
import type { ComposeOption, EChartsInitOpts } from "echarts/core";
import type { EchartLoadingOptions } from "@/@types/types.ts";
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
import { fetchAllPaginatedResponse } from "@/utils/functions/fetchFunctions.ts";
import { errorString } from "@/utils/functions/stringFunctions.ts";

const userStore = useUserStore();
const logicStore = useLogicStore();
const { t, locale } = useI18n();
use([TooltipComponent, GridComponent, LineChart, SVGRenderer]);

type ChartOptions = ComposeOption<TooltipComponentOption | GridComponentOption | LineSeriesOption>;
type GroupingMode = "daily" | "weekly" | "monthly";

const daySelect = ref(7);
const loading = ref(false);
const isAnimationEnabled = ref(true);

const groupingMode = computed<GroupingMode>(() => {
    if (daySelect.value < 60)
        return "daily";
    if (daySelect.value < 180)
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

const emergenciesPerPeriod = ref<number[]>([]);
const dateLabels = ref<string[]>([]);
const errorLoading = ref("");
const totalNumberOfEmergencies = ref(0);

const oldestDateNeeded = ref(new Date());

onMounted(async () => {
    await fetchMissionsForPeriod();
    generateDateLabels();

    updateChartSeries();
});

watch(locale, () => {
    generateDateLabels();

    updateChartSeries();
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

function getNumberOfPeriods(): number {
    const mode = groupingMode.value;

    if (mode === "daily") {
        return daySelect.value;
    }
    else if (mode === "weekly") {
        return Math.ceil(daySelect.value / 7);
    }
    else {
        return Math.ceil(daySelect.value / 30);
    }
}

function getPeriodStartDate(periodIndex: number): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mode = groupingMode.value;

    if (mode === "daily") {
        const date = new Date(today);
        date.setDate(date.getDate() - periodIndex);
        return date;
    }
    else if (mode === "weekly") {
        const date = new Date(today);
        date.setDate(date.getDate() - (periodIndex * 7));
        return date;
    }
    else {
        const date = new Date(today);
        date.setMonth(date.getMonth() - periodIndex);
        return date;
    }
}

function getPeriodIndexForDate(emergencyDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    emergencyDate.setHours(0, 0, 0, 0);

    const mode = groupingMode.value;
    const dayDifference = Math.ceil((today.getTime() - emergencyDate.getTime()) / (1000 * 3600 * 24));

    if (mode === "daily") {
        return dayDifference;
    }
    else if (mode === "weekly") {
        return Math.floor(dayDifference / 7);
    }
    else {
        return (today.getFullYear() - emergencyDate.getFullYear()) * 12
            + (today.getMonth() - emergencyDate.getMonth());
    }
}

function generateDateLabels() {
    const labels = [];
    const numPeriods = getNumberOfPeriods();
    const mode = groupingMode.value;

    for (let i = numPeriods - 1; i >= 0; i--) {
        const date = getPeriodStartDate(i);

        if (mode === "daily") {
            if (daySelect.value < 360) {
                labels.push(
                    date.toLocaleDateString(locale.value, {
                        month: "2-digit",
                        day: "2-digit",
                    }),
                );
            }
            else {
                labels.push(
                    date.toLocaleDateString(locale.value, {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                    }),
                );
            }
        }
        else if (mode === "weekly") {
            labels.push(
                date.toLocaleDateString(locale.value, {
                    month: "2-digit",
                    day: "2-digit",
                }),
            );
        }
        else {
            labels.push(
                date.toLocaleDateString(locale.value, {
                    month: "short",
                    year: "numeric",
                }),
            );
        }
    }

    dateLabels.value = labels;
}

function initializePeriodsData() {
    const numPeriods = getNumberOfPeriods();
    emergenciesPerPeriod.value = Array.from({ length: numPeriods }, () => 0);
}

function incrementPeriodCount(timestamp: string) {
    const emergencyDate = new Date(timestamp);
    const periodIndex = getPeriodIndexForDate(emergencyDate);
    const numPeriods = getNumberOfPeriods();

    if (periodIndex >= 0 && periodIndex < numPeriods) {
        emergenciesPerPeriod.value[periodIndex]++;
    }
}

async function fetchMissionsForPeriod() {
    errorLoading.value = "";
    loading.value = true;

    oldestDateNeeded.value.setDate(oldestDateNeeded.value.getDate() - daySelect.value);
    initializePeriodsData();

    try {
        const recentEmergencies = await fetchAllPaginatedResponse(
            userStore.fetchUserClientEmergencyHistory,
            undefined,
            undefined,
            oldestDateNeeded.value.toISOString(),
            new Date().toISOString(),
        );

        totalNumberOfEmergencies.value = recentEmergencies.totalCount;
        recentEmergencies.data.forEach(emergency => incrementPeriodCount(emergency.created));

        emergenciesPerPeriod.value.reverse();
    }
    catch (error: any) {
        errorLoading.value = errorString(error.statusCode, t("error_loadingData"));
    }
    finally {
        loading.value = false;
    }
}

async function changePeriod() {
    emergenciesPerPeriod.value = [];
    oldestDateNeeded.value = new Date();
    dateLabels.value = [];

    await fetchMissionsForPeriod();
    generateDateLabels();

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
                    v-model="daySelect"
                    :options="[
                        { value: 7, label: t('home_day', { number: 7 }, 7) },
                        { value: 30, label: t('home_day', { number: 30 }, 30) },
                        { value: 60, label: t('home_day', { number: 60 }, 60) },
                        { value: 90, label: t('home_day', { number: 90 }, 90) },
                        { value: 180, label: t('home_day', { number: 180 }, 180) },
                        { value: 365, label: t('home_day', { number: 365 }, 365) },
                    ]"
                    @change="changePeriod()"
                />
            </div>

            <div class="mt-8">
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

            <div class="mt-4 w-full justify-center">
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
