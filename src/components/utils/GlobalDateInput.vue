<script setup lang="ts">
import { computed } from "vue";
import GlobalTooltip from "@/components/utils/GlobalTooltip.vue";

export interface Props {
    disabled?: boolean;
    required?: boolean;
    label?: string;
    placeholder?: string;
    value?: string;
    helper?: string;
    modelValue?: string;
    radius?: "rounded-t-lg" | "rounded-r-lg" | "bottom-left" | "rounded-b-lg" | "rounded-l-lg" | "rounded-lg" | "none";
    min?: string;
    max?: string;
    size?: "small" | "large";
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    required: false,
    radius: "rounded-lg",
    size: "large",
});

const emit = defineEmits(["update:modelValue"]);

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
        <div v-if="props.label" class="flex items-center" :class="props.size === 'large' ? 'mb-2' : ''">
            <label
                class="
                    block font-medium text-gray-900
                    dark:text-white
                "
                :class="props.size === 'large' ? 'text-sm' : 'text-xs'"
            >{{ props.label }}<span v-if="props.required">*</span></label>

            <GlobalTooltip v-if="props.helper" :content="props.helper" />
        </div>

        <div class="relative">
            <input
                v-model="value"
                type="date"
                :min="props.min"
                :max="props.max"
                class="
                    w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400
                    focus:border-gray-500 focus:ring-gray-500
                    dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                    dark:focus:border-gray-400 dark:focus:ring-gray-400
                "
                :class="props.size === 'large' ? 'p-2.5 text-sm' : 'p-2 text-xs'"
                :placeholder="props.placeholder"
                :disabled="props.disabled"
                :required="props.required"
            >
        </div>
    </div>
</template>

<style scoped></style>
