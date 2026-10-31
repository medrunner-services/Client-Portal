<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import GlobalCard from "@/components/utils/GlobalCard.vue";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const { t } = useI18n();

const successRate = computed(() => {
    const total
        = Number(userStore.user.clientStats.missions.success)
            + Number(userStore.user.clientStats.missions.failed)
            + Number(userStore.user.clientStats.missions.aborted)
            + Number(userStore.user.clientStats.missions.canceled)
            + Number(userStore.user.clientStats.missions.serverError)
            + Number(userStore.user.clientStats.missions.refused);
    const success = Number(userStore.user.clientStats.missions.success);

    if (total === 0)
        return 0;
    else return Math.round((success / total) * 1000) / 10;
});
</script>

<template>
    <GlobalCard class="text-center">
        <p
            class="
                font-Mohave text-4xl font-bold text-gray-900 uppercase
                dark:text-white
            "
        >
            {{ successRate > 0 ? `${successRate}%` : t("home_noData") }}
        </p>
        <p
            class="
                font-Mohave text-lg text-gray-500
                dark:text-gray-400
            "
        >
            {{ t("home_emergencySuccessRate") }}
        </p>
    </GlobalCard>
</template>

<style scoped></style>
