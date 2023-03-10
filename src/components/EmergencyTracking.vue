<script setup lang="ts">
import { computed, ref } from "vue";

const emergencyStatus = ref("received");

const emergencyTitle = computed(() => {
    switch (emergencyStatus.value) {
        case "received":
            return "📡 Message received";
        case "ongoing":
            return "🚑 Help is on the way";
        case "canceled":
            return "🚫 Emergency canceled";
        case "failed":
            return "❌ Operation failed";
        case "success":
            return "✅ Operation successful";
    }
});

const emergencySubTitle = computed(() => {
    switch (emergencyStatus.value) {
        case "received":
            return "awaiting for dispatch confirmation";
        case "ongoing":
            return "Medrunners are on their way to rescue you";
        case "canceled":
            return "The operation was canceled";
        case "failed":
            return "The operation has failed";
        case "success":
            return "Thanks for choosing Medrunner";
    }
});
</script>

<template>
    <div>
        <p class="text-3xl text-primary-900 font-Mohave font-semibold">{{ emergencyTitle }}</p>
        <p class="text-sm font-medium">{{ emergencySubTitle }}</p>

        <div class="mt-10" v-if="emergencyStatus === 'received' || emergencyStatus === 'ongoing'">
            <div class="lg:flex lg:justify-between">
                <div class="p-4 shadow-md bg-gray-50 lg:w-[30%]">
                    <p class="font-Mohave font-semibold text-2xl lg:text-xl">
                        <span>🌌</span>System
                    </p>
                    <p class="mt-2">Stanton</p>
                </div>
                <div class="p-4 shadow-md bg-gray-50 mt-5 lg:mt-0 lg:w-[30%]">
                    <p class="font-Mohave font-semibold text-2xl lg:text-xl">
                        <span>🌍</span>Sub System
                    </p>
                    <p class="mt-2">Crusader</p>
                </div>
                <div class="p-4 shadow-md bg-gray-50 mt-5 lg:mt-0 lg:w-[30%] h-fit">
                    <p class="font-Mohave font-semibold text-2xl lg:text-xl">
                        <span>⚔️</span>Threat Level
                    </p>
                    <p class="mt-2">High</p>
                </div>
            </div>
            <div class="lg:flex lg:justify-between lg:mt-5">
                <div class="p-4 shadow-md bg-gray-50 mt-5 lg:mt-0">
                    <p class="font-Mohave font-semibold text-2xl lg:text-xl">
                        <span>🗒️</span>Remarks
                    </p>
                    <p class="mt-2">
                        Pirates everywhere ! Please be careful their are ambushed inside the bunker
                        and have armed ships in the air.
                    </p>
                </div>
            </div>
        </div>

        <div v-if="emergencyStatus === 'ongoing'" class="mt-10">
            <p class="font-Mohave text-primary-900 text-2xl font-semibold mb-3">Responders</p>
            <p class="font-medium">CapitainObvious</p>
            <p class="font-medium">Fallen</p>
            <p class="font-medium">CharlieFox2</p>
        </div>

        <button
            v-if="emergencyStatus === 'received' || emergencyStatus === 'ongoing'"
            class="w-full cursor-pointer lg:w-fit mt-10 bg-primary-900 text-gray-50 px-6 py-3 font-medium flex items-center justify-center"
        >
            <span>Cancel Emergency</span>
        </button>
        <div v-else class="mt-10">
            <p class="font-Mohave font-semibold text-xl">How was your experience with Medrunner?</p>
            <div class="flex w-full justify-between mt-5">
                <button
                    class="p-3 cursor-pointer font-semibold border-2 border-primary-900 w-[45%]"
                >
                    Good
                </button>
                <button
                    class="p-3 cursor-pointer font-semibold border-2 border-primary-900 w-[45%]"
                >
                    Bad
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
