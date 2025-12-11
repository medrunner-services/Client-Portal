<script setup lang="ts">
import { ref, watchEffect } from "vue";

import { AlertColors } from "@/@types/types.ts";
import { useAlertStore } from "@/stores/alertStore";

const alertStore = useAlertStore();

const animatedElement = ref<HTMLDivElement | null>(null);

watchEffect(() => {
    if (animatedElement.value && alertStore.message) {
        animatedElement.value.classList.remove("animate-width");
        void animatedElement.value.offsetWidth;
        animatedElement.value.classList.add("animate-width");
    }
});
</script>

<template>
    <div
        class="
            fixed top-6 left-1/2 z-50 w-full -translate-x-1/2 transform rounded-lg
            md:w-fit
            dark:bg-gray-900
        "
        :class="{
            'bg-red-50 text-red-800 dark:text-red-400': alertStore.color === AlertColors.RED,
            'bg-green-50 text-green-800 dark:text-green-400': alertStore.color === AlertColors.GREEN,
            'bg-blue-50 text-blue-800 dark:text-blue-400': alertStore.color === AlertColors.BLUE,
            'bg-yellow-50 text-yellow-800 dark:text-yellow-400': alertStore.color === AlertColors.YELLOW,
        }"
    >
        <div class="flex items-center p-4">
            <svg
                v-if="alertStore.icon === 'info'"
                class="h-4 w-4 shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path
                    d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
                />
            </svg>
            <p class="mx-3 font-medium" v-html="alertStore.message" />
            <button
                v-if="alertStore.isCloseable"
                type="button"
                class="
                    -mx-1.5 -my-1.5 ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg p-1.5
                    focus:ring-2
                    dark:bg-gray-900 dark:hover:bg-gray-700
                "
                :class="{
                    'bg-red-50 text-red-500 hover:bg-red-200 focus:ring-red-400 dark:text-red-400': alertStore.color === AlertColors.RED,
                    'bg-green-50 text-green-500 hover:bg-green-200 focus:ring-green-400 dark:text-green-400': alertStore.color === AlertColors.GREEN,
                    'bg-blue-50 text-blue-500 hover:bg-blue-200 focus:ring-blue-400 dark:text-blue-400': alertStore.color === AlertColors.BLUE,
                    'bg-yellow-50 text-yellow-500 hover:bg-yellow-200 focus:ring-yellow-400 dark:text-yellow-400':
                        alertStore.color === AlertColors.YELLOW,
                }"
                @click="alertStore.closeAlert()"
            >
                <svg class="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                </svg>
            </button>
        </div>

        <div
            ref="animatedElement"
            class="animate-width h-1 w-full rounded-lg"
            :class="{
                'bg-red-900': alertStore.color === AlertColors.RED,
                'bg-green-900': alertStore.color === AlertColors.GREEN,
                'bg-blue-900': alertStore.color === AlertColors.BLUE,
                'bg-yellow-900': alertStore.color === AlertColors.YELLOW,
            }"
            :style="{ animationDuration: `${alertStore.speed / 1000}s` }"
        />
    </div>
</template>

<style scoped>
.animate-width {
    animation: decrease-width linear forwards;
}

@keyframes decrease-width {
    from {
        width: 100%;
    }
    to {
        width: 0;
    }
}
</style>
