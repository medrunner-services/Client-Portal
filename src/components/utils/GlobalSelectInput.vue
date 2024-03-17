<script setup lang="ts">
import { computed, ref } from "vue";

export interface Props {
    disabled?: boolean;
    required?: boolean;
    label?: string;
    placeholder?: string;
    helper?: string;
    modelValue?: string | number | boolean | undefined;
    options: { value: string | number | boolean | undefined; label?: string; hidden?: boolean }[];
    radius?: "rounded-t-lg" | "rounded-r-lg" | "bottom-left" | "rounded-b-lg" | "rounded-l-lg" | "rounded-lg";
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    required: false,
    radius: "rounded-lg",
});

const emit = defineEmits(["update:modelValue", "change"]);

const value = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit("update:modelValue", value);
    },
});

const showHelper = ref(false);

const selectInputClasses = computed(() => {
    let allClasses: string[] = [];

    if (props.disabled) allClasses = allClasses.concat(["cursor-not-allowed", "bg-gray-100", "!text-gray-400"]);
    allClasses.push(props.radius);

    return allClasses.join(" ");
});
</script>

<template>
    <div>
        <div v-if="props.label" class="mb-2 flex items-center">
            <label class="block text-sm font-medium text-gray-900 dark:text-white">{{ props.label }}<span v-if="props.required">*</span></label>

            <div class="relative">
                <svg
                    v-if="helper"
                    @mouseenter="showHelper = true"
                    @mouseleave="showHelper = false"
                    class="ml-2 h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-500"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clip-rule="evenodd"
                    ></path>
                </svg>

                <div
                    v-if="showHelper"
                    role="tooltip"
                    class="absolute bottom-5 z-30 inline-block w-64 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                >
                    <div class="px-3 py-2">
                        <p>{{ props.helper }}</p>
                    </div>
                </div>
            </div>
        </div>
        <select
            @change="$emit('change')"
            :disabled="props.disabled"
            :required="props.required"
            v-model="value"
            class="block w-full cursor-pointer border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-gray-500 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-gray-400 dark:focus:ring-gray-400"
            :class="selectInputClasses"
        >
            <option
                v-for="(option, index) in props.options"
                :key="index"
                :value="option.value"
                :hidden="option.hidden"
                :class="option.value === '' ? 'text-gray-500 dark:text-gray-400' : ''"
            >
                {{ option.label ?? option.value }}
            </option>
        </select>
    </div>
</template>

<style scoped></style>
