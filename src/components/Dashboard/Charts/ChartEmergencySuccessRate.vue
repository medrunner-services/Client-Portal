<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import GlobalCard from "@/components/utils/GlobalCard.vue";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const { t } = useI18n();

const successRate = computed(() => {
    const total =
        userStore.user.clientStats.missions.success +
        userStore.user.clientStats.missions.failed +
        userStore.user.clientStats.missions.aborted +
        userStore.user.clientStats.missions.canceled +
        userStore.user.clientStats.missions.serverError +
        userStore.user.clientStats.missions.refused;
    const success = userStore.user.clientStats.missions.success;

    if (total === 0) return 0;
    else return Math.round((success / total) * 1000) / 10;
});
</script>

<template>
    <GlobalCard class="text-center">
        <p class="font-Mohave text-4xl font-bold uppercase text-gray-900 dark:text-white">{{ successRate }}%</p>
        <p class="font-Mohave text-lg text-gray-500 dark:text-gray-400">{{ t("home_emergencySuccessRate") }}</p>
    </GlobalCard>
</template>

<style scoped></style>
