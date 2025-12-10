<script setup lang="ts">
import type { EChartsType } from "echarts";
import type { PieSeriesOption } from "echarts/charts";
import type { TitleComponentOption, TooltipComponentOption } from "echarts/components";
import type { ComposeOption, EChartsInitOpts } from "echarts/core";
import { PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent } from "echarts/components";
import { use } from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import { computed, onMounted, ref, watch } from "vue";
import VChart from "vue-echarts";

import { useI18n } from "vue-i18n";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";

const { t, locale } = useI18n();
const userStore = useUserStore();
const logicStore = useLogicStore();
use([SVGRenderer, PieChart, TooltipComponent, TitleComponent]);

type ChartOptions = ComposeOption<PieSeriesOption | TooltipComponentOption | TitleComponentOption>;

const chartRef = ref<InstanceType<typeof VChart> | null>(null);

const totalMissions = computed(() => {
	return Object.values(userStore.user.clientStats.missions).reduce((sum, val) => sum + val, 0);
});

const initOptions: EChartsInitOpts = {
	locale: locale.value,
	renderer: "svg",
};

const chartOptions = ref<ChartOptions>({
	tooltip: {
		trigger: "item",
	},
	title: {
		show: true,
		text: `{value|${totalMissions.value}}\n{name|${t("home_totalEmergencies")}}`,
		top: "middle",
		left: "center",
		textStyle: {
			rich: {
				value: {
					fontSize: 45,
					fontWeight: "bold",
					fontFamily: "Mohave, sans-serif",
					color: logicStore.darkMode ? "#fff" : "#111827",
					lineHeight: 50,
				},
				name: {
					fontSize: 20,
					fontFamily: "Mohave, sans-serif",
					color: logicStore.darkMode ? "#9ca3af" : "#6b7280",
					lineHeight: 30,
				},
			},
		},
	},
	backgroundColor: "transparent",
	series: {
		name: "Mission Breakdown",
		type: "pie",
		colorBy: "data",
		radius: ["70%", "90%"],
		minAngle: 5,
		stillShowZeroSum: false,
		avoidLabelOverlap: false,
		label: {
			show: false,
		},
		tooltip: {
			formatter: (params) => {
				return `<div class="text-black dark:text-white"><p>${params.name} : <span class="font-bold">${typeof params.value === "number" ? params.value.toString() : "0"}</span></p></div>`;
			},
			borderWidth: 2,
			borderRadius: 10,
			textStyle: {
				fontFamily: "Inter, sans-serif",
			},
		},
		labelLine: {
			show: false,
		},
	},
});

onMounted(() => {
	updateChartOptions();
});

watch(locale, () => {
	updateChartOptions();
});

function generateSeriesData() {
	const data: { value: number; name: string; itemStyle: { color: string } }[] = [];

	for (const [missionType, value] of Object.entries(userStore.user.clientStats.missions)) {
		if (value > 0) {
			data.push({
				value,
				name: getLabel(missionType),
				itemStyle: { color: getLabelColor(missionType) },
			});
		}
	}

	return data;
}

function updateChartOptions() {
	if (chartOptions.value.title && !Array.isArray(chartOptions.value.title)) {
		chartOptions.value.title.text = `{value|${totalMissions.value}}\n{name|${t("home_totalEmergencies")}}`;
	}

	if (chartOptions.value.series && !Array.isArray(chartOptions.value.series)) {
		const data = generateSeriesData();
		chartOptions.value.series.data = data;

		if (data.length === 1) {
			chartOptions.value.series.itemStyle = {
				borderRadius: 0,
				borderColor: "transparent",
			};
			chartOptions.value.series.padAngle = 0;
		}
		else {
			chartOptions.value.series.itemStyle = {
				borderRadius: 5,
				borderColor: "transparent",
			};
			chartOptions.value.series.padAngle = 1;
		}
	}
}

function getLabel(missionType: string): string {
	switch (missionType) {
		case "success":
			return t("history_completed");
		case "failed":
			return t("history_failed");
		case "noContact":
			return t("history_noContact");
		case "canceled":
			return t("history_canceled");
		case "refused":
			return t("history_refused");
		case "aborted":
			return t("history_aborted");
		case "serverError":
			return t("history_serverError");

		default:
			return t("tracking_unknown");
	}
}

function getLabelColor(missionType: string): string {
	switch (missionType) {
		case "success":
			return "#10b981";
		case "failed":
			return "#f87171";
		case "noContact":
			return "#3b82f6";
		case "canceled":
			return "#fdba74";
		case "refused":
			return "#a78bfa";
		case "aborted":
			return "#2dd4bf";
		case "serverError":
			return "#ec4899";
		default:
			return "#9ca3af";
	}
}

function highlightSegment(segmentName: string) {
	const chartInstance = chartRef.value?.chart as EChartsType | undefined;
	if (!chartInstance)
		return;

	chartInstance.dispatchAction({
		type: "highlight",
		seriesIndex: 0,
		name: segmentName,
	});
}

function downplaySegment(segmentName: string) {
	const chartInstance = chartRef.value?.chart as EChartsType | undefined;
	if (!chartInstance)
		return;

	chartInstance.dispatchAction({
		type: "downplay",
		seriesIndex: 0,
		name: segmentName,
	});
}
</script>

<template>
	<GlobalCard>
		<p class="font-Mohave text-2xl font-semibold uppercase">
			{{ t("home_emergencyBreakdown") }}
		</p>

		<div class="mt-4 flex w-full justify-center">
			<VChart
				ref="chartRef"
				class="chart"
				:init-options="initOptions"
				:option="chartOptions"
				:autoresize="true"
				:theme="logicStore.darkMode ? 'dark' : 'light'"
			/>
		</div>

		<div
			class="
				mt-4 flex justify-center border-t border-t-gray-200 p-4
				dark:border-t-gray-700
			"
		>
			<div
				class="
					flex flex-wrap justify-center gap-4
					xl:w-2/3
				"
			>
				<div
					v-for="(stat, key) in userStore.user.clientStats.missions" :key="key" class="flex items-center justify-center"
					@mouseenter="highlightSegment(getLabel(key))"
					@mouseleave="downplaySegment(getLabel(key))"
				>
					<div
						class="pi mr-2 h-3 w-3 rounded-full" :style="`background-color: ${getLabelColor(key)}`"
					/>
					<div
						class="
							text-sm text-gray-500
							dark:text-gray-400
						"
					>
						{{ getLabel(key) }}:
						<span
							class="
								font-semibold text-gray-900
								dark:text-white
							"
						>{{ stat }}</span>
					</div>
				</div>
			</div>
		</div>
	</GlobalCard>
</template>

<style scoped>
.chart {
    height: 325px;
    width: 100%;
}
</style>
