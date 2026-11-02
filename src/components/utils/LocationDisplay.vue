<script setup lang="ts">
import type { EmergencyLocation } from "@/utils/functions/locationFunctions.ts";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import { useLogicStore } from "@/stores/logicStore.ts";
import { getEmergencyLocationNames } from "@/utils/functions/locationFunctions.ts";

const props = defineProps<{
    emergency: EmergencyLocation;
}>();

const logicStore = useLogicStore();
const { t } = useI18n();
const container = ref<HTMLElement | null>(null);
const fullMeasure = ref<HTMLElement | null>(null);
const compactMeasure = ref<HTMLElement | null>(null);
const displayMode = ref<"full" | "compact" | "leaf">("full");
let observer: ResizeObserver | undefined;

const names = computed(() => getEmergencyLocationNames(
    props.emergency,
    logicStore.medrunnerSettings?.locationSettings.locations ?? [],
));
const fullLabel = computed(() => names.value.join(" > ") || t("tracking_unknown"));
const compactLabel = computed(() => names.value.length > 2
    ? `${names.value[0]} >> ${names.value[names.value.length - 1]}`
    : fullLabel.value);
const leafLabel = computed(() => names.value[names.value.length - 1] || fullLabel.value);
const visibleLabel = computed(() => {
    if (displayMode.value === "full")
        return fullLabel.value;
    if (displayMode.value === "compact")
        return compactLabel.value;
    return leafLabel.value;
});

function updateDisplayMode() {
    if (!container.value || !fullMeasure.value || !compactMeasure.value)
        return;

    const availableWidth = container.value.getBoundingClientRect().width;
    if (fullMeasure.value.getBoundingClientRect().width <= availableWidth)
        displayMode.value = "full";
    else if (compactMeasure.value.getBoundingClientRect().width <= availableWidth)
        displayMode.value = "compact";
    else
        displayMode.value = "leaf";
}

watch([fullLabel, compactLabel], updateDisplayMode, { flush: "post" });

onMounted(() => {
    // Measure both labels independently of the visible one, avoiding resize loops.
    // Observing the measurements also handles font loading and text-size changes.
    observer = new ResizeObserver(updateDisplayMode);
    for (const element of [container.value, fullMeasure.value, compactMeasure.value]) {
        if (element)
            observer.observe(element);
    }
    updateDisplayMode();
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
    <span ref="container" class="relative block w-full min-w-0 overflow-hidden" :title="fullLabel">
        <span class="sr-only">{{ fullLabel }}</span>
        <span aria-hidden="true" class="block truncate">{{ visibleLabel }}</span>
        <span ref="fullMeasure" aria-hidden="true" class="pointer-events-none invisible absolute top-0 left-0 w-max whitespace-nowrap">{{ fullLabel }}</span>
        <span ref="compactMeasure" aria-hidden="true" class="pointer-events-none invisible absolute top-0 left-0 w-max whitespace-nowrap">{{ compactLabel }}</span>
    </span>
</template>
