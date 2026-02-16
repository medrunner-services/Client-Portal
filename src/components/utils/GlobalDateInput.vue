<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef } from "vue";
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
    timeSensitivity?: "days" | "minutes";
    size?: "small" | "large";
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    required: false,
    radius: "rounded-lg",
    timeSensitivity: "days",
    size: "large",
});

const emit = defineEmits(["update:modelValue"]);
const dateInputRef = useTemplateRef("dateInput");
const isValid = ref(true);
const isFocused = ref(false);
let intervalId: number | null = null;

const value = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit("update:modelValue", value);
    },
});

function checkValidity() {
    if (dateInputRef.value) {
        isValid.value = dateInputRef.value.validity.valid;
    }
}

function handleFocus() {
    isFocused.value = true;
    if (!intervalId) {
        intervalId = window.setInterval(checkValidity, 200);
    }
}

function handleBlur() {
    isFocused.value = false;
    if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
    }
    checkValidity();
}

onBeforeUnmount(() => {
    if (intervalId) {
        window.clearInterval(intervalId);
    }
});

defineExpose({
    isValid,
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
                ref="dateInput"
                v-model="value"
                :type="props.timeSensitivity === 'minutes' ? 'datetime-local' : 'date'"
                :min="props.min"
                :max="props.max"
                class="
                    w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50
                    invalid:border-red-600 invalid:text-red-600
                    focus:border-gray-500 focus:ring-gray-500
                    dark:border-gray-600 dark:bg-gray-700
                    dark:invalid:border-red-500 dark:invalid:text-red-500
                    dark:focus:border-gray-400 dark:focus:ring-gray-400
                "
                :class="[props.size === 'large' ? 'p-2.5 text-sm' : 'p-2 text-xs', value ? `
                    text-gray-900
                    dark:text-white
                ` : `text-gray-400`]"
                :placeholder="props.placeholder"
                :disabled="props.disabled"
                :required="props.required"
                @focus="handleFocus"
                @blur="handleBlur"
            >
        </div>
    </div>
</template>

<style scoped></style>
