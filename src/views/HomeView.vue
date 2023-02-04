<script setup lang="ts">
import EmergencyHistory from "@/components/EmergencyHistory.vue";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
</script>

<template>
    <div
        class="flex flex-col-reverse lg:flex-row lg:justify-between content-container"
    >
        <div class="mt-10 lg:mt-0 lg:w-[35%] lg:max-w-xl">
            <h2
                class="text-3xl lg:text-4xl font-Mohave font-semibold uppercase mb-5"
            >
                History
            </h2>
            <div v-if="userStore.user.emergencyHistory.length > 0">
                <EmergencyHistory
                    v-for="(
                        emergency, index
                    ) in userStore.getLastOrderedEmergencyHistory"
                    class="mt-4 first:mt-0"
                    :emergencyListIndex="index"
                />
            </div>
        </div>
        <div class="lg:w-[60%]">
            <h2
                class="text-3xl lg:text-4xl font-Mohave font-semibold uppercase"
            >
                Emergency
            </h2>
        </div>
    </div>
</template>
