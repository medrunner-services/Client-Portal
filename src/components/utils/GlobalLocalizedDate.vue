<script setup lang="ts">
import { computed } from "vue";

import { timestampToDate, timestampToFullDate, timestampToFullDateTimeZone, timestampToHours } from "@/utils/functions/dateTimeFunctions";

const props = defineProps<{
    date: string | number;
    format: "toHours" | "toDate" | "toFullDate";
}>();

const dateString = computed(() => {
    switch (props.format) {
        case "toHours":
            return timestampToHours(props.date);
        case "toDate":
            return timestampToDate(props.date);
        case "toFullDate":
            return timestampToFullDate(props.date);
        default:
            return timestampToHours(props.date);
    }
});
</script>

<template>
    <p class="cursor-help underline decoration-dotted" :title="timestampToFullDateTimeZone(props.date)">
        {{ dateString }}
    </p>
</template>

<style scoped></style>
