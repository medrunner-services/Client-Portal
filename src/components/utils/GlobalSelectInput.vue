<script setup lang="ts">
import type { GlobalSelectOption } from "@/@types/types.ts";
import { computed, ref } from "vue";

export interface Props {
    disabled?: boolean;
    required?: boolean;
    label?: string;
    helper?: string;
    helperType?: "icon" | "text";
    inputPosition?: "row" | "column";
    inputSize?: "small" | "large";
    labelSize?: "small" | "large";
    labelClasses?: string;
    size?: "fit" | "full";
    error?: boolean;
    modelValue?: string | number | boolean | undefined;
    options: GlobalSelectOption[];
    radius?: "rounded-t-lg" | "rounded-r-lg" | "bottom-left" | "rounded-b-lg" | "rounded-l-lg" | "rounded-lg";
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    required: false,
    radius: "rounded-lg",
    helperType: "icon",
    inputPosition: "column",
    inputSize: "large",
    labelSize: "large",
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

const effectiveSize = computed(() => {
    if (props.size !== undefined) {
        return props.size;
    }
    return props.inputPosition === "column" ? "full" : "fit";
});

const selectInputClasses = computed(() => {
    let allClasses: string[] = [];

    if (props.disabled)
        allClasses = allClasses.concat(["cursor-not-allowed", "bg-gray-100", "text-gray-400!"]);
    if (props.error)
        allClasses = allClasses.concat(["border-red-600", "focus:border-red-500", "focus:ring-red-500"]);
    if (props.inputPosition === "row")
        allClasses = allClasses.concat(["w-fit"]);
    if (props.inputPosition === "column")
        allClasses = allClasses.concat(["w-full"]);
    if (props.inputSize === "small")
        allClasses = allClasses.concat(["pl-2", "pr-8", "py-1.5", "h-fit"]);
    if (props.inputSize === "large")
        allClasses = allClasses.concat(["p-2.5", "pr-8"]);
    if (effectiveSize.value === "fit")
        allClasses = allClasses.concat(["md:w-fit"]);
    allClasses.push(props.radius);

    return allClasses.join(" ");
});
</script>

<template>
    <div
        class="flex" :class="props.inputPosition === 'column' ? 'flex-col' : `
            flex-col gap-8
            sm:flex-row sm:justify-between
        `"
    >
        <div
            v-if="props.label"
            class="mb-2 flex"
            :class="[props.helperType === 'text' ? 'flex-col' : 'items-center', props.labelSize === 'small' ? 'text-sm' : '', props.labelClasses]"
        >
            <label
                class="
                    block font-medium text-gray-900
                    dark:text-white
                "
            >{{ props.label }}<span v-if="props.required">*</span></label>

            <div v-if="props.helperType === 'icon'" class="relative">
                <svg
                    v-if="helper"
                    class="
                        ml-2 h-4 w-4 cursor-pointer text-gray-400
                        hover:text-gray-500
                    "
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    @mouseenter="showHelper = true"
                    @mouseleave="showHelper = false"
                >
                    <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clip-rule="evenodd"
                    />
                </svg>

                <div
                    v-if="showHelper"
                    role="tooltip"
                    class="
                        absolute bottom-5 z-30 inline-block w-64 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500 shadow-xs
                        dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400
                    "
                >
                    <div class="px-3 py-2">
                        <p>{{ props.helper }}</p>
                    </div>
                </div>
            </div>
            <p
                v-else-if="props.helperType === 'text' && props.helper" class="
                    text-xs text-gray-500
                    dark:text-gray-400
                "
            >
                {{ props.helper }}
            </p>
        </div>
        <select
            v-model="value"
            :disabled="props.disabled"
            :required="props.required"
            class="
                block cursor-pointer border border-gray-300 bg-gray-50 text-sm text-gray-900
                focus:border-gray-500 focus:ring-gray-500
                disabled:cursor-not-allowed
                dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-gray-400 dark:focus:ring-gray-400
            "
            :class="selectInputClasses"
            @change="$emit('change')"
        >
            <option v-for="(option, index) in props.options" :key="index" :value="option.value" :hidden="option.hidden" :disabled="option.disabled">
                {{ option.label ?? option.value }}
            </option>
        </select>
    </div>
</template>

<style scoped></style>
