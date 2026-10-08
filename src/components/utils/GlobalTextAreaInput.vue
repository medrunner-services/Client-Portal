<script setup lang="ts">
import autosize from "autosize";
import { computed, onMounted, onUpdated, ref } from "vue";
import GlobalTooltip from "@/components/utils/GlobalTooltip.vue";

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
    error?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    required: false,
    radius: "rounded-lg",
    rows: 5,
    autoGrow: false,
    error: false,
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

const selectInputClasses = computed(() => {
    let allClasses: string[] = [];

    if (props.error) {
        allClasses = allClasses.concat([
            "border-red-600",
            "focus:border-red-600",
            "focus:ring-red-600",
            "dark:border-red-500",
            "dark:focus:border-red-500",
            "dark:focus:ring-red-500",
        ]);
    }
    else {
        allClasses = allClasses.concat([
            "border-gray-300",
            "focus:border-gray-500",
            "focus:ring-gray-500",
            "dark:border-gray-600",
            "dark:focus:border-gray-400",
            "dark:focus:ring-gray-400",
        ]);
    }

    if (props.disabled)
        allClasses = allClasses.concat(["cursor-not-allowed", "bg-gray-100", "text-gray-400!"]);
    if (props.radius !== "none")
        allClasses.push(props.radius);
    if (props.maxHeight)
        allClasses.push(props.maxHeight);
    if (props.maxHeight && props.autoGrow)
        allClasses.push("overflow-x-hidden!");

    return allClasses.join(" ");
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
        <textarea
            ref="textAreaRef"
            v-model="value"
            class="
                w-full border bg-gray-50 p-2.5 text-sm text-gray-900 placeholder-gray-400
                dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
            "
            :class="selectInputClasses"
            :disabled="props.disabled"
            :required="props.required"
            :placeholder="props.placeholder"
            :rows="props.rows"
        />
    </div>
</template>

<style scoped></style>
