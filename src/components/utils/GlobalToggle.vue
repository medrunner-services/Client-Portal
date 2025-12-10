<script setup lang="ts">
import { computed } from "vue";

export interface Props {
    side?: "left" | "right";
    helper?: string;
    modelValue?: boolean;
    size?: "small" | "large";
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    side: "right",
    size: "large",
    disabled: false,
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
            <label class="relative" :class="[props.side === 'right' ? 'ml-4' : '', props.disabled ? 'cursor-not-allowed' : 'cursor-pointer']">
                <span>
                    <input v-model="value" :disabled="props.disabled" type="checkbox" class="peer sr-only" @click="$emit('inputClick')" />
                    <div
                        class="peer peer-checked:bg-primary-600 peer-focus:ring-primary-300 dark:peer-checked:bg-primary-600 dark:peer-focus:ring-primary-300 h-6 w-11 rounded-full peer-focus:ring-4 peer-focus:outline-hidden after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600"
                        :class="
                            props.disabled
                                ? 'peer-checked:bg-opacity-75 dark:peer-checked:bg-opacity-50 bg-gray-100 after:border-gray-200 after:bg-gray-50 dark:bg-gray-600'
                                : 'peer-checked:bg-opacity-100 bg-gray-200 after:border-gray-300 after:bg-white dark:bg-gray-700'
                        "
                    ></div>
                </span>
            </label>
            <div class="ml-3 flex flex-col" :class="props.side === 'right' ? 'ml-0!' : ''">
                <p class="font-medium text-gray-900 dark:text-white" :class="props.size === 'small' ? 'text-sm' : ''">
                    <slot />
                </p>
                <p v-if="props.helper" class="text-xs text-gray-500 dark:text-gray-400">{{ props.helper }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
