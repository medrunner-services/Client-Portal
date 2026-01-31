<script setup lang="ts">
import { computed } from "vue";

export interface Props {
    errorText?: string;
    modelValue?: boolean;
    disabled?: boolean;
    centerCheckbox?: boolean;
    required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    side: "right",
    size: "large",
    disabled: false,
    centerCheckbox: true,
    required: false,
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
        <div class="flex flex-row">
            <div class="flex" :class="props.centerCheckbox ? 'items-center' : ''">
                <input
                    v-model="value"
                    type="checkbox"
                    :disabled="props.disabled"
                    :required="props.required"
                    class="
                        size-4 cursor-pointer rounded-sm border-gray-300 bg-gray-100 text-primary-600
                        focus:ring-2 focus:ring-primary-300
                        dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800
                        dark:focus:ring-primary-400
                    "
                    :class="props.centerCheckbox ? '' : 'mt-0.5'"
                    @click="$emit('inputClick')"
                >
                <label
                    class="
                        ms-2 text-sm font-medium text-gray-900
                        dark:text-gray-300
                    "
                ><slot /></label>
            </div>
        </div>
        <p
            class="
                mt-2 text-xs font-medium text-red-600
                dark:text-red-400
            "
        >
            {{ props.errorText }}
        </p>
    </div>
</template>

<style scoped>
.dark [type="checkbox"]:checked {
    background-size: 100% 100%;
}
</style>
