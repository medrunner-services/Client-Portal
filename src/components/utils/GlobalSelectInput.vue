<script setup lang="ts">
import type { GlobalSelectOption } from "@/@types/types.ts";
import { computed } from "vue";
import GlobalTooltip from "@/components/utils/GlobalTooltip.vue";

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
            justify-between gap-2
            lg:gap-8
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

            <GlobalTooltip v-if="props.helperType === 'icon' && props.helper" :content="props.helper" />
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
                dark:border-gray-600 dark:bg-gray-700 dark:text-white
                dark:focus:border-gray-400 dark:focus:ring-gray-400
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
