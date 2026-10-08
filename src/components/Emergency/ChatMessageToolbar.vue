<script setup lang="ts">
const emit = defineEmits<{
    editClick: [];
    deleteClick: [];
}>();
</script>

<template>
    <div
        id="chatMessageToolbar"
        class="absolute -top-6 right-1 z-30 flex gap-1 rounded-sm border border-gray-200 bg-[#990000] p-1 text-gray-50 shadow-md"
    >
        <div
            class="
                cursor-pointer rounded-sm p-1
                hover:bg-gray-200/30
            " @click="emit('deleteClick')"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
            </svg>
        </div>

        <div
            class="
                cursor-pointer rounded-sm p-1
                hover:bg-gray-200/30
            " @click="emit('editClick')"
        >
            <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path
                    d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z"
                />
            </svg>
        </div>
    </div>
</template>

<style scoped></style>
