<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";

import { useLogicStore } from "@/stores/logicStore";

const logicStore = useLogicStore();
const emit = defineEmits(["closeModal"]);
</script>

<template>
    <div class="fixed left-0 right-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-gray-400/50 px-8 py-16 dark:bg-neutral-700/50">
        <div class="relative max-h-full w-full overflow-y-auto bg-white p-4 shadow dark:bg-stone-900 lg:w-1/2 2xl:w-1/3 3xl:w-1/4">
            <div class="w-full">
                <XMarkIcon class="ml-auto h-6 w-6 cursor-pointer" @click="emit('closeModal')" />
            </div>
            <div class="px-2 lg:px-4 lg:py-4">
                <slot />
            </div>
        </div>
    </div>
</template>

<style scoped></style>
