<script setup lang="ts">
import { computed } from "vue";

export interface Props {
    side?: "left" | "right";
    helper?: string;
    min?: number;
    max?: number;
    modelValue?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
    side: "right",
});

const emit = defineEmits(["update:modelValue", "inputClick"]);

const value = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit("update:modelValue", value);
    },
});
</script>

<template>
    <div>
        <div class="mb-2">
            <label class="block font-medium text-gray-900 dark:text-white"><slot /></label>
            <p v-if="props.helper" class="text-xs text-gray-500">{{ props.helper }}</p>
        </div>

        <div class="flex items-center">
            <input
                v-model.number="value"
                type="range"
                :min="props.min"
                :max="props.max"
                class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                @change="$emit('inputClick')"
            />
            <p class="ml-4 text-sm font-semibold">{{ value }}</p>
        </div>
    </div>
</template>

<style scoped>
@reference "@/assets/main.css";

input[type="range"]::-webkit-slider-thumb {
    @apply bg-primary-600;
}

input[type="range"]::-ms-thumb {
    @apply bg-primary-600;
}

input[type="range"]::-moz-range-thumb {
    @apply bg-primary-600;
}

input[type="range"]::-moz-range-progress {
    @apply bg-transparent;
}
</style>
