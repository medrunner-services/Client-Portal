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
import { errorString } from "@/utils/functions/stringFunctions.ts";

const userStore = useUserStore();
const logicStore = useLogicStore();
const { t, locale } = useI18n();
use([TooltipComponent, GridComponent, LineChart, SVGRenderer]);

type ChartOptions = ComposeOption<TooltipComponentOption | GridComponentOption | LineSeriesOption>;

const daySelect = ref(7);
const loading = ref(false);

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

const emergenciesPerDay = ref<number[]>([]);
const dateLabels = ref<string[]>([]);
const errorLoading = ref("");

const oldestDateNeeded = ref(new Date());

const totalNumberOfEmergencies = computed(() => {
	return emergenciesPerDay.value.reduce((sum, current) => sum + current, 0);
});

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
		chartOptions.value.series.data = emergenciesPerDay.value;
		chartOptions.value.series.name = t("home_emergencies");
	}

	if (chartOptions.value.xAxis && !Array.isArray(chartOptions.value.xAxis)) {
		// @ts-expect-error - xAxis.data does exist on the type
		chartOptions.value.xAxis.data = dateLabels.value;
	}
}

function isWithinLastPeriod(timestamp: string) {
	const date = new Date(timestamp);
	return date >= oldestDateNeeded.value;
}

function initializeMissionsPerDay() {
	for (let i = 0; i < daySelect.value; i++) {
		emergenciesPerDay.value.push(0);
	}
}

function incrementDayCount(timestamp: string) {
	const emergencyDate = new Date(timestamp);
	emergencyDate.setHours(0, 0, 0, 0);

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const dayDifference = Math.ceil(Math.abs(today.getTime() - emergencyDate.getTime()) / (1000 * 3600 * 24));
	if (dayDifference < daySelect.value) {
		emergenciesPerDay.value[dayDifference]++;
	}
}

function generateDateLabels() {
	const labels = [];
	const today = new Date();

	for (let i = daySelect.value - 1; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);

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

	dateLabels.value = labels;
}

async function fetchMissionsForPeriod() {
	errorLoading.value = "";
	loading.value = true;

	let paginationToken;
	const limit = 50;

	oldestDateNeeded.value.setDate(oldestDateNeeded.value.getDate() - daySelect.value);
	initializeMissionsPerDay();

	try {
		do {
			const response = await userStore.fetchUserEmergencyHistory(limit, paginationToken);
			const recentEmergencies = response.data.filter(emergency => isWithinLastPeriod(emergency.created));

			recentEmergencies.forEach(emergency => incrementDayCount(emergency.created));

			if (recentEmergencies.length > 0) {
				const oldestFetchedEmergencyTimestamp = response.data[response.data.length - 1].created;
				paginationToken = isWithinLastPeriod(oldestFetchedEmergencyTimestamp) ? response.paginationToken : undefined;
			}
			else {
				paginationToken = undefined;
			}
		} while (paginationToken);

		emergenciesPerDay.value.reverse();
	}
	catch (error: any) {
		errorLoading.value = errorString(error.statusCode, t("error_loadingData"));
	}
	finally {
		loading.value = false;
	}
}

async function changePeriod() {
	emergenciesPerDay.value = [];
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
			<div class="flex items-center justify-between">
				<p class="font-Mohave text-2xl font-semibold uppercase">
					{{ t("home_emergencies") }}
				</p>
				<GlobalSelectInput
					v-model="daySelect"
					:options="[
						{ value: 7, label: t('home_day', { number: 7 }, 7) },
						{ value: 30, label: t('home_day', { number: 30 }, 30) },
						{ value: 60, label: t('home_day', { number: 60 }, 60) },
						{ value: 90, label: t('home_day', { number: 90 }, 90) },
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
