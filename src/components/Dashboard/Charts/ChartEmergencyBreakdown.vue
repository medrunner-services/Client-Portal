<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import GlobalCard from "@/components/utils/GlobalCard.vue";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const logicStore = useLogicStore();
const { t, locale } = useI18n();

const chartOptions = ref<any>({
	labels: [""],
	colors: [""],
	chart: {
		type: "donut",
	},
	stroke: {
		colors: ["transparent"],
		lineCap: "",
	},
	states: {
		hover: {
			filter: {
				type: "darken",
				value: 0.8,
			},
		},
		active: {
			filter: {
				type: "none",
			},
		},
	},
	plotOptions: {
		pie: {
			donut: {
				labels: {
					show: true,
					name: {
						show: true,
						offsetY: 30,
					},
					total: {
						showAlways: false,
						show: true,
						label: "",
						fontFamily: "Mohave, sans-serif",
						fontWeight: 400,
						color: "#6b7280",
						fontSize: "18px",
						formatter(w: any) {
							const sum = w.globals.seriesTotals.reduce((a: any, b: any) => {
								return a + b;
							}, 0);
							return `${sum}`;
						},
					},
					value: {
						show: true,
						fontFamily: "Mohave, sans-serif",
						fontWeight: 800,
						color: "#111827",
						fontSize: "40px",
						offsetY: -20,
						formatter(value: any) {
							return value;
						},
					},
				},
				size: "80%",
			},
			expandOnClick: false,
		},
	},
	grid: {
		padding: {
			top: -2,
		},
	},
	dataLabels: {
		enabled: false,
	},
	legend: {
		show: false,
	},
});
const chartSeries = ref([0, 0, 0, 0, 0, 0, 0]);

onMounted(() => {
	const chartLabels = [];
	const chartColors = [];

	for (const missionType of Object.keys(userStore.user.clientStats.missions)) {
		chartLabels.push(getMissionType(missionType));
		chartColors.push(getMissionColor(missionType));
	}

	chartOptions.value.colors = chartColors;
	chartOptions.value.labels = chartLabels;
	chartOptions.value.plotOptions.pie.donut.labels.total.label = t("home_totalEmergencies");
	chartSeries.value = Object.values(userStore.user.clientStats.missions);

	if (logicStore.darkMode) {
		chartOptions.value.plotOptions.pie.donut.labels.value.color = "white";
		chartOptions.value.plotOptions.pie.donut.labels.total.color = "#9ca3af";
	}
});

watch(locale, () => {
	const chartLabels = [];

	for (const missionType of Object.keys(userStore.user.clientStats.missions)) {
		chartLabels.push(getMissionType(missionType));
	}

	chartOptions.value = {
		...chartOptions.value,
		...{
			labels: chartLabels,
			plotOptions: {
				pie: {
					donut: {
						labels: {
							total: {
								label: t("home_totalEmergencies"),
							},
						},
					},
				},
			},
		},
	};
});

function getMissionType(missionType: string): string {
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

function getMissionColor(missionType: string): string {
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
</script>

<template>
	<GlobalCard>
		<p class="font-Mohave text-2xl font-semibold uppercase">
			{{ t("home_emergencyBreakdown") }}
		</p>

		<div class="mt-4 flex w-full justify-center">
			<apexchart height="320" type="donut" :options="chartOptions" :series="chartSeries" />
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
				<div v-for="(stat, key) in userStore.user.clientStats.missions" :key="key" class="flex items-center justify-center">
					<div class="pi mr-2 h-3 w-3 rounded-full" :style="`background-color: ${getMissionColor(key)}`" />
					<div
						class="
							text-sm text-gray-500
							dark:text-gray-400
						"
					>
						{{ getMissionType(key) }}: <span
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

<style></style>
