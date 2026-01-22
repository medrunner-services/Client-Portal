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
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    required: false,
    radius: "rounded-lg",
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
        <div v-if="props.label" class="mb-2 flex items-center">
            <label
                class="
                    block text-sm font-medium text-gray-900
                    dark:text-white
                "
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
                    w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 placeholder-gray-400
                    focus:border-gray-500 focus:ring-gray-500
                    dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                    dark:focus:border-gray-400 dark:focus:ring-gray-400
                "
                :placeholder="props.placeholder"
                :disabled="props.disabled"
                :required="props.required"
            >
        </div>
    </div>
</template>

<style scoped></style>
