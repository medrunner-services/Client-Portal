<script setup lang="ts">
import { computed } from "vue";

export interface Props {
    side?: "left" | "right";
    helper?: string;
    errorText?: string;
    modelValue?: boolean;
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
        <div class="flex flex-row" :class="props.side === 'right' ? 'flex-row-reverse justify-between' : ''">
            <label class="relative cursor-pointer" :class="props.side === 'right' ? 'ml-4' : ''">
                <span>
                    <input @click="$emit('inputClick')" type="checkbox" v-model="value" class="peer sr-only" />
                    <div
                        class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-primary-800"
                    ></div>
                </span>
            </label>
            <div class="ml-3 flex flex-col" :class="props.side === 'right' ? '!ml-0' : ''">
                <p class="font-medium text-gray-900 dark:text-white">
                    <slot />
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400" v-if="props.helper">{{ props.helper }}</p>
            </div>
        </div>
        <p class="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{{ props.errorText }}</p>
    </div>
</template>

<style scoped></style>
