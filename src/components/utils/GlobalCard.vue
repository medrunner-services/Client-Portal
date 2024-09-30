<script setup lang="ts">
export interface Props {
    borderColor?: "gray" | "primary" | "yellow";
    borderSize?: "fine" | "thick";
}

const props = withDefaults(defineProps<Props>(), {
    borderColor: "gray",
    borderSize: "fine",
});
</script>

<template>
    <div
        class="rounded-lg border-gray-200 p-4 shadow-md dark:border-gray-700 dark:shadow-gray-900 md:p-6"
        :class="[
            props.borderSize === 'fine' ? 'border' : '',
            props.borderSize === 'thick' ? 'border-2' : '',
            props.borderColor === 'gray' ? 'border-gray-200 dark:border-gray-700' : '',
            props.borderColor === 'yellow' ? 'border-yellow-300 dark:border-yellow-400' : '',
            props.borderColor === 'primary' ? 'border-primary-600' : '',
        ]"
    >
        <slot />
    </div>
</template>

<style scoped></style>
