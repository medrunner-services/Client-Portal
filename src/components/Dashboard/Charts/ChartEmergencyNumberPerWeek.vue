<script setup lang="ts">
import { computed, onMounted, type Ref, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";
const { t, locale } = useI18n();

const userStore = useUserStore();
const logicStore = useLogicStore();

const chartOptions: Ref<any> = ref({
    chart: {
        height: "100%",
        width: "100%",
        type: "area",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
            enabled: false,
        },
        toolbar: {
            show: false,
        },
    },
    tooltip: {
        enabled: true,
        followCursor: false,
        theme: "light",
        x: {
            show: false,
        },
        y: {
            formatter: function (value: any) {
                return value;
            },
        },
    },
    fill: {
        type: "gradient",
        gradient: {
            opacityFrom: 0.55,
            opacityTo: 0,
            shade: "#AA0000",
            gradientToColors: ["#AA0000"],
        },
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        width: 6,
    },
    grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
            left: 2,
            right: 2,
            top: 0,
        },
    },
    xaxis: {
        categories: [""],
        labels: {
            show: false,
        },
        axisBorder: {
            show: false,
        },
        axisTicks: {
            show: false,
        },
    },
    yaxis: {
        show: false,
    },
});
const chartSeries = ref([
    {
        name: "Emergencies",
        data: [0, 0, 0, 0, 0, 0, 0],
        color: "#AA0000",
    },
]);

const emergenciesPerDay: Ref<number[]> = ref([]);
const dateLabels: Ref<string[]> = ref([]);
const errorLoading = ref("");

const oldestDateNeeded: Ref<Date> = ref(new Date());

const totalNumberOfEmergencies = computed(() => {
    return emergenciesPerDay.value.reduce((sum, current) => sum + current, 0);
});

onMounted(() => {
    fetchEmergenciesForWeek();
    generateDateLabels();

    chartSeries.value[0].name = t("home_emergencies");
    chartSeries.value[0].data = emergenciesPerDay.value;
    chartOptions.value.xaxis.categories = dateLabels.value;

    if (logicStore.darkMode) {
        chartOptions.value.tooltip.theme = "dark";
    }
});

watch(locale, async () => {
    generateDateLabels();

    chartSeries.value[0].name = t("home_emergencies");
    chartOptions.value = {
        ...chartOptions.value,
        ...{
            xaxis: {
                categories: dateLabels.value,
            },
        },
    };
});

const isWithinLastWeek = (timestamp: string) => {
    const date = new Date(timestamp);
    return date >= oldestDateNeeded.value;
};

const initializeEmergenciesPerDay = () => {
    for (let i = 0; i < 7; i++) {
        emergenciesPerDay.value.push(0);
    }
};

const incrementDayCount = (timestamp: string) => {
    const emergencyDate = new Date(timestamp);
    const today = new Date();

    const dayDifference = Math.floor((today.getTime() - emergencyDate.getTime()) / (1000 * 3600 * 24));
    if (dayDifference < 7) {
        emergenciesPerDay.value[dayDifference]++;
    }
};

const generateDateLabels = () => {
    const labels = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        labels.push(
            date.toLocaleDateString(locale.value, {
                month: "2-digit",
                day: "2-digit",
            }),
        );
    }

    dateLabels.value = labels;
};

async function fetchEmergenciesForWeek() {
    errorLoading.value = "";

    let paginationToken = undefined;
    const limit = 50;

    oldestDateNeeded.value.setDate(oldestDateNeeded.value.getDate() - 7);
    initializeEmergenciesPerDay();

    try {
        do {
            const response = await userStore.fetchUserEmergencyHistory(limit, paginationToken);
            const recentEmergencies = response.data.filter((emergency) => isWithinLastWeek(emergency.emergencyCreationTimestamp));

            recentEmergencies.forEach((emergency) => incrementDayCount(emergency.emergencyCreationTimestamp));

            if (recentEmergencies.length > 0) {
                const oldestFetchedEmergencyTimestamp = response.data[response.data.length - 1].emergencyCreationTimestamp;
                paginationToken = isWithinLastWeek(oldestFetchedEmergencyTimestamp) ? response.paginationToken : undefined;
            } else {
                paginationToken = undefined;
            }
        } while (paginationToken);

        emergenciesPerDay.value.reverse();
    } catch (error) {
        errorLoading.value = t("error_loadingData");
    }
}
</script>

<template>
    <GlobalCard>
        <div v-if="errorLoading" class="flex h-80 items-center justify-center">
            <GlobalErrorText :text="errorLoading" />
        </div>

        <div v-else>
            <div>
                <p class="font-Mohave text-4xl font-bold text-gray-900 dark:text-white">{{ totalNumberOfEmergencies }}</p>
                <p class="font-Mohave text-lg text-gray-500 dark:text-gray-400">{{ t("home_emergenciesThisWeek") }}</p>
            </div>

            <div class="mt-4 w-full justify-center">
                <apexchart type="area" height="250" style="width: 100%" :options="chartOptions" :series="chartSeries"></apexchart>
            </div>
        </div>
    </GlobalCard>
</template>

<style scoped></style>
