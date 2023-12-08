<script setup lang="ts">
import ChartEmergencyBreakdown from "@/components/Dashboard/Charts/ChartEmergencyBreakdown.vue";
import ChartEmergencyNumberPerWeek from "@/components/Dashboard/Charts/ChartEmergencyNumberPerWeek.vue";
import ChartEmergencySuccessRate from "@/components/Dashboard/Charts/ChartEmergencySuccessRate.vue";
import CTAEmergency from "@/components/Dashboard/CTAEmergency.vue";
import HistoryTable from "@/components/Dashboard/History/HistoryTable.vue";
</script>

<template>
    <div class="content-container flex flex-col gap-10 lg:flex-row">
        <div class="lg:w-1/2">
            <CTAEmergency />
            <HistoryTable class="mt-4" />
        </div>

        <div class="lg:w-1/2">
            <ChartEmergencyBreakdown />
            <ChartEmergencySuccessRate class="mt-4" />
            <ChartEmergencyNumberPerWeek class="mt-4" />
        </div>
    </div>
</template>
