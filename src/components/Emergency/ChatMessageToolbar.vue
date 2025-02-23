<script setup lang="ts">
const emit = defineEmits<{
    editClick: [];
}>();
</script>

<template>
    <div
        id="chatMessageToolbar"
        class="absolute -top-6 right-1 z-30 flex gap-1 rounded border border-gray-200 bg-[#990000] p-1 text-gray-50 shadow-md"
    >
        <div class="cursor-pointer rounded p-1 hover:bg-gray-200/30" @click="emit('editClick')">
            <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path
                    d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z"
                />
            </svg>
        </div>
    </div>
</template>

<style scoped></style>
