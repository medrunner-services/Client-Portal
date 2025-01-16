<script setup lang="ts">
import BlockedUserCTA from "@/components/Dashboard/BlockedUserCTA.vue";
import ChartEmergencyBreakdown from "@/components/Dashboard/Charts/ChartEmergencyBreakdown.vue";
import ChartEmergencyNumberPerWeek from "@/components/Dashboard/Charts/ChartEmergencyNumberPerWeek.vue";
import ChartEmergencySuccessRate from "@/components/Dashboard/Charts/ChartEmergencySuccessRate.vue";
import CTAEmergency from "@/components/Dashboard/CTAEmergency.vue";
import HistoryTable from "@/components/Dashboard/History/HistoryTable.vue";
import UnlinkedUserCTA from "@/components/Dashboard/UnlinkedUserCTA.vue";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
</script>

<template>
    <div class="content-container flex flex-col gap-10 xl:flex-row">
        <div class="xl:w-1/2">
            <BlockedUserCTA v-if="userStore.isBlocked" />
            <UnlinkedUserCTA v-else-if="!userStore.user.rsiHandle" />
            <CTAEmergency v-else />
            <HistoryTable class="mt-4" />
        </div>

        <div class="xl:w-1/2">
            <ChartEmergencyBreakdown />
            <ChartEmergencySuccessRate class="mt-4" />
            <ChartEmergencyNumberPerWeek class="mt-4" />
        </div>
    </div>
</template>
