<script setup lang="ts">
import autosize from "autosize";
import { onMounted, onUpdated, ref } from "vue";
import { computed } from "vue";

export interface Props {
    disabled?: boolean;
    required?: boolean;
    label?: string;
    placeholder?: string;
    value?: string;
    helper?: string;
    modelValue?: string;
    rows?: number;
    radius?: "rounded-t-lg" | "rounded-r-lg" | "bottom-left" | "rounded-b-lg" | "rounded-l-lg" | "rounded-lg" | "none";
    maxHeight?: string;
    autoGrow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    required: false,
    radius: "rounded-lg",
    rows: 5,
    autoGrow: false,
});

const emit = defineEmits(["update:modelValue"]);

const textAreaRef = ref<HTMLDivElement | null>(null);
defineExpose({ focus: () => textAreaRef.value?.focus() });

onMounted(() => {
    if (props.autoGrow && textAreaRef.value) {
        autosize(textAreaRef.value);
    }
});

onUpdated(() => {
    if (props.autoGrow && textAreaRef.value) {
        autosize.update(textAreaRef.value);
    }
});

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
    if (props.radius !== "none") allClasses.push(props.radius);
    if (props.maxHeight) allClasses.push(props.maxHeight);
    if (props.maxHeight && props.autoGrow) allClasses.push("!overflow-x-hidden");

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
                    class="ml-2 h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-500"
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
        <textarea
            ref="textAreaRef"
            v-model="value"
            class="w-full border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-gray-400 dark:focus:ring-gray-400"
            :class="selectInputClasses"
            :disabled="props.disabled"
            :required="props.required"
            :placeholder="props.placeholder"
            :rows="props.rows"
        />
    </div>
</template>

<style scoped></style>
